import type { WeatherDay } from "./types";

const WMO: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  80: "Rain showers",
  81: "Heavy showers",
  95: "Thunderstorm",
  96: "Storm + hail",
};

export function weatherSummary(code: number): string {
  return WMO[code] ?? "Mixed conditions";
}

/** Overcast (3) or drizzle family (51–57). */
export function isOvercastOrDrizzle(code: number): boolean {
  return code === 3 || (code >= 51 && code <= 57);
}

export function effectiveHeatCapC(code: number, heatLimitC: number): number {
  return isOvercastOrDrizzle(code) ? Math.max(heatLimitC, 23) : heatLimitC;
}

export function upcomingWeather<T extends { date: string }>(days: T[], today: string): T[] {
  return days.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function scoreOutdoorDay(input: {
  date: string;
  code: number;
  tempMax: number;
  tempMin: number;
  precipMm: number;
  windKmh: number;
  heatLimitC: number;
  rainLimitMm: number;
}): WeatherDay {
  const reasons: string[] = [];
  let score = 100;
  const heatCapC = effectiveHeatCapC(input.code, input.heatLimitC);
  if (input.precipMm >= input.rainLimitMm) {
    score -= Math.min(50, 18 + input.precipMm * 4);
    reasons.push(`${input.precipMm.toFixed(1)} mm rain`);
  }
  if (input.tempMax > heatCapC) {
    const over = input.tempMax - heatCapC;
    const heatPenalty = Math.min(50, Math.round(over * 5));
    score -= heatPenalty;
    const capNote = isOvercastOrDrizzle(input.code)
      ? `overcast/drizzle cap ${heatCapC}°C`
      : `ideal max ${heatCapC}°C`;
    reasons.push(`${input.tempMax.toFixed(0)}°C (${capNote})`);
  }
  if (input.tempMin <= 4) {
    score -= 15;
    reasons.push("very cold start");
  }
  if (input.windKmh >= 40) {
    score -= 20;
    reasons.push(`${Math.round(input.windKmh)} km/h wind`);
  }
  if ([65, 81, 95, 96, 99].includes(input.code)) {
    score -= 35;
    reasons.push(weatherSummary(input.code));
  }
  score = Math.max(0, Math.min(100, score));
  return {
    date: input.date,
    code: input.code,
    summary: weatherSummary(input.code),
    tempMax: input.tempMax,
    tempMin: input.tempMin,
    precipMm: input.precipMm,
    windKmh: input.windKmh,
    outdoorScore: score,
    outdoorOk: score >= 55,
    caution: reasons.length ? reasons.join(" · ") : null,
  };
}

export function applyWeatherToWeek<T extends {
  date: string;
  environment: string;
  type: string;
  weatherAdjusted: boolean;
  notes: string;
  baseNotes: string;
  name: string;
}>(week: T[], weather: WeatherDay[]): T[] {
  const byDate = new Map(weather.map((w) => [w.date, w]));
  return week.map((session) => {
    const day = byDate.get(session.date);
    const notes = session.baseNotes;
    const name = "baseName" in session && typeof session.baseName === "string" ? session.baseName : session.name;
    if (!day || session.environment !== "outdoor") {
      return { ...session, name, notes, weatherAdjusted: false };
    }
    if (day.outdoorOk) {
      return { ...session, name, notes, weatherAdjusted: false };
    }
    if (session.type === "quality_run" || session.type === "long_run") {
      return {
        ...session,
        weatherAdjusted: true,
        notes: `${notes} Weather: ${day.caution ?? day.summary}. Prefer the rower, indoor bike, or shift to a clearer day.`,
      };
    }
    return {
      ...session,
      weatherAdjusted: true,
      name: session.type === "easy_run" ? "Indoor easy aerobic" : session.name,
      notes: `${notes} Switched indoor because of ${day.caution ?? day.summary}.`,
    };
  });
}
