import type { MealAnalysis } from './mealTypes'

function createId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** Returns a realistic mock analysis for demo and offline testing. */
export function createMockMealAnalysis(imageUri: string): MealAnalysis {
  return {
    id: createId(),
    mealName: 'Grilled Chicken Rice Bowl',
    imageUri,
    createdAt: new Date().toISOString(),
    totalCalories: 640,
    confidence: 86,
    macros: {
      protein: 42,
      carbs: 68,
      fat: 22,
      fiber: 7,
      sugar: 8,
    },
    items: [
      {
        id: 'item_1',
        name: 'Grilled chicken breast',
        calories: 220,
        portion: '6 oz',
        protein: 38,
        carbs: 0,
        fat: 6,
      },
      {
        id: 'item_2',
        name: 'Jasmine rice',
        calories: 210,
        portion: '1 cup cooked',
        protein: 4,
        carbs: 45,
        fat: 1,
      },
      {
        id: 'item_3',
        name: 'Steamed broccoli',
        calories: 55,
        portion: '1 cup',
        protein: 4,
        carbs: 11,
        fat: 1,
      },
      {
        id: 'item_4',
        name: 'Teriyaki glaze',
        calories: 95,
        portion: '2 tbsp',
        protein: 1,
        carbs: 12,
        fat: 4,
      },
      {
        id: 'item_5',
        name: 'Sesame oil drizzle',
        calories: 60,
        portion: '1 tsp',
        protein: 0,
        carbs: 0,
        fat: 10,
      },
    ],
    assumptions: [
      'Chicken portion estimated at 6 oz based on visual size.',
      'Rice volume approximated as 1 cup cooked.',
      'Teriyaki sauce assumed standard restaurant-style sweetness.',
      'No hidden butter or cream detected in the image.',
    ],
    healthNotes: [
      'High-quality lean protein supports muscle recovery and satiety.',
      'Carb load is moderate — consider a smaller rice portion if cutting calories.',
      'Fiber from broccoli helps balance blood sugar response.',
      'Sodium may be elevated from teriyaki glaze; pair with water-rich sides.',
    ],
  }
}
