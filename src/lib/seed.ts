import type { CoachState, PlannedSession, WorkoutTemplate } from "./types";
import { addDays, parseIso, startOfWeek, uid } from "./dates";

export const CURRENT_PLAN_ID = "push-pull-legs-v2";

export const defaultSettings: CoachState["settings"] = {
  name: "Paul",
  weeklyStrength: 3,
  weeklyQualityRun: 1,
  weeklyEasyRun: 1,
  weeklyLongRun: 1,
  preferredRunHours: [6, 18],
  preferredLiftHours: [7, 17],
  heatLimitC: 21,
  rainLimitMm: 4,
  city: process.env.NEXT_PUBLIC_DEFAULT_CITY || "Sydney",
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT || -33.8688),
  lon: Number(process.env.NEXT_PUBLIC_DEFAULT_LON || 151.2093),
  planId: CURRENT_PLAN_ID,
};

export const templates: WorkoutTemplate[] = [
  {
    id: "push",
    name: "Push + core",
    type: "strength",
    durationMin: 58,
    intensity: "hard",
    environment: "indoor",
    focus: "Chest, shoulders, triceps and anterior core",
    notes: "50–65 min. Warm-up: 5 min easy row, then 2–4 heavier practice sets on the first lift. Practice sets do not count as working sets.",
  },
  {
    id: "pull",
    name: "Pull + core",
    type: "strength",
    durationMin: 58,
    intensity: "hard",
    environment: "indoor",
    focus: "Back, biceps, grip and trunk",
    notes: "50–65 min. Warm-up: 5 min easy row, then 2–4 heavier practice sets on the first lift. Practice sets do not count as working sets.",
  },
  {
    id: "legs",
    name: "Legs + core",
    type: "strength",
    durationMin: 62,
    intensity: "hard",
    environment: "indoor",
    focus: "Leg mass, glutes and symmetry",
    notes: "55–70 min. Warm-up: 5 min easy row, then 2–4 heavier practice sets on the first lift. Practice sets do not count as working sets.",
  },
  {
    id: "easy",
    name: "Zone 2 run",
    type: "easy_run",
    durationMin: 48,
    intensity: "easy",
    environment: "outdoor",
    focus: "Aerobic base and recovery",
    notes: "40–55 min conversational. Indoors, easy rowing that keeps breathing controlled — do not chase heart rate at the expense of the talk test.",
  },
  {
    id: "quality",
    name: "VO₂ max run",
    type: "quality_run",
    durationMin: 40,
    intensity: "hard",
    environment: "outdoor",
    focus: "Aerobic power",
    notes: "35–45 min. RPE 8–9/10. First rep is not a sprint. Hold a similar pace across all reps.",
  },
  {
    id: "long",
    name: "Easy long run",
    type: "long_run",
    durationMin: 55,
    intensity: "moderate",
    environment: "outdoor",
    focus: "Endurance",
    notes: "Start 45–55 min and build toward 60–70 min. Keep it easy. If Friday’s legs leave you sore or running ugly, shorten it or swap a brisk walk.",
  },
  {
    id: "mobility",
    name: "Recovery",
    type: "mobility",
    durationMin: 35,
    intensity: "recovery",
    environment: "either",
    focus: "Walk, mobility and roller work",
    notes: "As needed. Easy walk, hips/T-spine, roller. No heroics.",
  },
  {
    id: "rest",
    name: "Full rest",
    type: "rest",
    durationMin: 0,
    intensity: "recovery",
    environment: "either",
    focus: "Restore",
    notes: "Sleep, food, no heroics.",
  },
];

/** Monday = 0 … Sunday = 6 */
export const WEEKDAY_TEMPLATE_IDS = ["push", "quality", "pull", "easy", "legs", "long", "mobility"] as const;

export function weekdayMon0(date: string): number {
  const d = parseIso(date).getDay();
  return d === 0 ? 6 : d - 1;
}

function sessionFrom(template: WorkoutTemplate, date: string): PlannedSession {
  return {
    id: uid("ses"),
    date,
    templateId: template.id,
    name: template.name,
    baseName: template.name,
    type: template.type,
    durationMin: template.durationMin,
    baseDurationMin: template.durationMin,
    intensity: template.intensity,
    environment: template.environment,
    focus: template.focus,
    notes: template.notes,
    baseNotes: template.notes,
    locked: false,
    weatherAdjusted: false,
    calendarAdjusted: false,
  };
}

export function overlayTemplate(session: PlannedSession, template: WorkoutTemplate): PlannedSession {
  return {
    ...session,
    templateId: template.id,
    name: template.name,
    baseName: template.name,
    type: template.type,
    durationMin: template.durationMin,
    baseDurationMin: template.durationMin,
    intensity: template.intensity,
    environment: template.environment,
    focus: template.focus,
    notes: template.notes,
    baseNotes: template.notes,
  };
}

export function applyWeekdayPlan(week: PlannedSession[], planTemplates: WorkoutTemplate[] = templates): PlannedSession[] {
  const byId = Object.fromEntries(planTemplates.map((t) => [t.id, t]));
  return week.map((session) => {
    const id = WEEKDAY_TEMPLATE_IDS[weekdayMon0(session.date)];
    const template = byId[id];
    return template ? overlayTemplate(session, template) : session;
  });
}

export function buildBaseWeek(weekStart = startOfWeek()): PlannedSession[] {
  const t = Object.fromEntries(templates.map((x) => [x.id, x]));
  return WEEKDAY_TEMPLATE_IDS.map((id, i) => sessionFrom(t[id], addDays(weekStart, i)));
}

export function createSeedState(): CoachState {
  const weekStart = startOfWeek();
  return {
    settings: defaultSettings,
    templates,
    week: buildBaseWeek(weekStart),
    logs: [
      {
        id: uid("log"),
        date: addDays(weekStart, -2),
        name: "Zone 2 run",
        type: "easy_run",
        completed: true,
        rpe: 4,
        durationMin: 45,
      },
      {
        id: uid("log"),
        date: addDays(weekStart, -1),
        name: "Push + core",
        type: "strength",
        completed: true,
        rpe: 7,
        durationMin: 58,
      },
    ],
    weights: [
      { id: uid("w"), date: addDays(weekStart, -21), kg: 86.4 },
      { id: uid("w"), date: addDays(weekStart, -14), kg: 85.8 },
      { id: uid("w"), date: addDays(weekStart, -7), kg: 85.3 },
      { id: uid("w"), date: addDays(weekStart, -1), kg: 85.1 },
    ],
    waists: [
      { id: uid("wa"), date: addDays(weekStart, -21), cm: 91.5 },
      { id: uid("wa"), date: addDays(weekStart, -7), cm: 90.8 },
      { id: uid("wa"), date: addDays(weekStart, -1), cm: 90.4 },
    ],
    dexa: [
      {
        id: uid("dx"),
        date: addDays(weekStart, -90),
        bodyFatPct: 22.4,
        leanMassKg: 67.0,
        fatMassKg: 19.4,
        visceralFatCm2: 92,
        notes: "Baseline scan · DEXA total 86.4 kg (matches scale)",
      },
      {
        id: uid("dx"),
        date: addDays(weekStart, -10),
        bodyFatPct: 20.1,
        leanMassKg: 68.2,
        fatMassKg: 17.1,
        visceralFatCm2: 78,
        notes: "Lean held while fat dropped · DEXA total 85.3 kg (matches scale)",
      },
    ],
    recovery: [
      { id: uid("r"), date: addDays(weekStart, -1), score: 6, sleepHours: 6.5, soreness: 4 },
      { id: uid("r"), date: weekStart, score: 7, sleepHours: 7.2, soreness: 3 },
    ],
    calendar: [
      {
        id: uid("cal"),
        date: addDays(weekStart, 2),
        startHour: 8,
        endHour: 16,
        title: "Deep work / meetings",
        hardConflict: true,
      },
      {
        id: uid("cal"),
        date: addDays(weekStart, 5),
        startHour: 9,
        endHour: 12,
        title: "Family morning",
        hardConflict: false,
      },
    ],
    weather: [],
  };
}
