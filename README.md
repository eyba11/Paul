# Paul's Hybrid Coach

Mobile-first Next.js PWA for hybrid training: strength + running, with weather-aware and calendar-aware scheduling, body-comp tracking, and explained coaching calls.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Dark mode by default
- Installable PWA (`public/sw.js` + `public/manifest.webmanifest`)
- Open-Meteo forecast via `/api/weather` (no API key)
- Local storage so it works offline after the first visit

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel

```bash
npm i -g vercel
vercel
```

Or import the Git repo in the Vercel dashboard. Framework preset: Next.js. Optional env vars are in `.env.example`.

## Features

1. Dashboard home (`src/components/Dashboard.tsx`)
2. Adaptive weekly planner
3. Workout library / tracking
4. Weight tracking
5. Waist tracking
6. DEXA history
7. Workout completion logging
8. Recovery score input
9. Weather-aware scheduling engine
10. Calendar-aware scheduling engine
11. Rejig My Week
12. Coaching recommendations with explanations

Install on iOS via Share → Add to Home Screen, or on Android via the browser install prompt.
