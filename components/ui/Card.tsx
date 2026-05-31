import { View, StyleSheet, type ViewProps } from 'react-native'
import { SURFACE, BORDER } from '@/lib/theme'

interface CardProps extends ViewProps {
  /** Tighter padding */
  compact?: boolean
}

/**
 * Generic container card.
 * Use as a surface for list items, form sections, info panels, etc.
 */
export function Card({ compact, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        compact ? styles.compact : styles.normal,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:  SURFACE,
    borderRadius:     16,
    borderWidth:      1,
    borderColor:      BORDER,
    // Soft elevation for light theme
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.06,
    shadowRadius:     12,
    elevation:        3,
  },
  normal:  { padding: 16 },
  compact: { padding: 10 },
})
