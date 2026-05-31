## Prompt

Final contest polish for Cal AI:

1. Fix dark theme — text invisible on some screens after partial light-theme migration
2. Remove forced Expo offline mode; fix startup fetch failures correctly
3. AI scan: timeout + fast mock fallback with "Demo Result (AI unavailable)" label
4. Delete single meal + clear all history with confirmation
5. Write judge-friendly README and organize /ai-logs
6. Clarify: meals are NOT in Supabase DB — local AsyncStorage + Gemini API key for real AI values

## Response

**Theme:** Restored dark theme tokens in `lib/theme.ts` (`BG #0d0d0d`, light `TEXT_*` colors). Toast and error boundary updated to use theme tokens. Landing/auth screens with hardcoded white text work again on dark backgrounds.

**Expo startup:** Removed `EXPO_OFFLINE` usage. Added `EXPO_NO_DEPENDENCY_VALIDATION=1` in `.env.local` to skip Expo API version check when corporate firewall blocks `api.expo.dev` — networking stays enabled (not offline mode).

**AI fallback:** Added 12-second timeout in `lib/aiNutrition.ts`. Missing key → immediate mock. Result screen banner: **"Demo Result (AI unavailable)"**.

**History management:**
- `deleteMeal(id)` in `lib/mealStorage.ts`
- History tab: trash per row + Clear all with `AlertModal` confirmation
- Result screen: Delete Meal button

**Documentation:**
- Replaced template README with contest-focused Cal AI README
- `.env.local` / `.env.example` use `your_gemini_api_key_here` placeholder
- Organized `/ai-logs` with five day logs + index README

**Architecture reminder for judges:** Supabase auth UI exists from the starter template, but **meal scans are not synced to Supabase**. Contest core = Gemini Vision + AsyncStorage on device.

Cursor used for implementation, debugging Expo/ngrok issues, and README/log drafting.
