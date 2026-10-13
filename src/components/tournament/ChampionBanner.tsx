import React, { useRef, useState } from 'react'
import { Crown, Download, Share2 } from 'lucide-react'
import { exportElementAsPng, sharePngOrLink } from '../../lib/image-export'

interface ChampionBannerProps {
  championTeamName: string
  totalFinalPoints: number
  totalFinalKills: number
  runnerUpTeamName?: string
}

export const ChampionBanner: React.FC<ChampionBannerProps> = ({
  championTeamName,
  totalFinalPoints,
  totalFinalKills,
  runnerUpTeamName,
}) => {
  const bannerRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!bannerRef.current) return
    setIsExporting(true)
    try {
      await exportElementAsPng(bannerRef.current, {
        fileName: `bgmi-tournament-champion-${championTeamName.toLowerCase().replace(/\s+/g, '-')}.png`,
        pixelRatio: 2,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    await sharePngOrLink(
      `BGMI Championship Grand Champions: ${championTeamName}`,
      `Hail the champions! ${championTeamName} has won the BGMI Championship with ${totalFinalPoints} points in the Grand Final!`,
      window.location.href
    )
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto my-8">
      {/* Controls */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1 bg-[#0a0f0d] border border-cypress/60 rounded text-sand text-xs font-interface uppercase hover:text-white"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Champion</span>
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1 px-3 py-1 bg-cypress text-white rounded text-xs font-interface font-bold uppercase hover:bg-[#00342f]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Exporting...' : 'Export Champion PNG'}</span>
        </button>
      </div>

      {/* Renderable Champion Banner */}
      <div
        ref={bannerRef}
        className="bg-gradient-to-b from-[#004741] via-[#002f2b] to-[#000000] border-4 border-sand/80 rounded-xl p-8 text-sand shadow-2xl relative overflow-hidden text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown className="w-8 h-8 text-sand animate-bounce" />
          <span className="font-interface font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-sand text-black">
            Official Tournament Champion
          </span>
          <Crown className="w-8 h-8 text-sand animate-bounce" />
        </div>

        <p className="font-interface text-xs uppercase tracking-widest text-emerald-300">
          Grand Final Round 2 Decider
        </p>

        {/* Aisling Display Font for Champion Announcement */}
        <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-wider text-white drop-shadow-lg my-4">
          {championTeamName}
        </h2>

        {/* Highlighted Stats in Sand surface */}
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded bg-sand text-black">
            <span className="block font-interface text-xs font-bold uppercase text-black/60">
              Grand Final Points
            </span>
            <span className="block font-display font-black text-4xl text-cypress">
              {totalFinalPoints}
            </span>
          </div>

          <div className="p-4 rounded bg-sand text-black">
            <span className="block font-interface text-xs font-bold uppercase text-black/60">
              Total Squad Kills
            </span>
            <span className="block font-display font-black text-4xl text-cypress">
              {totalFinalKills}
            </span>
          </div>
        </div>

        {runnerUpTeamName && (
          <p className="font-interface text-xs uppercase tracking-wider text-sand/70">
            Runner-Up Squad: <strong className="text-white">{runnerUpTeamName}</strong>
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-cypress/60 flex items-center justify-between text-xs font-interface text-sand/50 uppercase tracking-widest">
          <span>BGMI Championship Official Esports</span>
          <span>Verified Final Stage Standings</span>
        </div>
      </div>
    </div>
  )
}
