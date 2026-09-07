"use client";

import { ItemTargets, SessionDetail } from "@/components/SessionDetail";
import { getWorkoutRx } from "@/lib/prescriptions";
import { useCoach } from "@/lib/store";
import { Card, typeLabel } from "@/components/ui";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { state } = useCoach();
  const template = state.templates.find((t) => t.id === templateId);
  const planned = state.week.find((s) => s.templateId === templateId);

  if (planned) return <SessionDetail session={planned} />;
  if (!template) {
    return (
      <div className="space-y-3">
        <p>Template not found.</p>
        <Link href="/workouts" className="text-sm text-volt">
          Library
        </Link>
      </div>
    );
  }

  const rx = getWorkoutRx({
    templateId: template.id,
    intensity: template.intensity,
    type: template.type,
    weatherAdjusted: false,
  });

  return (
    <div className="space-y-4">
      <Link href="/workouts" className="text-sm text-volt">
        ← Library
      </Link>
      <h1 className="font-display text-3xl uppercase">{template.name}</h1>
      <p className="text-sm text-mist">
        {typeLabel(template.type)} · {template.durationMin} min
      </p>
      {rx.blocks.map((block) => (
        <Card key={block.title}>
          <h2 className="text-sm uppercase tracking-[0.16em] text-volt">{block.title}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {block.items.map((item) => (
              <li key={item.name} className="rounded-2xl bg-ink-900 p-3">
                <div className="flex justify-between gap-3">
                  <span>{item.name}</span>
                  <span className="text-mist">{item.scheme}</span>
                </div>
                <ItemTargets item={item} />
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
