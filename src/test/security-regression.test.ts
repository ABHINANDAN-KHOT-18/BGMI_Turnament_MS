import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { TournamentStore } from '../lib/tournament-store'

describe('Database Migration & RLS Security Regression Tests', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../supabase/migrations/20261013000000_initial_schema.sql'
  )
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

  describe('Destructive Operations Verification', () => {
    it('does not contain destructive DROP TABLE or TRUNCATE operations', () => {
      expect(migrationSql).not.toMatch(/DROP\s+TABLE/i)
      expect(migrationSql).not.toMatch(/DROP\s+DATABASE/i)
      expect(migrationSql).not.toMatch(/DROP\s+SCHEMA/i)
      expect(migrationSql).not.toMatch(/TRUNCATE/i)
    })
  })

  describe('Matches Base Table Privacy & Room Credentials Isolation', () => {
    it('does NOT grant public SELECT access on the base public.matches table', () => {
      // Must not allow public read on the base matches table
      expect(migrationSql).not.toMatch(/CREATE\s+POLICY\s+["']Public can read published matches["']\s+ON\s+public\.matches/i)
      // Matches table SELECT must be restricted to administrators
      expect(migrationSql).toMatch(/CREATE\s+POLICY\s+["']Admins full access to matches["']\s+ON\s+public\.matches/i)
    })

    it('revokes all base table permissions on public.matches from anon role', () => {
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.matches\s+FROM\s+anon;/i)
    })

    it('defines a dedicated public_matches view that strictly excludes room credentials', () => {
      expect(migrationSql).toMatch(/CREATE\s+OR\s+REPLACE\s+VIEW\s+public\.public_matches/i)
      
      // Extract the columns selected in public_matches view
      const viewMatch = migrationSql.match(/VIEW\s+public\.public_matches[\s\S]*?AS\s+SELECT([\s\S]*?)FROM\s+public\.matches/i)
      expect(viewMatch).toBeTruthy()
      const selectedColumns = viewMatch ? viewMatch[1] : ''

      expect(selectedColumns).not.toMatch(/room_id/i)
      expect(selectedColumns).not.toMatch(/room_password/i)
      expect(selectedColumns).toMatch(/id/i)
      expect(selectedColumns).toMatch(/stage/i)
      expect(selectedColumns).toMatch(/match_number/i)
      expect(selectedColumns).toMatch(/publication_status/i)
    })

    it('ensures public_matches view is configured with security_barrier and security_invoker = false', () => {
      expect(migrationSql).toMatch(/CREATE\s+OR\s+REPLACE\s+VIEW\s+public\.public_matches\s+WITH\s*\(\s*security_barrier\s*=\s*true,\s*security_invoker\s*=\s*false\s*\)/i)
    })

    it('grants SELECT on public_matches view to anon and authenticated roles', () => {
      expect(migrationSql).toMatch(/GRANT\s+SELECT\s+ON\s+public\.public_matches\s+TO\s+anon,\s*authenticated;/i)
    })
  })

  describe('Team Registrations Privacy & Public View Isolation', () => {
    it('does NOT permit public direct access to public.team_registrations base table', () => {
      expect(migrationSql).not.toMatch(/CREATE\s+POLICY\s+["']Public registration submission["']/i)
      expect(migrationSql).toMatch(/CREATE\s+POLICY\s+["']Admins full access to registrations["']\s+ON\s+public\.team_registrations/i)
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.team_registrations\s+FROM\s+anon;/i)
    })

    it('shields whatsapp_number completely from public_approved_teams view', () => {
      const viewMatch = migrationSql.match(/VIEW\s+public\.public_approved_teams[\s\S]*?AS\s+SELECT([\s\S]*?)FROM\s+public\.team_registrations/i)
      expect(viewMatch).toBeTruthy()
      const selectedColumns = viewMatch ? viewMatch[1] : ''
      expect(selectedColumns).not.toMatch(/whatsapp_number/i)
    })

    it('grants SELECT on public_approved_teams to anon and authenticated roles', () => {
      expect(migrationSql).toMatch(/GRANT\s+SELECT\s+ON\s+public\.public_approved_teams\s+TO\s+anon,\s*authenticated;/i)
    })
  })

  describe('Registration Function Hardening & Concurrency Protection', () => {
    it('enforces input length validation and trimmed normalization in register_team_squad', () => {
      expect(migrationSql).toMatch(/v_team_name\s*:=\s*trim\(COALESCE\(p_team_name,\s*''\)\);/i)
      expect(migrationSql).toMatch(/length\(v_team_name\)\s*<\s*2\s*OR\s*length\(v_team_name\)\s*>\s*60/i)
      expect(migrationSql).toMatch(/length\(v_igl_name\)\s*<\s*2\s*OR\s*length\(v_igl_name\)\s*>\s*40/i)
      expect(migrationSql).toMatch(/length\(v_whatsapp\)\s*<\s*7\s*OR\s*length\(v_whatsapp\)\s*>\s*20/i)
    })

    it('defines a unique case-insensitive index on team_name and handles unique_violation safely', () => {
      expect(migrationSql).toMatch(/CREATE\s+UNIQUE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+idx_unique_team_name_lower\s+ON\s+public\.team_registrations\s*\(lower\(trim\(team_name\)\)\);/i)
      expect(migrationSql).toMatch(/EXCEPTION\s+WHEN\s+unique_violation\s+THEN/i)
    })

    it('seeds predictable tournament settings idempotently', () => {
      expect(migrationSql).toMatch(/INSERT\s+INTO\s+public\.tournament_settings/i)
      expect(migrationSql).toMatch(/ON\s+CONFLICT\s*\(id\)\s+DO\s+NOTHING;/i)
    })
  })

  describe('Function Execution Least Privilege (Grants & Revokes)', () => {
    it('revokes register_team_squad execution from default PUBLIC and grants only to anon and authenticated', () => {
      expect(migrationSql).toMatch(
        /REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.register_team_squad\s*\(TEXT,\s*TEXT,\s*TEXT,\s*TEXT,\s*TEXT,\s*TEXT,\s*TEXT\)\s+FROM\s+PUBLIC;/i
      )
      expect(migrationSql).toMatch(
        /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.register_team_squad\s*\(TEXT,\s*TEXT,\s*TEXT,\s*TEXT,\s*TEXT,\s*TEXT,\s*TEXT\)\s+TO\s+anon,\s*authenticated;/i
      )
    })

    it('protects is_admin function from anon access', () => {
      expect(migrationSql).toMatch(/REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.is_admin\(\)\s+FROM\s+PUBLIC;/i)
      expect(migrationSql).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.is_admin\(\)\s+TO\s+authenticated;/i)
    })
  })

  describe('Store-level Privacy Verification', () => {
    it('TournamentStore.getPublicApprovedTeams filters out sensitive contact info', () => {
      const publicTeams = TournamentStore.getPublicApprovedTeams()
      expect(publicTeams.length).toBeGreaterThan(0)
      publicTeams.forEach((team) => {
        expect((team as unknown as Record<string, unknown>).whatsapp_number).toBeUndefined()
      })
    })

    it('TournamentStore.getPublicMatches returns only published matches', () => {
      const publicMatches = TournamentStore.getPublicMatches()
      publicMatches.forEach((match) => {
        expect(match.publication_status).toBe('published')
        expect((match as unknown as Record<string, unknown>).room_password).toBeUndefined()
        expect((match as unknown as Record<string, unknown>).room_id).toBeUndefined()
      })
    })
  })

  describe('Admin Authorization & Role Verification Rules', () => {
    it('only permits admin and superadmin roles in admin_users schema', () => {
      expect(migrationSql).toMatch(/CHECK\s*\(\s*role\s+IN\s*\(\s*'admin',\s*'superadmin'\s*\)\s*\)/i)
    })

    it('requires is_admin() check for all administrative write and read policies', () => {
      expect(migrationSql).toMatch(/CREATE\s+POLICY\s+["']Admins full access to matches["']\s+ON\s+public\.matches[\s\S]*?USING\s*\(\s*public\.is_admin\(\)\s*\)/i)
      expect(migrationSql).toMatch(/CREATE\s+POLICY\s+["']Admins full access to registrations["']\s+ON\s+public\.team_registrations[\s\S]*?USING\s*\(\s*public\.is_admin\(\)\s*\)/i)
      expect(migrationSql).toMatch(/CREATE\s+POLICY\s+["']Admins can update tournament settings["']\s+ON\s+public\.tournament_settings[\s\S]*?USING\s*\(\s*public\.is_admin\(\)\s*\)/i)
    })
  })

  describe('Deterministic Scoring Rules & Single-Match Uniqueness', () => {
    it('enforces exact BGMI scoring placement points rules (10, 6, 2, 0) and calculated coherence in SQL', () => {
      expect(migrationSql).toMatch(/placement_points\s+IN\s+\(10,\s*6,\s*2,\s*0\)/i)
      expect(migrationSql).toMatch(/total_kills\s*=\s*\(player_1_kills\s*\+\s*player_2_kills\s*\+\s*player_3_kills\s*\+\s*player_4_kills\)/i)
      expect(migrationSql).toMatch(/kill_points\s*=\s*\(total_kills\s*\*\s*2\)/i)
      expect(migrationSql).toMatch(/total_points\s*=\s*\(kill_points\s*\+\s*placement_points\)/i)
    })

    it('enforces unique placement per match to prevent tied placements in a single battle', () => {
      expect(migrationSql).toMatch(/CONSTRAINT\s+unique_match_placement\s+UNIQUE\s*\(\s*match_id,\s*placement\s*\)/i)
    })
  })
})
