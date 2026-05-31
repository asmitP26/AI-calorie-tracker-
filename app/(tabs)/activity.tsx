import { useCallback, useMemo, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import {
    Beef,
    Droplets,
    Flame,
    Sparkles,
    Target,
    TrendingUp,
    Wheat,
    Zap,
} from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { EstimateDisclaimer } from '@/components/meal/MealUi'
import {
    ACCENT,
    ACCENT_DIM,
    BG,
    BORDER,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    TEXT_TERTIARY,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { getSavedMeals } from '@/lib/mealStorage'
import type { SavedMeal } from '@/lib/mealTypes'

export default function ActivityScreen() {
    const insets = useSafeAreaInsets()
    const [meals, setMeals] = useState<SavedMeal[]>([])

    useFocusEffect(
        useCallback(() => {
            getSavedMeals().then(setMeals)
        }, []),
    )

    const stats = useMemo(() => {
        if (meals.length === 0) return null
        const totalCal = meals.reduce((s, m) => s + m.totalCalories, 0)
        const avgCal = Math.round(totalCal / meals.length)
        const totalProtein = meals.reduce((s, m) => s + m.macros.protein, 0)
        const totalCarbs = meals.reduce((s, m) => s + m.macros.carbs, 0)
        const totalFat = meals.reduce((s, m) => s + m.macros.fat, 0)
        return { avgCal, totalProtein: Math.round(totalProtein), totalCarbs: Math.round(totalCarbs), totalFat: Math.round(totalFat), mealCount: meals.length }
    }, [meals])

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 20 }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={s.header}>
                <Text style={s.title}>Progress</Text>
                <Text style={s.subtitle}>Your nutrition insights at a glance</Text>
            </View>

            {/* Stats Cards */}
            <View style={s.statsGrid}>
                <Card style={s.statCard}>
                    <View style={[s.statIcon, { backgroundColor: '#FEF3C7' }]}>
                        <Flame size={20} color="#F59E0B" strokeWidth={2} />
                    </View>
                    <Text style={s.statLabel}>Avg. Calories</Text>
                    <Text style={s.statValue}>{stats?.avgCal ?? '--'}</Text>
                    <Text style={s.statUnit}>kcal / meal</Text>
                </Card>
                <Card style={s.statCard}>
                    <View style={[s.statIcon, { backgroundColor: ACCENT_DIM }]}>
                        <Zap size={20} color={ACCENT} strokeWidth={2} />
                    </View>
                    <Text style={s.statLabel}>Streak</Text>
                    <Text style={s.statValue}>{stats ? Math.min(stats.mealCount, 7) : 0}</Text>
                    <Text style={s.statUnit}>days active</Text>
                </Card>
            </View>

            {/* Macro Balance */}
            <Text style={s.sectionTitle}>Macro Balance</Text>
            <Card style={s.macroBalanceCard}>
                <View style={s.macroBarRow}>
                    <View style={s.macroBarLabel}>
                        <Beef size={14} color="#3B82F6" strokeWidth={2} />
                        <Text style={s.macroBarText}>Protein</Text>
                    </View>
                    <View style={s.barTrack}>
                        <View style={[s.barFill, { width: stats ? `${Math.min((stats.totalProtein / (stats.totalProtein + stats.totalCarbs + stats.totalFat)) * 100, 100)}%` : '33%', backgroundColor: '#3B82F6' }]} />
                    </View>
                    <Text style={s.macroBarValue}>{stats?.totalProtein ?? 0}g</Text>
                </View>
                <View style={s.macroBarRow}>
                    <View style={s.macroBarLabel}>
                        <Wheat size={14} color="#F59E0B" strokeWidth={2} />
                        <Text style={s.macroBarText}>Carbs</Text>
                    </View>
                    <View style={s.barTrack}>
                        <View style={[s.barFill, { width: stats ? `${Math.min((stats.totalCarbs / (stats.totalProtein + stats.totalCarbs + stats.totalFat)) * 100, 100)}%` : '33%', backgroundColor: '#F59E0B' }]} />
                    </View>
                    <Text style={s.macroBarValue}>{stats?.totalCarbs ?? 0}g</Text>
                </View>
                <View style={s.macroBarRow}>
                    <View style={s.macroBarLabel}>
                        <Droplets size={14} color="#EF4444" strokeWidth={2} />
                        <Text style={s.macroBarText}>Fat</Text>
                    </View>
                    <View style={s.barTrack}>
                        <View style={[s.barFill, { width: stats ? `${Math.min((stats.totalFat / (stats.totalProtein + stats.totalCarbs + stats.totalFat)) * 100, 100)}%` : '33%', backgroundColor: '#EF4444' }]} />
                    </View>
                    <Text style={s.macroBarValue}>{stats?.totalFat ?? 0}g</Text>
                </View>
            </Card>

            {/* Consistency Note */}
            <Text style={s.sectionTitle}>Consistency</Text>
            <Card style={s.noteCard}>
                <View style={s.noteIcon}>
                    <Target size={18} color={ACCENT} strokeWidth={2} />
                </View>
                <View style={s.noteContent}>
                    <Text style={s.noteTitle}>
                        {stats && stats.mealCount >= 3 ? 'You are building a habit!' : 'Keep logging meals'}
                    </Text>
                    <Text style={s.noteBody}>
                        {stats && stats.mealCount >= 3
                            ? `${stats.mealCount} meals tracked. Consistency is the key to reaching your nutrition goals.`
                            : 'Log at least 3 meals to start seeing trends and personalized insights here.'}
                    </Text>
                </View>
            </Card>

            {/* Tips */}
            <Card style={s.tipCard}>
                <Sparkles size={16} color={ACCENT} strokeWidth={2} />
                <Text style={s.tipText}>
                    Insights will become more accurate as you log more meals. Keep snapping!
                </Text>
            </Card>

            <EstimateDisclaimer />
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 16 },
    header: { gap: 4, marginBottom: 4 },
    title: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.8 },
    subtitle: { fontSize: 14, color: TEXT_SECONDARY },
    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 20 },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    statLabel: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '600' },
    statValue: { fontSize: 28, fontWeight: '800', color: TEXT_PRIMARY },
    statUnit: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
    macroBalanceCard: { gap: 14, paddingVertical: 18 },
    macroBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    macroBarLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
    macroBarText: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
    barTrack: {
        flex: 1,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#F1F3F5',
        overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: 999 },
    macroBarValue: { fontSize: 13, fontWeight: '700', color: TEXT_SECONDARY, width: 44, textAlign: 'right' },
    noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 16 },
    noteIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noteContent: { flex: 1, gap: 4 },
    noteTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
    noteBody: { fontSize: 13, lineHeight: 19, color: TEXT_SECONDARY },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        backgroundColor: ACCENT_DIM,
        borderColor: 'rgba(34,197,94,0.15)',
    },
    tipText: { flex: 1, fontSize: 13, lineHeight: 19, color: TEXT_SECONDARY },
})
