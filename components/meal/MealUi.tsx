import type { ReactNode } from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { Info } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import {
  ACCENT,
  ACCENT_DIM,
  ACCENT_BORDER,
  BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '@/lib/theme'

export function SectionLabel({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <View style={ui.sectionWrap}>
      <Text style={ui.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={ui.sectionSub}>{subtitle}</Text> : null}
    </View>
  )
}

export function EstimateDisclaimer({ style }: { style?: ViewStyle }) {
  return (
    <View style={[ui.disclaimer, style]}>
      <Info size={15} color={ACCENT} strokeWidth={2} />
      <Text style={ui.disclaimerText}>
        Nutrition values are AI estimates and may vary by portion size, ingredients, and preparation.
      </Text>
    </View>
  )
}

export function EmptyMealsState({
  icon,
  title,
  message,
  ctaLabel,
  onCta,
}: {
  icon: ReactNode
  title: string
  message: string
  ctaLabel?: string
  onCta?: () => void
}) {
  return (
    <View style={ui.emptyCard}>
      <View style={ui.emptyIcon}>{icon}</View>
      <Text style={ui.emptyTitle}>{title}</Text>
      <Text style={ui.emptyMessage}>{message}</Text>
      {ctaLabel && onCta ? (
        <Button label={ctaLabel} variant="secondary" size="sm" onPress={onCta} style={{ marginTop: 8 }} />
      ) : null}
    </View>
  )
}

const ui = StyleSheet.create({
  sectionWrap: { gap: 2, marginTop: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  sectionSub: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 1 },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: ACCENT_BORDER,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_SECONDARY,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
  emptyMessage: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
})
