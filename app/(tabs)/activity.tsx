import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import {
    ACCENT,
    ACCENT_DIM,
    BG,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    TEXT_TERTIARY,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

const INSIGHTS = [
    {
        icon: 'barbell-outline' as const,
        title: 'Protein intake looks balanced',
        body: 'Your recent meals include solid lean protein sources that support recovery and fullness.',
    },
    {
        icon: 'leaf-outline' as const,
        title: 'Add more fiber-rich foods',
        body: 'Try adding beans, berries, or extra vegetables to improve digestion and satiety.',
    },
    {
        icon: 'moon-outline' as const,
        title: 'Dinner portions are usually highest',
        body: 'Evening meals tend to carry the most calories — consider lighter sides after 7 PM.',
    },
]

export default function ActivityScreen() {
    const insets = useSafeAreaInsets()

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: BG }}
            contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={s.header}>
                <Text style={s.title}>Insights</Text>
                <Text style={s.subtitle}>Simple nutrition patterns to guide your next meal.</Text>
            </View>

            {INSIGHTS.map((insight) => (
                <Card key={insight.title} style={s.insightCard}>
                    <View style={s.iconWrap}>
                        <Ionicons name={insight.icon} size={18} color={ACCENT} />
                    </View>
                    <View style={s.textWrap}>
                        <Text style={s.insightTitle}>{insight.title}</Text>
                        <Text style={s.insightBody}>{insight.body}</Text>
                    </View>
                </Card>
            ))}

            <Text style={s.note}>
                Insights are static demo cards for Day 1. Live trends will connect to your meal history later.
            </Text>
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { paddingHorizontal: 20, gap: 12 },
    header: { gap: 4, marginBottom: 4 },
    title: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: TEXT_SECONDARY },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 14,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: ACCENT_DIM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWrap: { flex: 1, gap: 4 },
    insightTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
    insightBody: { fontSize: 13, lineHeight: 19, color: TEXT_SECONDARY },
    note: {
        fontSize: 12,
        lineHeight: 18,
        color: TEXT_TERTIARY,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
    },
})
