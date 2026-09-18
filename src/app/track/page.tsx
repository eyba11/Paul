"use client";

import { FormEvent, useMemo, useState } from "react";
import { GarminImport } from "@/components/GarminImport";
import { Card, Field, PrimaryButton, Sparkline, inputClass } from "@/components/ui";
import { dexaScaleGap, dexaTotalKg, massesFromTotal } from "@/lib/dexa";
import { latestLiftMarks } from "@/lib/lifts";
import { useCoach } from "@/lib/store";

export default function TrackPage() {
  const { state, addWeight, addWaist, addDexa } = useCoach();
  const [kg, setKg] = useState("");
  const [cm, setCm] = useState("");
  const [dexa, setDexa] = useState({
    date: "",
    totalKg: "",
    bodyFatPct: "",
    visceralFatCm2: "",
    notes: "",
  });

  const derived = useMemo(() => {
    const total = Number(dexa.totalKg);
    const pct = Number(dexa.bodyFatPct);
    if (!total || !pct) return null;
    return { total, pct, ...massesFromTotal(total, pct) };
  }, [dexa.totalKg, dexa.bodyFatPct]);

  function onWeight(e: FormEvent) {
    e.preventDefault();
    const n = Number(kg);
    if (!n) return;
    addWeight(n);
    setKg("");
  }

  function onWaist(e: FormEvent) {
    e.preventDefault();
    const n = Number(cm);
    if (!n) return;
    addWaist(n);
    setCm("");
  }

  function onDexa(e: FormEvent) {
    e.preventDefault();
    if (!derived) return;
    addDexa({
      date: dexa.date,
      bodyFatPct: derived.pct,
      leanMassKg: derived.leanMassKg,
      fatMassKg: derived.fatMassKg,
      visceralFatCm2: Number(dexa.visceralFatCm2),
      notes: dexa.notes,
    });
  }

  const weights = [...state.weights].sort((a, b) => b.date.localeCompare(a.date));
  const waists = [...state.waists].sort((a, b) => b.date.localeCompare(a.date));
  const latestLifts = latestLiftMarks(state.liftLogs ?? []);
  const liftNames = Object.keys(latestLifts).sort((a, b) => latestLifts[b].date.localeCompare(latestLifts[a].date));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase">Body tracking</h1>
      <GarminImport />
      <Card>
        <h2 className="mb-3 text-sm uppercase tracking-[0.16em] text-mist">Lift progress</h2>
        <p className="mb-3 text-sm text-mist">
          Kg and reps from completed gym sessions. Edit the boxes in a workout, then mark complete.
        </p>
        {liftNames.length === 0 ? (
          <p className="text-sm text-mist">No lift history yet.</p>
        ) : (
          <ul className="space-y-3">
            {liftNames.map((key) => {
              const last = latestLifts[key];
              const history = [...(state.liftLogs ?? [])]
                .filter((l) => l.exercise.trim().toLowerCase() === key)
                .sort((a, b) => a.date.localeCompare(b.date));
              const label = history[0]?.exercise ?? key;
              const kgs = history.map((l) => l.kg).filter((n): n is number => n != null);
              return (
                <li key={key} className="rounded-2xl bg-ink-900 p-3">
                  <p className="text-foam">{label}</p>
                  <p className="mt-1 font-display text-2xl text-volt">
                    {last.kg != null ? `${last.kg} kg` : "—"}
                    {last.reps != null ? ` × ${last.reps}` : ""}
                  </p>
                  <p className="text-xs text-mist">{last.date}</p>
                  {kgs.length >= 2 && (
                    <div className="mt-2 text-volt">
                      <Sparkline values={kgs} />
                    </div>
                  )}
                  <ul className="mt-2 space-y-1 text-xs text-mist">
                    {[...history]
                      .reverse()
                      .slice(0, 6)
                      .map((l) => (
                        <li key={l.id} className="flex justify-between gap-3">
                          <span>{l.date}</span>
                          <span className="text-foam">
                            {l.kg != null ? `${l.kg} kg` : ""}
                            {l.reps != null ? ` × ${l.reps}` : ""}
                          </span>
                        </li>
                      ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="mb-3 text-sm uppercase tracking-[0.16em] text-mist">Weight</h2>
        <form onSubmit={onWeight} className="mb-3 flex gap-2">
          <input className={inputClass} inputMode="decimal" placeholder="kg" value={kg} onChange={(e) => setKg(e.target.value)} />
          <PrimaryButton type="submit">Save</PrimaryButton>
        </form>
        <ul className="space-y-1 text-sm text-mist">
          {weights.slice(0, 6).map((w) => (
            <li key={w.id} className="flex justify-between">
              <span>{w.date}</span>
              <span className="text-foam">{w.kg.toFixed(1)} kg</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm uppercase tracking-[0.16em] text-mist">Waist</h2>
        <form onSubmit={onWaist} className="mb-3 flex gap-2">
          <input className={inputClass} inputMode="decimal" placeholder="cm" value={cm} onChange={(e) => setCm(e.target.value)} />
          <PrimaryButton type="submit">Save</PrimaryButton>
        </form>
        <ul className="space-y-1 text-sm text-mist">
          {waists.slice(0, 6).map((w) => (
            <li key={w.id} className="flex justify-between">
              <span>{w.date}</span>
              <span className="text-foam">{w.cm.toFixed(1)} cm</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm uppercase tracking-[0.16em] text-mist">DEXA history</h2>
        <p className="mb-3 text-sm text-mist">
          Enter the report&apos;s total mass and body-fat %. Lean and fat are calculated so the scan cannot silently sit 3 kg below the scale.
        </p>
        <form onSubmit={onDexa} className="grid grid-cols-2 gap-2">
          <Field label="Date">
            <input className={inputClass} type="date" value={dexa.date} onChange={(e) => setDexa({ ...dexa, date: e.target.value })} required />
          </Field>
          <Field label="DEXA total kg">
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="Scale-like total"
              value={dexa.totalKg}
              onChange={(e) => setDexa({ ...dexa, totalKg: e.target.value })}
              required
            />
          </Field>
          <Field label="Body fat %">
            <input className={inputClass} value={dexa.bodyFatPct} onChange={(e) => setDexa({ ...dexa, bodyFatPct: e.target.value })} required />
          </Field>
          <Field label="VAT cm²">
            <input className={inputClass} value={dexa.visceralFatCm2} onChange={(e) => setDexa({ ...dexa, visceralFatCm2: e.target.value })} required />
          </Field>
          <Field label="Notes">
            <input className={inputClass} value={dexa.notes} onChange={(e) => setDexa({ ...dexa, notes: e.target.value })} />
          </Field>
          <div className="col-span-2 rounded-2xl bg-ink-900 p-3 text-sm text-mist">
            {derived ? (
              <p>
                Fat {derived.fatMassKg} kg · lean {derived.leanMassKg} kg · total {derived.total.toFixed(1)} kg
              </p>
            ) : (
              <p>Fat and lean appear once total mass and body-fat % are filled.</p>
            )}
          </div>
          <div className="col-span-2 mt-2">
            <PrimaryButton type="submit">Add DEXA</PrimaryButton>
          </div>
        </form>
        <ul className="mt-4 space-y-3">
          {[...state.dexa]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((d) => {
              const total = dexaTotalKg(d);
              const gap = dexaScaleGap(d, state.weights);
              return (
                <li key={d.id} className="rounded-2xl bg-ink-900 p-3 text-sm">
                  <p className="text-foam">{d.date}</p>
                  <p className="mt-1 text-lg text-foam">{total.toFixed(1)} kg DEXA total</p>
                  <p className="text-mist">
                    {d.bodyFatPct}% fat · {d.fatMassKg.toFixed(1)} kg fat · {d.leanMassKg.toFixed(1)} kg lean · VAT {d.visceralFatCm2}
                  </p>
                  {gap != null && Math.abs(gap) >= 1.5 && (
                    <p className="mt-1 text-amber-200">
                      {Math.abs(gap).toFixed(1)} kg {gap > 0 ? "above" : "below"} nearest scale weight — check the report total.
                    </p>
                  )}
                  {gap != null && Math.abs(gap) < 1.5 && (
                    <p className="mt-1 text-xs text-mist">Within {Math.abs(gap).toFixed(1)} kg of nearest scale weigh-in.</p>
                  )}
                  {d.notes && <p className="mt-1">{d.notes}</p>}
                </li>
              );
            })}
        </ul>
      </Card>
    </div>
  );
}
