"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, Field, PrimaryButton, inputClass, typeLabel } from "@/components/ui";
import { longDate } from "@/lib/dates";
import { getWorkoutRx, rxItemKey } from "@/lib/prescriptions";
import { useCoach } from "@/lib/store";
import type { PlannedSession } from "@/lib/types";

function ticksKey(sessionId: string) {
  return `phc-rx-ticks-${sessionId}`;
}

export function SessionDetail({ session }: { session: PlannedSession }) {
  const { logCompletion } = useCoach();
  const rx = useMemo(() => getWorkoutRx(session), [session]);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [rpe, setRpe] = useState("7");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ticksKey(session.id));
      setTicks(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setTicks({});
    }
  }, [session.id]);

  function toggle(key: string) {
    setTicks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(ticksKey(session.id), JSON.stringify(next));
      return next;
    });
  }

  const totalItems = rx.blocks.reduce((n, b) => n + b.items.length, 0);
  const doneItems = Object.values(ticks).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Link href="/plan" className="text-sm text-volt">
        ← Planner
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-mist">{longDate(session.date)}</p>
        <h1 className="font-display text-3xl uppercase leading-none text-foam">{session.name}</h1>
        <p className="mt-2 text-sm text-mist">
          {typeLabel(session.type)} · {session.durationMin} min · {session.intensity}
        </p>
      </div>

      <Card>
        <p className="text-sm text-foam">{rx.summary}</p>
        {session.weatherAdjusted && rx.indoorNote && (
          <p className="mt-2 text-sm text-volt">{rx.indoorNote}</p>
        )}
        <p className="mt-2 text-sm text-mist">{session.notes}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-mist">
          {doneItems}/{totalItems} items ticked
        </p>
      </Card>

      {rx.blocks.map((block) => (
        <Card key={block.title}>
          <h2 className="text-sm uppercase tracking-[0.16em] text-volt">{block.title}</h2>
          <ul className="mt-3 space-y-3">
            {block.items.map((item, i) => {
              const key = rxItemKey(block.title, item, i);
              const on = Boolean(ticks[key]);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className={`w-full rounded-2xl border p-3 text-left ${
                      on ? "border-volt/40 bg-volt/10" : "border-white/10 bg-ink-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-medium ${on ? "text-volt" : "text-foam"}`}>
                        {on ? "✓ " : ""}
                        {item.name}
                      </p>
                      <p className="shrink-0 text-sm text-mist">{item.scheme}</p>
                    </div>
                    {item.target && (
                      <p className="mt-1 font-display text-lg uppercase tracking-wide text-volt">{item.target}</p>
                    )}
                    {item.rest && <p className="mt-1 text-xs text-mist">Rest {item.rest}</p>}
                    {item.note && <p className="mt-1 text-sm text-mist">{item.note}</p>}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      <Card>
        <h2 className="text-sm uppercase tracking-[0.16em] text-mist">Log this session</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            logCompletion({
              sessionId: session.id,
              name: session.name,
              type: session.type,
              durationMin: session.durationMin,
              rpe: Number(rpe),
              date: session.date,
            });
            setSaved(true);
          }}
        >
          <Field label="RPE 1–10">
            <input className={inputClass} value={rpe} onChange={(e) => setRpe(e.target.value)} />
          </Field>
          <PrimaryButton type="submit">{saved ? "Saved to log" : "Mark complete"}</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
