# BGMI Tournament Management Platform (BGMIxMANAGEMENT)

A professional esports tournament management website for Battlegrounds Mobile India (BGMI) built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

---

## Brand Identity & Design System

The platform strictly enforces the official four-colour esports design system:
- **Cypress Green**: `#004741` (Primary brand colour, navigation, headers, CTA buttons, active accents)
- **Sand**: `#F0EDE4` (Light surface, leaderboard tables, card containers, stat boxes)
- **White**: `#FFFFFF` (Headings, high-contrast labels, form inputs)
- **Black**: `#000000` (Dark backgrounds, contrast typography)

### Typography
- **Display Typography**: Aisling (`public/fonts/aisling.woff2`) — used for hero titles, champion banners, and major headings.
- **Interface Typography**: Cyberway Riders (`public/fonts/cyberway-riders.woff2`) — used for navigation, scorecards, labels, and match displays.
- *Fallback fonts*: Automatically active via `@font-face` definitions (`Cinzel`/`Trajan Pro` and `Rajdhani`/`Inter`) until local licensed font binaries are placed in `public/fonts/`.

---

## Reusing Existing Supabase Project (`BGMIxMANAGEMENT`)

> [!IMPORTANT]
> This application is configured to reuse your existing **`BGMIxMANAGEMENT`** Supabase project. **No new Supabase project is created.**
> Follow the migration and setup instructions below to safely connect without accidental data loss.

### 1. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials from the Supabase Dashboard (**Project Settings > API**):

```env
VITE_SUPABASE_URL=https://<your-bgmixmanagement-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-publishable-key>
```

> [!CAUTION]
> **Safety Notice:** Never put your `service_role` secret key into `.env` or frontend files. Only the public `anon` / `publishable` key belongs in the browser.

---

## 2. Reviewing & Applying PostgreSQL Migrations

Migrations are stored in version control under:
`supabase/migrations/20261013000000_initial_schema.sql`

This migration defines:
- `admin_users`: Administrator roles and permissions
- `tournament_settings`: Global settings, registration status, tie-break rules, MVP/Champion announcements
- `team_registrations`: Squad submissions with confidential WhatsApp contacts
- `groups` & `group_assignments`: Round 1 group management with unique team assignment constraints
- `qualifications`: Auditable manual qualifications for Round 2
- `matches`: Two-stage matches (`round_1` and `round_2`) with publication toggles
- `match_team_results`: 10/6/2/0 placement points + 2 pts/kill official scoring
- `audit_logs`: Administrative operation tracking
- **Row Level Security (RLS)** & **Public Safe View** (`public_approved_teams`): Restricts WhatsApp numbers and private registrations from anonymous queries.

### Applying via Supabase Web SQL Editor (Recommended & Safest)
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your **`BGMIxMANAGEMENT`** project.
3. Navigate to **SQL Editor** in the left sidebar.
4. Open or copy the contents of `supabase/migrations/20261013000000_initial_schema.sql`.
5. Review the SQL statements. All tables use `CREATE TABLE IF NOT EXISTS`, ensuring existing assets are protected.
6. Click **Run** to apply the schema and security policies.

### Applying via Supabase CLI
```bash
# Link to your existing project
npx supabase link --project-ref <your-bgmixmanagement-ref>

# Review migration diff safely
npx supabase db diff

# Push migration
npx supabase db push
```

---

## 3. Creating the First Administrator Securely

1. In Supabase Dashboard, go to **Authentication > Users** and click **Add User** (enter your admin email and password).
2. Go to **SQL Editor** and promote the user to administrator:
```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('<uuid-of-user-from-auth.users>', '<admin-email>', 'admin');
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Run automated tests (Scoring engine & registration validation)
npm test

# Run build verification
npm run build

# Start local development server
npm run dev
```

Server runs at `http://localhost:5173/`.

---

## Project Structure

```
bgmi-tournament/
├── public/
│   └── fonts/                     # Aisling and Cyberway Riders font assets
├── src/
│   ├── components/
│   │   ├── layout/Navbar.tsx      # Esports brand navigation
│   │   ├── tournament/            # Hero, Champion Banner, Groups manager, Registration Modal
│   │   ├── leaderboard/           # Leaderboard tables with PNG export
│   │   ├── matches/               # Two-stage Match scorecard & Score entry manager
│   │   ├── mvp/                   # Match & Tournament MVP cards and manager
│   │   └── ui/                    # Reusable Button and Card components
│   ├── pages/
│   │   ├── public/PublicHomepage.tsx
│   │   └── admin/AdminDashboard.tsx, AdminLogin.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client with publishable key
│   │   ├── scoring.ts             # Centralized typed BGMI scoring engine
│   │   ├── validation.ts          # Zod registration validation
│   │   ├── tournament-store.ts    # Persistent domain store with audit logging
│   │   └── image-export.ts        # html-to-image PNG exporter with font check
│   ├── types/tournament.ts        # Domain models
│   └── test/                      # Vitest test suite
├── supabase/
│   ├── config.toml                # Supabase CLI config
│   ├── seed.sql                   # Fictional demonstration teams
│   └── migrations/                # Version-controlled PostgreSQL schemas
├── .env.example
├── package.json
└── vite.config.ts
```

---

## Phase 1 Status & Remaining Next Steps
- [x] Phase 1: Runnable React 19 + TypeScript + Vite app
- [x] Phase 1: Tailwind CSS configured with official brand tokens (Cypress Green, Sand, White, Black)
- [x] Phase 1: Responsive homepage shell with navigation, hero, empty states, and scoring breakdown
- [x] Phase 1: Supabase client reading `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_URL`
- [x] Phase 1: Complete PostgreSQL schema migration file with strict RLS and public safety view
- [x] Phase 1: Vitest test suite passing (8/8 tests) & clean production build
- [ ] Phase 2: Add credentials to `.env` from your existing `BGMIxMANAGEMENT` project and run the migration in Supabase SQL Editor.
- [ ] Phase 3: Finalize end-to-end cloud live data subscriptions with Supabase Realtime for instant leaderboard updates.
