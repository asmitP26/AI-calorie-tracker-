import { useCallback, useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Beef,
  ChevronLeft,
  Droplets,
  Flame,
  Sparkles,
  Wheat,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AppModal'
import { EstimateDisclaimer } from '@/components/meal/MealUi'
import {
  ACCENT,
  ACCENT_DIM,
  BG,
  BORDER,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '@/lib/theme'
import { deleteMeal, getMealById } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/mealTypes'
import { useToast } from '@/contexts/ToastContext'

const PRIMARY_MACROS = [
  { key: 'protein' as const, label: 'Protein', unit: 'g', icon: Beef, color: '#3B82F6' },
  { key: 'carbs' as const, label: 'Carbs', unit: 'g', icon: Wheat, color: '#F59E0B' },
  { key: 'fat' as const, label: 'Fat', unit: 'g', icon: Droplets, color: '#EF4444' },
] as const

export default function ResultScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useToast()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [meal, setMeal] = useState<SavedMeal | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const handleDelete = async () => {
    if (!meal) return
    try {
      await deleteMeal(meal.id)
      setConfirmDelete(false)
      showToast('Meal removed', 'success')
      router.replace('/(tabs)/explore')
    } catch {
      setConfirmDelete(false)
      showToast('Could not delete meal', 'error')
    }
  }

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
      {/* Meal Image at Top */}
      <View style={[s.imageContainer, { paddingTop: insets.top }]}>
        <Image source={{ uri: meal.imageUri }} style={s.heroImage} resizeMode="cover" />
        <Pressable onPress={() => router.back()} style={[s.backBtn, { top: insets.top + 8 }]}>
          <ChevronLeft size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bottom Sheet Style Content */}
      <ScrollView
        style={s.sheet}
        contentContainerStyle={[s.sheetContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal Name */}
        <Text style={s.mealName}>{meal.mealName}</Text>
        <View style={s.badges}>
          <View style={s.confidencePill}>
            <Sparkles size={12} color={ACCENT} strokeWidth={2.5} />
            <Text style={s.confidenceText}>{meal.confidence}% confidence</Text>
          </View>
          {meal.analysisSource === 'gemini' && (
            <View style={s.sourcePill}>
              <Text style={s.sourcePillText}>AI analyzed</Text>
            </View>
          )}
        </View>

        {/* Total Calories - Large */}
        <Card style={s.calorieCard}>
          <Flame size={28} color={ACCENT} strokeWidth={2} />
          <Text style={s.calorieValue}>{meal.totalCalories}</Text>
          <Text style={s.calorieLabel}>calories</Text>
        </Card>

        {/* Macro Mini Cards */}
        <View style={s.macroRow}>
          {PRIMARY_MACROS.map((macro) => {
            const Icon = macro.icon
            return (
              <Card key={macro.key} compact style={s.macroCard}>
                <View style={[s.macroIconWrap, { backgroundColor: macro.color + '14' }]}>
                  <Icon size={16} color={macro.color} strokeWidth={2.2} />
                </View>
                <Text style={s.macroCardLabel}>{macro.label}</Text>
                <Text style={s.macroCardValue}>
                  {meal.macros[macro.key]}<Text style={s.macroCardUnit}>{macro.unit}</Text>
                </Text>
              </Card>
            )
          })}
        </View>

        {/* Mock fallback banner */}
        {meal.analysisSource === 'mock' && (
          <View style={s.fallbackBanner}>
            <Text style={s.fallbackText}>
              Demo Result (AI unavailable) — values are illustrative estimates.
            </Text>
          </View>
        )}

        {/* Food Breakdown */}
        <Text style={s.sectionTitle}>Ingredients</Text>
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

        {/* Assumptions */}
        <Text style={s.sectionTitle}>Assumptions</Text>
        <Card style={s.bulletCard}>
          {meal.assumptions.map((note, i) => (
            <View key={`a-${i}`} style={s.bulletRow}>
              <View style={s.bulletDot} />
              <Text style={s.bulletItem}>{note}</Text>
            </View>
          ))}
        </Card>

        {/* Health Notes */}
        <Text style={s.sectionTitle}>Health Notes</Text>
        <Card style={s.bulletCard}>
          {meal.healthNotes.map((note, i) => (
            <View key={`h-${i}`} style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: ACCENT }]} />
              <Text style={s.bulletItem}>{note}</Text>
            </View>
          ))}
        </Card>

        <EstimateDisclaimer />

        {/* Actions */}
        <View style={s.actions}>
          <Button
            label="Done"
            variant="primary"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          />
          <Button
            label="Analyze Another"
            variant="secondary"
            fullWidth
            onPress={() => router.push('/analyze')}
          />
          <Button
            label="Delete Meal"
            variant="outline"
            fullWidth
            onPress={() => setConfirmDelete(true)}
          />
        </View>
      </ScrollView>

      <AlertModal
        visible={confirmDelete}
        title="Delete this meal?"
        message={`"${meal.mealName}" will be removed from your history.`}
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setConfirmDelete(false) },
          { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ]}
        onDismiss={() => setConfirmDelete(false)}
      />
    </View>
  )
}

const s = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingHint: { fontSize: 13, color: TEXT_SECONDARY },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },
  notFoundSub: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 8, textAlign: 'center' },
  imageContainer: {
    height: 260,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: SURFACE,
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 16,
  },
  mealName: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
  badges: { flexDirection: 'row', gap: 8, marginTop: -8 },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ACCENT_DIM,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confidenceText: { fontSize: 12, fontWeight: '700', color: ACCENT },
  sourcePill: {
    backgroundColor: '#F1F3F5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sourcePillText: { fontSize: 11, fontWeight: '600', color: TEXT_SECONDARY },
  calorieCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  calorieValue: { fontSize: 56, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -2 },
  calorieLabel: { fontSize: 16, color: TEXT_SECONDARY, fontWeight: '500' },
  macroRow: { flexDirection: 'row', gap: 10 },
  macroCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14 },
  macroIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCardLabel: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '600' },
  macroCardValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
  macroCardUnit: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY },
  fallbackBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  fallbackText: { fontSize: 12, lineHeight: 18, color: TEXT_SECONDARY, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
  listCard: { paddingVertical: 4, paddingHorizontal: 0 },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
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
  bulletItem: { flex: 1, fontSize: 13, lineHeight: 20, color: TEXT_SECONDARY },
  actions: { gap: 10, marginTop: 4 },
})
