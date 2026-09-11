import type { PlannedSession } from "./types";

export interface RxItem {
  name: string;
  scheme: string;
  target?: string;
  rest?: string;
  note?: string;
  equipment?: string;
  loadKg?: number;
  loadLabel?: string;
}

export interface RxBlock {
  title: string;
  items: RxItem[];
}

export interface WorkoutRx {
  summary: string;
  blocks: RxBlock[];
  indoorNote?: string;
}

const gymWarmup: RxItem[] = [
  {
    name: "Easy row",
    scheme: "5 min",
    note: "Raise temperature. Then 2–4 progressively heavier practice sets on the first major lift. Practice sets do not count as working sets.",
    equipment: "Rower",
  },
];

const library: Record<string, WorkoutRx> = {
  push: {
    summary: "Chest, shoulders, triceps and anterior core. Leave 1–2 reps in the tank on working sets.",
    blocks: [
      { title: "Warm-up", items: gymWarmup },
      {
        title: "Main",
        items: [
          {
            name: "Barbell bench press",
            scheme: "4 × 5–8",
            rest: "2–3 min",
            equipment: "Bench/rack",
            loadKg: 62.5,
            loadLabel: "kg",
          },
          {
            name: "Incline dumbbell press",
            scheme: "3 × 8–12",
            rest: "90 sec",
            equipment: "Bench + dumbbells",
            loadKg: 24,
            loadLabel: "kg / DB",
          },
          {
            name: "Standing dumbbell shoulder press",
            scheme: "3 × 8–12",
            rest: "90 sec",
            equipment: "Dumbbells",
            loadKg: 18,
            loadLabel: "kg / DB",
          },
          {
            name: "Dumbbell lateral raise",
            scheme: "3 × 12–15",
            rest: "60 sec",
            equipment: "Dumbbells",
            loadKg: 8,
            loadLabel: "kg / DB",
          },
          {
            name: "Cable triceps pressdown",
            scheme: "3 × 10–15",
            rest: "60–90 sec",
            equipment: "Pulley + straight bar",
            loadKg: 20,
            loadLabel: "kg",
          },
          {
            name: "Ab wheel rollout",
            scheme: "3 × 6–10",
            rest: "60–90 sec",
            equipment: "Ab wheel",
            note: "Ribs down. Stop the range before the low back sags.",
          },
        ],
      },
    ],
  },
  pull: {
    summary: "Back, biceps, grip and trunk. Extra left-side row set is for symmetry — do not skip it.",
    blocks: [
      { title: "Warm-up", items: gymWarmup },
      {
        title: "Main",
        items: [
          {
            name: "Pull-up or assisted pull-up",
            scheme: "4 × 5–10",
            rest: "2 min",
            equipment: "Pull-up bar",
            loadKg: 0,
            loadLabel: "kg added",
            note: "0 kg = bodyweight. Assist if you cannot hold 5 clean reps.",
          },
          {
            name: "One-arm dumbbell row",
            scheme: "3 × 8–12 / side + 1 left set",
            rest: "90 sec",
            equipment: "Bench + dumbbell",
            loadKg: 28,
            loadLabel: "kg",
            note: "After the paired sets, add one extra set on the left.",
          },
          {
            name: "Pulley row",
            scheme: "3 × 10–15",
            rest: "90 sec",
            equipment: "Pulley + straight bar",
            loadKg: 40,
            loadLabel: "kg",
          },
          {
            name: "Pulley high row / face-pull pattern",
            scheme: "3 × 12–15",
            rest: "60–90 sec",
            equipment: "Pulley; straight bar or secure rope",
            loadKg: 14,
            loadLabel: "kg",
          },
          {
            name: "Dumbbell curl",
            scheme: "3 × 8–12",
            rest: "60–90 sec",
            equipment: "Dumbbells",
            loadKg: 14,
            loadLabel: "kg / DB",
          },
          {
            name: "Hammer curl",
            scheme: "2 × 10–15",
            rest: "60 sec",
            equipment: "Dumbbells",
            loadKg: 14,
            loadLabel: "kg / DB",
          },
          {
            name: "Hanging knee raise",
            scheme: "3 × 8–12",
            rest: "60 sec",
            equipment: "Pull-up bar",
            note: "Posterior tilt. No swinging.",
          },
        ],
      },
    ],
  },
  legs: {
    summary: "Leg mass, glutes and left/right symmetry. Extra left split-squat set is required.",
    blocks: [
      { title: "Warm-up", items: gymWarmup },
      {
        title: "Main",
        items: [
          {
            name: "Dumbbell Bulgarian split squat",
            scheme: "4 × 8–12 / side + 1 left set",
            rest: "90–120 sec",
            equipment: "Dumbbells + stable step/bench",
            loadKg: 16,
            loadLabel: "kg / DB",
            note: "After the paired sets, add one extra set on the left.",
          },
          {
            name: "Barbell Romanian deadlift",
            scheme: "4 × 6–10",
            rest: "2–3 min",
            equipment: "Barbell + plates",
            loadKg: 70,
            loadLabel: "kg",
          },
          {
            name: "Heavy goblet squat",
            scheme: "3 × 10–15",
            rest: "90 sec",
            equipment: "Dumbbell or kettlebell",
            loadKg: 28,
            loadLabel: "kg",
          },
          {
            name: "Walking or reverse lunge",
            scheme: "3 × 8–12 / side",
            rest: "90 sec",
            equipment: "Dumbbells",
            loadKg: 16,
            loadLabel: "kg / DB",
          },
          {
            name: "Barbell hip thrust",
            scheme: "3 × 8–12",
            rest: "90–120 sec",
            equipment: "Bench + padded barbell",
            loadKg: 70,
            loadLabel: "kg",
          },
          {
            name: "Single-leg calf raise",
            scheme: "3 × 12–20 / side",
            rest: "60 sec",
            equipment: "Step + dumbbell",
            loadKg: 16,
            loadLabel: "kg",
          },
          {
            name: "Pallof press or suitcase carry",
            scheme: "3 × 10–12 / side or 4 × 30 m",
            rest: "60 sec",
            equipment: "Pulley or kettlebell/dumbbell",
            loadKg: 16,
            loadLabel: "kg",
            note: "Pick one: anti-rotation press, or loaded carries.",
          },
          {
            name: "Side plank",
            scheme: "3 × 30–45 sec / side",
            rest: "45–60 sec",
            equipment: "Floor mat",
          },
        ],
      },
    ],
  },
  easy: {
    summary: "Zone 2 aerobic base. Conversational effort the whole way.",
    indoorNote: "Rower: easy, conversational stroke. Do not chase a heart-rate number at the expense of the talk test.",
    blocks: [
      {
        title: "Main",
        items: [
          {
            name: "Zone 2 run",
            scheme: "40–55 min",
            target: "talk test",
            note: "You should be able to speak in full sentences. Slow down on hills rather than spiking.",
            equipment: "Road or rower",
          },
        ],
      },
    ],
  },
  quality: {
    summary: "VO₂ max intervals. RPE 8–9/10. The first repetition must not be a sprint — hold a similar pace across all reps.",
    indoorNote: "Rower: same work and recovery. RPE still rules the session.",
    blocks: [
      {
        title: "Warm-up",
        items: [
          { name: "Easy running", scheme: "10–12 min", equipment: "Road or rower" },
          { name: "Relaxed strides", scheme: "3–4 × 15 sec", note: "Quick but not a sprint." },
        ],
      },
      {
        title: "Main set · pick this week’s block",
        items: [
          {
            name: "Weeks 1–4",
            scheme: "4 × 3 min hard",
            target: "RPE 8–9",
            rest: "3 min easy jog",
            note: "Default block if you are starting this programme.",
          },
          {
            name: "Weeks 5–8",
            scheme: "5 × 3 min hard",
            target: "RPE 8–9",
            rest: "2½–3 min easy jog",
          },
          {
            name: "Weeks 9–11",
            scheme: "Alternate 5 × 3 min and 4 × 4 min",
            target: "RPE 8–9",
            rest: "Similar-duration easy recovery",
          },
          {
            name: "Week 12",
            scheme: "Reduce volume",
            note: "Then an optional controlled benchmark later in the week.",
          },
        ],
      },
      {
        title: "Cool-down",
        items: [{ name: "Easy jog / walk", scheme: "8–10 min" }],
      },
    ],
  },
  long: {
    summary: "Easy endurance. Build time slowly. Finish able to talk.",
    indoorNote: "Rower, same minutes. Drop duration if form is ugly after Friday legs.",
    blocks: [
      {
        title: "Main",
        items: [
          {
            name: "Easy long run",
            scheme: "45–70 min",
            target: "easy / talk test",
            note: "Start at 45–55 min and build gradually toward 60–70 min. If Friday’s leg session leaves pronounced soreness or altered running form, shorten the run or substitute a brisk walk.",
            equipment: "Road or rower",
          },
        ],
      },
    ],
  },
  mobility: {
    summary: "Recovery day. Walk, mobility and roller work — as needed, not as a workout.",
    blocks: [
      {
        title: "Optional",
        items: [
          { name: "Easy walk", scheme: "as needed", target: "nasal / easy", equipment: "Outdoor or easy row" },
          { name: "Mobility", scheme: "hips, T-spine, ankles", equipment: "Floor mat" },
          { name: "Roller work", scheme: "as needed", equipment: "Foam roller" },
        ],
      },
    ],
  },
  rest: {
    summary: "No training. Sleep, protein, and a short walk if you feel like it.",
    blocks: [
      {
        title: "Restore",
        items: [
          { name: "Sleep window", scheme: "7.5–9 h" },
          { name: "Optional 15 min walk", scheme: "easy", note: "Only if it makes you feel better." },
        ],
      },
    ],
  },
};

library.lower = library.legs;
library.upper = library.push;
library.full = library.pull;

const techniqueStrength: WorkoutRx = {
  summary: "Recovery is low — technique only. No grinding top sets.",
  blocks: [
    {
      title: "Warm-up",
      items: [{ name: "Easy row", scheme: "5 min", equipment: "Rower" }],
    },
    {
      title: "Technique",
      items: [
        { name: "Pattern primer", scheme: "2 × 8 squats + 8 hinges" },
        { name: "Squat or hinge (choose one)", scheme: "3 × 5", target: "RPE 5", rest: "2:00", loadKg: 40, loadLabel: "kg", note: "Light plates only." },
        { name: "Push-up or DB press", scheme: "3 × 8", target: "RPE 5", loadKg: 12, loadLabel: "kg / DB" },
        { name: "Row", scheme: "3 × 10", target: "RPE 5", loadKg: 20, loadLabel: "kg" },
      ],
    },
  ],
};

export function getWorkoutRx(session: Pick<PlannedSession, "templateId" | "intensity" | "type" | "weatherAdjusted">): WorkoutRx {
  if (session.intensity === "easy" && session.type === "strength") return techniqueStrength;
  if (session.intensity === "easy" && session.templateId === "quality") return library.easy;
  const rx = library[session.templateId] ?? library.easy;
  if (session.weatherAdjusted && rx.indoorNote) {
    return {
      ...rx,
      summary: `${rx.summary} Indoor option today.`,
    };
  }
  return rx;
}

export function rxItemKey(blockTitle: string, item: RxItem, index: number): string {
  return `${blockTitle}:${item.name}:${index}`;
}

export function loadStorageKey(itemName: string): string {
  return itemName.trim().toLowerCase();
}

export function paceToKmh(min: number, sec: number): number {
  const minutes = min + sec / 60;
  if (minutes <= 0) return 0;
  return Math.round((60 / minutes) * 10) / 10;
}

export function speedFromPaceTarget(target?: string): string | undefined {
  if (!target || !/\/km/i.test(target)) return undefined;
  const matches = [...target.matchAll(/(\d+):(\d{2})/g)];
  if (!matches.length) return undefined;
  const speeds = matches.map((m) => paceToKmh(Number(m[1]), Number(m[2])));
  if (speeds.length === 1) return `${speeds[0].toFixed(1)} km/h avg`;
  const slow = Math.min(...speeds);
  const fast = Math.max(...speeds);
  const avg = Math.round(((slow + fast) / 2) * 10) / 10;
  return `${slow.toFixed(1)}–${fast.toFixed(1)} km/h · avg ${avg.toFixed(1)} km/h`;
}
