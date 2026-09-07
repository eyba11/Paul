"use client";

import Link from "next/link";
import { Card, typeLabel } from "@/components/ui";
import { useCoach } from "@/lib/store";

export default function WorkoutsPage() {
  const { state } = useCoach();
  return (
    <div className="space-y-3">
      <h1 className="font-display text-3xl uppercase">Workout library</h1>
      <p className="text-sm text-mist">
        Templates the adaptive planner, weather engine and rejig feature pull from.
      </p>
      {state.templates.map((t) => (
        <Link key={t.id} href={`/workouts/${t.id}`} className="block">
          <Card>
            <p className="text-xs uppercase tracking-[0.16em] text-volt">{typeLabel(t.type)}</p>
            <h2 className="text-lg">{t.name}</h2>
            <p className="text-sm text-mist">
              {t.durationMin} min · {t.intensity} · {t.environment}
            </p>
            <p className="mt-2 text-sm">{t.focus}</p>
            <p className="mt-1 text-sm text-mist">{t.notes}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
