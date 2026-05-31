import * as FileSystem from 'expo-file-system/legacy'
import type { MealAnalysis, MacroBreakdown, FoodItem } from './mealTypes'
import { createMockMealAnalysis } from './mockNutrition'

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
/** Max wait for a live Gemini response before falling back to demo data. */
const AI_REQUEST_TIMEOUT_MS = 12_000

const MIN_MEAL_CALORIES = 80
const MAX_MEAL_CALORIES = 2800
const MAX_ITEM_CALORIES = 1200

const NUTRITION_PROMPT = `You are a vision-based nutrition estimator for a calorie-tracking app.

OUTPUT RULES (critical):
- Respond with ONE JSON object only. No markdown, no code fences, no prose before or after.
- Every numeric field must be a JSON number (not a string). Example: 420 not "420".
- Round calories and grams to whole numbers.

PORTION ESTIMATION:
- Estimate each visible food's portion from the photo (plate size, utensil, container, thickness, count).
- Put the visual portion in estimatedPortion (e.g. "1 medium bowl", "2 eggs", "1 cup rice").
- If scale is ambiguous, state your best guess and reflect lower confidence.

CALORIE REALISM:
- Use typical home/restaurant portions. Most single-plate meals are roughly 350–900 kcal unless clearly large.
- totalCalories should be close to the sum of item calories (within ~15%).
- Avoid extreme values unless the image clearly shows a very large or tiny meal.

CONFIDENCE (0–100 integer):
- 85–95: clear photo, recognizable foods, portion obvious
- 65–84: reasonable guess, some hidden ingredients or angle issues
- 40–64: blurry, mixed dish, or heavy sauce/oil uncertainty
- Below 40 only if the meal is nearly unidentifiable

ASSUMPTIONS (2–5 strings):
- List portion guesses AND what you could not see (oils, dressings, drinks, hidden butter).
- Include uncertainty explicitly (e.g. "Assumed ~1 tbsp oil — not visible in photo").

HEALTH NOTES (2–4 strings, max 12 words each):
- General wellness tips only (balance, fiber, protein, hydration).
- NO medical advice, diagnoses, treatment, or supplement recommendations.

JSON schema (follow exactly):
{
  "mealName": "short descriptive title",
  "summary": "one neutral sentence about the meal",
  "confidence": 0,
  "totalCalories": 0,
  "macros": {
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0
  },
  "items": [
    {
      "name": "food name",
      "estimatedPortion": "visual portion estimate",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  ],
  "assumptions": ["string with uncertainty when needed"],
  "healthNotes": ["short non-medical tip"]
}`

type RawGeminiItem = {
  name?: unknown
  estimatedPortion?: unknown
  portion?: unknown
  calories?: unknown
  protein?: unknown
  carbs?: unknown
  fat?: unknown
}

type RawGeminiPayload = {
  mealName?: unknown
  summary?: unknown
  confidence?: unknown
  totalCalories?: unknown
  macros?: Partial<Record<keyof MacroBreakdown, unknown>>
  items?: RawGeminiItem[]
  assumptions?: unknown
  healthNotes?: unknown
}

const MEDICAL_PATTERN =
  /\b(diagnos|prescri|medicine|medication|treat|cure|disease|disorder|symptom|doctor|physician|clinical|therapy|insulin|dosage)\b/i

function createMealId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** Parse numbers from raw JSON values, including strings like "42g" or "220 kcal". */
function parseNutrientNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value === null || value === undefined) return 0
  const cleaned = String(value).trim().replace(/,/g, '')
  const match = cleaned.match(/-?\d+(\.\d+)?/)
  if (!match) return 0
  const parsed = parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function roundNonNegative(value: unknown, max = 9999): number {
  return clamp(Math.round(parseNutrientNumber(value)), 0, max)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mimeTypeFromUri(uri: string): string {
  const lower = uri.split('?')[0].toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic'
  return 'image/jpeg'
}

async function imageUriToBase64(imageUri: string): Promise<{ base64: string; mimeType: string }> {
  const mimeType = mimeTypeFromUri(imageUri)
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  if (!base64) throw new Error('Empty image data')
  return { base64, mimeType }
}

function sanitizeJsonLike(text: string): string {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/,\s*([}\]])/g, '$1')
}

function extractJsonFromText(text: string): unknown {
  const trimmed = sanitizeJsonLike(text.trim())

  const attempts: string[] = [trimmed]

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) attempts.unshift(sanitizeJsonLike(fenced[1].trim()))

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) {
    attempts.push(sanitizeJsonLike(trimmed.slice(start, end + 1)))
  }

  let lastError: unknown
  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Could not parse JSON from model response')
}

function normalizeStringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry).trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

function sanitizeHealthNotes(value: unknown, summary?: unknown): string[] {
  const notes = normalizeStringArray(value, 4, 90)
    .map((note) => {
      if (MEDICAL_PATTERN.test(note)) return null
      const words = note.split(/\s+/)
      return words.slice(0, 14).join(' ')
    })
    .filter((note): note is string => Boolean(note))

  if (typeof summary === 'string' && summary.trim() && !MEDICAL_PATTERN.test(summary)) {
    const shortSummary = summary.trim().split(/\s+/).slice(0, 14).join(' ')
    if (!notes.includes(shortSummary)) notes.unshift(shortSummary)
  }

  return notes.slice(0, 4)
}

function sanitizeAssumptions(value: unknown): string[] {
  const assumptions = normalizeStringArray(value, 5, 160)
  if (assumptions.length > 0) return assumptions
  return [
    'Portions were estimated visually from the photo; actual serving size may differ.',
    'Hidden oils, sauces, or drinks may not be fully visible in the image.',
  ]
}

function normalizeMacros(raw: RawGeminiPayload['macros']): MacroBreakdown {
  return {
    protein: roundNonNegative(raw?.protein, 500),
    carbs: roundNonNegative(raw?.carbs, 800),
    fat: roundNonNegative(raw?.fat, 400),
    fiber: roundNonNegative(raw?.fiber, 100),
    sugar: roundNonNegative(raw?.sugar, 200),
  }
}

function sumItemCalories(items: FoodItem[]): number {
  return items.reduce((sum, item) => sum + item.calories, 0)
}

function sumMacrosFromItems(items: FoodItem[]): MacroBreakdown {
  return items.reduce(
    (acc, item) => ({
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber,
      sugar: acc.sugar,
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  )
}

function macrosAreMostlyEmpty(macros: MacroBreakdown): boolean {
  return macros.protein + macros.carbs + macros.fat < 5
}

/** Align meal total with line items; prefer item sum when totals diverge. */
function reconcileCalories(items: FoodItem[], statedTotal: number): number {
  const itemsSum = sumItemCalories(items)
  let total = statedTotal > 0 ? statedTotal : itemsSum

  if (itemsSum > 0 && total > 0) {
    const drift = Math.abs(total - itemsSum) / Math.max(itemsSum, 1)
    if (drift > 0.18) total = itemsSum
  } else if (itemsSum > 0) {
    total = itemsSum
  }

  return clamp(total, MIN_MEAL_CALORIES, MAX_MEAL_CALORIES)
}

function reconcileMacros(reported: MacroBreakdown, items: FoodItem[]): MacroBreakdown {
  const fromItems = sumMacrosFromItems(items)
  if (macrosAreMostlyEmpty(reported) && fromItems.protein + fromItems.carbs + fromItems.fat > 0) {
    return fromItems
  }
  return reported
}

function normalizeItems(rawItems: RawGeminiItem[]): FoodItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('No food items in AI response')
  }

  return rawItems.slice(0, 8).map((item, index) => {
    const name = String(item.name ?? `Item ${index + 1}`).trim() || `Item ${index + 1}`
    const portion = String(item.estimatedPortion ?? item.portion ?? 'Estimated from photo').trim()
      || 'Estimated from photo'

    return {
      id: `item_${index + 1}`,
      name: name.slice(0, 80),
      portion: portion.slice(0, 60),
      calories: roundNonNegative(item.calories, MAX_ITEM_CALORIES),
      protein: roundNonNegative(item.protein, 200),
      carbs: roundNonNegative(item.carbs, 300),
      fat: roundNonNegative(item.fat, 150),
    }
  })
}

function mapToMealAnalysis(raw: RawGeminiPayload, imageUri: string): MealAnalysis {
  const items = normalizeItems(Array.isArray(raw.items) ? raw.items : [])
  const statedTotal = roundNonNegative(raw.totalCalories, MAX_MEAL_CALORIES)
  const totalCalories = reconcileCalories(items, statedTotal)
  const macros = reconcileMacros(normalizeMacros(raw.macros), items)

  const meal: MealAnalysis = {
    id: createMealId(),
    mealName: String(raw.mealName ?? 'Analyzed Meal').trim().slice(0, 80) || 'Analyzed Meal',
    imageUri,
    createdAt: new Date().toISOString(),
    totalCalories,
    confidence: clamp(roundNonNegative(raw.confidence, 100), 0, 100),
    macros,
    items,
    assumptions: sanitizeAssumptions(raw.assumptions),
    healthNotes: sanitizeHealthNotes(
      raw.healthNotes,
      raw.summary,
    ),
    analysisSource: 'gemini',
  }

  if (meal.healthNotes.length === 0) {
    meal.healthNotes = ['Values are estimates — adjust portions to match what you ate.']
  }

  return meal
}

async function callGeminiVision(
  apiKey: string,
  imageUri: string,
  base64: string,
  mimeType: string,
): Promise<MealAnalysis> {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: NUTRITION_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Gemini HTTP ${response.status}: ${errBody.slice(0, 200)}`)
  }

  const data: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  } = await response.json()

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')

  const parsed = extractJsonFromText(text)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response was not a JSON object')
  }

  return mapToMealAnalysis(parsed as RawGeminiPayload, imageUri)
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    )
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function mockFallback(imageUri: string, reason: string): MealAnalysis {
  console.warn(`[Cal AI] Using mock nutrition analysis: ${reason}`)
  return createMockMealAnalysis(imageUri)
}

/**
 * Analyze a meal photo with Gemini Vision when configured; otherwise mock fallback.
 * Never throws — safe for demo flows.
 */
export async function analyzeMealImage(imageUri: string): Promise<MealAnalysis> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim()

  if (!apiKey) {
    return mockFallback(imageUri, 'EXPO_PUBLIC_GEMINI_API_KEY is not set')
  }

  try {
    const { base64, mimeType } = await imageUriToBase64(imageUri)
    return await withTimeout(
      callGeminiVision(apiKey, imageUri, base64, mimeType),
      AI_REQUEST_TIMEOUT_MS,
      'Gemini vision request',
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return mockFallback(imageUri, message)
  }
}
