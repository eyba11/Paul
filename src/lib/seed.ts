import type { CoachState, PlannedSession, WorkoutTemplate } from "./types";
import { addDays, startOfWeek, uid } from "./dates";

export const defaultSettings: CoachState["settings"] = {
  name: "Paul",
  weeklyStrength: 3,
  weeklyQualityRun: 1,
  weeklyEasyRun: 2,
  weeklyLongRun: 1,
  preferredRunHours: [6, 18],
  preferredLiftHours: [7, 17],
  heatLimitC: 21,
  rainLimitMm: 4,
  city: process.env.NEXT_PUBLIC_DEFAULT_CITY || "Sydney",
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT || -33.8688),
  lon: Number(process.env.NEXT_PUBLIC_DEFAULT_LON || 151.2093),
};

export const templates: WorkoutTemplate[] = [
  {
    id: "lower",
    name: "Lower strength",
    type: "strength",
    durationMin: 60,
    intensity: "hard",
    environment: "indoor",
    focus: "Squat pattern + posterior chain",
    notes: "Squat or hinge primary, then unilateral and calves.",
  },
  {
    id: "upper",
    name: "Upper strength",
    type: "strength",
    durationMin: 55,
    intensity: "hard",
    environment: "indoor",
    focus: "Press + pull volume",
    notes: "Horizontal and vertical pairs, keep rest honest.",
  },
  {
    id: "full",
    name: "Full-body hybrid",
    type: "strength",
    durationMin: 50,
    intensity: "moderate",
    environment: "indoor",
    focus: "Full-body density",
    notes: "Compound circuits, leave some in the tank.",
  },
  {
    id: "easy",
    name: "Easy aerobic",
    type: "easy_run",
    durationMin: 40,
    intensity: "easy",
    environment: "outdoor",
    focus: "Zone 2",
    notes: "Conversational pace. Walk hills if needed.",
  },
  {
    id: "quality",
    name: "Quality session",
    type: "quality_run",
    durationMin: 45,
    intensity: "hard",
    environment: "outdoor",
    focus: "Threshold or intervals",
    notes: "Warm up well. Stop if form collapses.",
  },
  {
    id: "long",
    name: "Long aerobic",
    type: "long_run",
    durationMin: 80,
    intensity: "moderate",
    environment: "outdoor",
    focus: "Durability",
    notes: "Steady, fuel early, finish able to talk.",
  },
  {
    id: "mobility",
    name: "Mobility + walk",
    type: "mobility",
    durationMin: 30,
    intensity: "recovery",
    environment: "either",
    focus: "Tissue quality",
    notes: "Hips, T-spine, easy 20 min walk.",
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

export function buildBaseWeek(weekStart = startOfWeek()): PlannedSession[] {
  const t = Object.fromEntries(templates.map((x) => [x.id, x]));
  return [
    sessionFrom(t.lower, addDays(weekStart, 0)),
    sessionFrom(t.easy, addDays(weekStart, 1)),
    sessionFrom(t.upper, addDays(weekStart, 2)),
    sessionFrom(t.quality, addDays(weekStart, 3)),
    sessionFrom(t.full, addDays(weekStart, 4)),
    sessionFrom(t.long, addDays(weekStart, 5)),
    sessionFrom(t.mobility, addDays(weekStart, 6)),
  ];
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
        name: "Easy aerobic",
        type: "easy_run",
        completed: true,
        rpe: 4,
        durationMin: 42,
      },
      {
        id: uid("log"),
        date: addDays(weekStart, -1),
        name: "Lower strength",
        type: "strength",
        completed: true,
        rpe: 7,
        durationMin: 62,
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
