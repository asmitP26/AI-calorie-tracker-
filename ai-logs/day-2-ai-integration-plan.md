## Prompt

Day 2: Replace mock meal analysis with real AI vision.

Requirements:
- Use Google Gemini (free tier, JSON mode)
- Key in `.env.local` as `EXPO_PUBLIC_GEMINI_API_KEY` — never commit
- Fallback to mock when key missing, network fails, or response invalid
- Keep existing MealAnalysis types and result UI
- Do not store meals in Supabase — AsyncStorage only
- Real API returns photo-specific estimates; mock is fixed demo data

## Response

Selected **Gemini 2.0 Flash** over OpenAI for free tier, speed, and native JSON output.

**Implementation (consolidated into `lib/aiNutrition.ts`):**
- Base64 image encoding via `expo-file-system`
- Structured nutrition prompt with portion estimation, confidence, assumptions, health notes
- Response parsing with validation, calorie reconciliation, and medical-language filtering
- `analysisSource: 'gemini' | 'mock'` on saved meals
- Never throws — all errors route to `createMockMealAnalysis()`

**Security approach for contest:**
- API key only in `.env.local` (gitignored)
- Documented that production should proxy through a backend
- Supabase remains unused for meal data — only Gemini + local storage drive scan results

**Planned tests:** with key (real food photo), without key (instant mock), airplane mode (mock), malformed JSON (mock).

Cursor assisted with prompt engineering, fetch payload shape, and JSON normalization helpers.
