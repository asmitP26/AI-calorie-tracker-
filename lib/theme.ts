/**
 * 🎨 BRAND — central theme constants.
 *
 * Change ACCENT (and the matching tailwind.config.js color) to rebrand the
 * entire app in one edit. All components import from here instead of
 * hardcoding color strings.
 *
 * Steps to rebrand:
 *   1. Change ACCENT below to your hex color
 *   2. Change the `accent` key in tailwind.config.js to the same hex
 *   3. Optionally change BG for a different dark shade
 */

// ── Primary brand color ───────────────────────────────────────────────────────
// 🎨 Change this one value to rebrand the whole app
export const ACCENT = '#22C55E'           // green — Cal AI brand color

// Derived from ACCENT — adjust opacity as needed
export const ACCENT_DIM = 'rgba(34,197,94,0.12)'
export const ACCENT_BORDER = 'rgba(34,197,94,0.25)'
export const ACCENT_GLOW = 'rgba(34,197,94,0.15)'
export const ACCENT_LIGHT = '#4ade80'

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG = '#0d0d0d'               // main app background (dark)
export const SURFACE = '#1a1a1a'          // cards, inputs
export const SURFACE2 = '#242424'         // elevated surface (sheet panels, etc.)
export const SURFACE3 = '#2a2a2a'         // even more elevated

// ── Text ──────────────────────────────────────────────────────────────────────
export const TEXT_PRIMARY = '#FFFFFF'
export const TEXT_SECONDARY = 'rgba(255,255,255,0.55)'
export const TEXT_TERTIARY = 'rgba(255,255,255,0.35)'
export const TEXT_DISABLED = 'rgba(255,255,255,0.22)'

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER = 'rgba(255,255,255,0.08)'
export const BORDER_ACTIVE = 'rgba(255,255,255,0.16)'

// ── Semantic ──────────────────────────────────────────────────────────────────
export const ERROR = '#EF4444'
export const ERROR_DIM = 'rgba(239,68,68,0.12)'
export const WARNING = '#F59E0B'
export const SUCCESS = '#22C55E'

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_ACTIVE = ACCENT
export const TAB_INACTIVE = '#6b7280'
export const TAB_HEIGHT = 68
