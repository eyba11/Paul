"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, Field, PrimaryButton, inputClass, typeLabel } from "@/components/ui";
import { longDate } from "@/lib/dates";
import { defaultRepsFromScheme, latestLiftMarks, tracksReps } from "@/lib/lifts";
import { getWorkoutRx, loadStorageKey, rxItemKey, speedFromPaceTarget, type RxItem } from "@/lib/prescriptions";
import { useCoach } from "@/lib/store";
import type { PlannedSession } from "@/lib/types";

function ticksKey(sessionId: string) {
  return `phc-rx-ticks-${sessionId}`;
}

const LOADS_KEY = "phc-exercise-loads-v1";
const REPS_KEY = "phc-exercise-reps-v1";

function readMap(key: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function ItemTargets({
  item,
  load,
  reps,
  last,
  onLoad,
  onReps,
}: {
  item: RxItem;
  load?: number;
  reps?: number;
  last?: { kg?: number; reps?: number; date: string };
  onLoad?: (kg: number) => void;
  onReps?: (reps: number) => void;
}) {
  const speed = speedFromPaceTarget(item.target);
  const kg = load ?? item.loadKg;
  const showReps = Boolean(onReps) && tracksReps(item.scheme, item.loadKg);
  const repValue = reps ?? defaultRepsFromScheme(item.scheme);
  return (
    <>
      {item.target && (
        <p className="mt-1 font-display text-lg uppercase tracking-wide text-volt">{item.target}</p>
      )}
      {speed && <p className="text-sm text-foam">{speed}</p>}
      {(item.loadKg != null || showReps) && (
        <div className="mt-2 flex flex-wrap gap-3" onClick={(e) => e.stopPropagation()}>
          {item.loadKg != null && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-mist">{item.loadLabel ?? "kg"}</span>
              {onLoad ? (
                <input
                  className="w-20 rounded-xl border border-white/10 bg-ink-950 px-2 py-1 text-foam outline-none ring-volt/40 focus:ring-2"
                  inputMode="decimal"
                  value={kg ?? ""}
                  onChange={(e) => onLoad(Number(e.target.value) || 0)}
                />
              ) : (
                <span className="font-display text-lg text-volt">{item.loadKg}</span>
              )}
            </label>
          )}
          {showReps && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-mist">reps</span>
              <input
                className="w-16 rounded-xl border border-white/10 bg-ink-950 px-2 py-1 text-foam outline-none ring-volt/40 focus:ring-2"
                inputMode="numeric"
                value={repValue ?? ""}
                onChange={(e) => onReps?.(Number(e.target.value) || 0)}
              />
            </label>
          )}
        </div>
      )}
      {last && (last.kg != null || last.reps != null) && (
        <p className="mt-1 text-xs text-mist">
          Last {last.date}
          {last.kg != null ? ` · ${last.kg} kg` : ""}
          {last.reps != null ? ` × ${last.reps}` : ""}
        </p>
      )}
      {item.rest && <p className="mt-1 text-xs text-mist">Rest {item.rest}</p>}
      {item.equipment && <p className="mt-1 text-xs text-mist">{item.equipment}</p>}
      {item.note && <p className="mt-1 text-sm text-mist">{item.note}</p>}
    </>
  );
}

export function SessionDetail({
  session,
  fromLibrary = false,
}: {
  session: PlannedSession;
  fromLibrary?: boolean;
}) {
  const { logCompletion, state } = useCoach();
  const rx = useMemo(() => getWorkoutRx(session), [session]);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [loads, setLoads] = useState<Record<string, number>>({});
  const [reps, setReps] = useState<Record<string, number>>({});
  const [rpe, setRpe] = useState("7");
  const [saved, setSaved] = useState(false);
  const isStrength = session.type === "strength";
  const isRun = session.type === "easy_run" || session.type === "quality_run" || session.type === "long_run";
  const lastMarks = useMemo(() => latestLiftMarks(state.liftLogs), [state.liftLogs]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ticksKey(session.id));
      setTicks(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setTicks({});
    }
    const storedLoads = readMap(LOADS_KEY);
    const storedReps = readMap(REPS_KEY);
    const nextLoads = { ...storedLoads };
    const nextReps = { ...storedReps };
    for (const [key, mark] of Object.entries(lastMarks)) {
      if (mark.kg != null && nextLoads[key] == null) nextLoads[key] = mark.kg;
      if (mark.reps != null && nextReps[key] == null) nextReps[key] = mark.reps;
    }
    setLoads(nextLoads);
    setReps(nextReps);
  }, [session.id, lastMarks]);

  function toggle(key: string) {
    setTicks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(ticksKey(session.id), JSON.stringify(next));
      return next;
    });
  }

  function saveLoad(name: string, kg: number) {
    setLoads((prev) => {
      const next = { ...prev, [loadStorageKey(name)]: kg };
      localStorage.setItem(LOADS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function saveReps(name: string, count: number) {
    setReps((prev) => {
      const next = { ...prev, [loadStorageKey(name)]: count };
      localStorage.setItem(REPS_KEY, JSON.stringify(next));
      return next;
    });
  }

  const totalItems = rx.blocks.reduce((n, b) => n + b.items.length, 0);
  const doneItems = Object.values(ticks).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Link href={fromLibrary ? "/workouts" : "/plan"} className="text-sm text-volt">
        {fromLibrary ? "← Library" : "← Planner"}
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-mist">{longDate(session.date)}</p>
        <h1 className="font-display text-3xl uppercase leading-none text-foam">{session.name}</h1>
        <p className="mt-2 text-sm text-foam/80">{session.focus}</p>
        <p className="mt-2 text-sm text-mist">
          {typeLabel(session.type)} · {session.durationMin} min · {session.intensity}
        </p>
        {fromLibrary && (
          <p className="mt-2 text-sm text-volt">
            Library session for today. Completing this logs the work you actually did and updates the planner suggestion.
          </p>
        )}
        {session.completed && (
          <p className="mt-2 text-sm text-volt">Already logged for this slot.</p>
        )}
      </div>

      <Card>
        <p className="text-sm text-foam">{rx.summary}</p>
        {isStrength && (
          <p className="mt-2 text-sm text-mist">
            Edit kg and reps. Both save on this phone and land in Track so you can see progress.
          </p>
        )}
        {isRun && (
          <p className="mt-2 text-sm text-mist">
            Easy running is a talk test. VO₂ work is RPE 8–9 — do not sprint the first rep. Pace/speed only shows if a /km target is listed.
          </p>
        )}
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
              const markKey = loadStorageKey(item.name);
              return (
                <li key={key} className={`rounded-2xl border p-3 ${on ? "border-volt/40 bg-volt/10" : "border-white/10 bg-ink-900"}`}>
                  <button type="button" onClick={() => toggle(key)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-medium ${on ? "text-volt" : "text-foam"}`}>
                        {on ? "✓ " : ""}
                        {item.name}
                      </p>
                      <p className="shrink-0 text-sm text-mist">{item.scheme}</p>
                    </div>
                  </button>
                  <ItemTargets
                    item={item}
                    load={loads[markKey]}
                    reps={reps[markKey]}
                    last={lastMarks[markKey]}
                    onLoad={item.loadKg != null ? (kg) => saveLoad(item.name, kg) : undefined}
                    onReps={tracksReps(item.scheme, item.loadKg) ? (count) => saveReps(item.name, count) : undefined}
                  />
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
            const lifts = rx.blocks.flatMap((block) =>
              block.items
                .filter((item) => tracksReps(item.scheme, item.loadKg) || item.loadKg != null)
                .map((item) => {
                  const markKey = loadStorageKey(item.name);
                  return {
                    exercise: item.name,
                    kg: loads[markKey] ?? item.loadKg,
                    reps: reps[markKey] ?? defaultRepsFromScheme(item.scheme),
                  };
                }),
            );
            logCompletion({
              sessionId: fromLibrary ? undefined : session.id,
              templateId: session.templateId,
              fromLibrary,
              name: session.name,
              type: session.type,
              durationMin: session.durationMin,
              rpe: Number(rpe),
              date: fromLibrary ? undefined : session.date,
              lifts,
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
