export function defaultRepsFromScheme(scheme: string): number | undefined {
  if (/sec|min|\bm\b/i.test(scheme) && !/×\s*\d+\s*[–-]/i.test(scheme)) return undefined;
  const range = scheme.match(/×\s*(\d+)\s*[–-]\s*(\d+)/);
  if (range) return Number(range[2]);
  const single = scheme.match(/×\s*(\d+)/);
  if (single && !/sec|min/i.test(scheme)) return Number(single[1]);
  return undefined;
}

export function tracksReps(scheme: string, loadKg?: number): boolean {
  if (loadKg != null) return true;
  if (/sec|min/i.test(scheme)) return false;
  return /×\s*\d+/.test(scheme);
}

export function latestLiftMarks(
  logs: { date: string; exercise: string; kg?: number; reps?: number }[],
): Record<string, { kg?: number; reps?: number; date: string }> {
  const out: Record<string, { kg?: number; reps?: number; date: string }> = {};
  for (const log of [...logs].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = log.exercise.trim().toLowerCase();
    out[key] = { kg: log.kg, reps: log.reps, date: log.date };
  }
  return out;
}
