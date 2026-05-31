import { useCallback, useState } from 'react'
import { View, ScrollView, StyleSheet, RefreshControl, Pressable, Image } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    Camera,
    ChevronRight,
    Flame,
    Plus,
    Sparkles,
    Beef,
    Wheat,
    Droplets,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EstimateDisclaimer, EmptyMealsState, SectionLabel } from '@/components/meal/MealUi'
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
import { APP_NAME } from '@/lib/constants'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useProfile } from '@/hooks/useProfile'
import { getSavedMeals, getTodayNutritionSummary } from '@/lib/mealStorage'
import type { SavedMeal, TodayNutritionSummary } from '@/lib/mealTypes'
import { formatRelativeDate } from '@/lib/utils'

const DAILY_GOAL = 2500

export default function HomeScreen() {
    const insets = useSafeAreaInsets()
    const [refreshing, setRefreshing] = useState(false)
    const [summary, setSummary] = useState<TodayNutritionSummary>({
        totalCalories: 0,
        macros: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
        mealCount: 0,
    })
    const [recentMeals, setRecentMeals] = useState<SavedMeal[]>([])

    const { data: profile } = useProfile()

    const loadDashboard = useCallback(async () => {
        const [todaySummary, meals] = await Promise.all([
            getTodayNutritionSummary(),
            getSavedMeals(),
        ])
        setSummary(todaySummary)
        setRecentMeals(meals.slice(0, 3))
    }, [])

    useFocusEffect(
        useCallback(() => {
            loadDashboard()
        }, [loadDashboard]),
    )

    const onRefresh = async () => {
        setRefreshing(true)
        await loadDashboard()
        setRefreshing(false)
    }

    const firstName = (profile?.fullName ?? 'there').split(' ')[0]
    const progress = Math.min(summary.totalCalories / DAILY_GOAL, 1)

    // Weekly date selector
    const today = new Date()
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - today.getDay() + i)
        return {
            day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
            date: d.getDate(),
            isToday: d.toDateString() === today.toDateString(),
        }
    })

    return (
        <View style={{ flex: 1, backgroundColor: BG }}>
            <ScrollView
                contentContainerStyle={[s.container, { paddingTop: insets.top + 12, paddingBottom: TAB_BAR_CLEARANCE + 20 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={s.header}>
                    <Text style={s.brandTitle}>{APP_NAME}</Text>
                    <Text style={s.greeting}>Hi, {firstName}</Text>
                </View>

                {/* Weekly Date Selector */}
                <View style={s.weekRow}>
                    {weekDays.map((d, i) => (
                        <View key={i} style={[s.dayItem, d.isToday && s.dayItemActive]}>
                            <Text style={[s.dayLabel, d.isToday && s.dayLabelActive]}>{d.day}</Text>
                            <Text style={[s.dayDate, d.isToday && s.dayDateActive]}>{d.date}</Text>
                        </View>
                    ))}
                </View>

                {/* Calorie Hero Card */}
                <Card style={s.heroCard}>
                    <View style={s.heroTop}>
                        <View style={s.heroIconWrap}>
                            <Flame size={20} color={ACCENT} strokeWidth={2.2} />
                        </View>
                        <Text style={s.heroLabel}>Today's Calories</Text>
                    </View>
                    <View style={s.heroNumbers}>
                        <Text style={s.heroValue}>{summary.totalCalories}</Text>
                        <Text style={s.heroDivider}> / </Text>
                        <Text style={s.heroGoal}>{DAILY_GOAL}</Text>
                    </View>
                    <Text style={s.heroUnit}>kcal</Text>
                    <View style={s.progressTrack}>
                        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={s.heroMeta}>
                        {summary.mealCount === 0
                            ? 'Log your first meal today'
                            : `${summary.mealCount} meal${summary.mealCount === 1 ? '' : 's'} logged \u00b7 ${Math.round(progress * 100)}% of goal`}
                    </Text>
                </Card>

                {/* Macro Cards */}
                <View style={s.macroRow}>
                    <MacroCard label="Protein" value={summary.macros.protein} color="#3B82F6" icon={Beef} />
                    <MacroCard label="Carbs" value={summary.macros.carbs} color="#F59E0B" icon={Wheat} />
                    <MacroCard label="Fat" value={summary.macros.fat} color="#EF4444" icon={Droplets} />
                </View>

                {/* Analyze CTA */}
                <Button
                    label="Analyze Meal"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={() => router.push('/analyze')}
                />

                {/* Recent Meals */}
                <Text style={s.sectionTitle}>Recent Meals</Text>
                {recentMeals.length === 0 ? (
                    <EmptyMealsState
                        icon={<Camera size={26} color={ACCENT} strokeWidth={2} />}
                        title="No meals yet"
                        message="Your analyzed meals will appear here with calories, macros, and confidence scores."
                        ctaLabel="Analyze your first meal"
                        onCta={() => router.push('/analyze')}
                    />
                ) : (
                    recentMeals.map((meal) => (
                        <Pressable
                            key={meal.id}
                            onPress={() => router.push(`/result/${meal.id}`)}
                            style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                        >
                            <Card style={s.mealCard}>
                                <Image source={{ uri: meal.imageUri }} style={s.mealThumb} />
                                <View style={s.mealInfo}>
                                    <Text style={s.mealName} numberOfLines={1}>{meal.mealName}</Text>
                                    <Text style={s.mealMeta}>{formatRelativeDate(meal.createdAt)} \u00b7 {meal.totalCalories} kcal</Text>
                                    <View style={s.mealMacroRow}>
                                        <Text style={s.mealMacro}>P {Math.round(meal.macros.protein)}g</Text>
                                        <Text style={s.mealMacro}>C {Math.round(meal.macros.carbs)}g</Text>
                                        <Text style={s.mealMacro}>F {Math.round(meal.macros.fat)}g</Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color={TEXT_TERTIARY} />
                            </Card>
                        </Pressable>
                    ))
                )}

                <EstimateDisclaimer style={{ marginTop: 8 }} />
            </ScrollView>

            {/* Floating Plus Button */}
            <Pressable
                style={[s.fab, { bottom: TAB_BAR_CLEARANCE + 16, right: 20 }]}
                onPress={() => router.push('/analyze')}
            >
                <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
        </View>
    )
}

function MacroCard({
    label,
    value,
    color,
    icon: Icon,
}: {
    label: string
    value: number
    color: string
    icon: typeof Beef
}) {
    return (
        <Card compact style={s.macroCard}>
            <View style={[s.macroIcon, { backgroundColor: color + '14' }]}>
                <Icon size={16} color={color} strokeWidth={2.2} />
            </View>
            <Text style={s.macroLabel}>{label}</Text>
            <Text style={s.macroValue}>
                {Math.round(value)}
                <Text style={s.macroUnit}>g</Text>
            </Text>
        </Card>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 16 },
    header: { gap: 2, marginBottom: 4 },
    brandTitle: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.8 },
    greeting: { fontSize: 15, color: TEXT_SECONDARY, marginTop: 2 },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    dayItem: {
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    dayItemActive: {
        backgroundColor: ACCENT,
    },
    dayLabel: { fontSize: 12, fontWeight: '600', color: TEXT_TERTIARY },
    dayLabelActive: { color: '#FFFFFF' },
    dayDate: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
    dayDateActive: { color: '#FFFFFF' },
    heroCard: {
        padding: 24,
        alignItems: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 5,
    },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    heroIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroLabel: { fontSize: 14, fontWeight: '600', color: TEXT_SECONDARY },
    heroNumbers: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    heroValue: { fontSize: 48, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -2 },
    heroDivider: { fontSize: 28, fontWeight: '300', color: TEXT_TERTIARY },
    heroGoal: { fontSize: 24, fontWeight: '600', color: TEXT_TERTIARY },
    heroUnit: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 12 },
    progressTrack: {
        width: '100%',
        height: 8,
        borderRadius: 999,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: ACCENT,
    },
    heroMeta: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 8 },
    macroRow: { flexDirection: 'row', gap: 10 },
    macroCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14 },
    macroIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroLabel: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '600' },
    macroValue: { fontSize: 20, fontWeight: '800', color: TEXT_PRIMARY },
    macroUnit: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY, marginTop: 4 },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 12,
    },
    mealThumb: {
        width: 60,
        height: 60,
        borderRadius: 14,
        backgroundColor: '#F1F3F5',
    },
    mealInfo: { flex: 1, gap: 3 },
    mealName: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
    mealMeta: { fontSize: 12, color: TEXT_SECONDARY },
    mealMacroRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
    mealMacro: { fontSize: 11, fontWeight: '600', color: TEXT_TERTIARY },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: ACCENT,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
})
