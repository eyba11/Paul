import type { CalendarBlock, PlannedSession } from "./types";

export function blocksOn(date: string, calendar: CalendarBlock[]): CalendarBlock[] {
  return calendar.filter((b) => b.date === date).sort((a, b) => a.startHour - b.startHour);
}

export function dayLoad(date: string, calendar: CalendarBlock[]): number {
  return blocksOn(date, calendar).reduce((sum, b) => {
    const hours = Math.max(0, b.endHour - b.startHour);
    return sum + hours * (b.hardConflict ? 1.4 : 0.8);
  }, 0);
}

export function applyCalendarToWeek(
  week: PlannedSession[],
  calendar: CalendarBlock[],
): PlannedSession[] {
  return week.map((session) => {
    const load = dayLoad(session.date, calendar);
    const hardBlocks = blocksOn(session.date, calendar).filter((b) => b.hardConflict);
    if (load < 6 && hardBlocks.length === 0) {
      return { ...session, calendarAdjusted: false };
    }
    if (session.intensity === "hard" && (load >= 8 || hardBlocks.length > 0)) {
      return {
        ...session,
        calendarAdjusted: true,
        notes: `${session.notes} Calendar is dense (${hardBlocks[0]?.title ?? "busy day"}). Keep this session short or move it.`,
        durationMin: Math.max(25, Math.round(session.baseDurationMin * 0.85)),
      };
    }
    if (session.type !== "rest" && load >= 10) {
      return {
        ...session,
        calendarAdjusted: true,
        notes: `${session.notes} Heavy calendar load — treat this as optional if energy is low.`,
      };
    }
    return session;
  });
}
