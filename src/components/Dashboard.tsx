"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, GhostButton, PrimaryButton, SeverityDot, Sparkline, typeLabel } from "@/components/ui";
import { longDate, todayIso, weekdayLabel } from "@/lib/dates";
import { useCoach } from "@/lib/store";

export default function PaulsHybridCoachDashboard() {
  const { state, recommendations, refreshWeather, rejig, hydrated } = useCoach();
  const [busy, setBusy] = useState<"weather" | "rejig" | null>(null);
  const today = todayIso();
  const session = state.week.find((s) => s.date === today) ?? state.week.find((s) => s.date >= today);
  const weights = useMemo(
    () => [...state.weights].sort((a, b) => a.date.localeCompare(b.date)).map((w) => w.kg),
    [state.weights],
  );
  const recovery = [...state.recovery].sort((a, b) => b.date.localeCompare(a.date))[0];
  const dexa = [...state.dexa].sort((a, b) => b.date.localeCompare(a.date))[0];
  const waist = [...state.waists].sort((a, b) => b.date.localeCompare(a.date))[0];
  const weatherToday = state.weather.find((w) => w.date === today);

  async function onWeather() {
    setBusy("weather");
    try {
      await refreshWeather();
    } finally {
      setBusy(null);
    }
  }

  function onRejig() {
    setBusy("rejig");
    rejig();
    setTimeout(() => setBusy(null), 400);
  }

  if (!hydrated) {
    return <p className="py-20 text-center text-mist">Loading coach…</p>;
  }

  return (
    <div className="space-y-4">
      {session ? (
        <Link href={`/session/${session.id}`} className="block">
          <section className="overflow-hidden rounded-[28px] border border-volt/20 bg-gradient-to-br from-ink-700 to-ink-950 p-5">
            <p className="font-display text-xs uppercase tracking-[0.25em] text-volt">Today · tap for workout</p>
            <h1 className="mt-1 font-display text-3xl uppercase leading-none text-foam">
              {session.name}
            </h1>
            <p className="mt-2 text-sm text-mist">{`${session.durationMin} min · ${session.focus}`}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1">{typeLabel(session.type)}</span>
              {session.weatherAdjusted && (
                <span className="rounded-full bg-volt/15 px-3 py-1 text-volt">Weather-aware</span>
              )}
              {session.calendarAdjusted && (
                <span className="rounded-full bg-white/10 px-3 py-1">Calendar-aware</span>
              )}
            </div>
          </section>
        </Link>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-volt/20 bg-gradient-to-br from-ink-700 to-ink-950 p-5">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-volt">Today</p>
          <h1 className="mt-1 font-display text-3xl uppercase leading-none text-foam">Rest and reset</h1>
          <p className="mt-2 text-sm text-mist">No session locked in.</p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-mist">Recovery</p>
          <p className="mt-1 font-display text-4xl text-foam">{recovery?.score ?? "—"}</p>
          <p className="text-xs text-mist">/10 {recovery ? `· ${recovery.date}` : ""}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-mist">Weight</p>
          <p className="mt-1 font-display text-4xl text-foam">
            {weights.at(-1)?.toFixed(1) ?? "—"}
          </p>
          <div className="text-volt">
            <Sparkline values={weights} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-mist">Weather engine</p>
            <p className="mt-1 text-lg text-foam">
              {weatherToday
                ? `${weatherToday.summary} · ${Math.round(weatherToday.tempMax)}°`
                : "Fetch the 7-day outdoor score"}
            </p>
            {weatherToday?.caution && (
              <p className="mt-1 text-sm text-amber-200">{weatherToday.caution}</p>
            )}
          </div>
          <Link href="/weather" className="text-xs text-volt">
            Details
          </Link>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {state.week.map((day) => {
            const w = state.weather.find((x) => x.date === day.date);
            return (
              <div key={day.id} className="min-w-[3.4rem] rounded-2xl bg-ink-900 px-2 py-2 text-center">
                <p className="text-[10px] uppercase text-mist">{weekdayLabel(day.date)}</p>
                <p className="text-sm text-foam">{w ? w.outdoorScore : "–"}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <PrimaryButton onClick={onWeather} disabled={busy !== null}>
            {busy === "weather" ? "Scoring…" : "Update weather"}
          </PrimaryButton>
          <GhostButton onClick={onRejig} disabled={busy !== null}>
            {busy === "rejig" ? "Rejigging…" : "Rejig my week"}
          </GhostButton>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.16em] text-mist">Coach says</p>
          <Link href="/coach" className="text-xs text-volt">
            All calls
          </Link>
        </div>
        <ul className="space-y-3">
          {recommendations.slice(0, 3).map((rec) => (
            <li key={rec.id} className="rounded-2xl bg-ink-900 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-foam">
                <SeverityDot severity={rec.severity} />
                {rec.title}
              </p>
              <p className="mt-1 text-sm text-mist">{rec.action}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-mist">Waist</p>
          <p className="mt-1 font-display text-3xl">{waist?.cm ?? "—"} cm</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-mist">DEXA fat</p>
          <p className="mt-1 font-display text-3xl">{dexa?.bodyFatPct ?? "—"}%</p>
        </Card>
      </div>

      <Card>
        <p className="text-xs uppercase tracking-[0.16em] text-mist">This week</p>
        <ul className="mt-3 space-y-2">
          {state.week.map((s) => (
            <li key={s.id}>
              <Link href={`/session/${s.id}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-mist">{longDate(s.date)}</span>
                <span className={s.date === today ? "text-volt" : "text-foam"}>{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/plan" className="mt-3 inline-block text-sm text-volt">
          Open adaptive planner
        </Link>
      </Card>
    </div>
  );
}
