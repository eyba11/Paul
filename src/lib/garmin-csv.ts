import type { SessionType, WeightEntry, WorkoutLog } from "./types";
import { isoDate } from "./dates";

export interface GarminImportDraft {
  logs: Omit<WorkoutLog, "id">[];
  weights: Omit<WeightEntry, "id">[];
  skipped: number;
  warnings: string[];
}

const ACTIVITY_HEADERS = ["activity type", "type", "sport", "activitytype"];
const TITLE_HEADERS = ["title", "name", "activity name", "activity"];
const DATE_HEADERS = ["date", "start time", "start", "timestamp"];
const DURATION_HEADERS = ["time", "duration", "elapsed time", "moving time", "total time"];
const DISTANCE_HEADERS = ["distance", "distance (km)", "distance (mi)"];
const HR_HEADERS = ["avg hr", "average hr", "avg heart rate", "average heart rate"];
const WEIGHT_HEADERS = ["weight", "weight kg", "weight (kg)", "weight (lbs)", "weight (lb)"];

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/®/g, "");
}

function pick(row: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const hit = Object.entries(row).find(([key]) => key === alias || key.startsWith(alias));
    if (hit?.[1]) return hit[1];
  }
  return "";
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (ch === delimiter && !quoted) {
      out.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

export function parseCsvTable(text: string): Record<string, string>[] {
  const raw = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!raw) return [];
  const firstLine = raw.split("\n")[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = (cells[i] ?? "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

function parseNumber(value: string): number | undefined {
  if (!value || /^(--|n\/a|null)$/i.test(value)) return undefined;
  const cleaned = value.replace(/[^\d.,-]/g, "");
  if (!cleaned) return undefined;
  const normalized =
    cleaned.includes(",") && cleaned.includes(".")
      ? cleaned.replace(/,/g, "")
      : cleaned.includes(",") && !cleaned.includes(".")
        ? cleaned.replace(",", ".")
        : cleaned;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

export function parseGarminDate(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = v.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (dmy) {
    const a = Number(dmy[1]);
    const b = Number(dmy[2]);
    const y = dmy[3];
    if (a > 12) return `${y}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
    if (b > 12) return `${y}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
    return `${y}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
  }
  const parsed = new Date(v);
  if (!Number.isNaN(parsed.getTime())) return isoDate(parsed);
  return undefined;
}

export function parseDurationMinutes(value: string): number | undefined {
  const v = value.trim();
  if (!v || v === "--") return undefined;
  if (/^\d+(\.\d+)?$/.test(v)) {
    const n = Number(v);
    return n > 180 ? Math.round(n / 60) : Math.round(n);
  }
  const parts = v.split(":").map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p))) return undefined;
  if (parts.length === 3) return Math.max(1, Math.round(parts[0] * 60 + parts[1] + parts[2] / 60));
  if (parts.length === 2) return Math.max(1, Math.round(parts[0] + parts[1] / 60));
  return undefined;
}

function classifySession(activityType: string, title: string, durationMin: number, distanceKm?: number): SessionType {
  const blob = `${activityType} ${title}`.toLowerCase();
  if (/(strength|weights?|gym|hypertrophy|deadlift|squat)/.test(blob)) return "strength";
  if (/(yoga|pilates|stretch|mobility|flexibility|recovery|breathwork)/.test(blob)) return "mobility";
  if (/(walk|hike)/.test(blob) && (durationMin < 50 || (distanceKm ?? 0) < 6)) return "mobility";
  if (/(interval|tempo|threshold|vo2|repeat|track|fartlek|quality|race|5k|10k|time trial)/.test(blob)) {
    return "quality_run";
  }
  if (
    /(run|trail|treadmill|virtual run|cycling|bike|cycle|swim|row|cardio|elliptical)/.test(blob) ||
    distanceKm
  ) {
    if (durationMin >= 75 || (distanceKm ?? 0) >= 14) return "long_run";
    return "easy_run";
  }
  if (durationMin >= 75) return "long_run";
  return "easy_run";
}

function toKg(value: number, header: string, row: Record<string, string>): number {
  const unit = `${header} ${row.unit ?? row.units ?? ""}`.toLowerCase();
  if (/(lb|lbs|pound)/.test(unit) || (value > 140 && value < 400 && !/(kg)/.test(unit))) {
    return Math.round((value / 2.20462) * 10) / 10;
  }
  return Math.round(value * 10) / 10;
}

function toKm(value: number, header: string): number {
  if (/(mi|mile)/.test(header) || value > 80) return Math.round((value * 1.60934) * 100) / 100;
  return Math.round(value * 100) / 100;
}

export function parseGarminCsv(text: string): GarminImportDraft {
  const rows = parseCsvTable(text);
  const logs: Omit<WorkoutLog, "id">[] = [];
  const weights: Omit<WeightEntry, "id">[] = [];
  const warnings: string[] = [];
  let skipped = 0;

  for (const row of rows) {
    const weightHeader = Object.keys(row).find((key) => WEIGHT_HEADERS.some((h) => key.includes("weight")));
    const weightRaw = weightHeader ? row[weightHeader] : pick(row, WEIGHT_HEADERS);
    const weightNum = parseNumber(weightRaw);
    const date = parseGarminDate(pick(row, DATE_HEADERS) || row.date || row.time || "");
    const activityType = pick(row, ACTIVITY_HEADERS);
    const title = pick(row, TITLE_HEADERS) || activityType;

    if (weightNum && weightNum > 30 && weightNum < 400 && (!activityType || !pick(row, DURATION_HEADERS))) {
      if (!date) {
        skipped += 1;
        continue;
      }
      weights.push({ date, kg: toKg(weightNum, weightHeader ?? "weight", row) });
      continue;
    }

    if (!activityType && !title) {
      skipped += 1;
      continue;
    }

    const durationMin =
      parseDurationMinutes(pick(row, DURATION_HEADERS)) ??
      parseDurationMinutes(row["elapsed time"] ?? "") ??
      parseDurationMinutes(row["moving time"] ?? "");
    if (!date || !durationMin) {
      skipped += 1;
      continue;
    }

    const distanceHeader = Object.keys(row).find((key) => DISTANCE_HEADERS.some((h) => key.includes("distance")));
    const distanceNum = parseNumber(pick(row, DISTANCE_HEADERS));
    const distanceKm = distanceNum != null ? toKm(distanceNum, distanceHeader ?? "distance") : undefined;
    const avgHr = parseNumber(pick(row, HR_HEADERS));
    const type = classifySession(activityType, title, durationMin, distanceKm);
    const details = [
      distanceKm ? `${distanceKm} km` : null,
      avgHr ? `avg HR ${Math.round(avgHr)}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    logs.push({
      date,
      name: title || activityType,
      type,
      completed: true,
      durationMin,
      notes: `Garmin${details ? ` · ${details}` : ""}`,
    });
  }

  if (!logs.length && !weights.length) {
    warnings.push("No Garmin activities or weigh-ins were recognised. Export CSV from Garmin Connect Activities or Weight.");
  }

  return { logs, weights, skipped, warnings };
}

export function logFingerprint(log: Pick<WorkoutLog, "date" | "name" | "durationMin">): string {
  return `${log.date}|${log.name.trim().toLowerCase()}|${log.durationMin ?? 0}`;
}

export function weightFingerprint(entry: Pick<WeightEntry, "date" | "kg">): string {
  return `${entry.date}|${entry.kg.toFixed(1)}`;
}
