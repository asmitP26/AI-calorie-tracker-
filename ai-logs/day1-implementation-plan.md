# Cal AI — Day 1 Implementation Plan

**Project:** Cal AI (AI Calorie Tracker)
**Template:** 8x React Native Expo Starter
**Date:** May 31, 2026
**Goal:** Safe MVP with mock AI results, image picker, local storage

---

## Data Model

```typescript
// lib/types.ts

export type MacroBreakdown = {
  protein: number    // grams
  carbs: number      // grams
  fat: number        // grams
  fiber: number      // grams
}

export type DetectedItem = {
  name: string
  calories: number
  confidence: number  // 0-1
}

export type MealAnalysis = {
  id: string
  imageUri: string
  totalCalories: number
  macros: MacroBreakdown
  items: DetectedItem[]
  assumptions: string[]
  confidence: number       // 0-1 overall
  healthNotes: string[]
  analyzedAt: string       // ISO date
}
```

---

## Route Structure

| Route | Purpose | File |
|-------|---------|------|
| `/` | Landing page (rebranded) | `app/index.tsx` (edit) |
| `/(tabs)/` | Dashboard - today's calories + recent meals | `app/(tabs)/index.tsx` (rewrite) |
| `/(tabs)/analyze` | Image picker + analyze button | `app/(tabs)/analyze.tsx` (NEW) |
| `/(tabs)/history` | Full meal history list | `app/(tabs)/history.tsx` (NEW) |
| `/(tabs)/profile` | Keep as-is | `app/(tabs)/profile.tsx` (no change) |
| `/result/[id]` | Detailed analysis result | `app/result/[id].tsx` (NEW) |

---

## Tab Reuse Plan

| Old Tab | New Tab | Reasoning |
|---------|---------|-----------|
| Home (index) | Dashboard | Repurpose for calorie summary |
| Explore | Analyze | Repurpose slot for camera/photo flow |
| Activity | History | Repurpose for meal log |
| Profile | Profile | Keep intact |

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/types.ts` | MealAnalysis, MacroBreakdown, DetectedItem types |
| `lib/mockAnalysis.ts` | Mock AI response generator |
| `lib/storage.ts` | AsyncStorage wrapper for meals |
| `app/(tabs)/analyze.tsx` | Image picker + analyze CTA |
| `app/(tabs)/history.tsx` | Meal history list |
| `app/result/[id].tsx` | Full result display |
| `ai-logs/` | This folder (already being created) |

---

## Files to Edit

| File | Changes |
|------|---------|
| `lib/constants.ts` | Rebrand APP_NAME, APP_TAGLINE, APP_DESCRIPTION |
| `app.json` | Change name, slug, scheme |
| `app/index.tsx` | Update FEATURES array for calorie tracking |
| `app/(tabs)/_layout.tsx` | Rename tabs: Dashboard, Analyze, History, Profile; swap icons |
| `app/(tabs)/index.tsx` | Rewrite as calorie dashboard (today's total, recent meals) |
| `app/(tabs)/explore.tsx` | DELETE (replaced by analyze.tsx) |
| `app/(tabs)/activity.tsx` | DELETE (replaced by history.tsx) |

---

## DO NOT CHANGE

- `app/_layout.tsx` — Root layout with all providers
- `app/(auth)/` — Auth flow (login, etc.)
- `app/(onboarding)/` — Onboarding flow
- `app/settings.tsx`, `app/support.tsx`, `app/privacy.tsx`, `app/terms.tsx`
- `app/upgrade.tsx` — RevenueCat paywall
- `contexts/` — SubscriptionContext, ToastContext
- `components/ui/` — All UI primitives (Button, Card, Text, etc.)
- `components/TabBar.tsx` — Custom tab bar (works automatically)
- `components/OfflineBanner.tsx`, `OfflineOverlay.tsx`
- `lib/supabase.ts`, `lib/analytics.ts`, `lib/purchases.ts`
- `lib/theme.ts` — Keep the teal accent (looks good for health app)
- `hooks/useProfile.ts` — Still used by profile
- `supabase/` — Migrations and functions

---

## Implementation Order (5 Phases)

### Phase 1: Rebrand (10 min)

**Edit `lib/constants.ts`:**
```typescript
export const APP_NAME = 'Cal AI'
export const APP_SCHEME = 'calai'
export const APP_SUPPORT_EMAIL = 'support@calai.app'
export const APP_DOCS_URL = 'https://calai.app/docs'
export const APP_TAGLINE = 'Snap. Analyze. Track.'
export const APP_DESCRIPTION = 'AI-powered calorie tracking from a single photo. Know what you eat in seconds.'
```

**Edit `app.json`:**
```json
{
  "expo": {
    "name": "Cal AI",
    "slug": "cal-ai",
    "scheme": "calai"
  }
}
```

**Edit `app/index.tsx` FEATURES array:**
```typescript
const FEATURES = [
  { icon: 'camera-outline', title: 'Snap a Meal', desc: 'Take or upload a photo' },
  { icon: 'nutrition-outline', title: 'AI Analysis', desc: 'Instant calorie & macro breakdown' },
  { icon: 'trending-up-outline', title: 'Track Progress', desc: 'Daily totals & meal history' },
]
```

**Testing checklist:**
- [ ] App launches without crash
- [ ] Landing page shows "Cal AI" branding
- [ ] Feature cards show new copy
- [ ] Auth flow still works (tap Get Started → login screen)

**Git commit:** `feat: rebrand app to Cal AI with updated landing copy`

---

### Phase 2: Data Layer (15 min)

**Create `lib/types.ts`** — types as shown above

**Create `lib/mockAnalysis.ts`:**
```typescript
import { MealAnalysis } from './types'

export function generateMockAnalysis(imageUri: string): MealAnalysis {
  return {
    id: Date.now().toString(),
    imageUri,
    totalCalories: 520,
    macros: { protein: 32, carbs: 45, fat: 22, fiber: 6 },
    items: [
      { name: 'Grilled Chicken Breast', calories: 230, confidence: 0.92 },
      { name: 'Brown Rice', calories: 180, confidence: 0.88 },
      { name: 'Steamed Broccoli', calories: 55, confidence: 0.95 },
      { name: 'Olive Oil Drizzle', calories: 55, confidence: 0.70 },
    ],
    assumptions: [
      'Portion size estimated as medium (200g protein, 150g rice)',
      'Cooking method assumed: grilled with minimal oil',
      'No sauce or dressing detected',
    ],
    confidence: 0.85,
    healthNotes: [
      'Good protein-to-carb ratio',
      'High fiber content from broccoli',
      'Consider adding more vegetables for micronutrients',
    ],
    analyzedAt: new Date().toISOString(),
  }
}
```

**Create `lib/storage.ts`:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MealAnalysis } from './types'

const MEALS_KEY = 'cal_ai_meals'

export async function saveMeal(meal: MealAnalysis): Promise<void> {
  const existing = await getMeals()
  const updated = [meal, ...existing]
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(updated))
}

export async function getMeals(): Promise<MealAnalysis[]> {
  const raw = await AsyncStorage.getItem(MEALS_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

export async function getMealById(id: string): Promise<MealAnalysis | null> {
  const meals = await getMeals()
  return meals.find(m => m.id === id) ?? null
}

export async function clearMeals(): Promise<void> {
  await AsyncStorage.removeItem(MEALS_KEY)
}
```

**Testing checklist:**
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No import errors in new files

**Git commit:** `feat: add meal types, mock analysis generator, and AsyncStorage layer`

---

### Phase 3: Tab Restructure (20 min)

**Delete** `app/(tabs)/explore.tsx` and `app/(tabs)/activity.tsx`

**Create `app/(tabs)/analyze.tsx`** — Image picker screen:
```typescript
// Camera icon tab — pick/take photo, show preview, "Analyze Meal" button
// On analyze: generate mock result → save to storage → navigate to /result/[id]
```

**Create `app/(tabs)/history.tsx`** — Meal history:
```typescript
// Lists all saved meals from AsyncStorage
// Each row shows: image thumbnail, total cals, date
// Tap → navigate to /result/[id]
```

**Edit `app/(tabs)/_layout.tsx`:**
- Tab 1: Dashboard (House icon → Flame icon from lucide: `Flame`)
- Tab 2: Analyze (Compass → `Camera` from lucide)
- Tab 3: History (Bell → `History` from lucide)
- Tab 4: Profile (keep CircleUser)

**Rewrite `app/(tabs)/index.tsx`** as Dashboard:
```typescript
// Shows:
// - Today's calorie total (sum of today's meals)
// - Circular progress or simple bar
// - "Recent Meals" list (last 3-5 from storage)
// - Empty state: "Snap your first meal to get started"
// Each meal card: thumbnail, cals, time
// Pull-to-refresh reloads from AsyncStorage
```

**Testing checklist:**
- [ ] App boots without crash
- [ ] All 4 tabs render and navigate correctly
- [ ] Dashboard shows empty state initially
- [ ] Analyze tab shows image picker UI
- [ ] History tab shows empty state
- [ ] Profile tab still works as before

**Git commit:** `feat: restructure tabs for calorie tracking (dashboard, analyze, history)`

---

### Phase 4: Analyze Flow + Result Screen (30 min)

**Finalize `app/(tabs)/analyze.tsx`:**
- "Take Photo" button → `expo-image-picker` camera
- "Choose from Gallery" button → `expo-image-picker` library
- After selection: show image preview
- "Analyze Meal" button → calls `generateMockAnalysis(uri)`
- Save result via `saveMeal()`
- Navigate to `/result/${meal.id}`

**Create `app/result/[id].tsx`:**
- Read meal from storage by route param `id`
- Display:
  - Meal image (full width)
  - Total calories (big number)
  - Macro breakdown (protein/carbs/fat/fiber as colored bars or numbers)
  - Detected items list with individual calories + confidence %
  - Assumptions section (bullet list)
  - Confidence score badge (using StatusBadge)
  - Health notes section
- "Back to Dashboard" button

**Testing checklist:**
- [ ] Can pick image from gallery
- [ ] Can take photo with camera (test on device/emulator)
- [ ] Image preview shows after selection
- [ ] "Analyze Meal" navigates to result screen
- [ ] Result screen shows all sections with mock data
- [ ] Meal appears in History tab after analysis
- [ ] Meal appears in Dashboard "recent meals"
- [ ] Can tap a meal in history/dashboard to re-view the result

**Git commit:** `feat: complete analyze flow with image picker, mock AI results, and result screen`

---

### Phase 5: Polish + Logs (15 min)

- Add calorie daily goal constant (e.g., 2000) to `lib/constants.ts`
- Dashboard: show progress toward daily goal
- Empty states: friendly messages + CTA to Analyze tab
- Add this plan file to `ai-logs/`
- Create `ai-logs/README.md` explaining AI usage

**Testing checklist:**
- [ ] Full flow: Landing → Login → Dashboard → Analyze → Result → Dashboard (shows meal)
- [ ] Pull-to-refresh on Dashboard reloads meals
- [ ] History shows meals in reverse chronological order
- [ ] App survives force-close and reload (data persists)
- [ ] No TypeScript errors
- [ ] No yellow box warnings in dev

**Git commit:** `feat: add daily goal tracking, polish empty states, create ai-logs`

---

## Fallback Plans

### If `expo-image-picker` gives permission errors:
1. The template already has camera permissions in `app.json`
2. If still failing, use a hardcoded placeholder image URI for demo
3. Add `expo-image-picker` plugin to `app.json` plugins array:
   ```json
   "plugins": ["expo-image-picker"]
   ```

### If AsyncStorage gives errors:
1. Package is already installed (`@react-native-async-storage/async-storage`)
2. If read/write fails, fall back to React state (in-memory only)
3. Wrap all storage calls in try/catch with console.warn

### If camera doesn't work in emulator:
1. Use gallery pick only (always works in simulator)
2. Add a "Use Demo Image" button that uses a bundled asset

### If navigation crashes after tab rename:
1. Ensure tab file names match exactly: `index.tsx`, `analyze.tsx`, `history.tsx`, `profile.tsx`
2. Clear Metro cache: `npx expo start --clear`
3. Delete `.expo/` folder and restart

---

## Key Commands

```bash
# Start dev
npx expo start --clear

# Type check
npx tsc --noEmit

# Run tests
npm test

# Clear all caches if weird errors
rm -rf node_modules/.cache .expo
npx expo start --clear
```

---

## Day 2 Preview (don't build yet)

- Replace mock analysis with real OpenAI Vision API call
- Add Supabase table for meal storage (sync across devices)
- Add daily/weekly calorie chart
- Add food database search
- Loom recording + screenshots
- Write reflection doc
- Push to public GitHub

---

## Summary of New File Tree

```
app/
  (tabs)/
    _layout.tsx        ← EDIT (new tab names + icons)
    index.tsx          ← REWRITE (calorie dashboard)
    analyze.tsx        ← NEW (image picker + analyze)
    history.tsx        ← NEW (meal log)
    profile.tsx        ← NO CHANGE
  result/
    [id].tsx           ← NEW (analysis result detail)
  index.tsx            ← EDIT (rebrand landing features)
lib/
  types.ts             ← NEW (MealAnalysis types)
  mockAnalysis.ts      ← NEW (mock AI response)
  storage.ts           ← NEW (AsyncStorage CRUD)
  constants.ts         ← EDIT (rebrand strings)
ai-logs/
  day1-implementation-plan.md  ← THIS FILE
  README.md            ← NEW (explain AI tool usage)
```

---

## Cursor Instructions Format

When giving these to Cursor, prefix each phase with:

```
PHASE X: [name]
FILES TO EDIT: [list]
FILES TO CREATE: [list]
REQUIREMENTS: [bullet list of what the code must do]
CONSTRAINTS: Do not modify files outside the listed set.
```

This keeps the AI focused and prevents it from over-reaching into auth/provider code.
