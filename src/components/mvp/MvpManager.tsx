import React, { useState } from 'react'
import { TournamentStore } from '../../lib/tournament-store'
import type { MvpCandidate } from '../../types/tournament'


export const MvpManager: React.FC = () => {
  const [matches, setMatches] = useState(TournamentStore.getMatches())
  const [results] = useState(TournamentStore.getMatchResults())
  const [teams] = useState(TournamentStore.getTeams())
  const [settings, setSettings] = useState(TournamentStore.getSettings())

  // Match MVP State
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '')

  // Calculate Match MVP Suggestions from individual player frags in the selected match
  const currentMatchResults = results.filter((r) => r.match_id === selectedMatchId)
  const currentMatch = matches.find((m) => m.id === selectedMatchId)

  const matchCandidates: MvpCandidate[] = []
  for (const r of currentMatchResults) {
    const teamObj = teams.find((t) => t.id === r.team_id)
    if (!teamObj) continue

    matchCandidates.push(
      {
        player_id: teamObj.igl_bgmi_uid,
        player_name: `${teamObj.igl_name} (IGL)`,
        team_id: r.team_id,
        team_name: r.team_name,
        kills: r.player_1_kills,
      },
      {
        player_id: teamObj.player_2_bgmi_id,
        player_name: 'Player 2',
        team_id: r.team_id,
        team_name: r.team_name,
        kills: r.player_2_kills,
      },
      {
        player_id: teamObj.player_3_bgmi_id,
        player_name: 'Player 3',
        team_id: r.team_id,
        team_name: r.team_name,
        kills: r.player_3_kills,
      },
      {
        player_id: teamObj.player_4_bgmi_id,
        player_name: 'Player 4',
        team_id: r.team_id,
        team_name: r.team_name,
        kills: r.player_4_kills,
      }
    )
  }

  // Sort descending by kills
  matchCandidates.sort((a, b) => b.kills - a.kills)
  const maxMatchKills = matchCandidates[0]?.kills ?? 0
  const tiedMatchMvps = matchCandidates.filter((c) => c.kills > 0 && c.kills === maxMatchKills)

  // Calculate Tournament MVP Suggestions across tournament (Separating Round 1 & Round 2)
  const playerTournamentStats = new Map<
    string,
    {
      player_name: string
      team_name: string
      team_id: string
      round1_kills: number
      round2_kills: number
      total_kills: number
    }
  >()

  for (const r of results) {
    const match = matches.find((m) => m.id === r.match_id)
    if (!match) continue
    const isR2 = match.stage === 'round_2'
    const teamObj = teams.find((t) => t.id === r.team_id)
    if (!teamObj) continue

    const players = [
      { id: teamObj.igl_bgmi_uid, name: `${teamObj.igl_name} (IGL)`, kills: r.player_1_kills },
      { id: teamObj.player_2_bgmi_id, name: 'Player 2', kills: r.player_2_kills },
      { id: teamObj.player_3_bgmi_id, name: 'Player 3', kills: r.player_3_kills },
      { id: teamObj.player_4_bgmi_id, name: 'Player 4', kills: r.player_4_kills },
    ]

    for (const p of players) {
      const existing = playerTournamentStats.get(p.id) || {
        player_name: p.name,
        team_name: r.team_name,
        team_id: r.team_id,
        round1_kills: 0,
        round2_kills: 0,
        total_kills: 0,
      }

      if (isR2) {
        existing.round2_kills += p.kills
      } else {
        existing.round1_kills += p.kills
      }
      existing.total_kills += p.kills
      playerTournamentStats.set(p.id, existing)
    }
  }

  // Recommendation criteria: Round 2 performance is the primary basis for Tournament MVP
  const tournamentCandidates = Array.from(playerTournamentStats.entries())
    .map(([id, stats]) => ({
      player_id: id,
      ...stats,
    }))
    .sort((a, b) => {
      // Primary: Round 2 kills, Secondary: Total Tournament Kills
      if (b.round2_kills !== a.round2_kills) {
        return b.round2_kills - a.round2_kills
      }
      return b.total_kills - a.total_kills
    })

  const handleConfirmMatchMvp = (c: MvpCandidate, publish: boolean) => {
    if (!selectedMatchId) return
    TournamentStore.setMatchMvp(selectedMatchId, {
      player_id: c.player_id,
      player_name: c.player_name,
      team_id: c.team_id,
      publish,
    })
    setMatches(TournamentStore.getMatches())
  }

  const handleConfirmTournamentMvp = (
    c: { player_id: string; player_name: string; team_id: string },
    publish: boolean
  ) => {
    TournamentStore.updateSettings({
      tournament_mvp_player_id: c.player_id,
      tournament_mvp_player_name: c.player_name,
      tournament_mvp_team_id: c.team_id,
      tournament_mvp_published: publish,
    })
    setSettings(TournamentStore.getSettings())
  }

  return (
    <div className="space-y-8">
      {/* 1. Official Match MVP Selection */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand">
              Match MVP Manual Selection & Publication
            </h3>
            <p className="font-interface text-xs text-sand/60">
              Automated suggestions identify the highest fraggers. Administrator selection overrides suggestions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-interface uppercase text-sand/70">Select Match:</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="px-3 py-1.5 bg-black border border-cypress/60 rounded text-sand text-xs font-interface uppercase"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  Match #{m.match_number} ({m.stage === 'round_1' ? 'Round 1' : 'Round 2'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Match Status */}
        {currentMatch && (
          <div className="p-3 mb-4 rounded bg-[#050807] border border-cypress/40 flex items-center justify-between">
            <span className="font-interface text-xs text-sand">
              Current Official MVP:{' '}
              <strong className="text-emerald-400">
                {currentMatch.official_mvp_player_name || 'None selected yet'}
              </strong>
            </span>
            <span className="font-interface text-xs text-sand/60 uppercase">
              Published Status:{' '}
              <strong className={currentMatch.mvp_published ? 'text-emerald-400' : 'text-yellow-400'}>
                {currentMatch.mvp_published ? 'PUBLISHED' : 'DRAFT'}
              </strong>
            </span>
          </div>
        )}

        {/* Tied or Leading Candidates */}
        {tiedMatchMvps.length > 1 && (
          <div className="p-3 mb-4 rounded bg-yellow-950/40 border border-yellow-700 text-yellow-200 text-xs font-interface">
            Tied MVP Candidates detected: {tiedMatchMvps.map((c) => `${c.player_name} (${c.kills} kills)`).join(', ')}. Select the official MVP below.
          </div>
        )}

        <div className="overflow-x-auto rounded bg-sand text-black">
          <table className="w-full text-left text-xs font-interface">
            <thead>
              <tr className="bg-cypress text-white uppercase border-b border-black/20">
                <th className="py-2.5 px-3">Player Name</th>
                <th className="py-2.5 px-3">BGMI UID</th>
                <th className="py-2.5 px-3">Squad Name</th>
                <th className="py-2.5 px-3 text-center font-bold">Match Kills</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {matchCandidates.slice(0, 8).map((c) => (
                <tr key={c.player_id} className={c.kills === maxMatchKills && c.kills > 0 ? 'bg-emerald-50' : ''}>
                  <td className="py-2 px-3 font-bold uppercase">{c.player_name}</td>
                  <td className="py-2 px-3 font-mono text-black/70">{c.player_id}</td>
                  <td className="py-2 px-3 uppercase text-black/80">{c.team_name}</td>
                  <td className="py-2 px-3 text-center font-black text-cypress text-sm">{c.kills}</td>
                  <td className="py-2 px-3 text-center space-x-2">
                    <button
                      onClick={() => handleConfirmMatchMvp(c, true)}
                      className="px-2.5 py-1 bg-cypress text-white font-bold rounded text-[10px] uppercase hover:bg-[#003833]"
                    >
                      Set & Publish MVP
                    </button>
                    <button
                      onClick={() => handleConfirmMatchMvp(c, false)}
                      className="px-2.5 py-1 bg-[#ded9cb] text-black font-semibold rounded text-[10px] uppercase hover:bg-[#d0cbbd]"
                    >
                      Save as Draft
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Official Tournament MVP Selection */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand">
            Tournament MVP Manual Selection & Publication
          </h3>
          <p className="font-interface text-xs text-sand/60">
            Round 2 performance is the primary basis for recommendation, tracked distinctly from Round 1 statistics.
          </p>
        </div>

        <div className="p-3 mb-4 rounded bg-[#050807] border border-cypress/40 flex items-center justify-between">
          <span className="font-interface text-xs text-sand">
            Official Tournament MVP:{' '}
            <strong className="text-emerald-400">
              {settings.tournament_mvp_player_name || 'None confirmed yet'}
            </strong>
          </span>
          <span className="font-interface text-xs text-sand/60 uppercase">
            Publication Status:{' '}
            <strong className={settings.tournament_mvp_published ? 'text-emerald-400' : 'text-yellow-400'}>
              {settings.tournament_mvp_published ? 'PUBLISHED' : 'DRAFT'}
            </strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded bg-sand text-black">
          <table className="w-full text-left text-xs font-interface">
            <thead>
              <tr className="bg-cypress text-white uppercase border-b border-black/20">
                <th className="py-2.5 px-3">Player Name</th>
                <th className="py-2.5 px-3">Squad Name</th>
                <th className="py-2.5 px-3 text-center font-bold text-emerald-200">
                  Round 2 Kills (Primary)
                </th>
                <th className="py-2.5 px-3 text-center">Round 1 Kills</th>
                <th className="py-2.5 px-3 text-center font-bold">Total Kills</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {tournamentCandidates.slice(0, 10).map((tc) => (
                <tr key={tc.player_id}>
                  <td className="py-2 px-3 font-bold uppercase">{tc.player_name}</td>
                  <td className="py-2 px-3 uppercase text-black/80">{tc.team_name}</td>
                  <td className="py-2 px-3 text-center font-black text-cypress text-sm">
                    {tc.round2_kills}
                  </td>
                  <td className="py-2 px-3 text-center text-black/70">{tc.round1_kills}</td>
                  <td className="py-2 px-3 text-center font-bold">{tc.total_kills}</td>
                  <td className="py-2 px-3 text-center space-x-2">
                    <button
                      onClick={() => handleConfirmTournamentMvp(tc, true)}
                      className="px-2.5 py-1 bg-cypress text-white font-bold rounded text-[10px] uppercase hover:bg-[#003833]"
                    >
                      Confirm & Publish
                    </button>
                    <button
                      onClick={() => handleConfirmTournamentMvp(tc, false)}
                      className="px-2.5 py-1 bg-[#ded9cb] text-black font-semibold rounded text-[10px] uppercase"
                    >
                      Draft
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
