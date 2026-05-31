## Prompt

You are working inside my cloned 8x React Native Expo starter template.

Task:
Rebrand the starter template into my contest app called “Cal AI”.

Important:
Do not remove auth, onboarding, Supabase, RevenueCat, Sentry, PostHog, settings, tabs, or existing infrastructure.
Keep the starter template stable.
Only make safe branding and copy changes.

App identity:
- App name: Cal AI
- Tagline: Snap your meal. Know your nutrition.
- Scheme: calai
- Slug: cal-ai
- iOS bundle identifier: com.asmit.calai
- Android package: com.asmit.calai
- Support email: support@calai.app
- Docs URL: https://calai.app/docs
- Accent color: #22C55E

Please do the following:
1. Update app.json with Cal AI identity.
2. Update lib/constants.ts with Cal AI constants.
3. Update lib/theme.ts accent color and derived accent colors.
4. Update tailwind.config.js accent color to match #22C55E.
5. Update visible landing page text so it introduces Cal AI as an AI calorie tracker.
6. Keep design consistent with the existing template.
7. Create /ai-logs folder if it does not exist.
8. Create /ai-logs/day-1-rebrand.md with:
   - ## Prompt
   - this exact prompt
   - ## Response
   - a short summary of the files changed

After making changes:
- Tell me exactly which files you modified.
- Tell me what command I should run to test.
- Do not create the calorie scanner feature yet.

## Response

Rebranded the Expo starter to **Cal AI** with green accent `#22C55E`. Updated app identity in `app.json` and `lib/constants.ts`, theme and Tailwind accent colors, and landing copy (hero uses constants; feature cards describe snap, AI nutrition, and daily tracking). No auth, tabs, or infrastructure removed.

**Files changed:**
- `app.json` — name, slug, scheme, iOS/Android bundle IDs, Android intent filter scheme
- `lib/constants.ts` — app name, tagline, description, scheme, support email, docs URL
- `lib/theme.ts` — accent `#22C55E` and derived rgba/light values
- `tailwind.config.js` — `accent` color
- `app/index.tsx` — landing feature cards and subtle green-tinted background gradient
- `ai-logs/day-1-rebrand.md` — this log
