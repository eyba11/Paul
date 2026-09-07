import type { DexaEntry, WeightEntry } from "./types";

export function dexaTotalKg(entry: Pick<DexaEntry, "leanMassKg" | "fatMassKg">): number {
  return Math.round((entry.leanMassKg + entry.fatMassKg) * 10) / 10;
}

export function massesFromTotal(totalKg: number, bodyFatPct: number): {
  fatMassKg: number;
  leanMassKg: number;
} {
  const fatMassKg = Math.round(totalKg * (bodyFatPct / 100) * 10) / 10;
  const leanMassKg = Math.round((totalKg - fatMassKg) * 10) / 10;
  return { fatMassKg, leanMassKg };
}

export function impliedFatPct(entry: Pick<DexaEntry, "leanMassKg" | "fatMassKg">): number {
  const total = dexaTotalKg(entry);
  if (!total) return 0;
  return Math.round((entry.fatMassKg / total) * 1000) / 10;
}

export function nearestScaleKg(date: string, weights: WeightEntry[]): number | undefined {
  if (!weights.length) return undefined;
  let best = weights[0];
  let bestDist = Infinity;
  for (const w of weights) {
    const dist = Math.abs(Date.parse(w.date) - Date.parse(date));
    if (dist < bestDist) {
      best = w;
      bestDist = dist;
    }
  }
  return best.kg;
}

export function dexaScaleGap(entry: DexaEntry, weights: WeightEntry[]): number | undefined {
  const scale = nearestScaleKg(entry.date, weights);
  if (scale == null) return undefined;
  return Math.round((dexaTotalKg(entry) - scale) * 10) / 10;
}

export function isPlaceholderDexaMass(entry: Pick<DexaEntry, "leanMassKg" | "fatMassKg">): boolean {
  const lean = entry.leanMassKg;
  const fat = entry.fatMassKg;
  return (
    (Math.abs(lean - 64.1) < 0.05 && Math.abs(fat - 18.8) < 0.05) ||
    (Math.abs(lean - 65) < 0.05 && Math.abs(fat - 16.9) < 0.05)
  );
}

export function correctedPlaceholderMass(entry: Pick<DexaEntry, "bodyFatPct" | "leanMassKg" | "fatMassKg">): {
  leanMassKg: number;
  fatMassKg: number;
} | null {
  if (Math.abs(entry.leanMassKg - 64.1) < 0.05 && Math.abs(entry.fatMassKg - 18.8) < 0.05) {
    return massesFromTotal(86.4, entry.bodyFatPct || 22.4);
  }
  if (Math.abs(entry.leanMassKg - 65) < 0.05 && Math.abs(entry.fatMassKg - 16.9) < 0.05) {
    return massesFromTotal(85.3, entry.bodyFatPct || 20.1);
  }
  return null;
}
