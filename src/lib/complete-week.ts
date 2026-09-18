import type { PlannedSession, SessionType, WorkoutTemplate } from "./types";
import { overlayTemplate, templates } from "./seed";

export function applyCompletionToPlanner(
  week: PlannedSession[],
  input: {
    date: string;
    name: string;
    type: SessionType;
    templateId?: string;
    logId: string;
    sessionId?: string;
  },
): PlannedSession[] {
  const tmpl = input.templateId ? templates.find((t) => t.id === input.templateId) : undefined;
  const mobility = templates.find((t) => t.id === "mobility");

  return week.map((session) => {
    if (input.sessionId && session.id === input.sessionId) {
      return markDone(alignToday(session, tmpl, input), input.logId);
    }
    if (session.date === input.date) {
      return markDone(alignToday(session, tmpl, input), input.logId);
    }
    if (
      input.templateId &&
      session.date > input.date &&
      session.templateId === input.templateId &&
      !session.completed &&
      mobility
    ) {
      const next = overlayTemplate(session, mobility);
      return {
        ...next,
        notes: `${input.name} already done on ${input.date}. This slot is optional recovery.`,
      };
    }
    return session;
  });
}

function alignToday(
  session: PlannedSession,
  tmpl: WorkoutTemplate | undefined,
  input: { name: string; type: SessionType; templateId?: string },
): PlannedSession {
  if (input.templateId && session.templateId === input.templateId) return session;
  if (tmpl) {
    const next = overlayTemplate(session, tmpl);
    return {
      ...next,
      notes: `Logged ${input.name}. Planner suggestion updated from ${session.baseName}.`,
    };
  }
  return {
    ...session,
    name: input.name,
    type: input.type,
    notes: `Logged ${input.name}. Originally suggested: ${session.baseName}.`,
  };
}

function markDone(session: PlannedSession, logId: string): PlannedSession {
  return { ...session, completed: true, completedLogId: logId };
}
