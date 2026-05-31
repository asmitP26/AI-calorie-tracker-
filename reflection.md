Cal AI — Hackathon Reflection


What was easy

The 8x starter template gave me a strong base: Expo Router, auth flow, settings, and UI components were already in place, so I could focus on the core feature — photo → nutrition result. TypeScript types, AsyncStorage for meal history, and the analyze → result screen flow came together quickly on Day 1 with mock data. Rebranding to Cal AI and wiring the tab structure (dashboard, history, insights) was straightforward once the data model was defined.

What was difficult

Getting reliable AI analysis end-to-end was harder than expected. Gemini responses needed strict JSON parsing, validation, and fallback logic so the app never hung or crashed when the API was slow or unavailable. Expo dev setup also took time — dependency checks, tunnel/ngrok on a corporate network, and theme inconsistencies after a partial light-theme migration. Keeping the starter infrastructure (Supabase auth, paywall shell) without letting it block the demo flow required careful env handling.

What I learned

A contest MVP needs graceful degradation: real AI when configured, instant mock when not. Local-first storage (AsyncStorage) is enough for a 2-day demo; cloud sync can wait. Nutrition from a single photo is inherently uncertain — the UI should show confidence, assumptions, and disclaimers, not pretend to be a medical tool.

How AI tools helped

Cursor and Copilot sped up planning, boilerplate (types, storage, Gemini client), debugging (Expo startup, theme contrast, fetch timeouts), and documentation (README, /ai-logs). AI was most useful for structured prompts, JSON normalization, and iterating on error handling — less so for product decisions, which I kept manual.

What I would improve with more time

Backend proxy for the Gemini API so keys aren’t in the client bundle
Supabase sync for meal history across devices
Editable portions and manual corrections after AI estimates
Daily/weekly charts and clearer progress toward calorie goals
Better photo guidance (lighting, angle) to improve estimate quality
Production auth and onboarding polish beyond the template shell
Honest limitations around nutrition accuracy
Cal AI provides estimates, not facts. Portion size, hidden oils, sauces, and mixed dishes are hard to infer from one image. Confidence scores and assumption lists help, but results can be off by a meaningful margin. The app is for awareness and logging, not medical advice, diagnosis, or precise dietary planning. Mock fallback uses fixed demo data and is clearly labeled when AI is unavailable. Users should treat numbers as starting points and adjust based on what they actually ate.