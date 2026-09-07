export type SessionType =
  | "strength"
  | "easy_run"
  | "quality_run"
  | "long_run"
  | "mobility"
  | "rest";

export type Environment = "indoor" | "outdoor" | "either";

export type Intensity = "recovery" | "easy" | "moderate" | "hard";

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: SessionType;
  durationMin: number;
  intensity: Intensity;
  environment: Environment;
  focus: string;
  notes: string;
}

export interface PlannedSession {
  id: string;
  date: string;
  templateId: string;
  name: string;
  baseName: string;
  type: SessionType;
  durationMin: number;
  baseDurationMin: number;
  intensity: Intensity;
  environment: Environment;
  focus: string;
  notes: string;
  baseNotes: string;
  locked: boolean;
  weatherAdjusted: boolean;
  calendarAdjusted: boolean;
}

export interface WorkoutLog {
  id: string;
  sessionId?: string;
  date: string;
  name: string;
  type: SessionType;
  completed: boolean;
  rpe?: number;
  durationMin?: number;
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  kg: number;
}

export interface WaistEntry {
  id: string;
  date: string;
  cm: number;
}

export interface DexaEntry {
  id: string;
  date: string;
  bodyFatPct: number;
  leanMassKg: number;
  fatMassKg: number;
  visceralFatCm2: number;
  notes?: string;
}

export interface RecoveryEntry {
  id: string;
  date: string;
  score: number;
  sleepHours?: number;
  soreness?: number;
  notes?: string;
}

export interface CalendarBlock {
  id: string;
  date: string;
  startHour: number;
  endHour: number;
  title: string;
  hardConflict: boolean;
}

export interface WeatherDay {
  date: string;
  code: number;
  summary: string;
  tempMax: number;
  tempMin: number;
  precipMm: number;
  windKmh: number;
  outdoorScore: number;
  outdoorOk: boolean;
  caution: string | null;
}

export interface CoachRecommendation {
  id: string;
  title: string;
  action: string;
  explanation: string;
  severity: "info" | "watch" | "priority";
  relatedDate?: string;
}

export interface AthleteSettings {
  name: string;
  weeklyStrength: number;
  weeklyQualityRun: number;
  weeklyEasyRun: number;
  weeklyLongRun: number;
  preferredRunHours: number[];
  preferredLiftHours: number[];
  heatLimitC: number;
  rainLimitMm: number;
  city: string;
  lat: number;
  lon: number;
}

export interface CoachState {
  settings: AthleteSettings;
  templates: WorkoutTemplate[];
  week: PlannedSession[];
  logs: WorkoutLog[];
  weights: WeightEntry[];
  waists: WaistEntry[];
  dexa: DexaEntry[];
  recovery: RecoveryEntry[];
  calendar: CalendarBlock[];
  weather: WeatherDay[];
  lastRejigAt?: string;
  lastWeatherAt?: string;
}

export const STORAGE_KEY = "pauls-hybrid-coach-v1";
