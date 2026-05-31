# Cal AI

**Snap your meal. Know your nutrition.**

Cal AI is a React Native + Expo mobile app that lets users take or upload a meal photo and receive AI-estimated calories, macronutrients, ingredient breakdown, assumptions, confidence score, and wellness notes.

Built for a 2-day contest submission on top of the 8x React Native starter template.

---

## Demo

> **Placeholder** — add your hosted demo or Loom link before submission.

- **Live demo:** `[Add Expo Snack, Loom, or TestFlight link here]`
- **Video walkthrough:** `[Add Loom/YouTube link here]`

---

## Screenshots

> **Placeholder** — add 4–6 screenshots before submission.

| Screen | Description |
|--------|-------------|
| Landing | Cal AI intro and Get Started |
| Analyze | Camera / gallery picker + Scan Food |
| Result | Calories, macros, ingredients, AI notes |
| Dashboard | Today's totals + recent meals |
| History | Saved scans with delete / clear all |

```
docs/screenshots/   ← recommended folder for submission assets
```

---

## Features

- **Photo-based meal analysis** — camera or gallery via `expo-image-picker`
- **Gemini Vision AI** — real calorie and macro estimation when `EXPO_PUBLIC_GEMINI_API_KEY` is configured
- **Reliable demo fallback** — mock nutrition result when the API key is missing, the request fails, or times out (labeled **Demo Result (AI unavailable)**)
- **Rich result screen** — meal name, total calories, confidence, macros, ingredient list, assumptions, health notes
- **Local meal history** — saved on-device with AsyncStorage (not Supabase)
- **Dashboard** — today's calorie total, macro summary, recent meals
- **History management** — delete individual scans or clear all history with confirmation
- **Insights tab** — simple nutrition insight cards from saved meals
- **Starter infrastructure preserved** — Supabase auth UI, onboarding, settings, profile, paywall shell, analytics hooks, and design system from the template

---

## App Flow

```
Landing (public)
  └─► Login / Sign up (Supabase OTP — optional for demo; use "Skip to Home" in dev)
        └─► Onboarding (display name)
              └─► Authenticated tabs
                    ├─► Dashboard — today's nutrition + recent meals
                    ├─► History — all saved scans
                    ├─► Insights — aggregate stats
                    └─► Profile — account + sign out
              └─► Analyze Meal (stack screen)
                    └─► Result /result/[id]
```

**Core scan flow**

1. User opens **Analyze Meal** from the dashboard or history tab.
2. User picks or captures a photo.
3. App sends the image to **Gemini 2.0 Flash** (when configured).
4. Result is saved to **AsyncStorage** and shown on the result screen.
5. Dashboard and history refresh on focus.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Styling | Theme tokens (`lib/theme.ts`) + Tailwind/NativeWind config |
| Local storage | `@react-native-async-storage/async-storage` |
| AI | Google Gemini 2.0 Flash Vision API |
| Auth (template) | Supabase OTP — UI wired; not required for meal data |
| Data fetching (template) | TanStack Query |
| Icons | Lucide React Native |
| Image picking | expo-image-picker |
| Base64 encoding | expo-file-system |

---

## AI Implementation

**File:** `lib/aiNutrition.ts`

1. Read meal photo URI and convert to base64 (`expo-file-system`).
2. POST to Gemini `gemini-2.0-flash` with a structured JSON nutrition prompt.
3. Parse and validate the response (`mealName`, `totalCalories`, `macros`, `items`, `assumptions`, `healthNotes`, `confidence`).
4. Normalize numbers, reconcile item calories vs. total, and sanitize health notes (no medical advice).
5. Tag result as `analysisSource: 'gemini'` or `'mock'`.
6. Persist via `lib/mealStorage.ts` and navigate to `/result/[id]`.

**Important:** Meal scan data is **not stored in Supabase**. Only **AsyncStorage on the device** holds meal history. Supabase remains from the starter template for auth/profile scaffolding only.

---

## Fallback Behavior

| Condition | Behavior |
|-----------|----------|
| No `EXPO_PUBLIC_GEMINI_API_KEY` | Immediate mock result (`analysisSource: 'mock'`) |
| API error / invalid JSON | Mock fallback; app does not crash |
| Request exceeds 12s timeout | Mock fallback |
| Success | Real AI values (`analysisSource: 'gemini'`) |

The result screen shows an amber banner: **"Demo Result (AI unavailable)"** when `analysisSource === 'mock'`.

---

## Setup Instructions

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+**
- **Expo Go** on a physical device, or Android/iOS simulator
- **Google AI Studio API key** (free tier) for real AI analysis — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Install

```bash
git clone <your-repo-url>
cd AI-calorie-tracker-
npm install
```

### Environment

```bash
cp .env.example .env.local   # if .env.example exists, otherwise create .env.local manually
```

Edit `.env.local` and set your Gemini key (see below). **Never commit `.env.local`** — it is listed in `.gitignore`.

---

## Environment Variables

| Variable | Required for Cal AI | Description |
|----------|---------------------|-------------|
| `EXPO_PUBLIC_GEMINI_API_KEY` | **Yes** (for real AI) | Google Gemini API key from AI Studio |
| `EXPO_PUBLIC_SUPABASE_URL` | No (demo) | Supabase project URL — template auth only |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No (demo) | Supabase anon/publishable key |
| `EXPO_NO_DEPENDENCY_VALIDATION` | Optional | Skips Expo API version check on restricted networks |

**Example `.env.local` (safe to share as a template — use placeholders only):**

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Template auth (optional for contest demo)
EXPO_PUBLIC_SUPABASE_URL=https://example.com
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dummy
```

> **Security:** Do not commit real API keys, Supabase secrets, or RevenueCat keys. Use `.env.local` locally and EAS secrets for production builds.

---

## Running Locally

```bash
# Start Metro (LAN)
npm start

# Start with tunnel (physical device on different network)
npm run start:tunnel

# Type check
npm run typecheck

# Tests
npm test
```

In Expo Go: scan the QR code, sign in (or use **Skip to Home** in dev), then tap **Analyze Meal**.

---

## Folder Structure

```
app/
  index.tsx                 Landing page
  analyze.tsx               Meal photo + AI scan
  result/[id].tsx           Nutrition result detail
  (auth)/login.tsx          OTP login (template)
  (onboarding)/             First-run name capture
  (tabs)/
    index.tsx               Dashboard
    explore.tsx             Meal history
    activity.tsx            Insights
    profile.tsx             Profile
  settings.tsx, upgrade.tsx, …   Template screens

lib/
  aiNutrition.ts            Gemini Vision + fallback
  mockNutrition.ts          Demo nutrition data
  mealStorage.ts            AsyncStorage CRUD
  mealTypes.ts              TypeScript types
  theme.ts                  Design tokens
  supabase.ts               Auth client (meals not synced here)
  constants.ts              App name, tagline

components/
  ui/                       Button, Card, Text, AppModal, …
  meal/MealUi.tsx           Shared meal UI helpers

ai-logs/                    AI-assisted development logs (contest transparency)
```

---

## AI Usage / AI Logs

This project was built with **Cursor**, **GitHub Copilot**, and other AI assistants for planning, coding, debugging, and documentation.

All major prompts and outcomes are logged in **`/ai-logs`**:

| Log | Contents |
|-----|----------|
| `day-1-planning.md` | MVP scope, routes, data model plan |
| `day-1-rebrand.md` | Cal AI branding from starter template |
| `day-1-mvp-build.md` | Mock analysis flow + screens |
| `day-2-ai-integration-plan.md` | Gemini Vision integration design |
| `day-2-final-polish.md` | Fallback, theme, delete history, README |

See [`ai-logs/README.md`](./ai-logs/README.md) for the full index.

---

## What I Built in 2 Days

**Day 1**

- Rebranded the 8x Expo starter to **Cal AI** (green `#22C55E` accent)
- Defined meal types and mock nutrition generator
- Built analyze → result flow with AsyncStorage persistence
- Rewrote dashboard, history, and insights tabs for calorie tracking

**Day 2**

- Integrated **Gemini 2.0 Flash** vision API with JSON parsing and validation
- Added timeout + graceful mock fallback for contest-ready demos
- Polished dark theme readability across screens
- Added delete single meal + clear all history
- Wrote contest README and organized `/ai-logs`

**Intentionally not in scope:** Supabase meal sync, cloud backup, or production auth deployment — meal data stays local; AI requires only the Gemini API key for live estimates.

---

## Known Limitations

- Meal data is **device-local only** (AsyncStorage) — clearing app data loses history
- **Supabase database is not used** for meal scans; auth is template scaffolding
- `EXPO_PUBLIC_GEMINI_API_KEY` is bundled in the client (acceptable for hackathon demo; use a backend proxy for production)
- AI estimates are approximate — not medical or dietary advice
- Mock fallback returns a fixed sample meal, not photo-specific
- RevenueCat, Sentry, and PostHog require real keys for full template features
- Tunnel mode may fall back to LAN on corporate networks with ngrok restrictions

---

## Future Improvements

- Supabase table for meal sync across devices
- Server-side Gemini proxy to protect API keys
- Daily / weekly calorie charts
- Editable portions and manual corrections
- Barcode + food database lookup
- Push reminders for meal logging
- Export history as CSV/PDF

---

## Submission Checklist

- [ ] Public GitHub repo with clean commit history
- [ ] README demo link and screenshots added (replace placeholders)
- [ ] `/ai-logs` complete and reviewed
- [ ] No secrets in git (`git grep -i "api_key\|secret\|token"` clean)
- [ ] `.env.local` not committed
- [ ] App runs in Expo Go: landing → analyze → result → history
- [ ] Real AI works with valid Gemini key
- [ ] Mock fallback works without key or on API failure
- [ ] Delete / clear history tested
- [ ] Loom or short demo video recorded
- [ ] Reflection / contest form submitted

---

## License

Contest submission — see repository license if applicable.
