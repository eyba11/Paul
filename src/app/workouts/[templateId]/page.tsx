"use client";

import { SessionDetail } from "@/components/SessionDetail";
import { todayIso } from "@/lib/dates";
import { templateAsSession } from "@/lib/seed";
import { useCoach } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { state } = useCoach();
  const template = state.templates.find((t) => t.id === templateId);

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

  return <SessionDetail session={templateAsSession(template, todayIso())} fromLibrary />;
}
