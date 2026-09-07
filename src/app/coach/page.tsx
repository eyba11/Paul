"use client";

import { Card, GhostButton, PrimaryButton, SeverityDot } from "@/components/ui";
import { useCoach } from "@/lib/store";

export default function CoachPage() {
  const { recommendations, rejig, refreshWeather } = useCoach();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase">Coaching</h1>
      <p className="text-sm text-mist">
        Every recommendation is explained from recovery, body-comp trend, weather and calendar load.
      </p>
      <div className="flex gap-2">
        <PrimaryButton onClick={() => rejig()}>Rejig my week</PrimaryButton>
        <GhostButton onClick={() => refreshWeather()}>Refresh weather</GhostButton>
      </div>
      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <p className="flex items-center gap-2 text-lg">
            <SeverityDot severity={rec.severity} />
            {rec.title}
          </p>
          <p className="mt-2 text-sm text-volt">{rec.action}</p>
          <p className="mt-2 text-sm text-mist">{rec.explanation}</p>
        </Card>
      ))}
    </div>
  );
}
