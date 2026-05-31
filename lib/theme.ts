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
export const ACCENT_DIM = 'rgba(34,197,94,0.08)'
export const ACCENT_BORDER = 'rgba(34,197,94,0.25)'
export const ACCENT_GLOW = 'rgba(34,197,94,0.15)'
// Text color on dark background using accent tone
export const ACCENT_LIGHT = '#16a34a'

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG = '#F8F9FA'        // main app background (light)
export const SURFACE = '#FFFFFF'        // cards, inputs (white)
export const SURFACE2 = '#F1F3F5'        // elevated surface (sheet panels, etc.)
export const SURFACE3 = '#E9ECEF'        // even more elevated

// ── Text ──────────────────────────────────────────────────────────────────────
export const TEXT_PRIMARY = '#1A1A2E'
export const TEXT_SECONDARY = '#6B7280'
export const TEXT_TERTIARY = '#9CA3AF'
export const TEXT_DISABLED = '#D1D5DB'

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER = '#E5E7EB'
export const BORDER_ACTIVE = '#D1D5DB'

// ── Semantic ──────────────────────────────────────────────────────────────────
export const ERROR = '#EF4444'
export const ERROR_DIM = 'rgba(239,68,68,0.08)'
export const WARNING = '#F59E0B'
export const SUCCESS = '#22C55E'

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_ACTIVE = ACCENT
export const TAB_INACTIVE = '#9CA3AF'
export const TAB_HEIGHT = 68
