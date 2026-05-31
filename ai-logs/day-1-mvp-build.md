## Prompt

Now build the Day 1 MVP app flow for Cal AI.

Context:
This is a React Native Expo app using Expo Router and the 8x starter template.
The app is called Cal AI.
It helps users upload or take a meal photo and get AI-estimated calories and macros.

Important constraints:
- Do NOT remove auth, onboarding, Supabase, settings, profile, paywall, analytics, or template providers.
- Do NOT connect a real AI API yet.
- Use mock nutrition analysis first so the app demo is reliable.
- Use existing UI components where possible: Button, Card, Text, StatusBadge, AppModal, etc.
- Keep TypeScript clean.
- Keep the UI polished and mobile-first.
- Use Expo Router routes.

Build these features:

1. Data model
Create a file such as lib/mealTypes.ts with TypeScript types for:
- MacroBreakdown
- FoodItem
- MealAnalysis
- SavedMeal

MealAnalysis should include:
- id
- mealName
- imageUri
- createdAt
- totalCalories
- confidence
- macros: protein, carbs, fat, fiber, sugar
- items: food item array
- assumptions: string array
- healthNotes: string array

2. Mock nutrition result
Create lib/mockNutrition.ts.
Export a function createMockMealAnalysis(imageUri: string): MealAnalysis.
The mock result should look realistic:
- mealName: "Grilled Chicken Rice Bowl"
- totalCalories around 640
- protein around 42g
- carbs around 68g
- fat around 22g
- fiber around 7g
- sugar around 8g
- confidence around 86
- 3 to 5 food items
- assumptions and health notes

3. Local storage
Create lib/mealStorage.ts using AsyncStorage.
Functions:
- getSavedMeals()
- saveMeal(meal)
- clearSavedMeals()
- getTodayNutritionSummary()

If AsyncStorage is not installed, tell me the install command.
Use safe JSON parsing and error handling.

4. Analyze screen
Create app/analyze.tsx.
Features:
- Header: Analyze Meal
- Short instruction text
- Image picker button: “Choose Meal Photo”
- Optional camera button if easy, otherwise keep gallery only
- Image preview after selection
- Analyze Meal button
- Loading state for 1 to 2 seconds
- Generate mock result using createMockMealAnalysis(imageUri)
- Save result using saveMeal()
- Navigate to result screen with the saved meal id or serialized result
- Use polished cards and green accent styling

5. Result screen
Create app/result.tsx or app/result/[id].tsx, whichever is safer with the existing router.
Features:
- Show meal image
- Meal name
- Total calories large
- Confidence score
- Macro cards: protein, carbs, fat, fiber, sugar
- Food breakdown list
- Assumptions section
- Health notes section
- Disclaimer: “AI nutrition estimates may vary based on portion size, ingredients, and preparation method.”
- Button back to Dashboard
- Button Analyze Another Meal

6. Home dashboard
Update app/(tabs)/index.tsx.
Make it a Cal AI dashboard:
- Welcome heading
- Today’s calories
- Macro summary
- CTA button: Analyze Meal
- Recent meals section
- Empty state if no meals yet
- Pull/load saved meals from AsyncStorage
- Refresh when screen focuses if possible

7. Explore tab
Update app/(tabs)/explore.tsx.
Make it meal history:
- List saved meals
- Show calories, date, confidence
- Empty state
- Ability to tap a meal and view result if easy

8. Activity tab
If app/(tabs)/activity.tsx exists, lightly rebrand it to “Insights”.
Show simple static insight cards:
- “Protein intake looks balanced”
- “Add more fiber-rich foods”
- “Dinner portions are usually highest”
Do not overcomplicate.

9. Navigation
Use router.push('/analyze') from dashboard CTA.
Use router.push('/result') or router.push({ pathname: '/result', params: { id }}) depending on implementation.

10. AI logs
Create /ai-logs/day-1-mvp-build.md with:
## Prompt
[paste this prompt]
## Response
Short summary of what was implemented and which files changed.

After changes:
- Tell me all files created and modified.
- Tell me install commands needed.
- Tell me exact test commands.

## Response

Implemented the Day 1 Cal AI MVP with mock meal analysis, AsyncStorage persistence, analyze/result routes, and tab updates (dashboard, meal history, static insights). No real AI API; auth and template providers unchanged.

**Created:** `lib/mealTypes.ts`, `lib/mockNutrition.ts`, `lib/mealStorage.ts`, `app/analyze.tsx`, `app/result/[id].tsx`, `ai-logs/day-1-mvp-build.md`

**Modified:** `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/activity.tsx`, `app/(tabs)/_layout.tsx`, `app/_layout.tsx`
