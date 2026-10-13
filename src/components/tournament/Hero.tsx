import React from 'react'
import { Trophy, Shield, Users, Crosshair } from 'lucide-react'

interface HeroProps {
  onRegisterClick: () => void
  isRegistrationOpen: boolean
  totalTeams: number
}

export const Hero: React.FC<HeroProps> = ({
  onRegisterClick,
  isRegistrationOpen,
  totalTeams,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#003833]/70 via-black to-black border-b border-cypress/40 py-16 sm:py-24">
      {/* Subtle brand grid texture */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#F0EDE4_1px,transparent_1px),linear-gradient(to_bottom,#F0EDE4_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Stage & Registration Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cypress/80 border border-sand/30 text-sand text-xs font-interface uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Stage: Round 1 Qualifiers & Round 2 Finals</span>
          <span className="text-sand/40">•</span>
          <span className={isRegistrationOpen ? 'text-emerald-300 font-bold' : 'text-red-300'}>
            Registration: {isRegistrationOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </div>

        {/* Tournament Title with Aisling Display Font */}
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-wider text-sand mb-4 drop-shadow-md">
          BGMI CHAMPIONSHIP <br />
          <span className="text-emerald-400">INVITATIONAL</span>
        </h1>

        <p className="max-w-2xl mx-auto font-interface text-sand/80 text-sm sm:text-base md:text-lg mb-8 tracking-wide">
          Official Battlegrounds Mobile India 2-stage competitive battlegrounds. Complete squad tracking, deterministic placement scoring, and verified Match & Tournament MVP titles.
        </p>

        {/* Call to action & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {isRegistrationOpen ? (
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-cypress text-white font-interface font-bold uppercase tracking-widest rounded border border-sand/40 hover:bg-[#00342f] shadow-lg hover:shadow-cypress/50 transition-all cursor-pointer"
            >
              Register Squad Now
            </button>
          ) : (
            <div className="px-6 py-3 bg-red-950/60 border border-red-800 text-red-200 font-interface uppercase text-sm rounded">
              Squad Registration Closed
            </div>
          )}

          <div className="flex items-center gap-2 px-6 py-3 bg-[#0a0f0d] border border-cypress/50 rounded font-interface text-sand text-sm uppercase">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Registered Squads: <strong className="text-white font-bold">{totalTeams}</strong></span>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded bg-[#0a0f0d]/90 border border-cypress/40 flex items-start space-x-3">
            <Trophy className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sand text-sm font-bold uppercase">Official Scoring</h3>
              <p className="font-interface text-sand/70 text-xs mt-1">
                Chicken Dinner = 10 pts, 2nd = 6 pts, 3rd = 2 pts. Each verified frag awards 2 points.
              </p>
            </div>
          </div>

          <div className="p-4 rounded bg-[#0a0f0d]/90 border border-cypress/40 flex items-start space-x-3">
            <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sand text-sm font-bold uppercase">2-Stage Progression</h3>
              <p className="font-interface text-sand/70 text-xs mt-1">
                Round 1 Group Stages (A/B/C/D) followed by authorized manual qualification to Round 2 Grand Final.
              </p>
            </div>
          </div>

          <div className="p-4 rounded bg-[#0a0f0d]/90 border border-cypress/40 flex items-start space-x-3">
            <Crosshair className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sand text-sm font-bold uppercase">Verified MVP Engine</h3>
              <p className="font-interface text-sand/70 text-xs mt-1">
                Match MVP & Tournament MVP recognition calculated directly from validated individual kills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
