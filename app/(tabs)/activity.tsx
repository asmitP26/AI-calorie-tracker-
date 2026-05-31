import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    Beef,
    Droplets,
    Lightbulb,
    Moon,
    Salad,
    Sparkles,
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

const INSIGHTS = [
    {
        icon: Beef,
        title: 'Protein looks on track',
        body: 'Lean proteins in recent meals can help you stay full between meals.',
    },
    {
        icon: Salad,
        title: 'Add more fiber-rich foods',
        body: 'Vegetables, beans, and whole grains support digestion and steady energy.',
    },
    {
        icon: Moon,
        title: 'Evening portions run larger',
        body: 'Dinner often carries the most calories — lighter sides can balance the day.',
    },
    {
        icon: Droplets,
        title: 'Stay hydrated with meals',
        body: 'Water alongside balanced plates supports how you feel after eating.',
    },
]

export default function ActivityScreen() {
    const insets = useSafeAreaInsets()

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 20 }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={s.header}>
                <View style={s.titleRow}>
                    <Lightbulb size={22} color={ACCENT} strokeWidth={2} />
                    <Text style={s.title}>Insights</Text>
                </View>
                <Text style={s.subtitle}>General wellness patterns — not medical advice.</Text>
            </View>

            {INSIGHTS.map((insight) => {
                const Icon = insight.icon
                return (
                    <Card key={insight.title} style={s.insightCard}>
                        <View style={s.iconWrap}>
                            <Icon size={18} color={ACCENT} strokeWidth={2.2} />
                        </View>
                        <View style={s.textWrap}>
                            <Text style={s.insightTitle}>{insight.title}</Text>
                            <Text style={s.insightBody}>{insight.body}</Text>
                        </View>
                    </Card>
                )
            })}

            <View style={s.demoNote}>
                <Sparkles size={14} color={ACCENT} strokeWidth={2} />
                <Text style={s.demoNoteText}>
                    Demo insights for your Loom walkthrough — live trends will use your meal history later.
                </Text>
            </View>

            <EstimateDisclaimer />
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 12 },
    header: { gap: 6, marginBottom: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { fontSize: 26, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.6 },
    subtitle: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: ACCENT_DIM,
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: { flex: 1, gap: 5 },
    insightTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
    insightBody: { fontSize: 13, lineHeight: 19, color: TEXT_SECONDARY },
    demoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: BORDER,
        marginTop: 4,
    },
    demoNoteText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: TEXT_TERTIARY,
    },
})
