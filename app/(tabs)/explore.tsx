import { useCallback, useMemo, useState } from 'react'
import {
    View,
    ScrollView,
    StyleSheet,
    Pressable,
    RefreshControl,
    Image,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    Camera,
    ChevronRight,
    Flame,
    Sparkles,
    Trash2,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/AppModal'
import { EmptyMealsState, EstimateDisclaimer } from '@/components/meal/MealUi'
import {
    ACCENT,
    ACCENT_DIM,
    BG,
    BORDER,
    ERROR,
    SURFACE2,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    TEXT_TERTIARY,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { clearSavedMeals, deleteMeal, getSavedMeals } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/mealTypes'
import { formatRelativeDate } from '@/lib/utils'
import { useToast } from '@/contexts/ToastContext'

export default function ExploreScreen() {
    const insets = useSafeAreaInsets()
    const { showToast } = useToast()
    const [refreshing, setRefreshing] = useState(false)
    const [meals, setMeals] = useState<SavedMeal[]>([])
    const [confirmClear, setConfirmClear] = useState(false)
    const [mealToDelete, setMealToDelete] = useState<SavedMeal | null>(null)

    const loadMeals = useCallback(async () => {
        const saved = await getSavedMeals()
        setMeals(saved)
    }, [])

    useFocusEffect(
        useCallback(() => {
            loadMeals()
        }, [loadMeals]),
    )

    const onRefresh = async () => {
        setRefreshing(true)
        await loadMeals()
        setRefreshing(false)
    }

    const handleClearAll = async () => {
        await clearSavedMeals()
        setConfirmClear(false)
        await loadMeals()
        showToast('Meal history cleared', 'success')
    }

    const handleDeleteMeal = async () => {
        if (!mealToDelete) return
        try {
            await deleteMeal(mealToDelete.id)
            setMealToDelete(null)
            await loadMeals()
            showToast('Meal removed', 'success')
        } catch {
            showToast('Could not delete meal', 'error')
        }
    }

    const stats = useMemo(() => {
        if (meals.length === 0) return null
        const totalKcal = meals.reduce((sum, m) => sum + m.totalCalories, 0)
        const avgConfidence = Math.round(
            meals.reduce((sum, m) => sum + m.confidence, 0) / meals.length,
        )
        return { count: meals.length, totalKcal, avgConfidence }
    }, [meals])

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 20 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <Text style={s.title}>Meal History</Text>
                    <Text style={s.subtitle}>Every meal you have analyzed</Text>
                </View>
                {meals.length > 0 && (
                    <Pressable
                        onPress={() => setConfirmClear(true)}
                        hitSlop={8}
                        style={({ pressed }) => [s.clearBtn, pressed && { opacity: 0.7 }]}
                    >
                        <Trash2 size={18} color={ERROR} strokeWidth={2} />
                        <Text style={s.clearBtnText}>Clear</Text>
                    </Pressable>
                )}
            </View>

            {/* Stats Row */}
            {stats && (
                <View style={s.statsRow}>
                    <Card compact style={s.statCard}>
                        <Text style={s.statValue}>{stats.count}</Text>
                        <Text style={s.statLabel}>Meals</Text>
                    </Card>
                    <Card compact style={s.statCard}>
                        <Text style={s.statValue}>{stats.totalKcal}</Text>
                        <Text style={s.statLabel}>Total kcal</Text>
                    </Card>
                    <Card compact style={s.statCard}>
                        <Text style={s.statValue}>{stats.avgConfidence}%</Text>
                        <Text style={s.statLabel}>Confidence</Text>
                    </Card>
                </View>
            )}

            {/* Meal List */}
            {meals.length === 0 ? (
                <EmptyMealsState
                    icon={<Camera size={26} color={ACCENT} strokeWidth={2} />}
                    title="No meal history yet"
                    message="Your saved analyses will show up here with calories, dates, and AI confidence."
                    ctaLabel="Analyze a meal"
                    onCta={() => router.push('/analyze')}
                />
            ) : (
                meals.map((meal) => (
                    <Pressable
                        key={meal.id}
                        onPress={() => router.push(`/result/${meal.id}`)}
                        onLongPress={() => setMealToDelete(meal)}
                        style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                    >
                        <Card style={s.mealCard}>
                            <Image source={{ uri: meal.imageUri }} style={s.thumb} />
                            <View style={s.mealBody}>
                                <Text style={s.mealName} numberOfLines={1}>{meal.mealName}</Text>
                                <Text style={s.mealMeta}>{formatRelativeDate(meal.createdAt)}</Text>
                                <View style={s.mealFooter}>
                                    <View style={s.kcalBadge}>
                                        <Flame size={12} color={ACCENT} strokeWidth={2.2} />
                                        <Text style={s.kcalText}>{meal.totalCalories} kcal</Text>
                                    </View>
                                    <View style={s.confBadge}>
                                        <Sparkles size={10} color={ACCENT} strokeWidth={2.5} />
                                        <Text style={s.confText}>{meal.confidence}%</Text>
                                    </View>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setMealToDelete(meal)}
                                hitSlop={8}
                                style={({ pressed }) => [s.deleteBtn, pressed && { opacity: 0.6 }]}
                            >
                                <Trash2 size={16} color={TEXT_TERTIARY} strokeWidth={2} />
                            </Pressable>
                            <ChevronRight size={18} color={TEXT_TERTIARY} />
                        </Card>
                    </Pressable>
                ))
            )}

            {meals.length > 0 && (
                <Button
                    label="Analyze New Meal"
                    variant="secondary"
                    fullWidth
                    onPress={() => router.push('/analyze')}
                    style={{ marginTop: 4 }}
                />
            )}

            <EstimateDisclaimer />

            <AlertModal
                visible={confirmClear}
                title="Clear all history?"
                message="This removes every saved meal scan. This cannot be undone."
                buttons={[
                    { text: 'Cancel', style: 'cancel', onPress: () => setConfirmClear(false) },
                    { text: 'Clear all', style: 'destructive', onPress: handleClearAll },
                ]}
                onDismiss={() => setConfirmClear(false)}
            />

            <AlertModal
                visible={mealToDelete != null}
                title="Delete this meal?"
                message={mealToDelete ? `"${mealToDelete.mealName}" will be removed from your history.` : undefined}
                buttons={[
                    { text: 'Cancel', style: 'cancel', onPress: () => setMealToDelete(null) },
                    { text: 'Delete', style: 'destructive', onPress: handleDeleteMeal },
                ]}
                onDismiss={() => setMealToDelete(null)}
            />
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 14 },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
    title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.8 },
    subtitle: { fontSize: 14, color: TEXT_SECONDARY },
    clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 6 },
    clearBtnText: { fontSize: 13, fontWeight: '600', color: ERROR },
    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14 },
    statValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
    statLabel: { fontSize: 11, color: TEXT_SECONDARY, fontWeight: '600' },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 12,
    },
    thumb: {
        width: 64,
        height: 64,
        borderRadius: 14,
        backgroundColor: SURFACE2,
    },
    deleteBtn: {
        padding: 6,
    },
    mealBody: { flex: 1, gap: 4 },
    mealName: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
    mealMeta: { fontSize: 12, color: TEXT_SECONDARY },
    mealFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
    kcalBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    kcalText: { fontSize: 12, fontWeight: '700', color: ACCENT },
    confBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: ACCENT_DIM,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 999,
    },
    confText: { fontSize: 11, fontWeight: '700', color: ACCENT },
})
