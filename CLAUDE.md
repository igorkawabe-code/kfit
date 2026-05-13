# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server (Vite)
npm run build     # Build for production → dist/
npm run preview   # Preview the production build locally
```

There are no tests or linting configured. No test runner is present.

## Architecture

KFit is a mobile-first PWA workout tracker for the Kawabe family. It's a React SPA (Vite + React Router v6) backed by Supabase, deployed on Netlify.

### Stack
- **Frontend**: React 18, React Router v6, Tailwind CSS v3
- **Backend/DB**: Supabase (Postgres + Auth + Storage + RLS)
- **AI**: Gemini 1.5 Flash via a Netlify serverless function
- **Deploy**: Netlify (SPA redirect configured in `netlify.toml`)

### Data flow
All data access goes through the `supabase` client (`src/lib/supabase.js`). There is no API layer — pages query Supabase directly. The only server-side logic is `netlify/functions/ai-message.js`, which proxies calls to Gemini so the API key stays server-side.

### Auth and profile
`AuthContext` (`src/contexts/AuthContext.jsx`) wraps the entire app and exposes `{ user, profile, loading, signOut, refreshProfile }`. `user` is the Supabase auth object; `profile` is the matching row from the `profiles` table. `ProtectedRoute` redirects unauthenticated users to `/login`. After login, new users who have no profile row are redirected to `/setup`.

### Database schema (3 tables)
- `profiles` — extends `auth.users`; holds name, age, gender, bio, personal color (`#B4FF00` default), weekly goal
- `workouts` — one row per workout; unique constraint on `(user_id, date)` — but the UI allows multiple workouts per day via separate inserts (the unique constraint on the schema appears stricter than the UX)
- `ai_messages` — daily AI message cache; unique on `(user_id, date, type)` where type is `pre_workout` or `post_workout`

RLS is enabled on all tables. Profiles and workouts are readable by all authenticated users (needed for rankings); writes are owner-only.

### Pages
| Route | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Streak, weekly progress, AI message, mini-ranking |
| `/checkin` | CheckIn | Register a workout with tags, notes, optional photo |
| `/rankings` | Rankings | All-time and weekly leaderboard |
| `/history` | History | Personal workout history |
| `/profile` | Profile | Edit name, bio, color, weekly goal |
| `/login` | Login | Supabase magic link auth |
| `/setup` | Setup | First-time profile creation |

### UI system
Tailwind is extended with custom design tokens:
- **Colors**: `accent` (#B4FF00 neon green), `surface`, `surface2`, `surface3` (dark greys)
- **Fonts**: `font-display` (Bebas Neue), `font-body` (Barlow), `font-mono` (Barlow Condensed)
- CSS utility classes like `.card`, `.btn-primary`, `.input-field`, `.label`, `.page-title`, `.section-title` are defined in `src/index.css`

### AI message flow
1. Dashboard loads → checks `ai_messages` table for a cached message for today
2. If no cache → POSTs to `/.netlify/functions/ai-message` with profile data and message type
3. Netlify function calls Gemini, returns ≤2 sentences in pt-BR
4. Response is upserted into `ai_messages` for the day

### Utilities (`src/lib/utils.js`)
- `getDisplayName(profile, allProfiles)` — returns first name, appends last initial only when two members share the same first name
- `getTextColor(bgColor)` — returns `#060606` or `#FFFFFF` based on luminance, used for text on member color badges

### Environment variables
| Variable | Where used |
|---|---|
| `VITE_SUPABASE_URL` | Frontend (Vite, public) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend (Vite, public) |
| `GEMINI_API_KEY` | Netlify function only (server-side) |

Copy `.env.example` → `.env.local` for local development. The Gemini key must also be set in Netlify's environment for the serverless function to work in production.

### PWA
`public/manifest.json` and icons enable "Add to Home Screen" on iOS Safari. Netlify serves the manifest with the correct `Content-Type` header via `netlify.toml`.
