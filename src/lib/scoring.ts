import type { MatchTeamResult, StandingRow } from '../types/tournament'

/**
 * BGMI Tournament Official Scoring Rules:
 * - 1st place / Chicken Dinner: 10 points
 * - 2nd place: 6 points
 * - 3rd place: 2 points
 * - 4th place and below: 0 points
 * - Each kill: 2 points
 */

export const PLACEMENT_POINTS_MAP: Record<number, number> = {
  1: 10,
  2: 6,
  3: 2,
}

export function getPlacementPoints(placement: number): number {
  if (placement < 1) {
    throw new Error('Placement must be greater than or equal to 1')
  }
  return PLACEMENT_POINTS_MAP[placement] ?? 0
}

export function calculateKillPoints(kills: number): number {
  if (kills < 0) {
    throw new Error('Kills cannot be negative')
  }
  return kills * 2
}

export interface PlayerKillsInput {
  player_1_kills: number
  player_2_kills: number
  player_3_kills: number
  player_4_kills: number
}

export interface CalculatedScore {
  total_kills: number
  kill_points: number
  placement_points: number
  total_points: number
}

export function calculateMatchScore(
  placement: number,
  kills: PlayerKillsInput
): CalculatedScore {
  if (placement < 1) {
    throw new Error('Placement cannot be less than 1')
  }

  const p1 = Math.max(0, kills.player_1_kills || 0)
  const p2 = Math.max(0, kills.player_2_kills || 0)
  const p3 = Math.max(0, kills.player_3_kills || 0)
  const p4 = Math.max(0, kills.player_4_kills || 0)

  const total_kills = p1 + p2 + p3 + p4
  const kill_points = calculateKillPoints(total_kills)
  const placement_points = getPlacementPoints(placement)
  const total_points = kill_points + placement_points

  return {
    total_kills,
    kill_points,
    placement_points,
    total_points,
  }
}

/**
 * Deterministic Tie-Breaker Logic:
 * 1. Total Points (descending)
 * 2. Total Kills (descending)
 * 3. Placement Points (descending)
 * 4. Team Name (lexicographical ascending for stable rendering)
 */
export function sortStandings(teams: StandingRow[]): StandingRow[] {
  const sorted = [...teams].sort((a, b) => {
    // 1. Total Round Points, descending
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points
    }
    // 2. Total Kills, descending
    if (b.total_kills !== a.total_kills) {
      return b.total_kills - a.total_kills
    }
    // 3. Placement Points, descending
    if (b.placement_points !== a.placement_points) {
      return b.placement_points - a.placement_points
    }
    // 4. Stable tie fallback
    return a.team_name.localeCompare(b.team_name)
  })

  return sorted.map((team, idx) => ({
    ...team,
    rank: idx + 1,
  }))
}

/**
 * Calculates standings from an array of published match results for a given stage or group
 */
export function calculateStandingsFromResults(
  results: MatchTeamResult[],
  qualifiedTeamIds: Set<string> = new Set()
): StandingRow[] {
  const teamAggregates = new Map<string, {
    team_name: string
    matches_played: number
    total_kills: number
    kill_points: number
    placement_points: number
    total_points: number
  }>()

  for (const res of results) {
    const existing = teamAggregates.get(res.team_id) || {
      team_name: res.team_name,
      matches_played: 0,
      total_kills: 0,
      kill_points: 0,
      placement_points: 0,
      total_points: 0,
    }

    existing.matches_played += 1
    existing.total_kills += res.total_kills
    existing.kill_points += res.kill_points
    existing.placement_points += res.placement_points
    existing.total_points += res.total_points

    teamAggregates.set(res.team_id, existing)
  }

  const rawRows: StandingRow[] = Array.from(teamAggregates.entries()).map(([team_id, stats]) => ({
    rank: 0,
    team_id,
    team_name: stats.team_name,
    matches_played: stats.matches_played,
    total_kills: stats.total_kills,
    kill_points: stats.kill_points,
    placement_points: stats.placement_points,
    total_points: stats.total_points,
    is_qualified: qualifiedTeamIds.has(team_id),
  }))

  return sortStandings(rawRows)
}
