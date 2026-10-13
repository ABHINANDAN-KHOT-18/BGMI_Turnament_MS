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

    it('revokes all base table permissions on public.matches from anon and authenticated roles', () => {
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.matches\s+FROM\s+anon,\s*authenticated;/i)
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
      expect(migrationSql).toMatch(/REVOKE\s+ALL\s+ON\s+TABLE\s+public\.team_registrations\s+FROM\s+anon,\s*authenticated;/i)
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
})
