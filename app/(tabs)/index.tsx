import { useCallback, useState } from 'react'
import { View, ScrollView, StyleSheet, RefreshControl, Pressable, Image } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
    Camera,
    ChevronRight,
    Flame,
    Sparkles,
    Beef,
    Wheat,
    Droplets,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { EstimateDisclaimer, EmptyMealsState, SectionLabel } from '@/components/meal/MealUi'
import {
    ACCENT,
    ACCENT_DIM,
    ACCENT_GLOW,
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
import { adjustBrightness } from '@/lib/utils'

const DAILY_GOAL = 2000

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

    const greeting = (() => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    })()

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

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 20 }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={s.header}>
                <View style={s.brandPill}>
                    <Sparkles size={12} color={ACCENT} strokeWidth={2.5} />
                    <Text style={s.brandText}>{APP_NAME}</Text>
                </View>
                <Text style={s.greeting}>{greeting}, {firstName}</Text>
                <Text style={s.subGreeting}>Track today&apos;s nutrition at a glance</Text>
            </View>

            <LinearGradient
                colors={[adjustBrightness(ACCENT, -35), ACCENT, adjustBrightness(ACCENT, 12)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.heroGradient}
            >
                <View style={s.heroTop}>
                    <View style={s.heroIconWrap}>
                        <Flame size={22} color="#fff" strokeWidth={2.2} />
                    </View>
                    <Text style={s.heroLabel}>Today&apos;s calories</Text>
                </View>
                <Text style={s.heroValue}>{summary.totalCalories}</Text>
                <Text style={s.heroUnit}>kcal estimated</Text>
                <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={s.heroMeta}>
                    {summary.mealCount === 0
                        ? `Goal ${DAILY_GOAL} kcal · log your first meal`
                        : `${summary.mealCount} meal${summary.mealCount === 1 ? '' : 's'} · ${Math.round(progress * 100)}% of ${DAILY_GOAL} kcal goal`}
                </Text>
            </LinearGradient>

            <SectionLabel title="Macro summary" subtitle="Totals from meals logged today" />
            <View style={s.macroRow}>
                <MacroChip icon={Beef} label="Protein" value={summary.macros.protein} />
                <MacroChip icon={Wheat} label="Carbs" value={summary.macros.carbs} />
                <MacroChip icon={Droplets} label="Fat" value={summary.macros.fat} />
            </View>

            <Pressable
                onPress={() => router.push('/analyze')}
                style={({ pressed }) => [s.ctaCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
            >
                <View style={s.ctaIcon}>
                    <Camera size={22} color={ACCENT} strokeWidth={2} />
                </View>
                <View style={s.ctaText}>
                    <Text style={s.ctaTitle}>Analyze Meal</Text>
                    <Text style={s.ctaSub}>Snap a photo · get instant macro estimates</Text>
                </View>
                <ChevronRight size={20} color={TEXT_TERTIARY} />
            </Pressable>

            <SectionLabel title="Recent meals" />
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
                        style={({ pressed }) => [pressed && { opacity: 0.82 }]}
                    >
                        <Card style={s.mealCard}>
                            <View style={s.thumbWrap}>
                                <Image source={{ uri: meal.imageUri }} style={s.mealThumb} />
                                <View style={s.kcalBadge}>
                                    <Text style={s.kcalBadgeText}>{meal.totalCalories}</Text>
                                </View>
                            </View>
                            <View style={s.mealInfo}>
                                <Text style={s.mealName} numberOfLines={1}>{meal.mealName}</Text>
                                <Text style={s.mealMeta}>{formatRelativeDate(meal.createdAt)}</Text>
                                <View style={s.confidenceRow}>
                                    <Sparkles size={11} color={ACCENT} strokeWidth={2.5} />
                                    <Text style={s.mealConfidence}>{meal.confidence}% confidence</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color={TEXT_TERTIARY} />
                        </Card>
                    </Pressable>
                ))
            )}

            <EstimateDisclaimer style={{ marginTop: 4 }} />
        </ScrollView>
    )
}

function MacroChip({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Beef
    label: string
    value: number
}) {
    return (
        <Card compact style={s.macroChip}>
            <View style={s.macroIcon}>
                <Icon size={14} color={ACCENT} strokeWidth={2.2} />
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
    header: { gap: 8, marginBottom: 2 },
    brandPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: ACCENT_DIM,
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.22)',
    },
    brandText: { fontSize: 12, fontWeight: '700', color: ACCENT, letterSpacing: 0.3 },
    greeting: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.8 },
    subGreeting: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
    heroGradient: {
        borderRadius: 20,
        padding: 20,
        gap: 4,
        overflow: 'hidden',
        shadowColor: ACCENT_GLOW,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 6,
    },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    heroIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    heroValue: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: -2 },
    heroUnit: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
    progressTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.2)',
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#fff',
    },
    heroMeta: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    macroRow: { flexDirection: 'row', gap: 8 },
    macroChip: { flex: 1, gap: 6, paddingVertical: 12 },
    macroIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    macroValue: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY },
    macroUnit: { fontSize: 12, fontWeight: '600', color: TEXT_SECONDARY },
    ctaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 16,
        backgroundColor: SURFACE,
        borderWidth: 1,
        borderColor: BORDER,
    },
    ctaIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: { flex: 1, gap: 3 },
    ctaTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
    ctaSub: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 17 },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
    },
    thumbWrap: { position: 'relative' },
    mealThumb: {
        width: 64,
        height: 64,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    kcalBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: ACCENT,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: SURFACE,
    },
    kcalBadgeText: { fontSize: 10, fontWeight: '800', color: '#0d0d0d' },
    mealInfo: { flex: 1, gap: 3 },
    mealName: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
    mealMeta: { fontSize: 12, color: TEXT_SECONDARY },
    confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    mealConfidence: { fontSize: 11, color: ACCENT, fontWeight: '600' },
})
