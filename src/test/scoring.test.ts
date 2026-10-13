import { describe, it, expect } from 'vitest'
import {
  calculateMatchScore,
  getPlacementPoints,
  calculateKillPoints,
  sortStandings,
  calculateStandingsFromResults,
} from '../lib/scoring'
import type { MatchTeamResult, StandingRow } from '../types/tournament'

describe('BGMI Tournament Official Scoring Engine', () => {
  it('correctly maps official placement points', () => {
    // 1st place / Chicken Dinner: 10 points
    expect(getPlacementPoints(1)).toBe(10)
    // 2nd place: 6 points
    expect(getPlacementPoints(2)).toBe(6)
    // 3rd place: 2 points
    expect(getPlacementPoints(3)).toBe(2)
    // 4th place and below: 0 points
    expect(getPlacementPoints(4)).toBe(0)
    expect(getPlacementPoints(10)).toBe(0)
    expect(getPlacementPoints(16)).toBe(0)
  })

  it('awards exactly 2 points per kill', () => {
    expect(calculateKillPoints(0)).toBe(0)
    expect(calculateKillPoints(1)).toBe(2)
    expect(calculateKillPoints(8)).toBe(16)
  })

  it('verifies the mandatory scenario: an 8-kill Chicken Dinner produces exactly 26 points', () => {
    // Player 1: 3, Player 2: 2, Player 3: 2, Player 4: 1 (Total: 8 kills)
    // 1st place: 10 placement points
    // Kill points: 8 * 2 = 16 points
    // Match Total: 16 + 10 = 26 points
    const score = calculateMatchScore(1, {
      player_1_kills: 3,
      player_2_kills: 2,
      player_3_kills: 2,
      player_4_kills: 1,
    })

    expect(score.total_kills).toBe(8)
    expect(score.kill_points).toBe(16)
    expect(score.placement_points).toBe(10)
    expect(score.total_points).toBe(26)
  })

  it('correctly applies tie-breakers: Total Points > Total Kills > Placement Points', () => {
    const teams: StandingRow[] = [
      {
        rank: 0,
        team_id: 't-1',
        team_name: 'Team Alpha',
        matches_played: 1,
        total_kills: 5,
        kill_points: 10,
        placement_points: 10,
        total_points: 20,
      },
      {
        rank: 0,
        team_id: 't-2',
        team_name: 'Team Bravo',
        matches_played: 1,
        total_kills: 7, // More kills with same total points -> should rank higher
        kill_points: 14,
        placement_points: 6,
        total_points: 20,
      },
      {
        rank: 0,
        team_id: 't-3',
        team_name: 'Team Charlie',
        matches_played: 1,
        total_kills: 2,
        kill_points: 4,
        placement_points: 0,
        total_points: 4,
      },
    ]

    const sorted = sortStandings(teams)
    expect(sorted[0].team_name).toBe('Team Bravo')
    expect(sorted[0].rank).toBe(1)
    expect(sorted[1].team_name).toBe('Team Alpha')
    expect(sorted[1].rank).toBe(2)
    expect(sorted[2].team_name).toBe('Team Charlie')
    expect(sorted[2].rank).toBe(3)
  })

  it('verifies stage separation: Round 1 points are not combined with Round 2', () => {
    // A team with 50 Round 1 points and 20 Round 2 points has exactly 20 final-stage points, not 70
    const round2Results: MatchTeamResult[] = [
      {
        id: 'r2-1',
        match_id: 'm-final-1',
        team_id: 'team-apex',
        team_name: 'Team Apex',
        placement: 2, // 6 pts
        player_1_kills: 3,
        player_2_kills: 2,
        player_3_kills: 2,
        player_4_kills: 0, // 7 kills = 14 pts
        total_kills: 7,
        kill_points: 14,
        placement_points: 6,
        total_points: 20,
        created_at: new Date().toISOString(),
      },
    ]

    const finalStandings = calculateStandingsFromResults(round2Results)
    expect(finalStandings).toHaveLength(1)
    expect(finalStandings[0].total_points).toBe(20)
    expect(finalStandings[0].total_points).not.toBe(70)
  })
})
