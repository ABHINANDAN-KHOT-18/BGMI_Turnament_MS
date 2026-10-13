-- Phase 1 Migration (Production-Grade Security Hardened): Complete Schema for BGMIxMANAGEMENT
-- Brand Palette: Cypress Green (#004741), Sand (#F0EDE4), White (#FFFFFF), Black (#000000)
-- Security Architecture:
-- 1. Security Definer trusted registration function for safe, controlled anonymous squad creation.
-- 2. Security Barrier views (public_approved_teams, public_matches) with security_invoker = false for zero privacy leakage.
-- 3. Dedicated MVP and Player Stats tables fully decoupled from transient fields.
-- 4. Idempotent policy drops/creates, fixed search_path = public, auth on all functions, and strict least-privilege RBAC.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. APP ROLES & ADMINISTRATOR PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 2. TOURNAMENT GLOBAL CONFIGURATION & RULES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tournament_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'BGMI CHAMPIONSHIP INVITATIONAL',
  tagline TEXT NOT NULL DEFAULT 'ROAD TO GLORY: 2-STAGE BATTLEGROUNDS',
  description TEXT NOT NULL DEFAULT 'Official professional BGMI tournament featuring Round 1 Group Stage qualifying battles and the high-stakes Round 2 Grand Final.',
  banner_url TEXT,
  logo_url TEXT,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  champion_team_id UUID,
  champion_published BOOLEAN NOT NULL DEFAULT false,
  tie_break_rules JSONB NOT NULL DEFAULT '["Total Round Points (descending)", "Total Kills (descending)", "Placement Points (descending)", "Head-to-head match outcomes"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 3. TEAM REGISTRATIONS (Confidential contact details)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.team_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT NOT NULL UNIQUE,
  igl_name TEXT NOT NULL,
  igl_bgmi_uid TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL, -- Sensitive: Strictly restricted to authorized admins
  player_2_bgmi_id TEXT NOT NULL,
  player_3_bgmi_id TEXT NOT NULL,
  player_4_bgmi_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  -- Constraint: Enforce distinct BGMI player IDs within the 4-player squad
  CONSTRAINT check_distinct_player_uids CHECK (
    igl_bgmi_uid <> player_2_bgmi_id AND
    igl_bgmi_uid <> player_3_bgmi_id AND
    igl_bgmi_uid <> player_4_bgmi_id AND
    player_2_bgmi_id <> player_3_bgmi_id AND
    player_2_bgmi_id <> player_4_bgmi_id AND
    player_3_bgmi_id <> player_4_bgmi_id
  )
);

-- =========================================================
-- 4. ROUND 1 GROUPS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- e.g., 'Group A', 'Group B'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 5. ROUND 1 GROUP ASSIGNMENTS (Single active group rule)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.group_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_team_group_assignment UNIQUE(team_id)
);

-- =========================================================
-- 6. ROUND 2 QUALIFICATIONS (Manual qualification only)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  qualified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_qualified_team UNIQUE(team_id)
);

-- =========================================================
-- 7. TWO-STAGE MATCHES & ROOM CREDENTIAL PRIVACY
-- =========================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage TEXT NOT NULL CHECK (stage IN ('round_1', 'round_2')),
  match_number INT NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL, -- Null for Round 2 matches
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published')),
  room_id TEXT, -- Private match room credentials (admin-only)
  room_password TEXT, -- Private match room credentials (admin-only)
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 8. MATCH TEAM RESULTS (Exact BGMI Scoring: 10/6/2/0 + 2 pts/kill)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.match_team_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  placement INT NOT NULL CHECK (placement >= 1),
  player_1_kills INT NOT NULL DEFAULT 0 CHECK (player_1_kills >= 0),
  player_2_kills INT NOT NULL DEFAULT 0 CHECK (player_2_kills >= 0),
  player_3_kills INT NOT NULL DEFAULT 0 CHECK (player_3_kills >= 0),
  player_4_kills INT NOT NULL DEFAULT 0 CHECK (player_4_kills >= 0),
  total_kills INT NOT NULL DEFAULT 0 CHECK (total_kills >= 0),
  kill_points INT NOT NULL DEFAULT 0 CHECK (kill_points >= 0),
  placement_points INT NOT NULL DEFAULT 0 CHECK (placement_points IN (10, 6, 2, 0)),
  total_points INT NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_match_team_result UNIQUE(match_id, team_id),
  CONSTRAINT unique_match_placement UNIQUE(match_id, placement),
  -- Database constraint verifying placement points alignment:
  -- 1st = 10, 2nd = 6, 3rd = 2, 4th and below = 0
  CONSTRAINT check_placement_points_rules CHECK (
    (placement = 1 AND placement_points = 10) OR
    (placement = 2 AND placement_points = 6) OR
    (placement = 3 AND placement_points = 2) OR
    (placement >= 4 AND placement_points = 0)
  ),
  -- Database constraint verifying kill points and total calculations
  CONSTRAINT check_calculated_points_coherence CHECK (
    total_kills = (player_1_kills + player_2_kills + player_3_kills + player_4_kills) AND
    kill_points = (total_kills * 2) AND
    total_points = (kill_points + placement_points)
  )
);

-- =========================================================
-- 9. DEDICATED MVP SELECTIONS & PUBLICATION RECORDS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.match_mvp_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  player_bgmi_uid TEXT NOT NULL,
  player_name TEXT NOT NULL,
  kills INT NOT NULL CHECK (kills >= 0),
  published BOOLEAN NOT NULL DEFAULT false,
  selected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_match_mvp UNIQUE(match_id)
);

CREATE TABLE IF NOT EXISTS public.tournament_mvp_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournament_settings(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  player_bgmi_uid TEXT NOT NULL,
  player_name TEXT NOT NULL,
  round_2_kills INT NOT NULL DEFAULT 0 CHECK (round_2_kills >= 0),
  total_kills INT NOT NULL DEFAULT 0 CHECK (total_kills >= 0),
  published BOOLEAN NOT NULL DEFAULT false,
  selected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_tournament_mvp UNIQUE(tournament_id)
);

-- =========================================================
-- 10. ADMINISTRATIVE AUDIT TRAIL
-- =========================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================
-- 11. INDEXES FOR PERFORMANCE & CONCURRENCY
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_team_registrations_status ON public.team_registrations(status);
CREATE INDEX IF NOT EXISTS idx_group_assignments_group_id ON public.group_assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON public.matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_publication_status ON public.matches(publication_status);
CREATE INDEX IF NOT EXISTS idx_match_team_results_match_id ON public.match_team_results(match_id);
CREATE INDEX IF NOT EXISTS idx_match_team_results_team_id ON public.match_team_results(team_id);
CREATE INDEX IF NOT EXISTS idx_match_mvp_match_id ON public.match_mvp_records(match_id);
CREATE INDEX IF NOT EXISTS idx_match_mvp_published ON public.match_mvp_records(published);

-- =========================================================
-- 12. TRUSTED SECURITY FUNCTIONS & VIEWS
-- =========================================================

-- Trusted Admin Verification Function
-- Recursion-safe, stable, and hardened with fixed search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$$;

-- Secure Public Squad Registration Function:
-- Allows anonymous players to submit a registration without giving direct table INSERT privileges
-- Validates: registration_open, distinct UIDs, status forced to 'pending'
CREATE OR REPLACE FUNCTION public.register_team_squad(
  p_team_name TEXT,
  p_igl_name TEXT,
  p_igl_bgmi_uid TEXT,
  p_whatsapp_number TEXT,
  p_player_2_bgmi_id TEXT,
  p_player_3_bgmi_id TEXT,
  p_player_4_bgmi_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_open BOOLEAN;
  v_new_id UUID;
BEGIN
  -- 1. Verify tournament registration is open
  SELECT registration_open INTO v_is_open
  FROM public.tournament_settings
  LIMIT 1;

  IF NOT COALESCE(v_is_open, false) THEN
    RAISE EXCEPTION 'Squad registration is currently closed.';
  END IF;

  -- 2. Validate distinct BGMI UIDs
  IF p_igl_bgmi_uid IN (p_player_2_bgmi_id, p_player_3_bgmi_id, p_player_4_bgmi_id) OR
     p_player_2_bgmi_id IN (p_player_3_bgmi_id, p_player_4_bgmi_id) OR
     p_player_3_bgmi_id = p_player_4_bgmi_id THEN
    RAISE EXCEPTION 'All 4 player BGMI UIDs must be distinct.';
  END IF;

  -- 3. Check for duplicate team name
  IF EXISTS (SELECT 1 FROM public.team_registrations WHERE lower(team_name) = lower(p_team_name)) THEN
    RAISE EXCEPTION 'A squad with this name has already registered.';
  END IF;

  -- 4. Insert strictly with pending status
  INSERT INTO public.team_registrations (
    team_name,
    igl_name,
    igl_bgmi_uid,
    whatsapp_number,
    player_2_bgmi_id,
    player_3_bgmi_id,
    player_4_bgmi_id,
    status
  ) VALUES (
    trim(p_team_name),
    trim(p_igl_name),
    trim(p_igl_bgmi_uid),
    trim(p_whatsapp_number),
    trim(p_player_2_bgmi_id),
    trim(p_player_3_bgmi_id),
    trim(p_player_4_bgmi_id),
    'pending'
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_new_id,
    'message', 'Registration submitted successfully with pending status.'
  );
END;
$$;

-- Secure Public View for Approved Squads:
-- Security barrier enabled, security_invoker = false (definer access to non-sensitive columns)
-- Completely shields whatsapp_number from public exposure
CREATE OR REPLACE VIEW public.public_approved_teams
WITH (security_barrier = true, security_invoker = false) AS
SELECT 
  id,
  team_name,
  igl_name,
  igl_bgmi_uid,
  player_2_bgmi_id,
  player_3_bgmi_id,
  player_4_bgmi_id,
  created_at
FROM public.team_registrations
WHERE status = 'approved';

-- Secure Public View for Published Matches:
-- Security barrier enabled, security_invoker = false (definer access to published non-sensitive match columns)
-- Strictly excludes private match room credentials (room_id, room_password)
CREATE OR REPLACE VIEW public.public_matches
WITH (security_barrier = true, security_invoker = false) AS
SELECT
  id,
  stage,
  match_number,
  group_id,
  scheduled_at,
  status,
  publication_status,
  created_at,
  updated_at
FROM public.matches
WHERE publication_status = 'published';

-- =========================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_team_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_mvp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_mvp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. admin_users
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2. tournament_settings
DROP POLICY IF EXISTS "Public can read tournament settings" ON public.tournament_settings;
CREATE POLICY "Public can read tournament settings"
  ON public.tournament_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update tournament settings" ON public.tournament_settings;
CREATE POLICY "Admins can update tournament settings"
  ON public.tournament_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. team_registrations
-- Strict Privacy: Direct access to base table is granted ONLY to authorized admins.
-- Anonymous registration is executed strictly via public.register_team_squad() function.
-- Approved squads are viewed via public_approved_teams view.
DROP POLICY IF EXISTS "Public registration submission" ON public.team_registrations;
DROP POLICY IF EXISTS "Admins full access to registrations" ON public.team_registrations;
CREATE POLICY "Admins full access to registrations"
  ON public.team_registrations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. groups
DROP POLICY IF EXISTS "Public can read groups" ON public.groups;
CREATE POLICY "Public can read groups"
  ON public.groups FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage groups" ON public.groups;
CREATE POLICY "Admins can manage groups"
  ON public.groups FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. group_assignments
DROP POLICY IF EXISTS "Public can read group assignments" ON public.group_assignments;
CREATE POLICY "Public can read group assignments"
  ON public.group_assignments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage group assignments" ON public.group_assignments;
CREATE POLICY "Admins can manage group assignments"
  ON public.group_assignments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. qualifications
DROP POLICY IF EXISTS "Public can read qualifications" ON public.qualifications;
CREATE POLICY "Public can read qualifications"
  ON public.qualifications FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage qualifications" ON public.qualifications;
CREATE POLICY "Admins can manage qualifications"
  ON public.qualifications FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. matches
-- Strict Privacy: Base table contains room_id & room_password.
-- Public SELECT on base table is completely disallowed.
-- Public users query public_matches view instead.
-- Only authenticated administrators have full access to base matches table.
DROP POLICY IF EXISTS "Public can read published matches" ON public.matches;
DROP POLICY IF EXISTS "Admins full access to matches" ON public.matches;
CREATE POLICY "Admins full access to matches"
  ON public.matches FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. match_team_results
DROP POLICY IF EXISTS "Public can read results of published matches" ON public.match_team_results;
CREATE POLICY "Public can read results of published matches"
  ON public.match_team_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND m.publication_status = 'published'
    )
  );

DROP POLICY IF EXISTS "Admins full access to match results" ON public.match_team_results;
CREATE POLICY "Admins full access to match results"
  ON public.match_team_results FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. match_mvp_records
DROP POLICY IF EXISTS "Public can read published match mvp" ON public.match_mvp_records;
CREATE POLICY "Public can read published match mvp"
  ON public.match_mvp_records FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Admins manage match mvp" ON public.match_mvp_records;
CREATE POLICY "Admins manage match mvp"
  ON public.match_mvp_records FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. tournament_mvp_records
DROP POLICY IF EXISTS "Public can read published tournament mvp" ON public.tournament_mvp_records;
CREATE POLICY "Public can read published tournament mvp"
  ON public.tournament_mvp_records FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Admins manage tournament mvp" ON public.tournament_mvp_records;
CREATE POLICY "Admins manage tournament mvp"
  ON public.tournament_mvp_records FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. audit_logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- =========================================================
-- 14. LEAST PRIVILEGE ROLE-BASED ACCESS CONTROL (GRANTS & REVOKES)
-- =========================================================

-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Default security: Revoke execute on registration function from default PUBLIC,
-- then explicitly grant only to anon and authenticated roles.
REVOKE EXECUTE ON FUNCTION public.register_team_squad(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_team_squad(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Admin-only verification function
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Explicit grants for safe public views
GRANT SELECT ON public.public_approved_teams TO anon, authenticated;
GRANT SELECT ON public.public_matches TO anon, authenticated;

-- Revoke any direct access on base registration, matches, and audit tables from anon and authenticated
-- Regular authenticated non-admin users must NOT have base table privileges; all admin access is mediated via service role or admin RLS
REVOKE ALL ON TABLE public.team_registrations FROM anon, authenticated;
REVOKE ALL ON TABLE public.matches FROM anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM anon;

-- Explicit public grants on public tables
GRANT SELECT ON public.tournament_settings TO anon, authenticated;
GRANT SELECT ON public.groups TO anon, authenticated;
GRANT SELECT ON public.group_assignments TO anon, authenticated;
GRANT SELECT ON public.qualifications TO anon, authenticated;
GRANT SELECT ON public.match_team_results TO anon, authenticated;
GRANT SELECT ON public.match_mvp_records TO anon, authenticated;
GRANT SELECT ON public.tournament_mvp_records TO anon, authenticated;
