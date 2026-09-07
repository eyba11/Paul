"use client";

import { FormEvent, useState } from "react";
import { GarminImport } from "@/components/GarminImport";
import { Card, Field, PrimaryButton, inputClass } from "@/components/ui";
import { useCoach } from "@/lib/store";

export default function SettingsPage() {
  const { state, updateSettings } = useCoach();
  const [form, setForm] = useState(state.settings);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    updateSettings({
      ...form,
      lat: Number(form.lat),
      lon: Number(form.lon),
      heatLimitC: Number(form.heatLimitC),
      rainLimitMm: Number(form.rainLimitMm),
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase">Settings</h1>
      <GarminImport />
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="City">
            <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Lat">
              <input className={inputClass} value={form.lat} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} />
            </Field>
            <Field label="Lon">
              <input className={inputClass} value={form.lon} onChange={(e) => setForm({ ...form, lon: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Ideal max temp °C">
              <input className={inputClass} value={form.heatLimitC} onChange={(e) => setForm({ ...form, heatLimitC: Number(e.target.value) })} />
            </Field>
            <Field label="Rain limit mm">
              <input className={inputClass} value={form.rainLimitMm} onChange={(e) => setForm({ ...form, rainLimitMm: Number(e.target.value) })} />
            </Field>
          </div>
          <PrimaryButton type="submit">Save</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
