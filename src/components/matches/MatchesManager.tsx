import React, { useState } from 'react'
import {
  TournamentStore,
} from '../../lib/tournament-store'
import {
  calculateMatchScore,
} from '../../lib/scoring'
import type { Match, MatchTeamResult, TeamRegistration } from '../../types/tournament'


export const MatchesManager: React.FC = () => {
  const [matches, setMatches] = useState(TournamentStore.getMatches())
  const [groups] = useState(TournamentStore.getGroups())
  const [teams] = useState(TournamentStore.getTeams().filter((t) => t.status === 'approved'))
  const [qualifications] = useState(TournamentStore.getQualifications())
  const [results, setResults] = useState(TournamentStore.getMatchResults())

  // New Match State
  const [newStage, setNewStage] = useState<'round_1' | 'round_2'>('round_1')
  const [newMatchNumber, setNewMatchNumber] = useState(matches.length + 1)
  const [newGroupId, setNewGroupId] = useState(groups[0]?.id || '')

  // Score Entry Modal State
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null)
  const [teamScoreInputs, setTeamScoreInputs] = useState<
    Array<{
      team_id: string
      team_name: string
      placement: number
      p1: number
      p2: number
      p3: number
      p4: number
    }>
  >([])

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault()
    TournamentStore.createMatch({
      stage: newStage,
      match_number: Number(newMatchNumber),
      group_id: newStage === 'round_1' ? newGroupId : null,
    })
    setMatches(TournamentStore.getMatches())
    setNewMatchNumber(TournamentStore.getMatches().length + 1)
  }

  const togglePublication = (matchId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    TournamentStore.updateMatchPublication(matchId, nextStatus)
    setMatches(TournamentStore.getMatches())
  }

  const openScoreEntry = (match: Match) => {
    setScoringMatch(match)
    const existing = results.filter((r) => r.match_id === match.id)

    // Allowed participants:
    // Round 1: Teams assigned to that group
    // Round 2: Manually qualified teams ONLY
    let eligibleTeams: TeamRegistration[] = []
    if (match.stage === 'round_1') {
      const assignments = TournamentStore.getGroupAssignments()
      const assignedIds = new Set(
        assignments.filter((a) => a.group_id === match.group_id).map((a) => a.team_id)
      )
      eligibleTeams = teams.filter((t) => assignedIds.has(t.id))
    } else {
      const qualIds = new Set(qualifications.map((q) => q.team_id))
      eligibleTeams = teams.filter((t) => qualIds.has(t.id))
    }

    if (existing.length > 0) {
      setTeamScoreInputs(
        existing.map((r) => ({
          team_id: r.team_id,
          team_name: r.team_name,
          placement: r.placement,
          p1: r.player_1_kills,
          p2: r.player_2_kills,
          p3: r.player_3_kills,
          p4: r.player_4_kills,
        }))
      )
    } else {
      setTeamScoreInputs(
        eligibleTeams.map((t, idx) => ({
          team_id: t.id,
          team_name: t.team_name,
          placement: idx + 1,
          p1: 0,
          p2: 0,
          p3: 0,
          p4: 0,
        }))
      )
    }
  }

  const handleScoreChange = (
    index: number,
    field: 'placement' | 'p1' | 'p2' | 'p3' | 'p4',
    val: number
  ) => {
    setTeamScoreInputs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: Math.max(0, val) }
      return updated
    })
  }

  const saveScores = () => {
    if (!scoringMatch) return

    // Validate placements unique
    const placements = teamScoreInputs.map((t) => t.placement)
    const uniquePlacements = new Set(placements)
    if (uniquePlacements.size !== placements.length) {
      alert('Error: Duplicate placements detected. Each participating team must have a unique rank/placement.')
      return
    }

    const compiledResults: MatchTeamResult[] = teamScoreInputs.map((row) => {
      const calculated = calculateMatchScore(row.placement, {
        player_1_kills: row.p1,
        player_2_kills: row.p2,
        player_3_kills: row.p3,
        player_4_kills: row.p4,
      })

      return {
        id: `mtr-${scoringMatch.id}-${row.team_id}`,
        match_id: scoringMatch.id,
        team_id: row.team_id,
        team_name: row.team_name,
        placement: row.placement,
        player_1_kills: row.p1,
        player_2_kills: row.p2,
        player_3_kills: row.p3,
        player_4_kills: row.p4,
        total_kills: calculated.total_kills,
        kill_points: calculated.kill_points,
        placement_points: calculated.placement_points,
        total_points: calculated.total_points,
        created_at: new Date().toISOString(),
      }
    })

    TournamentStore.saveMatchResults(scoringMatch.id, compiledResults)
    setResults(TournamentStore.getMatchResults())
    setScoringMatch(null)
  }

  return (
    <div className="space-y-8">
      {/* Create Match Panel */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand mb-4">
          Create Tournament Match
        </h3>
        <form onSubmit={handleCreateMatch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-interface uppercase text-sand/70 mb-1">
              Tournament Stage
            </label>
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value as 'round_1' | 'round_2')}
              className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-sand text-xs font-interface uppercase"
            >
              <option value="round_1">Round 1 (Group Stage)</option>
              <option value="round_2">Round 2 (Grand Final)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-interface uppercase text-sand/70 mb-1">
              Match Number
            </label>
            <input
              type="number"
              min="1"
              value={newMatchNumber}
              onChange={(e) => setNewMatchNumber(Number(e.target.value))}
              className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-sand text-xs font-interface"
            />
          </div>

          {newStage === 'round_1' && (
            <div>
              <label className="block text-xs font-interface uppercase text-sand/70 mb-1">
                Round 1 Group
              </label>
              <select
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-sand text-xs font-interface uppercase"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-cypress text-white font-interface font-bold uppercase text-xs rounded hover:bg-[#003833] transition-colors"
            >
              + Create Match
            </button>
          </div>
        </form>
      </div>

      {/* Matches List & Publication Actions */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand">
          Matches & Scores Management
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {matches.map((m) => {
            const matchRes = results.filter((r) => r.match_id === m.id)
            const groupName = groups.find((g) => g.id === m.group_id)?.name || 'Grand Final'

            return (
              <div
                key={m.id}
                className="p-4 rounded-lg bg-[#050807] border border-cypress/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-display font-black text-xl text-sand">
                      Match #{m.match_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-interface uppercase font-bold bg-cypress text-white">
                      {m.stage === 'round_1' ? `Round 1 • ${groupName}` : 'Round 2 Final'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-interface uppercase font-bold ${
                        m.publication_status === 'published'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500'
                          : 'bg-yellow-950/60 text-yellow-300 border border-yellow-700'
                      }`}
                    >
                      {m.publication_status}
                    </span>
                  </div>
                  <p className="text-xs font-interface text-sand/60 mt-1">
                    Recorded Squads: <strong className="text-white">{matchRes.length}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openScoreEntry(m)}
                    className="px-3 py-1.5 bg-sand text-black font-interface font-bold text-xs uppercase rounded hover:bg-white transition-colors"
                  >
                    Enter / Edit Scores
                  </button>

                  <button
                    onClick={() => togglePublication(m.id, m.publication_status)}
                    className={`px-3 py-1.5 font-interface font-bold text-xs uppercase rounded transition-colors ${
                      m.publication_status === 'published'
                        ? 'bg-yellow-800 text-yellow-100 hover:bg-yellow-900'
                        : 'bg-cypress text-white hover:bg-[#003833]'
                    }`}
                  >
                    {m.publication_status === 'published' ? 'Unpublish' : 'Publish Result'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Score Entry Dialog */}
      {scoringMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#0a0f0d] border border-cypress rounded-lg p-6 text-sand max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-cypress/40 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-xl uppercase tracking-wider text-white">
                  Score Entry — Match #{scoringMatch.match_number}
                </h3>
                <p className="font-interface text-xs text-emerald-400 uppercase tracking-widest mt-0.5">
                  10/6/2/0 Placement Points + 2 Pts / Kill
                </p>
              </div>
              <button
                onClick={() => setScoringMatch(null)}
                className="text-sand/60 hover:text-white font-interface text-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full text-left text-xs font-interface">
                <thead>
                  <tr className="bg-cypress text-white uppercase border-b border-sand/20">
                    <th className="py-2.5 px-3">Squad Name</th>
                    <th className="py-2.5 px-2 text-center w-20">Placement</th>
                    <th className="py-2.5 px-2 text-center w-16">P1 Kills</th>
                    <th className="py-2.5 px-2 text-center w-16">P2 Kills</th>
                    <th className="py-2.5 px-2 text-center w-16">P3 Kills</th>
                    <th className="py-2.5 px-2 text-center w-16">P4 Kills</th>
                    <th className="py-2.5 px-2 text-center font-bold">Total Kills</th>
                    <th className="py-2.5 px-3 text-center font-bold text-emerald-300">Total Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cypress/30">
                  {teamScoreInputs.map((row, idx) => {
                    const preview = calculateMatchScore(row.placement, {
                      player_1_kills: row.p1,
                      player_2_kills: row.p2,
                      player_3_kills: row.p3,
                      player_4_kills: row.p4,
                    })

                    return (
                      <tr key={row.team_id} className="hover:bg-cypress/10">
                        <td className="py-2.5 px-3 font-bold uppercase text-white">
                          {row.team_name}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={row.placement}
                            onChange={(e) => handleScoreChange(idx, 'placement', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-black border border-cypress rounded text-center text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.p1}
                            onChange={(e) => handleScoreChange(idx, 'p1', Number(e.target.value))}
                            className="w-14 px-2 py-1 bg-black border border-cypress rounded text-center text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.p2}
                            onChange={(e) => handleScoreChange(idx, 'p2', Number(e.target.value))}
                            className="w-14 px-2 py-1 bg-black border border-cypress rounded text-center text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.p3}
                            onChange={(e) => handleScoreChange(idx, 'p3', Number(e.target.value))}
                            className="w-14 px-2 py-1 bg-black border border-cypress rounded text-center text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.p4}
                            onChange={(e) => handleScoreChange(idx, 'p4', Number(e.target.value))}
                            className="w-14 px-2 py-1 bg-black border border-cypress rounded text-center text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-sand">
                          {preview.total_kills}
                        </td>
                        <td className="py-2.5 px-3 text-center font-black text-emerald-400">
                          {preview.total_points}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-cypress/40 flex items-center justify-between mt-4">
              <span className="text-xs text-sand/50 font-interface">
                Totals auto-calculated via official scoring rules.
              </span>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => setScoringMatch(null)}
                  className="px-4 py-2 border border-sand/30 rounded text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveScores}
                  className="px-6 py-2 bg-cypress text-white font-bold text-xs uppercase rounded hover:bg-[#003833]"
                >
                  Save & Validate Scorecard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
