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
    Clock,
    Flame,
    Sparkles,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyMealsState, EstimateDisclaimer, SectionLabel } from '@/components/meal/MealUi'
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
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { getSavedMeals } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/mealTypes'
import { formatRelativeDate } from '@/lib/utils'

export default function ExploreScreen() {
    const insets = useSafeAreaInsets()
    const [refreshing, setRefreshing] = useState(false)
    const [meals, setMeals] = useState<SavedMeal[]>([])

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
            <View style={s.header}>
                <View style={s.titleRow}>
                    <Clock size={20} color={ACCENT} strokeWidth={2} />
                    <Text style={s.title}>Meal History</Text>
                </View>
                <Text style={s.subtitle}>Every meal you&apos;ve analyzed with Cal AI</Text>
            </View>

            {stats ? (
                <View style={s.statsRow}>
                    <Card compact style={s.statCard}>
                        <Text style={s.statValue}>{stats.count}</Text>
                        <Text style={s.statLabel}>Meals</Text>
                    </Card>
                    <Card compact style={s.statCard}>
                        <View style={s.statIconRow}>
                            <Flame size={14} color={ACCENT} strokeWidth={2.2} />
                            <Text style={s.statValue}>{stats.totalKcal}</Text>
                        </View>
                        <Text style={s.statLabel}>Total kcal</Text>
                    </Card>
                    <Card compact style={s.statCard}>
                        <View style={s.statIconRow}>
                            <Sparkles size={14} color={ACCENT} strokeWidth={2.2} />
                            <Text style={s.statValue}>{stats.avgConfidence}%</Text>
                        </View>
                        <Text style={s.statLabel}>Avg confidence</Text>
                    </Card>
                </View>
            ) : null}

            {meals.length === 0 ? (
                <EmptyMealsState
                    icon={<Camera size={26} color={ACCENT} strokeWidth={2} />}
                    title="No meal history yet"
                    message="Your saved analyses will show up here with calories, dates, and AI confidence."
                    ctaLabel="Analyze a meal"
                    onCta={() => router.push('/analyze')}
                />
            ) : (
                <>
                    <SectionLabel title="All meals" subtitle={`${meals.length} saved`} />
                    {meals.map((meal) => (
                        <Pressable
                            key={meal.id}
                            onPress={() => router.push(`/result/${meal.id}`)}
                            style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
                        >
                            <Card style={s.itemCard}>
                                <View style={s.thumbWrap}>
                                    <Image source={{ uri: meal.imageUri }} style={s.thumb} />
                                    <View style={s.thumbBadge}>
                                        <Flame size={10} color="#0d0d0d" strokeWidth={2.5} />
                                        <Text style={s.thumbBadgeText}>{meal.totalCalories}</Text>
                                    </View>
                                </View>
                                <View style={s.itemBody}>
                                    <Text style={s.itemName} numberOfLines={1}>{meal.mealName}</Text>
                                    <View style={s.metaRow}>
                                        <Text style={s.itemMeta}>{formatRelativeDate(meal.createdAt)}</Text>
                                        <Text style={s.itemDot}>·</Text>
                                        <Text style={s.itemKcal}>{meal.totalCalories} kcal</Text>
                                    </View>
                                    <View style={s.confidencePill}>
                                        <Sparkles size={10} color={ACCENT} strokeWidth={2.5} />
                                        <Text style={s.confidenceText}>{meal.confidence}% confidence</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} color={TEXT_TERTIARY} />
                            </Card>
                        </Pressable>
                    ))}
                </>
            )}

            {meals.length > 0 ? (
                <Button
                    label="Analyze New Meal"
                    variant="secondary"
                    fullWidth
                    onPress={() => router.push('/analyze')}
                    style={{ marginTop: 4 }}
                />
            ) : null}

            <EstimateDisclaimer />
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 14 },
    header: { gap: 6, marginBottom: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { fontSize: 26, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.6 },
    subtitle: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
    statsRow: { flexDirection: 'row', gap: 8 },
    statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14 },
    statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statValue: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY },
    statLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600' },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    itemDot: { fontSize: 12, color: TEXT_TERTIARY },
    itemKcal: { fontSize: 12, fontWeight: '700', color: ACCENT },
    thumbWrap: { position: 'relative' },
    thumb: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: BORDER,
    },
    thumbBadge: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        transform: [{ translateX: -22 }],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: ACCENT,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 2,
        borderColor: SURFACE,
        minWidth: 44,
        justifyContent: 'center',
    },
    thumbBadgeText: { fontSize: 11, fontWeight: '800', color: '#0d0d0d' },
    itemBody: { flex: 1, gap: 5 },
    itemName: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
    itemMeta: { fontSize: 12, color: TEXT_SECONDARY },
    confidencePill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        backgroundColor: ACCENT_DIM,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    confidenceText: { fontSize: 11, fontWeight: '700', color: ACCENT },
})
