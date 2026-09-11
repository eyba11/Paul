"use client";

import { Card, typeLabel } from "@/components/ui";
import { longDate } from "@/lib/dates";
import { useCoach } from "@/lib/store";
import Link from "next/link";

export function WeekPlanner() {
  const { state } = useCoach();
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.22em] text-volt">Adaptive week</p>
          <h1 className="font-display text-3xl uppercase text-foam">Planner</h1>
        </div>
        <Link href="/calendar" className="text-xs text-volt">
          Calendar engine
        </Link>
      </div>
      {state.week.map((session) => (
        <Link key={session.id} href={`/session/${session.id}`} className="block">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-mist">{longDate(session.date)}</p>
                <h2 className="text-lg text-foam">{session.name}</h2>
                <p className="text-sm text-foam/80">{session.focus}</p>
                <p className="text-sm text-mist">
                  {typeLabel(session.type)} · {session.durationMin} min · {session.intensity}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[10px] uppercase tracking-wide">
                <span className="text-volt">Open</span>
                {session.weatherAdjusted && <span className="text-volt">Weather</span>}
                {session.calendarAdjusted && <span className="text-mist">Calendar</span>}
              </div>
            </div>
            <p className="mt-2 text-sm text-mist">{session.notes}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
