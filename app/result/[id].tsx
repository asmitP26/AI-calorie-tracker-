import { useCallback, useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Beef,
  ChevronLeft,
  Droplets,
  Flame,
  Leaf,
  Sparkles,
  Wheat,
  Candy,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EstimateDisclaimer, SectionLabel } from '@/components/meal/MealUi'
import {
  ACCENT,
  ACCENT_DIM,
  BG,
  BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '@/lib/theme'
import { getMealById } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/mealTypes'

const PRIMARY_MACROS = [
  { key: 'protein' as const, label: 'Protein', unit: 'g', icon: Beef },
  { key: 'carbs' as const, label: 'Carbs', unit: 'g', icon: Wheat },
  { key: 'fat' as const, label: 'Fat', unit: 'g', icon: Droplets },
] as const

const SECONDARY_MACROS = [
  { key: 'fiber' as const, label: 'Fiber', unit: 'g', icon: Leaf },
  { key: 'sugar' as const, label: 'Sugar', unit: 'g', icon: Candy },
] as const

export default function ResultScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [meal, setMeal] = useState<SavedMeal | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMeal = useCallback(async () => {
    if (!id) {
      setMeal(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const found = await getMealById(id)
    setMeal(found)
    setLoading(false)
  }, [id])

  useFocusEffect(
    useCallback(() => {
      loadMeal()
    }, [loadMeal]),
  )

  if (loading) {
    return (
      <View style={[s.centered, { backgroundColor: BG }]}>
        <ActivityIndicator color={ACCENT} />
        <Text style={s.loadingHint}>Loading nutrition result...</Text>
      </View>
    )
  }

  if (!meal) {
    return (
      <View style={[s.centered, { backgroundColor: BG, padding: 24 }]}>
        <Text style={s.notFoundTitle}>Meal not found</Text>
        <Text style={s.notFoundSub}>This analysis may have been removed.</Text>
        <Button label="Back to Dashboard" variant="primary" onPress={() => router.replace('/(tabs)')} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <ChevronLeft size={22} color={TEXT_SECONDARY} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>Nutrition Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroWrap}>
          <Image source={{ uri: meal.imageUri }} style={s.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(13,13,13,0.85)', BG]}
            style={s.heroOverlay}
          />
          <View style={s.heroContent}>
            <Text style={s.mealName} numberOfLines={2}>{meal.mealName}</Text>
            <View style={s.heroBadges}>
              <View style={s.confidencePill}>
                <Sparkles size={12} color={ACCENT} strokeWidth={2.5} />
                <Text style={s.confidenceText}>{meal.confidence}% confidence</Text>
              </View>
              {meal.analysisSource === 'gemini' ? (
                <View style={s.sourcePill}>
                  <Text style={s.sourcePillText}>AI analyzed</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <Card style={s.calorieCard}>
          <View style={s.calorieIcon}>
            <Flame size={32} color={ACCENT} strokeWidth={2} />
          </View>
          <Text style={s.calorieLabel}>Total calories</Text>
          <Text style={s.calorieValue}>{meal.totalCalories}</Text>
          <Text style={s.calorieUnit}>kilocalories · estimate</Text>
        </Card>

        {meal.analysisSource === 'mock' ? (
          <View style={s.fallbackBanner}>
            <Text style={s.fallbackBannerText}>
              Demo estimate — AI vision was unavailable. Values are illustrative, not from a live scan.
            </Text>
          </View>
        ) : null}

        <SectionLabel title="Macronutrients" subtitle="Per-meal estimated breakdown" />
        <View style={s.macroRowPrimary}>
          {PRIMARY_MACROS.map((macro) => {
            const Icon = macro.icon
            return (
              <Card key={macro.key} compact style={s.macroCardPrimary}>
                <View style={s.macroIconWrap}>
                  <Icon size={16} color={ACCENT} strokeWidth={2.2} />
                </View>
                <Text style={s.macroLabel}>{macro.label}</Text>
                <Text style={s.macroValuePrimary}>
                  {meal.macros[macro.key]}
                  <Text style={s.macroUnit}>{macro.unit}</Text>
                </Text>
              </Card>
            )
          })}
        </View>
        <View style={s.macroRowSecondary}>
          {SECONDARY_MACROS.map((macro) => {
            const Icon = macro.icon
            return (
              <Card key={macro.key} compact style={s.macroCardSecondary}>
                <View style={s.macroIconWrapSmall}>
                  <Icon size={14} color={ACCENT} strokeWidth={2.2} />
                </View>
                <Text style={s.macroLabel}>{macro.label}</Text>
                <Text style={s.macroValue}>
                  {meal.macros[macro.key]}
                  <Text style={s.macroUnit}>{macro.unit}</Text>
                </Text>
              </Card>
            )
          })}
        </View>

        <SectionLabel title="Food breakdown" />
        <Card style={s.listCard}>
          {meal.items.map((item, index) => (
            <View key={item.id} style={[s.foodRow, index < meal.items.length - 1 && s.rowDivider]}>
              <View style={s.foodDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.foodName}>{item.name}</Text>
                <Text style={s.foodPortion}>{item.portion}</Text>
              </View>
              <View style={s.foodKcal}>
                <Text style={s.foodCalories}>{item.calories}</Text>
                <Text style={s.foodKcalUnit}>kcal</Text>
              </View>
            </View>
          ))}
        </Card>

        <SectionLabel title="Assumptions" subtitle="How Cal AI interpreted this meal" />
        <Card style={s.bulletCard}>
          {meal.assumptions.map((note, i) => (
            <View key={`a-${i}`} style={s.bulletRow}>
              <View style={s.bulletDot} />
              <Text style={s.bulletItem}>{note}</Text>
            </View>
          ))}
        </Card>

        <SectionLabel title="Health notes" />
        <Card style={s.bulletCard}>
          {meal.healthNotes.map((note, i) => (
            <View key={`h-${i}`} style={s.bulletRow}>
              <View style={[s.bulletDot, s.bulletDotAccent]} />
              <Text style={s.bulletItem}>{note}</Text>
            </View>
          ))}
        </Card>

        <EstimateDisclaimer />

        <View style={s.actions}>
          <Button
            label="Back to Dashboard"
            variant="primary"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          />
          <Button
            label="Analyze Another Meal"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/analyze')}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingHint: { fontSize: 13, color: TEXT_SECONDARY },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  body: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  heroWrap: {
    marginHorizontal: -20,
    height: 220,
    marginBottom: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    gap: 8,
  },
  mealName: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.4 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ACCENT_DIM,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  confidenceText: { fontSize: 12, fontWeight: '700', color: ACCENT },
  sourcePill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sourcePillText: { fontSize: 11, fontWeight: '600', color: TEXT_SECONDARY },
  calorieCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 26,
    marginTop: -12,
    borderWidth: 1.5,
    borderColor: 'rgba(34,197,94,0.35)',
    backgroundColor: 'rgba(34,197,94,0.08)',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  calorieIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calorieLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  calorieValue: { fontSize: 60, fontWeight: '800', color: ACCENT, letterSpacing: -2.5, lineHeight: 64 },
  calorieUnit: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '600' },
  fallbackBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.28)',
  },
  fallbackBannerText: {
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  macroRowPrimary: { flexDirection: 'row', gap: 8 },
  macroRowSecondary: { flexDirection: 'row', gap: 8 },
  macroCardPrimary: { flex: 1, gap: 6, paddingVertical: 14 },
  macroCardSecondary: { flex: 1, gap: 5, paddingVertical: 12 },
  macroValuePrimary: { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY },
  macroIconWrapSmall: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
  macroValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
  macroUnit: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY },
  listCard: { paddingVertical: 6, paddingHorizontal: 0 },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  foodDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: TEXT_TERTIARY,
  },
  foodName: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  foodPortion: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  foodKcal: { alignItems: 'flex-end' },
  foodCalories: { fontSize: 16, fontWeight: '800', color: ACCENT },
  foodKcalUnit: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '600' },
  bulletCard: { gap: 10, paddingVertical: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: TEXT_TERTIARY,
    marginTop: 7,
  },
  bulletDotAccent: { backgroundColor: ACCENT },
  bulletItem: { flex: 1, fontSize: 13, lineHeight: 20, color: TEXT_SECONDARY },
  actions: { gap: 10, marginTop: 4 },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },
  notFoundSub: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 8, textAlign: 'center' },
})
