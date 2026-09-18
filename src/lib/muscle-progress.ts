import { weekLabel, weekStartIso } from "./dates";
import type { LiftLog } from "./types";

export type MuscleId =
  | "chest"
  | "shoulders"
  | "triceps"
  | "back"
  | "biceps"
  | "quads"
  | "posterior"
  | "calves"
  | "core";

export interface MuscleMeta {
  id: MuscleId;
  label: string;
  session: "Push" | "Pull" | "Legs" | "Core";
  color: string;
}

export const MUSCLE_GROUPS: MuscleMeta[] = [
  { id: "chest", label: "Chest", session: "Push", color: "#d4ff3a" },
  { id: "shoulders", label: "Shoulders", session: "Push", color: "#86efac" },
  { id: "triceps", label: "Triceps", session: "Push", color: "#fde047" },
  { id: "back", label: "Back", session: "Pull", color: "#7dd3fc" },
  { id: "biceps", label: "Biceps", session: "Pull", color: "#c4b5fd" },
  { id: "quads", label: "Quads", session: "Legs", color: "#fdba74" },
  { id: "posterior", label: "Glutes / hamstrings", session: "Legs", color: "#fb7185" },
  { id: "calves", label: "Calves", session: "Legs", color: "#94a3b8" },
  { id: "core", label: "Core", session: "Core", color: "#e8eee6" },
];

export function muscleForExercise(exercise: string): MuscleId | null {
  const e = exercise.trim().toLowerCase();
  if (/bench|incline|push-up|push up/.test(e)) return "chest";
  if (/shoulder|lateral raise/.test(e)) return "shoulders";
  if (/triceps|pressdown/.test(e)) return "triceps";
  if (/pull-up|pulldown|row|face-pull|face pull/.test(e)) return "back";
  if (/curl/.test(e)) return "biceps";
  if (/split squat|goblet|lunge/.test(e)) return "quads";
  if (/romanian|deadlift|hip thrust/.test(e)) return "posterior";
  if (/calf/.test(e)) return "calves";
  if (/ab wheel|knee raise|pallof|plank|carry/.test(e)) return "core";
  return null;
}

export interface WeekPoint {
  week: string;
  label: string;
  kg: number;
}

export interface MuscleWeekSeries {
  meta: MuscleMeta;
  points: WeekPoint[];
  deltaKg: number | null;
  deltaPct: number | null;
}

export interface SessionWeekSeries {
  session: "Push" | "Pull" | "Legs";
  color: string;
  points: { week: string; label: string; index: number }[];
}

function weeklyMaxByMuscle(logs: LiftLog[]): Map<string, Map<MuscleId, number>> {
  const weeks = new Map<string, Map<MuscleId, number>>();
  for (const log of logs) {
    if (log.kg == null || log.kg <= 0) continue;
    const muscle = muscleForExercise(log.exercise);
    if (!muscle) continue;
    const week = weekStartIso(log.date);
    const byMuscle = weeks.get(week) ?? new Map<MuscleId, number>();
    byMuscle.set(muscle, Math.max(byMuscle.get(muscle) ?? 0, log.kg));
    weeks.set(week, byMuscle);
  }
  return weeks;
}

export function muscleWeekSeries(logs: LiftLog[]): MuscleWeekSeries[] {
  const weeks = weeklyMaxByMuscle(logs);
  return MUSCLE_GROUPS.map((meta) => {
    const points: WeekPoint[] = [...weeks.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([week, byMuscle]) => {
        const kg = byMuscle.get(meta.id);
        if (kg == null) return [];
        return [{ week, label: weekLabel(week), kg }];
      });
    const first = points[0]?.kg;
    const last = points.at(-1)?.kg;
    const deltaKg = first != null && last != null ? last - first : null;
    const deltaPct = first && last != null ? ((last - first) / first) * 100 : null;
    return { meta, points, deltaKg, deltaPct };
  }).filter((s) => s.points.length > 0);
}

export function sessionIndexSeries(logs: LiftLog[]): SessionWeekSeries[] {
  const weeks = weeklyMaxByMuscle(logs);
  const ordered = [...weeks.keys()].sort((a, b) => a.localeCompare(b));
  const sessions: SessionWeekSeries["session"][] = ["Push", "Pull", "Legs"];
  const colors: Record<(typeof sessions)[number], string> = {
    Push: "#d4ff3a",
    Pull: "#7dd3fc",
    Legs: "#fdba74",
  };
  return sessions.map((session) => {
    const muscles = MUSCLE_GROUPS.filter((g) => g.session === session).map((g) => g.id);
    const raw = ordered.map((week) => {
      const byMuscle = weeks.get(week);
      const values = muscles.map((id) => byMuscle?.get(id)).filter((n): n is number => n != null);
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
      return { week, label: weekLabel(week), avg };
    });
    const baseline = raw.find((p) => p.avg != null)?.avg;
    const points = raw
      .filter((p) => p.avg != null && baseline)
      .map((p) => ({
        week: p.week,
        label: p.label,
        index: Math.round(((p.avg as number) / baseline!) * 1000) / 10,
      }));
    return { session, color: colors[session], points };
  }).filter((s) => s.points.length > 0);
}
