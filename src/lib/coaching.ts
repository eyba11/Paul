import type { CoachRecommendation, CoachState } from "./types";
import { todayIso } from "./dates";

function trend(values: number[]): number {
  if (values.length < 2) return 0;
  return values[values.length - 1] - values[0];
}

export function buildRecommendations(state: CoachState): CoachRecommendation[] {
  const recs: CoachRecommendation[] = [];
  const today = todayIso();
  const recovery = [...state.recovery].sort((a, b) => b.date.localeCompare(a.date))[0];
  const weights = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const waists = [...state.waists].sort((a, b) => a.date.localeCompare(b.date));
  const dexa = [...state.dexa].sort((a, b) => a.date.localeCompare(b.date));
  const week = state.week;
  const completedThisWeek = state.logs.filter(
    (l) => l.completed && l.date >= (week[0]?.date ?? today),
  ).length;

  if (recovery && recovery.score <= 5) {
    recs.push({
      id: "low-recovery",
      title: "Protect tomorrow's quality",
      action: "Cap intensity. Keep one hard session, turn the other into easy aerobic or technique lifting.",
      explanation: `Latest recovery is ${recovery.score}/10${recovery.sleepHours ? ` with ${recovery.sleepHours}h sleep` : ""}. Hybrid progress comes from repeating weeks, not forcing a depleted nervous system through intervals and heavy squats on the same day.`,
      severity: "priority",
    });
  } else if (recovery && recovery.score >= 8) {
    recs.push({
      id: "high-recovery",
      title: "You can push the quality slot",
      action: "Keep the planned interval or heavy lower session. Add 5–10 minutes easy only if RPE stays honest.",
      explanation: `Recovery is ${recovery.score}/10. That is enough reserve for one hard stimulus. Do not stack a long run and a max-strength day back to back just because you feel good.`,
      severity: "info",
    });
  }

  const weightDelta = trend(weights.slice(-4).map((w) => w.kg));
  if (weights.length >= 3 && weightDelta <= -1.2) {
    recs.push({
      id: "weight-drop",
      title: "Rate of loss is a bit fast",
      action: "Add 200–300 kcal on lifting days and keep protein high. Do not add extra cardio.",
      explanation: `Bodyweight has dropped ${Math.abs(weightDelta).toFixed(1)} kg across recent weigh-ins. Faster cuts steal gym performance and make hybrid running feel flat. A slower slope protects lean mass seen on DEXA.`,
      severity: "watch",
    });
  } else if (weights.length >= 3 && Math.abs(weightDelta) < 0.4) {
    recs.push({
      id: "weight-stable",
      title: "Weight is stable — train for quality",
      action: "Hold calories, chase session quality and waist trend rather than scale theatrics.",
      explanation: "A flat scale with a falling waist usually means recomposition. That is a green light for strength progression, not more deficit.",
      severity: "info",
    });
  }

  const waistDelta = trend(waists.slice(-3).map((w) => w.cm));
  if (waists.length >= 2 && waistDelta < -0.6) {
    recs.push({
      id: "waist-down",
      title: "Waist trend is working",
      action: "Keep the current weekly structure. Re-scan DEXA only when the waist move stalls.",
      explanation: `Waist is down ${Math.abs(waistDelta).toFixed(1)} cm. Waist is a cheap leading indicator for visceral fat between DEXAs, so this supports staying the course.`,
      severity: "info",
    });
  }

  if (dexa.length >= 2) {
    const a = dexa[dexa.length - 2];
    const b = dexa[dexa.length - 1];
    const lean = b.leanMassKg - a.leanMassKg;
    const fat = b.bodyFatPct - a.bodyFatPct;
    const totalA = a.leanMassKg + a.fatMassKg;
    const totalB = b.leanMassKg + b.fatMassKg;
    recs.push({
      id: "dexa",
      title: lean >= 0 ? "DEXA: lean mass is holding" : "DEXA: lean mass slipped",
      action:
        lean >= 0
          ? "Keep 3 strength sessions and a protein floor. Running volume can rise slowly."
          : "Prioritise lifting this week and pull 20 minutes off the long run.",
      explanation: `DEXA total ${totalB.toFixed(1)} kg (was ${totalA.toFixed(1)} kg). Fat ${fat >= 0 ? "rose" : "fell"} ${Math.abs(fat).toFixed(1)} pts while lean mass ${lean >= 0 ? "rose" : "fell"} ${Math.abs(lean).toFixed(1)} kg, VAT ${b.visceralFatCm2} cm². Lean + fat on the report should sit near your scale weight — not a lower mystery number.`,
      severity: lean >= 0 ? "info" : "priority",
    });
  }

  const badWeather = state.weather.filter((w) => !w.outdoorOk);
  if (badWeather.length) {
    recs.push({
      id: "weather",
      title: "Weather will reshape outdoor work",
      action: "Move quality/long runs onto higher outdoor-score days, or take them indoor.",
      explanation: `${badWeather.map((w) => `${w.date}: ${w.caution ?? w.summary}`).join(" ")} The weather engine scores rain, heat, wind and storms so you do not waste a hard session on a washed-out day.`,
      severity: "watch",
      relatedDate: badWeather[0]?.date,
    });
  }

  const heavyCal = state.calendar.filter((c) => c.hardConflict);
  if (heavyCal.length) {
    recs.push({
      id: "calendar",
      title: "Calendar needs a shorter hard day",
      action: "Place strength near preferred lift hours and keep the meeting-heavy day easy or rest.",
      explanation: `${heavyCal[0].title} on ${heavyCal[0].date} is marked as a hard conflict. The calendar engine reduces duration and avoids stacking intervals on high-load workdays because life stress counts as training stress.`,
      severity: "watch",
      relatedDate: heavyCal[0].date,
    });
  }

  if (completedThisWeek >= 5) {
    recs.push({
      id: "volume",
      title: "Week is already dense",
      action: "Do not add bonus sessions. Take the mobility day as written.",
      explanation: `You already logged ${completedThisWeek} completions this week. Hybrid athletes usually get hurt by extras, not by the plan.`,
      severity: "watch",
    });
  }

  const todaySession = week.find((s) => s.date === today);
  if (todaySession) {
    recs.unshift({
      id: "today",
      title: `Today: ${todaySession.name}`,
      action: todaySession.weatherAdjusted
        ? "Follow the indoor or shifted version — do not force the original outdoor plan."
        : `Complete ${todaySession.durationMin} min at ${todaySession.intensity} intent, then log RPE.`,
      explanation: `${todaySession.focus}. ${todaySession.notes}`,
      severity: todaySession.intensity === "hard" ? "priority" : "info",
      relatedDate: today,
    });
  }

  return recs.slice(0, 6);
}
