import React, { useState } from 'react'
import { Hero } from '../../components/tournament/Hero'
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable'
import { MatchList } from '../../components/matches/MatchList'
import { MvpCard } from '../../components/mvp/MvpCard'
import { ChampionBanner } from '../../components/tournament/ChampionBanner'
import { RegistrationModal } from '../../components/tournament/RegistrationModal'
import { TournamentStore } from '../../lib/tournament-store'
import { calculateStandingsFromResults } from '../../lib/scoring'
import { Info } from 'lucide-react'

export const PublicHomepage: React.FC = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const settings = TournamentStore.getSettings()
  const groups = TournamentStore.getGroups()

  const qualifications = TournamentStore.getQualifications()
  const qualifiedTeamIds = new Set(qualifications.map((q) => q.team_id))

  // ONLY published results are exposed to public visitors via safe public matches
  const publishedMatches = TournamentStore.getPublicMatches()
  const allResults = TournamentStore.getMatchResults()
  const publishedMatchIds = new Set(publishedMatches.map((m) => m.id))
  const publishedResults = allResults.filter((r) => publishedMatchIds.has(r.match_id))

  // Round 1 separate standings per group
  const round1Matches = publishedMatches.filter((m) => m.stage === 'round_1')
  const round2Matches = publishedMatches.filter((m) => m.stage === 'round_2')

  const round2Results = publishedResults.filter((r) =>
    round2Matches.some((m) => m.id === r.match_id)
  )
  const round2Standings = calculateStandingsFromResults(round2Results, qualifiedTeamIds)

  // Find Champion if Round 2 has published matches
  const championTeam = round2Standings[0]
  const runnerUpTeam = round2Standings[1]

  // Find Published Match MVPs
  const publishedMatchMvps = publishedMatches.filter(
    (m) => m.mvp_published && m.official_mvp_player_name
  )

  const handleRegisterSuccess = async (data: {
    team_name: string
    igl_name: string
    igl_bgmi_uid: string
    whatsapp_number: string
    player_2_bgmi_id: string
    player_3_bgmi_id: string
    player_4_bgmi_id: string
  }) => {
    TournamentStore.addTeamRegistration(data)
  }

  const approvedTeamsCount = TournamentStore.getPublicApprovedTeams().length

  return (
    <div className="space-y-16 pb-24">
      {/* 1. Hero Section */}
      <Hero
        onRegisterClick={() => setIsRegistrationOpen(true)}
        isRegistrationOpen={settings.registration_open}
        totalTeams={approvedTeamsCount}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. Official Champion Announcement (If published in Final Stage) */}
        {championTeam && round2Matches.length > 0 && (
          <section>
            <ChampionBanner
              championTeamName={championTeam.team_name}
              totalFinalPoints={championTeam.total_points}
              totalFinalKills={championTeam.total_kills}
              runnerUpTeamName={runnerUpTeam?.team_name}
            />
          </section>
        )}

        {/* 3. Official Tournament MVP Card (If confirmed & published by admin) */}
        {settings.tournament_mvp_published && settings.tournament_mvp_player_name && (
          <section className="text-center">
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-wider text-sand mb-6">
              Official Tournament <span className="text-emerald-400">MVP</span>
            </h2>
            <MvpCard
              type="tournament"
              playerName={settings.tournament_mvp_player_name}
              playerUid={settings.tournament_mvp_player_id || 'VERIFIED'}
              teamName="TOURNAMENT STANDOUT"
              kills={round2Results.reduce((acc, r) => acc + r.total_kills, 0)}
              stageLabel="Round 2 Grand Final Peak Performer"
            />
          </section>
        )}

        {/* 4. Round 2 Final Standings (Independent from Round 1) */}
        <section className="space-y-4">
          <LeaderboardTable
            title="Grand Final Leaderboard"
            subtitle="Round 2 Final Standings (Scores strictly calculated from Final stage matches)"
            stageName="Stage 2: Grand Final"
            standings={round2Standings}
            isFinalStage={true}
          />
        </section>

        {/* 5. Round 1 Group Stage Standings (Separate Leaderboard for every group) */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-interface uppercase tracking-widest text-emerald-400 block">
              Stage 1: Qualifiers
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wider text-sand">
              Round 1 Group Standings
            </h2>
            <p className="font-interface text-xs text-sand/60 mt-1">
              Each group operates on an independent points table. Top performers are manually qualified for Round 2.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {groups.map((group) => {
              // Group specific published matches and results
              const groupMatches = round1Matches.filter((m) => m.group_id === group.id)
              const groupMatchIds = new Set(groupMatches.map((m) => m.id))
              const groupResults = publishedResults.filter((r) => groupMatchIds.has(r.match_id))
              const groupStandings = calculateStandingsFromResults(groupResults, qualifiedTeamIds)

              return (
                <div key={group.id}>
                  <LeaderboardTable
                    title={`${group.name} Standings`}
                    stageName="Round 1 Qualifier"
                    standings={groupStandings}
                  />
                </div>
              )
            })}
          </div>
        </section>

        {/* 6. Published Matches & Results Scorecards */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-interface uppercase tracking-widest text-emerald-400 block">
              Match Center
            </span>
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-wider text-sand">
              Published Match Results
            </h2>
            <p className="font-interface text-xs text-sand/60 mt-1">
              Confirmed match summaries and individual player kill breakdowns.
            </p>
          </div>

          <MatchList matches={publishedMatches} results={publishedResults} />
        </section>

        {/* 7. Published Match MVPs */}
        {publishedMatchMvps.length > 0 && (
          <section className="space-y-6">
            <div>
              <span className="text-xs font-interface uppercase tracking-widest text-emerald-400 block">
                Player Spotlight
              </span>
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-wider text-sand">
                Published Match MVPs
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedMatchMvps.map((m) => (
                <MvpCard
                  key={m.id}
                  type="match"
                  matchNumber={m.match_number}
                  playerName={m.official_mvp_player_name || 'MVP Player'}
                  playerUid={m.official_mvp_player_id || 'ID'}
                  teamName="Match MVP Winner"
                  kills={
                    publishedResults
                      .filter((r) => r.match_id === m.id)
                      .reduce((max, cur) => Math.max(max, cur.player_1_kills), 0) || 5
                  }
                  stageLabel={m.stage === 'round_1' ? 'Round 1 Qualifier' : 'Round 2 Final'}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. Tournament Rules & Scoring System Card */}
        <section className="p-6 sm:p-8 rounded-xl bg-[#0a0f0d] border border-cypress/50 space-y-6">
          <div className="flex items-center space-x-3">
            <Info className="w-6 h-6 text-emerald-400" />
            <h2 className="font-display font-black text-2xl uppercase text-sand tracking-wide">
              Official Scoring & Tie-Break Regulations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-interface text-sand/80">
            <div className="p-4 rounded bg-[#050807] border border-cypress/30 space-y-2">
              <h3 className="font-bold uppercase text-emerald-400 text-sm">Placement Points</h3>
              <p>• 1st Place (Winner Winner Chicken Dinner): <strong>10 Points</strong></p>
              <p>• 2nd Place: <strong>6 Points</strong></p>
              <p>• 3rd Place: <strong>2 Points</strong></p>
              <p>• 4th Place & Below: <strong>0 Points</strong></p>
              <p>• Every verified individual kill awards exactly <strong>2 Points</strong>.</p>
            </div>

            <div className="p-4 rounded bg-[#050807] border border-cypress/30 space-y-2">
              <h3 className="font-bold uppercase text-emerald-400 text-sm">Configured Tie-Break Hierarchy</h3>
              <ol className="list-decimal pl-4 space-y-1">
                {settings.tie_break_rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSubmitSuccess={handleRegisterSuccess}
      />
    </div>
  )
}
