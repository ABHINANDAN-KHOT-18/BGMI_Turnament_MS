import React, { useRef, useState } from 'react'
import type { StandingRow } from '../../types/tournament'
import { Download, Share2, Check } from 'lucide-react'
import { exportElementAsPng, sharePngOrLink } from '../../lib/image-export'

interface LeaderboardTableProps {
  title: string
  subtitle?: string
  stageName: string
  standings: StandingRow[]
  isFinalStage?: boolean
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  title,
  subtitle,
  stageName,
  standings,
  isFinalStage = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleDownloadPng = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    try {
      const cleanName = title.toLowerCase().replace(/\s+/g, '-')
      await exportElementAsPng(cardRef.current, {
        fileName: `${cleanName}-standings.png`,
        pixelRatio: 2,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const success = await sharePngOrLink(
      title,
      `Check out the latest standings for ${title} on the official BGMI Championship!`,
      window.location.href
    )
    if (!success) {
      await navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Table Export Controls */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-interface uppercase tracking-widest text-emerald-400">
            {stageName}
          </span>
          <h2 className="font-display font-extrabold text-2xl uppercase tracking-wider text-sand">
            {title}
          </h2>
          {subtitle && (
            <p className="font-interface text-xs text-sand/60">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f0d] border border-cypress/60 rounded text-sand text-xs font-interface uppercase hover:text-white hover:border-emerald-500 transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sand" />}
            <span>{isCopied ? 'Link Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cypress text-white rounded text-xs font-interface font-bold uppercase hover:bg-[#00342f] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
          </button>
        </div>
      </div>

      {/* Renderable Standings Card (Identical for UI and high-res PNG export) */}
      <div
        ref={cardRef}
        className="bg-[#050807] border-2 border-cypress rounded-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Esports Watermark / Banner Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cypress/50 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-cypress border border-sand/40 flex items-center justify-center font-display font-black text-sand text-lg">
              BGMI
            </div>
            <div>
              <span className="font-display font-black text-lg uppercase tracking-wider text-sand block">
                {title}
              </span>
              <span className="font-interface text-[11px] uppercase tracking-widest text-emerald-400 block">
                {stageName} • Official Tournament Standings
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-interface text-[10px] text-sand/50 uppercase tracking-widest block">
              Scoring System
            </span>
            <span className="font-interface text-xs font-bold text-sand block">
              10/6/2/0 Pts + 2 Pts/Kill
            </span>
          </div>
        </div>

        {/* Standings Table using Sand light surface for clean esports readability */}
        {standings.length === 0 ? (
          <div className="text-center py-12 bg-sand/5 rounded border border-sand/10">
            <p className="font-interface text-sand/60 text-sm uppercase tracking-wider">
              No published match results available for this table yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded bg-sand text-black shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cypress text-white font-interface text-xs uppercase tracking-wider border-b border-black/20">
                  <th className="py-3 px-3 text-center w-14">Rank</th>
                  <th className="py-3 px-4">Squad Name</th>
                  <th className="py-3 px-3 text-center">Matches</th>
                  <th className="py-3 px-3 text-center">Total Kills</th>
                  <th className="py-3 px-3 text-center">Kill Pts</th>
                  <th className="py-3 px-3 text-center">Place Pts</th>
                  <th className="py-3 px-4 text-center font-bold">Total Pts</th>
                  {!isFinalStage && (
                    <th className="py-3 px-3 text-center">Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 font-interface text-xs sm:text-sm">
                {standings.map((team, idx) => {
                  const isTopOne = idx === 0
                  return (
                    <tr
                      key={team.team_id}
                      className={`transition-colors hover:bg-black/5 ${
                        isTopOne ? 'bg-emerald-50 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-black ${
                            isTopOne
                              ? 'bg-cypress text-white shadow-sm'
                              : idx === 1
                              ? 'bg-[#ded9cb] text-black'
                              : idx === 2
                              ? 'bg-[#ded9cb]/60 text-black'
                              : 'text-black/70'
                          }`}
                        >
                          #{team.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold uppercase tracking-wide">
                        {team.team_name}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-black/80">
                        {team.matches_played}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-black/80">
                        {team.total_kills}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-black/80">
                        {team.kill_points}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-black/80">
                        {team.placement_points}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-sm text-cypress">
                        {team.total_points}
                      </td>
                      {!isFinalStage && (
                        <td className="py-3 px-3 text-center">
                          {team.is_qualified ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cypress text-white">
                              Qualified
                            </span>
                          ) : (
                            <span className="text-[11px] text-black/40 uppercase">
                              Contender
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-4 mt-3 flex items-center justify-between text-[11px] text-sand/50 font-interface uppercase tracking-wider">
          <span>Tie-Breakers: Total Points &gt; Total Kills &gt; Placement Points</span>
          <span>BGMI Esports Official System</span>
        </div>
      </div>
    </div>
  )
}
