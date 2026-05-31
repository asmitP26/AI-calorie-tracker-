import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MacroBreakdown, SavedMeal, TodayNutritionSummary } from './mealTypes'

const STORAGE_KEY = '@calai/saved_meals'

const EMPTY_MACROS: MacroBreakdown = {
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
}

function isSavedMeal(value: unknown): value is SavedMeal {
  if (!value || typeof value !== 'object') return false
  const meal = value as SavedMeal
  return (
    typeof meal.id === 'string'
    && typeof meal.mealName === 'string'
    && typeof meal.imageUri === 'string'
    && typeof meal.createdAt === 'string'
    && typeof meal.totalCalories === 'number'
    && typeof meal.confidence === 'number'
    && meal.macros != null
    && Array.isArray(meal.items)
  )
}

function parseMeals(raw: string | null): SavedMeal[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedMeal)
  } catch {
    return []
  }
}

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
  )
}

function sumMacros(meals: SavedMeal[]): MacroBreakdown {
  return meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + meal.macros.protein,
      carbs: acc.carbs + meal.macros.carbs,
      fat: acc.fat + meal.macros.fat,
      fiber: acc.fiber + meal.macros.fiber,
      sugar: acc.sugar + meal.macros.sugar,
    }),
    { ...EMPTY_MACROS },
  )
}

export async function getSavedMeals(): Promise<SavedMeal[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    const meals = parseMeals(raw)
    return meals.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  } catch {
    return []
  }
}

export async function saveMeal(meal: SavedMeal): Promise<void> {
  try {
    const existing = await getSavedMeals()
    const withoutDuplicate = existing.filter((m) => m.id !== meal.id)
    const next = [meal, ...withoutDuplicate]
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (error) {
    console.warn('[mealStorage] saveMeal failed:', error)
    throw error
  }
}

export async function clearSavedMeals(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[mealStorage] clearSavedMeals failed:', error)
  }
}

export async function getTodayNutritionSummary(): Promise<TodayNutritionSummary> {
  try {
    const meals = await getSavedMeals()
    const todayMeals = meals.filter((m) => isToday(m.createdAt))
    const totalCalories = todayMeals.reduce((sum, m) => sum + m.totalCalories, 0)
    return {
      totalCalories,
      macros: sumMacros(todayMeals),
      mealCount: todayMeals.length,
    }
  } catch {
    return { totalCalories: 0, macros: { ...EMPTY_MACROS }, mealCount: 0 }
  }
}

export async function getMealById(id: string): Promise<SavedMeal | null> {
  const meals = await getSavedMeals()
  return meals.find((m) => m.id === id) ?? null
}
