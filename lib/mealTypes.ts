/** Macronutrient totals for a meal or daily summary. */
export interface MacroBreakdown {
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
}

/** A single detected food item within a meal analysis. */
export interface FoodItem {
  id: string
  name: string
  calories: number
  portion: string
  protein: number
  carbs: number
  fat: number
}

/** How the meal analysis was produced (optional for older saved meals). */
export type AnalysisSource = 'gemini' | 'mock'

/** AI nutrition analysis result for one meal photo. */
export interface MealAnalysis {
  id: string
  mealName: string
  imageUri: string
  createdAt: string
  totalCalories: number
  confidence: number
  macros: MacroBreakdown
  items: FoodItem[]
  assumptions: string[]
  healthNotes: string[]
  /** Present when saved after AI integration; used for demo disclaimers. */
  analysisSource?: AnalysisSource
}

/** Persisted meal record (same shape as analysis). */
export type SavedMeal = MealAnalysis

/** Aggregated nutrition for meals logged today. */
export interface TodayNutritionSummary {
  totalCalories: number
  macros: MacroBreakdown
  mealCount: number
}
