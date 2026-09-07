"use client";

import { SessionDetail } from "@/components/SessionDetail";
import { useCoach } from "@/lib/store";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useCoach();
  const session = state.week.find((s) => s.id === id);
  if (!session) {
    return (
      <div className="space-y-3">
        <p className="text-foam">That session is not in this week.</p>
        <Link href="/plan" className="text-sm text-volt">
          Back to planner
        </Link>
      </div>
    );
  }
  return <SessionDetail session={session} />;
}
