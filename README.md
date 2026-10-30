# Swell Sensei

**Swell Sensei** helps surfers make better-informed, personal surf plans. It combines level-based surf-condition matching with a practical journey from choosing a spot through planning, logging, and reviewing sessions.

> **Safety note:** Swell Sensei is a planning aid, not a replacement for checking local conditions, official warnings, lifeguard advice, or your own judgement. Always assess the surf in person and choose conditions that suit your experience.

## What to expect

- **Level-based spot matching** — set your experience, years surfing, and comfortable wave size; eligible spot scores adapt to that saved profile.
- **Live-condition checks** — view available Open-Meteo marine and weather data on the spot pages. If live data is unavailable, the app says so rather than presenting an estimated score as live.
- **Surf journey planning** — compare spots, add a prospective session, and make a simple plan around conditions that fit your level.
- **Session log and progress view** — record completed sessions and look back through logs and analytics to spot patterns in your surfing.
- **Account-based privacy** — profile, plans, logs, and progress data are tied to your signed-in account.

## Try it

The public test app is deployed at:

**https://wdrobins.github.io/swell-sensei/**

Create an account, complete the short profile setup, then explore **Spots**, **Plan**, **Logs**, and **Analytics**. Authentication emails are sent by Supabase; use an email address you can access.

## Local development

1. Copy `.env.example` to `.env` and supply your browser-visible Supabase values. Never add service-role or other server secrets to a Vite environment file.
2. Install dependencies: `npm install`
3. Start the app: `npm run dev`
4. Open `http://localhost:8080`

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Stack

- Vite
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase
- Open-Meteo weather and marine APIs

## Deployment

The app is published to GitHub Pages by the deployment workflow. The production build receives only browser-visible Supabase configuration; keep service-role keys and other server secrets out of the client build.
