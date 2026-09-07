import type { CoachState, PlannedSession, SessionType } from "./types";
import { applyAdaptiveRules } from "./schedule-engine";
import { dayLoad } from "./calendar-engine";
import { todayIso, uid } from "./dates";

const PRIORITY: SessionType[] = [
  "strength",
  "long_run",
  "quality_run",
  "easy_run",
  "mobility",
  "rest",
];

function remainingKeySessions(week: PlannedSession[], today: string): PlannedSession[] {
  const done = new Set(
    week.filter((s) => s.date < today).map((s) => s.templateId + s.type),
  );
  return week
    .filter((s) => s.date >= today && s.type !== "rest")
    .sort((a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type))
    .filter((s, i, arr) => arr.findIndex((x) => x.templateId === s.templateId) === i)
    .filter((s) => !done.has(s.templateId + s.type));
}

export function rejigWeek(state: CoachState): CoachState {
  const today = todayIso();
  const weatherByDate = new Map(state.weather.map((w) => [w.date, w]));
  const remainingDays = state.week.filter((s) => s.date >= today).map((s) => s.date);
  const past = state.week.filter((s) => s.date < today);
  const needed = remainingKeySessions(state.week, today);

  const scoredDays = remainingDays
    .map((date) => {
      const weather = weatherByDate.get(date);
      const cal = dayLoad(date, state.calendar);
      const outdoor = weather?.outdoorScore ?? 70;
      return { date, cal, outdoor };
    })
    .sort((a, b) => a.cal - b.cal || b.outdoor - a.outdoor);

  const used = new Set<string>();
  const placed: PlannedSession[] = [];

  for (const session of needed) {
    const wantsOutdoor = session.environment === "outdoor";
    const slot = scoredDays.find((d) => {
      if (used.has(d.date)) return false;
      if (wantsOutdoor && d.outdoor < 55) return false;
      if (session.intensity === "hard" && d.cal >= 9) return false;
      return true;
    }) ?? scoredDays.find((d) => !used.has(d.date));

    if (!slot) continue;
    used.add(slot.date);
    placed.push({
      ...session,
      id: uid("ses"),
      date: slot.date,
      weatherAdjusted: wantsOutdoor && (weatherByDate.get(slot.date)?.outdoorOk === false),
      calendarAdjusted: slot.cal >= 6,
      notes:
        session.notes +
        ` Rejigged onto ${slot.date} (calendar load ${slot.cal.toFixed(1)}, outdoor ${slot.outdoor}).`,
    });
  }

  for (const day of remainingDays) {
    if (used.has(day)) continue;
    const mobility = state.templates.find((t) => t.id === "mobility")!;
    placed.push({
      id: uid("ses"),
      date: day,
      templateId: mobility.id,
      name: "Optional mobility",
      baseName: "Optional mobility",
      type: "mobility",
      durationMin: mobility.durationMin,
      baseDurationMin: mobility.durationMin,
      intensity: "recovery",
      environment: "either",
      focus: mobility.focus,
      notes: "Inserted after rejig — keep this optional.",
      baseNotes: mobility.notes,
      locked: false,
      weatherAdjusted: false,
      calendarAdjusted: false,
    });
    used.add(day);
  }

  const week = [...past, ...placed].sort((a, b) => a.date.localeCompare(b.date));
  return {
    ...state,
    week,
    lastRejigAt: new Date().toISOString(),
  };
}

export function adaptivePlan(state: CoachState): PlannedSession[] {
  return applyAdaptiveRules(state);
}
