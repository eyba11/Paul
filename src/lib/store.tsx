"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildRecommendations } from "./coaching";
import { applyAdaptiveRules } from "./schedule-engine";
import { correctedPlaceholderMass, isPlaceholderDexaMass } from "./dexa";
import { rejigWeek } from "./rejig";
import { createSeedState } from "./seed";
import { scoreOutdoorDay } from "./weather-engine";
import { logFingerprint, weightFingerprint } from "./garmin-csv";
import {
  STORAGE_KEY,
  type CalendarBlock,
  type CoachState,
  type DexaEntry,
  type RecoveryEntry,
  type SessionType,
  type WeatherDay,
  type WeightEntry,
  type WorkoutLog,
} from "./types";
import { todayIso, uid } from "./dates";

interface CoachContextValue {
  state: CoachState;
  hydrated: boolean;
  recommendations: ReturnType<typeof buildRecommendations>;
  refreshWeather: () => Promise<void>;
  rejig: () => void;
  logCompletion: (input: {
    sessionId?: string;
    name: string;
    type: SessionType;
    rpe?: number;
    durationMin?: number;
    notes?: string;
    date?: string;
  }) => void;
  addWeight: (kg: number, date?: string) => void;
  addWaist: (cm: number, date?: string) => void;
  addDexa: (entry: Omit<DexaEntry, "id">) => void;
  addRecovery: (entry: Omit<RecoveryEntry, "id">) => void;
  addCalendarBlock: (block: Omit<CalendarBlock, "id">) => void;
  removeCalendarBlock: (id: string) => void;
  updateSettings: (patch: Partial<CoachState["settings"]>) => void;
  importGarmin: (draft: {
    logs: Omit<WorkoutLog, "id">[];
    weights: Omit<WeightEntry, "id">[];
  }) => { logs: number; weights: number; duplicates: number };
}

const CoachContext = createContext<CoachContextValue | null>(null);

function persist(state: CoachState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function migrate(state: CoachState): CoachState {
  return {
    ...state,
    week: state.week.map((s) => ({
      ...s,
      baseNotes: s.baseNotes ?? s.notes,
      baseDurationMin: s.baseDurationMin ?? s.durationMin,
      baseName: s.baseName ?? s.name,
    })),
    dexa: state.dexa.map((entry) => {
      if (!isPlaceholderDexaMass(entry)) return entry;
      const fixed = correctedPlaceholderMass(entry);
      if (!fixed) return entry;
      return {
        ...entry,
        ...fixed,
        notes: entry.notes?.includes("DEXA total")
          ? entry.notes
          : `${entry.notes ? `${entry.notes} · ` : ""}Corrected DEXA total ${fixed.leanMassKg + fixed.fatMassKg} kg to match scale (was lean+fat ~83 kg placeholder).`,
      };
    }),
    settings: {
      ...state.settings,
      heatLimitC: state.settings.heatLimitC >= 32 ? 21 : state.settings.heatLimitC,
    },
  };
}

function loadState(): CoachState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return migrate({ ...createSeedState(), ...JSON.parse(raw) } as CoachState);
  } catch {
    return createSeedState();
  }
}

export function CoachProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CoachState>(createSeedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState({ ...loaded, week: applyAdaptiveRules(loaded) });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(state);
  }, [state, hydrated]);

  const apply = useCallback((updater: (prev: CoachState) => CoachState) => {
    setState((prev) => {
      const next = updater(prev);
      return { ...next, week: applyAdaptiveRules(next) };
    });
  }, []);

  const refreshWeather = useCallback(async () => {
    const { lat, lon, heatLimitC, rainLimitMm } = state.settings;
    const url = `/api/weather?lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = (await res.json()) as {
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
      };
    };
    const weather: WeatherDay[] = data.daily.time.map((date, i) =>
      scoreOutdoorDay({
        date,
        code: data.daily.weather_code[i],
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipMm: data.daily.precipitation_sum[i],
        windKmh: data.daily.wind_speed_10m_max[i],
        heatLimitC,
        rainLimitMm,
      }),
    );
    apply((prev) => ({ ...prev, weather, lastWeatherAt: new Date().toISOString() }));
  }, [apply, state.settings]);

  const value = useMemo<CoachContextValue>(
    () => ({
      state,
      hydrated,
      recommendations: buildRecommendations(state),
      refreshWeather,
      rejig: () => apply((prev) => rejigWeek(prev)),
      logCompletion: (input) =>
        apply((prev) => ({
          ...prev,
          logs: [
            {
              id: uid("log"),
              date: todayIso(),
              completed: true,
              ...input,
            } satisfies WorkoutLog,
            ...prev.logs,
          ],
        })),
      addWeight: (kg, date) =>
        apply((prev) => ({
          ...prev,
          weights: [{ id: uid("w"), date: date ?? todayIso(), kg }, ...prev.weights],
        })),
      addWaist: (cm, date) =>
        apply((prev) => ({
          ...prev,
          waists: [{ id: uid("wa"), date: date ?? todayIso(), cm }, ...prev.waists],
        })),
      addDexa: (entry) =>
        apply((prev) => ({
          ...prev,
          dexa: [{ id: uid("dx"), ...entry }, ...prev.dexa],
        })),
      addRecovery: (entry) =>
        apply((prev) => ({
          ...prev,
          recovery: [{ id: uid("r"), ...entry }, ...prev.recovery],
        })),
      addCalendarBlock: (block) =>
        apply((prev) => ({
          ...prev,
          calendar: [{ id: uid("cal"), ...block }, ...prev.calendar],
        })),
      removeCalendarBlock: (id) =>
        apply((prev) => ({
          ...prev,
          calendar: prev.calendar.filter((b) => b.id !== id),
        })),
      updateSettings: (patch) =>
        apply((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),
      importGarmin: (draft) => {
        let logsAdded = 0;
        let weightsAdded = 0;
        let duplicates = 0;
        apply((prev) => {
          const existingLogs = new Set(prev.logs.map(logFingerprint));
          const existingWeights = new Set(prev.weights.map(weightFingerprint));
          const logs = [...prev.logs];
          const weights = [...prev.weights];
          for (const log of draft.logs) {
            if (existingLogs.has(logFingerprint(log))) {
              duplicates += 1;
              continue;
            }
            const next = { ...log, id: uid("log"), completed: true } satisfies WorkoutLog;
            logs.unshift(next);
            existingLogs.add(logFingerprint(next));
            logsAdded += 1;
          }
          for (const weight of draft.weights) {
            if (existingWeights.has(weightFingerprint(weight))) {
              duplicates += 1;
              continue;
            }
            const next = { ...weight, id: uid("w") };
            weights.unshift(next);
            existingWeights.add(weightFingerprint(next));
            weightsAdded += 1;
          }
          return { ...prev, logs, weights };
        });
        return { logs: logsAdded, weights: weightsAdded, duplicates };
      },
    }),
    [apply, hydrated, refreshWeather, state],
  );

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}

export function useCoach() {
  const ctx = useContext(CoachContext);
  if (!ctx) throw new Error("useCoach must be used inside CoachProvider");
  return ctx;
}
