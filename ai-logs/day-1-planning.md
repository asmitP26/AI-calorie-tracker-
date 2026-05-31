## Prompt

Plan a 2-day Cal AI MVP on top of the 8x React Native Expo starter template.

Requirements:
- AI calorie tracker: photo → calories + macros
- Keep auth, onboarding, Supabase shell, settings, paywall, analytics from template
- Day 1: mock AI only (reliable demo)
- Local storage for meals
- Tabs: dashboard, history, insights, profile
- Analyze as stack screen, result at `/result/[id]`
- Document plan in ai-logs

## Response

Produced a phased Day 1 plan covering rebrand, data model, AsyncStorage layer, tab rewrites, and analyze → result navigation.

**Key decisions:**
- Reuse existing tabs (`index`, `explore`, `activity`, `profile`) instead of deleting template files
- `MealAnalysis` type with macros, items, assumptions, healthNotes, confidence
- `lib/mealStorage.ts` for on-device persistence — **not Supabase** (template DB stays for auth/profile only)
- Mock generator in `lib/mockNutrition.ts` for Day 1 demos
- Analyze screen as `app/analyze.tsx` (stack route behind auth guard)

**Implementation order:** rebrand → types/storage → analyze + result screens → dashboard/history/insights tab updates → polish + ai-logs.

AI tools (Cursor / Copilot) generated the initial route map, TypeScript interfaces, and file checklist from the contest brief and existing template structure.
