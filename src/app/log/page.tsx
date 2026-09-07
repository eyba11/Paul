"use client";

import { FormEvent, useMemo, useState } from "react";
import { GarminImport } from "@/components/GarminImport";
import { Card, Field, PrimaryButton, inputClass, typeLabel } from "@/components/ui";
import { todayIso } from "@/lib/dates";
import { useCoach } from "@/lib/store";
import type { SessionType } from "@/lib/types";
import Link from "next/link";

export default function LogPage() {
  const { state, logCompletion, addRecovery } = useCoach();
  const today = todayIso();
  const todaySession = state.week.find((s) => s.date === today);
  const [rpe, setRpe] = useState("6");
  const [score, setScore] = useState("7");
  const [sleep, setSleep] = useState("7.5");
  const [notes, setNotes] = useState("");
  const [recoveryNotes, setRecoveryNotes] = useState("");

  const recent = useMemo(
    () => [...state.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20),
    [state.logs],
  );

  function onComplete(e: FormEvent) {
    e.preventDefault();
    logCompletion({
      sessionId: todaySession?.id,
      name: todaySession?.name ?? "Custom session",
      type: (todaySession?.type ?? "easy_run") as SessionType,
      rpe: Number(rpe),
      durationMin: todaySession?.durationMin,
      notes,
    });
    setNotes("");
  }

  function onRecovery(e: FormEvent) {
    e.preventDefault();
    addRecovery({
      date: today,
      score: Number(score),
      sleepHours: Number(sleep),
      notes: recoveryNotes,
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase">Log</h1>
      <GarminImport />
      <Card>
        <h2 className="text-sm uppercase tracking-[0.16em] text-mist">Workout completion</h2>
        <p className="mt-1 text-lg">{todaySession?.name ?? "No planned session"}</p>
        {todaySession && (
          <>
            <p className="text-sm text-mist">
              {typeLabel(todaySession.type)} · {todaySession.durationMin} min
            </p>
            <Link href={`/session/${todaySession.id}`} className="mt-2 inline-block text-sm text-volt">
              Open exercises and paces
            </Link>
          </>
        )}
        <form onSubmit={onComplete} className="mt-3 space-y-3">
          <Field label="RPE 1–10">
            <input className={inputClass} value={rpe} onChange={(e) => setRpe(e.target.value)} />
          </Field>
          <Field label="Notes">
            <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <PrimaryButton type="submit">Mark complete</PrimaryButton>
        </form>
      </Card>

      <Card>
        <h2 className="text-sm uppercase tracking-[0.16em] text-mist">Recovery score</h2>
        <form onSubmit={onRecovery} className="mt-3 space-y-3">
          <Field label="Score 1–10">
            <input className={inputClass} value={score} onChange={(e) => setScore(e.target.value)} />
          </Field>
          <Field label="Sleep hours">
            <input className={inputClass} value={sleep} onChange={(e) => setSleep(e.target.value)} />
          </Field>
          <PrimaryButton type="submit">Save recovery</PrimaryButton>
        </form>
        <ul className="mt-4 space-y-1 text-sm text-mist">
          {state.recovery.slice(0, 5).map((r) => (
            <li key={r.id} className="flex justify-between">
              <span>{r.date}</span>
              <span className="text-foam">{r.score}/10</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-sm uppercase tracking-[0.16em] text-mist">Recent completions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {recent.map((l) => (
            <li key={l.id} className="flex justify-between gap-3">
              <span>
                {l.date} · {l.name}
                {l.durationMin ? ` · ${l.durationMin}m` : ""}
              </span>
              <span className="text-mist">RPE {l.rpe ?? "–"}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
