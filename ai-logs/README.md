# AI Logs — Cal AI Contest Submission

This folder documents AI-assisted development for transparency. **Cursor**, **GitHub Copilot**, and other AI tools were used for planning, coding, debugging, and documentation.

No API keys, secrets, or private credentials appear in these logs.

## Log Index

| File | Day | Description |
|------|-----|-------------|
| [`day-1-planning.md`](./day-1-planning.md) | 1 | MVP scope, routes, data model, implementation phases |
| [`day-1-rebrand.md`](./day-1-rebrand.md) | 1 | Rebrand 8x starter template to Cal AI |
| [`day-1-mvp-build.md`](./day-1-mvp-build.md) | 1 | Mock analysis flow, screens, AsyncStorage |
| [`day-2-ai-integration-plan.md`](./day-2-ai-integration-plan.md) | 2 | Gemini Vision API integration design |
| [`day-2-final-polish.md`](./day-2-final-polish.md) | 2 | Fallback, theme, delete history, README, contest prep |

## How AI Was Used

1. **Planning** — Architecture, route structure, and phased build order from contest requirements
2. **Code generation** — Types, storage layer, analyze/result screens, Gemini client
3. **Debugging** — Expo startup, theme contrast, fetch/timeouts, dependency issues
4. **Documentation** — README, env templates, and these logs

## Data Architecture Note

Meal scan results are stored in **AsyncStorage on the device**, not in Supabase. Real nutrition values come from the **Gemini API** when `EXPO_PUBLIC_GEMINI_API_KEY` is set; otherwise the app uses a local mock fallback.
