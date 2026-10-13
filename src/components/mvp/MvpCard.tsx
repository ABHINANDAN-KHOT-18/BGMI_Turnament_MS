import React, { useRef, useState } from 'react'
import { Trophy, Crosshair, Download, Share2 } from 'lucide-react'
import { exportElementAsPng, sharePngOrLink } from '../../lib/image-export'

interface MvpCardProps {
  type: 'match' | 'tournament'
  playerName: string
  playerUid: string
  teamName: string
  kills: number
  matchNumber?: number
  stageLabel?: string
  totalMatches?: number
}

export const MvpCard: React.FC<MvpCardProps> = ({
  type,
  playerName,
  playerUid,
  teamName,
  kills,
  matchNumber,
  stageLabel,
  totalMatches,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const isTournament = type === 'tournament'
  const title = isTournament ? 'TOURNAMENT MVP' : `MATCH ${matchNumber ?? ''} MVP`

  const handleExport = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    try {
      const cleanName = `${type}-mvp-${playerName}`.toLowerCase().replace(/\s+/g, '-')
      await exportElementAsPng(cardRef.current, {
        fileName: `${cleanName}.png`,
        pixelRatio: 2,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    await sharePngOrLink(
      `${title}: ${playerName}`,
      `Congratulations to ${playerName} (${teamName}) for securing ${title} with ${kills} total kills!`,
      window.location.href
    )
  }

  return (
    <div className="space-y-2 max-w-md mx-auto">
      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#0a0f0d] border border-cypress/60 rounded text-sand text-[11px] font-interface uppercase hover:text-white"
        >
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1 px-2.5 py-1 bg-cypress text-white rounded text-[11px] font-interface font-bold uppercase hover:bg-[#003833]"
        >
          <Download className="w-3 h-3" />
          <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
        </button>
      </div>

      {/* Renderable High-Res Card */}
      <div
        ref={cardRef}
        className="bg-gradient-to-b from-[#003833] to-[#040807] border-2 border-cypress rounded-lg p-6 text-sand shadow-2xl relative overflow-hidden text-center"
      >
        <div className="absolute top-2 right-2 text-cypress/30">
          <Crosshair className="w-24 h-24 pointer-events-none" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand text-black font-interface font-bold text-xs uppercase tracking-widest mb-4">
          <Trophy className="w-3.5 h-3.5 text-cypress" />
          <span>{title}</span>
        </div>

        {stageLabel && (
          <p className="text-[11px] font-interface uppercase tracking-widest text-emerald-300/80 mb-2">
            {stageLabel}
          </p>
        )}

        {/* Player Name */}
        <h3 className="font-display font-extrabold text-3xl uppercase tracking-wider text-white drop-shadow-md">
          {playerName}
        </h3>

        {/* Team Name */}
        <p className="font-interface text-sm font-bold uppercase tracking-widest text-emerald-400 mt-1">
          {teamName}
        </p>

        {/* UID */}
        <p className="font-interface text-[11px] text-sand/60 tracking-wider mt-0.5">
          BGMI UID: {playerUid}
        </p>

        {/* Stat Box */}
        <div className="mt-6 p-4 rounded bg-sand text-black flex items-center justify-around shadow-inner">
          <div>
            <span className="block font-interface text-[10px] uppercase font-bold text-black/60 tracking-wider">
              Total Frags / Kills
            </span>
            <span className="block font-display font-black text-3xl text-cypress">
              {kills}
            </span>
          </div>
          {totalMatches !== undefined && (
            <div className="border-l border-black/15 pl-4">
              <span className="block font-interface text-[10px] uppercase font-bold text-black/60 tracking-wider">
                Matches Played
              </span>
              <span className="block font-display font-black text-3xl text-cypress">
                {totalMatches}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-cypress/40 flex items-center justify-between text-[10px] font-interface text-sand/40 uppercase tracking-widest">
          <span>BGMI Championship Official</span>
          <span>Verified Esports Record</span>
        </div>
      </div>
    </div>
  )
}
