# Date Night — The No-Plan Date (MVP)

An iPhone-first Expo app for couples. Pick the vibe, play the date, save the story.

The app is a real-life multiplayer game played on **one shared iPhone**: a couple
configures time, budget, and transport, privately sets boundaries, then plays four
rounds of missions revealed one at a time. At the end they get a Spontaneity Score,
awards, a saved recap, and a shareable 9:16 card.

Everything is local — no accounts, no backend, no analytics. Works fully offline.

## Stack

- Expo SDK 57 · React Native 0.86 · TypeScript (strict) · Expo Router
- `expo-sqlite` for persistence (versioned migrations)
- `expo-image-picker` for photo capture, `expo-file-system` for permanent photo storage
- `react-native-view-shot` + `expo-sharing` for the share card
- `expo-haptics`, `expo-crypto`

## Run it

```bash
npm install
npx expo start        # then press i for the iOS simulator, or scan with Expo Go
```

## Checks

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
npm test              # jest — game engine unit tests
```

## Architecture

```
src/
  app/          Expo Router routes (onboarding, home, date flow, history)
  components/   Reusable UI (Screen, buttons, mission card, handoff, timer, ...)
  content/      Date content — vibes, missions, copy (separate from UI)
  context/      DateSessionContext — session state, persisted on every mutation
  engine/       Pure game logic: eligibility, branching, scoring, awards
  db/           SQLite database, migrations, repositories
  hooks/        usePersistentTimer, useDateSession, useShareRecap
  theme/        colors, spacing, typography
  utils/        ids, random, time, media
```

Key rules encoded in the engine:

- Missions are filtered by transport, budget, private boundaries (the union of both
  partners' picks — never attributed), and vetoed categories.
- The couple shares 2 rerolls; each partner has 1 no-questions-asked veto.
- Round Three combines two private choices order-independently; Round Four's ending
  is picked deterministically from session data.
- A safe fallback mission ("Your Move") guarantees the app never dead-ends.
- Timers are wall-clock based (`timerEndsAt`), so they survive backgrounding and
  restarts; active sessions resume from the home screen.
