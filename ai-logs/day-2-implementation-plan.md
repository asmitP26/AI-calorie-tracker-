# Cal AI — Day 2: Real AI Vision Integration Plan

## Decision: Google Gemini Flash (not OpenAI)

| Factor | Gemini 2.0 Flash | OpenAI GPT-4o |
|--------|------------------|---------------|
| Free tier | 15 RPM / 1M tokens/day | No free tier |
| Cost | $0.10/1M input tokens | $2.50/1M input tokens |
| Speed | ~1-2s for image | ~3-5s for image |
| JSON mode | Native `responseMimeType: "application/json"` | `response_format: { type: "json_object" }` |
| Setup | Google AI Studio → 1-click API key | Requires billing on file |
| Hackathon fit | Free, fast, no billing risk | Could hit rate limit or charge |

**Winner: Gemini 2.0 Flash** — free, fast, native JSON mode, perfect for 2-day hackathon.

---

## API Key Safety (Hackathon Approach)

For a hackathon demo where the app runs only on your device:

1. Store key in `.env.local` (already gitignored)
2. Access via `process.env.EXPO_PUBLIC_GEMINI_API_KEY` (Expo injects at build time)
3. **Never commit `.env.local`** — `.gitignore` already covers it
4. For production: move to a backend proxy (Supabase Edge Function). Not needed Day 2.

> ⚠️ `EXPO_PUBLIC_*` vars are bundled into the JS. This is acceptable for a hackathon demo app running on your device. For a shipped app, you'd proxy through a server.

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/analyzeImage.ts` | Core function: image → base64 → Gemini API → parsed MealAnalysis |
| `lib/geminiPrompt.ts` | System prompt + JSON schema for the AI |

## Files to Edit

| File | Change |
|------|--------|
| `app/analyze.tsx` | Replace `createMockMealAnalysis` call with `analyzeImage()`, add loading/error UI |
| `.env.example` | Add `EXPO_PUBLIC_GEMINI_API_KEY` line |
| `.gitignore` | Verify `.env.local` is covered (already is) |
| `lib/mealTypes.ts` | No change needed — existing types already match the target schema |

---

## Implementation Details

### 1. `lib/geminiPrompt.ts`

```typescript
export const MEAL_ANALYSIS_PROMPT = `You are a professional nutritionist AI. Analyze this meal photo and return a JSON object with your best estimates.

Rules:
- Estimate portions visually. Be specific (e.g., "6 oz", "1 cup cooked").
- Confidence is 0-100 integer representing how certain you are overall.
- Each item should have individual macro estimates.
- Assumptions should explain your portion/cooking method estimates.
- Health notes should be actionable and brief.
- If you cannot identify the food, return your best guess with low confidence.
- NEVER refuse to analyze. Always provide an estimate.

Return ONLY this JSON structure (no markdown, no explanation):
{
  "mealName": "string - short descriptive name for the meal",
  "totalCalories": number,
  "confidence": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number
  },
  "items": [
    {
      "name": "string",
      "estimatedPortion": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "assumptions": ["string"],
  "healthNotes": ["string"]
}`

export const GEMINI_MODEL = 'gemini-2.0-flash'
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
```

### 2. `lib/analyzeImage.ts`

```typescript
import * as FileSystem from 'expo-file-system'
import type { MealAnalysis } from './mealTypes'
import { createMockMealAnalysis } from './mockNutrition'
import { MEAL_ANALYSIS_PROMPT, GEMINI_MODEL, GEMINI_API_URL } from './geminiPrompt'

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY

/**
 * Analyze a meal image using Gemini Vision API.
 * Falls back to mock analysis if API key missing, network fails, or response is invalid.
 */
export async function analyzeImage(imageUri: string): Promise<{ result: MealAnalysis; source: 'ai' | 'mock' }> {
  // No API key → immediate mock fallback
  if (!API_KEY) {
    console.warn('[Cal AI] No GEMINI_API_KEY — using mock analysis')
    return { result: createMockMealAnalysis(imageUri), source: 'mock' }
  }

  try {
    // 1. Convert image to base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    // 2. Call Gemini API
    const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: MEAL_ANALYSIS_PROMPT },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn('[Cal AI] Gemini API error:', response.status, errText)
      return { result: createMockMealAnalysis(imageUri), source: 'mock' }
    }

    const data = await response.json()

    // 3. Extract text from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.warn('[Cal AI] Empty Gemini response')
      return { result: createMockMealAnalysis(imageUri), source: 'mock' }
    }

    // 4. Parse and validate JSON
    const parsed = JSON.parse(text)
    const meal = mapToMealAnalysis(parsed, imageUri)
    return { result: meal, source: 'ai' }
  } catch (err) {
    console.warn('[Cal AI] Analysis failed, using mock:', err)
    return { result: createMockMealAnalysis(imageUri), source: 'mock' }
  }
}

/** Map raw Gemini JSON to our MealAnalysis type with validation */
function mapToMealAnalysis(raw: any, imageUri: string): MealAnalysis {
  // Validate required fields exist, throw if not (caught above → mock fallback)
  if (typeof raw.totalCalories !== 'number') throw new Error('Missing totalCalories')
  if (!raw.macros || typeof raw.macros.protein !== 'number') throw new Error('Missing macros')
  if (!Array.isArray(raw.items) || raw.items.length === 0) throw new Error('Missing items')

  return {
    id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    mealName: typeof raw.mealName === 'string' ? raw.mealName : 'Analyzed Meal',
    imageUri,
    createdAt: new Date().toISOString(),
    totalCalories: Math.round(raw.totalCalories),
    confidence: typeof raw.confidence === 'number' ? Math.round(raw.confidence) : 70,
    macros: {
      protein: Math.round(raw.macros.protein ?? 0),
      carbs: Math.round(raw.macros.carbs ?? 0),
      fat: Math.round(raw.macros.fat ?? 0),
      fiber: Math.round(raw.macros.fiber ?? 0),
      sugar: Math.round(raw.macros.sugar ?? 0),
    },
    items: raw.items.map((item: any, i: number) => ({
      id: `item_${i + 1}`,
      name: String(item.name ?? 'Unknown item'),
      calories: Math.round(item.calories ?? 0),
      portion: String(item.estimatedPortion ?? item.portion ?? '1 serving'),
      protein: Math.round(item.protein ?? 0),
      carbs: Math.round(item.carbs ?? 0),
      fat: Math.round(item.fat ?? 0),
    })),
    assumptions: Array.isArray(raw.assumptions) ? raw.assumptions.map(String) : [],
    healthNotes: Array.isArray(raw.healthNotes) ? raw.healthNotes.map(String) : [],
  }
}
```

### 3. Edit `app/analyze.tsx` — Replace mock call

Change the `handleAnalyze` function from:
```typescript
import { createMockMealAnalysis } from '@/lib/mockNutrition'
// ...
const analysis = createMockMealAnalysis(imageUri)
```

To:
```typescript
import { analyzeImage } from '@/lib/analyzeImage'
// ...
const { result: analysis, source } = await analyzeImage(imageUri)
// Optionally show a toast if source === 'mock'
```

Remove the `await sleep(1800)` — real API call provides natural delay.

### 4. Update `.env.example`

Add at the bottom:
```env
# ─── Gemini AI Vision ─────────────────────────────────────────────────────────
# Get from https://aistudio.google.com/apikey
EXPO_PUBLIC_GEMINI_API_KEY=
```

---

## UI Loading & Error States

In `app/analyze.tsx`, the `handleAnalyze` function already has:
- `analyzing` state → shows `ActivityIndicator` ✓
- `error` state → shows error message ✓

Add these improvements:

```typescript
// New state
const [analysisSource, setAnalysisSource] = useState<'ai' | 'mock' | null>(null)

// In handleAnalyze:
const { result: analysis, source } = await analyzeImage(imageUri)
setAnalysisSource(source)
await saveMeal(analysis)
router.push(`/result/${analysis.id}`)

// In JSX, show a subtle indicator when mock is used:
{analysisSource === 'mock' && (
  <Text style={s.mockNotice}>⚡ Demo mode — using sample analysis</Text>
)}
```

---

## What NOT to Expose on GitHub

| Must gitignore | Status |
|----------------|--------|
| `.env.local` | ✅ Already in `.gitignore` |
| `.env.*.local` | ✅ Already in `.gitignore` |
| API keys in source code | ❌ Never hardcode |
| `node_modules/` | ✅ Already ignored |

**Double-check:** Run `git diff --cached` before pushing to verify no keys leak.

---

## `.env.local` (your local file, NOT committed)

```env
EXPO_PUBLIC_GEMINI_API_KEY=your-actual-key-here
```

Get the key from: https://aistudio.google.com/apikey (one click, free, no billing)

---

## Dependency Check

| Package | Needed for | Status |
|---------|-----------|--------|
| `expo-file-system` | Reading image as base64 | Check if installed |

Run: `npx expo install expo-file-system` if not already present.

---

## Risks & Simple Fixes

| Risk | Likelihood | Fix |
|------|-----------|-----|
| Gemini returns malformed JSON | Low (JSON mode enforces it) | `try/catch` → mock fallback |
| Image too large (>4MB) | Medium | Reduce quality to 0.7 in ImagePicker |
| Rate limit (15 RPM free tier) | Low for demo | Mock fallback catches this |
| API key exposed in Git | Medium if careless | `.gitignore` covers it; scan before push |
| Network timeout | Medium on slow wifi | Add `AbortController` with 15s timeout |
| Base64 conversion OOM on huge photos | Low | ImagePicker already resizes |
| Gemini refuses food analysis | Very low | Prompt says "never refuse" |
| `expo-file-system` not installed | Check once | `npx expo install expo-file-system` |

---

## Safe Implementation Order

1. **Install `expo-file-system`** if needed (`npx expo install expo-file-system`)
2. **Create `lib/geminiPrompt.ts`** — pure data, no deps
3. **Create `lib/analyzeImage.ts`** — imports prompt + mockNutrition
4. **Edit `.env.example`** — add Gemini key placeholder
5. **Create `.env.local`** — add your real key (never committed)
6. **Edit `app/analyze.tsx`** — swap mock call for `analyzeImage()`
7. **Test with real photo** — verify JSON comes back correctly
8. **Test without key** — delete key from `.env.local`, confirm mock fallback works
9. **Test with airplane mode** — confirm mock fallback works

---

## Testing Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] App launches without crash
- [ ] With API key: real photo → real AI analysis (see different results for different foods)
- [ ] Without API key: falls back to mock silently
- [ ] With airplane mode: falls back to mock silently
- [ ] Result screen renders all fields correctly from AI response
- [ ] Meals save and appear in history/dashboard
- [ ] No API key visible in any committed file
- [ ] `git grep GEMINI` shows only `.env.example` and code referencing `process.env`

---

## Git Commits

```
feat: add Gemini Vision AI analysis with mock fallback
docs: update .env.example with Gemini API key placeholder
```

---

## Cursor Implementation Instructions

```
PHASE 1: Dependencies
RUN: npx expo install expo-file-system
VERIFY: package.json includes expo-file-system

PHASE 2: AI Module
CREATE: lib/geminiPrompt.ts (prompt text + constants)
CREATE: lib/analyzeImage.ts (base64 conversion, API call, validation, mock fallback)
CONSTRAINTS: Must always return MealAnalysis type. Must never throw — catches all errors and falls back to mock.

PHASE 3: Wire Up
EDIT: app/analyze.tsx
- Replace import of createMockMealAnalysis with analyzeImage
- Remove sleep(1800) call
- Call analyzeImage(imageUri) instead
- Keep all existing loading/error UI
EDIT: .env.example — add EXPO_PUBLIC_GEMINI_API_KEY line
CONSTRAINTS: Do not modify any other files. Do not touch result screen, storage, or types.
```
