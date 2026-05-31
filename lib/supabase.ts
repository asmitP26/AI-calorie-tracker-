import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState } from 'react-native'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  ''

const PLACEHOLDER_KEY_PATTERN = /^(dummy|placeholder|your-local|replace|test)$/i

/** Treat localhost and placeholder env values as unconfigured — avoids fetch failures on device. */
function isRealSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false
  const lowerUrl = url.toLowerCase()
  if (
    lowerUrl.includes('127.0.0.1') ||
    lowerUrl.includes('localhost') ||
    lowerUrl.includes('example.com') ||
    lowerUrl.includes('placeholder') ||
    /^https?:\/\/(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(lowerUrl)
  ) {
    return false
  }
  if (PLACEHOLDER_KEY_PATTERN.test(key.trim()) || key.includes('your-local')) return false
  return true
}

/** True when Supabase credentials are present. Auth/DB calls are no-ops when false. */
export const isSupabaseEnabled = isRealSupabaseConfig(SUPABASE_URL, SUPABASE_KEY)

if (!isSupabaseEnabled) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or key — running without backend. ' +
    'Set values in .env.local to enable auth and database.'
  )
}

export const supabase = createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_KEY  || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: isSupabaseEnabled,
      persistSession: isSupabaseEnabled,
      detectSessionInUrl: false,
    },
    // Disable realtime entirely when unconfigured — prevents WebSocket errors
    realtime: isSupabaseEnabled ? undefined : { params: { eventsPerSecond: 0 } },
    global: {
      // Suppress fetch errors when Supabase is not configured
      fetch: isSupabaseEnabled ? undefined : () => Promise.resolve(new Response('null', { status: 200 })),
    },
  }
)

// Restart token auto-refresh when app comes to foreground
if (isSupabaseEnabled) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
