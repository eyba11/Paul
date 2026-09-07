import type { PlannedSession } from "./types";

export interface RxItem {
  name: string;
  scheme: string;
  target?: string;
  rest?: string;
  note?: string;
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

const library: Record<string, WorkoutRx> = {
  lower: {
    summary: "Squat primary, then hinge and single-leg work. Leave 2 reps in the tank on top sets.",
    blocks: [
      {
        title: "Warm-up · 8 min",
        items: [
          { name: "Easy bike or walk", scheme: "4 min", note: "Raise temperature, no stretching yet." },
          { name: "Bodyweight squat + hip airplane", scheme: "2 × 8 / 6 per side" },
          { name: "Empty-bar squat", scheme: "2 × 8", loadKg: 20, loadLabel: "kg bar", note: "Then 2 ramp-up sets to the working weight." },
        ],
      },
      {
        title: "Main lifts",
        items: [
          { name: "Back squat", scheme: "4 × 5", target: "RPE 7", rest: "2:30", loadKg: 80, loadLabel: "kg", note: "Last rep should still look like the first." },
          { name: "Romanian deadlift", scheme: "3 × 8", target: "RPE 7", rest: "2:00", loadKg: 70, loadLabel: "kg", note: "Soft knees, long hamstrings, no bounce." },
          { name: "Rear-foot elevated split squat", scheme: "3 × 8 / leg", target: "RPE 7", rest: "90s", loadKg: 16, loadLabel: "kg / DB", note: "Torso tall, front heel heavy." },
        ],
      },
      {
        title: "Accessories",
        items: [
          { name: "Standing calf raise", scheme: "3 × 12", rest: "60s", loadKg: 40, loadLabel: "kg" },
          { name: "Side plank", scheme: "3 × 30s / side", note: "If back is fried, do dead bugs instead." },
        ],
      },
    ],
  },
  upper: {
    summary: "Press and pull in pairs. Match pulling volume to pressing.",
    blocks: [
      {
        title: "Warm-up · 8 min",
        items: [
          { name: "Band pull-aparts + arm circles", scheme: "2 × 15" },
          { name: "Push-up + inverted row", scheme: "2 × 8" },
          { name: "Empty-bar bench", scheme: "2 × 8", loadKg: 20, loadLabel: "kg bar" },
        ],
      },
      {
        title: "Main lifts",
        items: [
          { name: "Barbell bench press", scheme: "4 × 6", target: "RPE 7", rest: "2:30", loadKg: 62.5, loadLabel: "kg" },
          { name: "Weighted pull-up or lat pulldown", scheme: "4 × 6–8", target: "RPE 7", rest: "2:00", loadKg: 5, loadLabel: "kg added", note: "Full hang, no kip. 0 kg = bodyweight pull-ups." },
          { name: "Dumbbell overhead press", scheme: "3 × 8", target: "RPE 7", rest: "90s", loadKg: 18, loadLabel: "kg / DB" },
          { name: "Chest-supported row", scheme: "3 × 10", rest: "90s", loadKg: 50, loadLabel: "kg" },
        ],
      },
      {
        title: "Finishers",
        items: [
          { name: "Face pull", scheme: "3 × 15", rest: "45s", loadKg: 12, loadLabel: "kg" },
          { name: "Farmer carry", scheme: "3 × 30 m", loadKg: 32, loadLabel: "kg / hand", note: "Heavy, quiet feet." },
        ],
      },
    ],
  },
  full: {
    summary: "Full-body density. Stop each set 1–2 reps short of failure.",
    blocks: [
      {
        title: "Warm-up · 6 min",
        items: [
          { name: "World's greatest stretch", scheme: "6 / side" },
          { name: "Goblet squat + push-up", scheme: "2 × 8", loadKg: 16, loadLabel: "kg goblet" },
        ],
      },
      {
        title: "Strength circuit · 3 rounds",
        items: [
          { name: "Goblet or front squat", scheme: "8 reps", target: "RPE 7", rest: "45s then next move", loadKg: 24, loadLabel: "kg" },
          { name: "Push-up or DB bench", scheme: "8–10 reps", loadKg: 22.5, loadLabel: "kg / DB" },
          { name: "One-arm DB row", scheme: "8 / arm", loadKg: 24, loadLabel: "kg" },
          { name: "Romanian deadlift", scheme: "8 reps", loadKg: 60, loadLabel: "kg" },
          { name: "Rest between rounds", scheme: "2:00" },
        ],
      },
      {
        title: "Carry + core",
        items: [
          { name: "Suitcase carry", scheme: "2 × 40 m / side", loadKg: 24, loadLabel: "kg" },
          { name: "Dead bug", scheme: "2 × 8 / side" },
        ],
      },
    ],
  },
  easy: {
    summary: "Zone 2 aerobic. You should be able to speak in full sentences.",
    indoorNote: "Treadmill 1% incline, same minutes, same talk test.",
    blocks: [
      {
        title: "Warm-up",
        items: [
          { name: "Walk", scheme: "3 min" },
          { name: "Easy jog", scheme: "5 min", target: "6:30–7:00 /km" },
        ],
      },
      {
        title: "Main set",
        items: [
          {
            name: "Steady zone 2",
            scheme: "30 min",
            target: "5:50–6:20 /km",
            note: "Heart rate roughly 60–70% max. Slow down on hills rather than spiking.",
          },
        ],
      },
      {
        title: "Optional strides",
        items: [
          { name: "Strides", scheme: "4 × 20 s", target: "quick but relaxed", rest: "40s walk", note: "Skip if legs feel heavy." },
        ],
      },
    ],
  },
  quality: {
    summary: "Threshold intervals. The hard reps should be controlled, not a sprint.",
    indoorNote: "Treadmill 1% incline. Same work/rest. Use the /km targets as belt speed.",
    blocks: [
      {
        title: "Warm-up · 12 min",
        items: [
          { name: "Easy jog", scheme: "8 min", target: "6:00–6:30 /km" },
          { name: "Drills", scheme: "A-skips + high knees", note: "2 × 20 m each." },
          { name: "Build-ups", scheme: "3 × 20 s", rest: "40s walk", target: "rolling toward interval pace" },
        ],
      },
      {
        title: "Main set",
        items: [
          {
            name: "Threshold repeats",
            scheme: "5 × 3:00",
            target: "4:20–4:35 /km",
            rest: "90s easy jog",
            note: "Even splits. If rep 1 is flying, you went out too hot. Cut to 4 × 3:00 if form unravels.",
          },
        ],
      },
      {
        title: "Cool-down",
        items: [{ name: "Easy jog / walk", scheme: "8 min", target: "6:30 /km or slower" }],
      },
    ],
  },
  long: {
    summary: "Time on feet. Fuel early and finish able to talk.",
    indoorNote: "Indoor bike or treadmill. Keep the same minutes; drop the last 10 min if heat is high.",
    blocks: [
      {
        title: "Start",
        items: [
          { name: "Walk / shuffle", scheme: "5 min" },
          { name: "Settle into easy", scheme: "15 min", target: "6:00–6:30 /km" },
        ],
      },
      {
        title: "Main",
        items: [
          {
            name: "Steady long aerobic",
            scheme: "50 min",
            target: "5:50–6:20 /km",
            note: "Gel or drink at 30 min. Walk a 60s hill if heart rate drifts.",
          },
          {
            name: "Last 10 min",
            scheme: "10 min",
            target: "5:40–5:55 /km",
            note: "Slightly quicker, still conversational. Not a tempo.",
          },
        ],
      },
      {
        title: "Finish",
        items: [{ name: "Walk + calves / hips", scheme: "5 min" }],
      },
    ],
  },
  mobility: {
    summary: "Tissue quality and an easy walk. This is optional after a rejig.",
    blocks: [
      {
        title: "Floor flow · 10 min",
        items: [
          { name: "90/90 hip switches", scheme: "10 / side" },
          { name: "Couch stretch", scheme: "45s / side" },
          { name: "T-spine opener on bench", scheme: "8 / side" },
          { name: "Dead hang", scheme: "3 × 20s" },
        ],
      },
      {
        title: "Walk",
        items: [{ name: "Easy outdoor or treadmill walk", scheme: "20 min", target: "nasal breathing" }],
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

const techniqueStrength: WorkoutRx = {
  summary: "Recovery is low — technique only. No grinding top sets.",
  blocks: [
    {
      title: "Warm-up",
      items: [
        { name: "Easy bike", scheme: "5 min" },
        { name: "Pattern primer", scheme: "2 × 8 squats + 8 hinges" },
      ],
    },
    {
      title: "Technique",
      items: [
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
