"use client";

import { FormEvent, useState } from "react";
import { Card, Field, GhostButton, PrimaryButton, inputClass } from "@/components/ui";
import { todayIso } from "@/lib/dates";
import { useCoach } from "@/lib/store";

export default function CalendarPage() {
  const { state, addCalendarBlock, removeCalendarBlock } = useCoach();
  const [title, setTitle] = useState("Meetings");
  const [date, setDate] = useState(todayIso());
  const [startHour, setStartHour] = useState("9");
  const [endHour, setEndHour] = useState("17");
  const [hard, setHard] = useState(true);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addCalendarBlock({
      date,
      title,
      startHour: Number(startHour),
      endHour: Number(endHour),
      hardConflict: hard,
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase">Calendar engine</h1>
      <p className="text-sm text-mist">
        Busy blocks reduce hard-session duration and feed Rejig My Week so quality work lands on quieter days.
      </p>
      <Card>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Date">
            <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start hour">
              <input className={inputClass} value={startHour} onChange={(e) => setStartHour(e.target.value)} />
            </Field>
            <Field label="End hour">
              <input className={inputClass} value={endHour} onChange={(e) => setEndHour(e.target.value)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hard} onChange={(e) => setHard(e.target.checked)} />
            Hard conflict (protect this day)
          </label>
          <PrimaryButton type="submit">Add block</PrimaryButton>
        </form>
      </Card>
      {state.calendar.map((b) => (
        <Card key={b.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-foam">{b.title}</p>
              <p className="text-sm text-mist">
                {b.date} · {b.startHour}:00–{b.endHour}:00 {b.hardConflict ? "· hard" : "· soft"}
              </p>
            </div>
            <GhostButton onClick={() => removeCalendarBlock(b.id)}>Remove</GhostButton>
          </div>
        </Card>
      ))}
    </div>
  );
}
