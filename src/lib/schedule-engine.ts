import type { CoachState, PlannedSession } from "./types";
import { applyCalendarToWeek, dayLoad } from "./calendar-engine";
import { applyWeatherToWeek } from "./weather-engine";
import { todayIso } from "./dates";

function latestRecovery(state: CoachState): number {
  const sorted = [...state.recovery].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0]?.score ?? 7;
}

export function applyAdaptiveRules(state: CoachState): PlannedSession[] {
  const today = todayIso();
  let week = applyWeatherToWeek(state.week, state.weather);
  week = applyCalendarToWeek(week, state.calendar);
  const recovery = latestRecovery(state);

  return week.map((session) => {
    if (session.date < today) return session;
    if (recovery <= 4 && session.intensity === "hard") {
      return {
        ...session,
        name: session.type.includes("run") ? "Easy aerobic (downgraded)" : "Technique strength",
        intensity: "easy",
        durationMin: Math.min(session.baseDurationMin, 40),
        notes: `${session.notes} Recovery is ${recovery}/10, so intensity is capped.`,
      };
    }
    if (recovery >= 8 && session.type === "easy_run" && dayLoad(session.date, state.calendar) < 4) {
      return {
        ...session,
        notes: `${session.notes} Recovery is high — you may extend 10 minutes if legs feel springy.`,
      };
    }
    return session;
  });
}
