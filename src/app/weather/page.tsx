"use client";

import { Card } from "@/components/ui";
import { todayIso, weekdayLabel } from "@/lib/dates";
import { useCoach } from "@/lib/store";
import { upcomingWeather } from "@/lib/weather-engine";

export default function WeatherPage() {
  const { state, refreshWeather } = useCoach();
  const forecast = upcomingWeather(state.weather, todayIso());
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl uppercase">Weather engine</h1>
      <p className="text-sm text-mist">
        Scores start from today so you can place this week&apos;s runs. Yesterday is dropped. Cap is{" "}
        {state.settings.heatLimitC}°C in sun, or 23°C when the day is overcast or drizzling. Rain over{" "}
        {state.settings.rainLimitMm} mm, wind and storms still cut the score.
      </p>
      <button
        onClick={() => refreshWeather()}
        className="rounded-full bg-volt px-5 py-3 text-sm font-semibold text-ink-950"
      >
        Fetch forecast for {state.settings.city}
      </button>
      {forecast.map((w) => (
        <Card key={w.date}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-mist">
                {weekdayLabel(w.date)} · {w.date}
              </p>
              <p className="text-lg">{w.summary}</p>
              <p className="text-sm text-mist">
                {Math.round(w.tempMin)}–{Math.round(w.tempMax)}° · {w.precipMm.toFixed(1)} mm ·{" "}
                {Math.round(w.windKmh)} km/h
              </p>
              {w.caution && <p className="mt-1 text-sm text-amber-200">{w.caution}</p>}
            </div>
            <p className={`font-display text-3xl ${w.outdoorOk ? "text-volt" : "text-orange-300"}`}>
              {w.outdoorScore}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
