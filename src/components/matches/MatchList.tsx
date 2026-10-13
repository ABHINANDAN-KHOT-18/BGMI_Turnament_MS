import React, { useState } from 'react'
import type { Match, MatchTeamResult } from '../../types/tournament'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MatchListProps {
  matches: Match[]
  results: MatchTeamResult[]
}

export const MatchList: React.FC<MatchListProps> = ({ matches, results }) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center bg-[#0a0f0d] border border-cypress/40 rounded-lg text-sand/60 font-interface text-sm uppercase tracking-wider">
        No matches recorded or published yet for this stage.
      </div>
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedMatchId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const isExpanded = expandedMatchId === match.id
        const matchResults = results
          .filter((r) => r.match_id === match.id)
          .sort((a, b) => a.placement - b.placement)

        const winner = matchResults.find((r) => r.placement === 1)

        return (
          <div
            key={match.id}
            className="bg-[#050807] border border-cypress/50 rounded-lg overflow-hidden shadow-md"
          >
            <div
              onClick={() => toggleExpand(match.id)}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-cypress/10 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded bg-cypress border border-sand/30 flex items-center justify-center font-display font-black text-sand text-lg">
                  M{match.match_number}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-interface text-xs uppercase tracking-widest text-emerald-400 font-bold">
                      {match.stage === 'round_1' ? 'Round 1 Qualifier' : 'Round 2 Grand Final'}
                    </span>
                    <span className="text-sand/30">•</span>
                    <span className="font-interface text-xs text-sand/60">
                      Match #{match.match_number}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg uppercase text-sand mt-0.5">
                    {winner ? (
                      <span>Chicken Dinner: <span className="text-emerald-400 font-extrabold">{winner.team_name}</span></span>
                    ) : (
                      <span>Match In Progress / Awaiting Results</span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {match.mvp_published && match.official_mvp_player_name && (
                  <div className="hidden sm:block text-right">
                    <span className="block text-[10px] font-interface uppercase text-sand/50">
                      Match MVP
                    </span>
                    <span className="block text-xs font-interface font-bold text-emerald-300 uppercase">
                      {match.official_mvp_player_name}
                    </span>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-sand/60" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-sand/60" />
                )}
              </div>
            </div>

            {/* Collapsible Result Details */}
            {isExpanded && (
              <div className="p-4 sm:p-6 border-t border-cypress/30 bg-[#0a0f0d]">
                <h4 className="font-interface text-xs font-bold uppercase tracking-wider text-sand/70 mb-3">
                  Match Scorecard & Individual Kills
                </h4>

                {matchResults.length === 0 ? (
                  <p className="font-interface text-xs text-sand/40">No team scores recorded.</p>
                ) : (
                  <div className="overflow-x-auto rounded bg-sand text-black">
                    <table className="w-full text-left text-xs font-interface">
                      <thead>
                        <tr className="bg-cypress text-white font-bold uppercase border-b border-black/20">
                          <th className="py-2.5 px-3 text-center">Place</th>
                          <th className="py-2.5 px-4">Squad Name</th>
                          <th className="py-2.5 px-2 text-center">P1</th>
                          <th className="py-2.5 px-2 text-center">P2</th>
                          <th className="py-2.5 px-2 text-center">P3</th>
                          <th className="py-2.5 px-2 text-center">P4</th>
                          <th className="py-2.5 px-3 text-center font-bold">Kills</th>
                          <th className="py-2.5 px-3 text-center">Kill Pts</th>
                          <th className="py-2.5 px-3 text-center">Place Pts</th>
                          <th className="py-2.5 px-4 text-center font-bold text-cypress">Total Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {matchResults.map((r) => (
                          <tr key={r.id} className={r.placement === 1 ? 'bg-emerald-50 font-bold' : ''}>
                            <td className="py-2 px-3 text-center font-bold">#{r.placement}</td>
                            <td className="py-2 px-4 font-bold uppercase">{r.team_name}</td>
                            <td className="py-2 px-2 text-center text-black/70">{r.player_1_kills}</td>
                            <td className="py-2 px-2 text-center text-black/70">{r.player_2_kills}</td>
                            <td className="py-2 px-2 text-center text-black/70">{r.player_3_kills}</td>
                            <td className="py-2 px-2 text-center text-black/70">{r.player_4_kills}</td>
                            <td className="py-2 px-3 text-center font-bold">{r.total_kills}</td>
                            <td className="py-2 px-3 text-center">{r.kill_points}</td>
                            <td className="py-2 px-3 text-center">{r.placement_points}</td>
                            <td className="py-2 px-4 text-center font-black text-cypress">{r.total_points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
