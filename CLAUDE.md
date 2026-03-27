# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"wager" is a mobile app being built by sarit and Joe. The main app lives in `commitment-app/` and is built with Expo + React Native + TypeScript.

## Commands

All commands run from `commitment-app/`:

```bash
npm run ios       # Run on iOS simulator
npm run android   # Run on Android emulator
npm run web       # Run in browser
npm run lint      # ESLint
```

## Architecture

- **Routing:** File-based via Expo Router. `app/(tabs)/` defines tab screens; `app/_layout.tsx` is the root layout with theme provider and stack navigator.
- **Theming:** Light/dark mode via `constants/theme.ts`. Use `useThemeColor()` hook and `ThemedText`/`ThemedView` components for theme-aware UI.
- **Platform splits:** `.ios.tsx` / `.web.ts` file extensions handle platform-specific implementations (e.g. `icon-symbol.ios.tsx` uses SF Symbols on iOS, falls back to Material Icons elsewhere).
- **Animations:** `react-native-reanimated` for scroll-based and gesture animations.
- **Path alias:** `@/*` maps to the `commitment-app/` root.


## Agent Behaviour & Collaboration

### Always Check Before Creating
- Before creating any new component, screen, or file — briefly describe what you're about to create and ask for confirmation
- Example: "I'm going to create a `WagerCard` component in `components/WagerCard.tsx` that displays the goal, amount, and deadline. Does that sound right?"
- Never generate large blocks of code without confirming the approach first

### Prefer Small Focused Changes
- Make one change at a time — don't refactor and add features in the same step
- If you spot something unrelated that could be improved, flag it but don't change it unless asked

### Ask Before Assuming
- If a requirement is ambiguous, ask rather than guess
- If there are two valid approaches, present both options briefly and let me decide

### Code Style
- Use TypeScript throughout
- Functional components only, no class components
- Always use named exports, not default exports
- Keep components small and single responsibility
- Use `camelCase` for variables and functions, `PascalCase` for components

### File Structure Conventions
- Components → `components/ComponentName.tsx`
- Screens → `app/screen-name.tsx` (Expo file based routing)
- Hooks → `hooks/useHookName.ts`
- Utilities → `utils/utilityName.ts`
- Types → `types/index.ts`

### Supabase
- Always use Row Level Security (RLS) — never expose data without policies
- Never write raw SQL unless necessary — use the Supabase client
- All database calls go in a dedicated service file, not directly in components

### Stripe
- Never log or expose payment intent IDs or keys
- All Stripe logic goes in `services/stripe.ts`
- Always handle payment failures gracefully with user friendly error messages

### Claude API
- All AI validation logic goes in `services/validation.ts`
- Always parse and validate Claude's JSON response before using it
- Always have a fallback if the API call fails

### Environment Variables
- Never hardcode API keys
- All keys go in `.env` and must be in `.gitignore`
- Use `EXPO_PUBLIC_` prefix for any keys needed on the client side