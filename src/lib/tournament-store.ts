import type {
  TeamRegistration,
  Group,
  GroupAssignment,
  Match,
  MatchTeamResult,
  Qualification,
  TournamentSettings,
  AuditLog,
} from '../types/tournament'


// In-Memory persistent mock state to ensure 100% offline local running & resilience
const STORAGE_PREFIX = 'bgmi_tournament_data_v1'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${key}`)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error('Storage error:', err)
  }
  return fallback
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data))
  } catch (err) {
    console.error('Storage save error:', err)
  }
}

// Initial default state
const initialSettings: TournamentSettings = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'BGMI CHAMPIONSHIP INVITATIONAL',
  tagline: 'ROAD TO GLORY: 2-STAGE BATTLEGROUNDS',
  description: 'Official BGMI esports tournament management platform.',
  registration_open: true,
  tie_break_rules: [
    'Total Round Points (descending)',
    'Total Kills (descending)',
    'Placement Points (descending)',
    'Head-to-head match outcomes',
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const initialGroups: Group[] = [
  { id: 'g-1', name: 'Group A', created_at: new Date().toISOString() },
  { id: 'g-2', name: 'Group B', created_at: new Date().toISOString() },
]

const initialTeams: TeamRegistration[] = [
  {
    id: 't-1',
    team_name: 'TEAM CYPRESS APEX',
    igl_name: 'ShadowIGL',
    igl_bgmi_uid: '5100000001',
    whatsapp_number: '+919876543210',
    player_2_bgmi_id: '5100000002',
    player_3_bgmi_id: '5100000003',
    player_4_bgmi_id: '5100000004',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    team_name: 'SANDSTORM WARRIORS',
    igl_name: 'VortexIGL',
    igl_bgmi_uid: '5200000001',
    whatsapp_number: '+919876543211',
    player_2_bgmi_id: '5200000002',
    player_3_bgmi_id: '5200000003',
    player_4_bgmi_id: '5200000004',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    team_name: 'NORTHERN TITANS',
    igl_name: 'BlazeIGL',
    igl_bgmi_uid: '5300000001',
    whatsapp_number: '+919876543212',
    player_2_bgmi_id: '5300000002',
    player_3_bgmi_id: '5300000003',
    player_4_bgmi_id: '5300000004',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-4',
    team_name: 'HYDRA SPECTRES',
    igl_name: 'GhostIGL',
    igl_bgmi_uid: '5400000001',
    whatsapp_number: '+919876543213',
    player_2_bgmi_id: '5400000002',
    player_3_bgmi_id: '5400000003',
    player_4_bgmi_id: '5400000004',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-5',
    team_name: 'RECON LEGION',
    igl_name: 'ReconIGL',
    igl_bgmi_uid: '5500000001',
    whatsapp_number: '+919876543214',
    player_2_bgmi_id: '5500000002',
    player_3_bgmi_id: '5500000003',
    player_4_bgmi_id: '5500000004',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't-6',
    team_name: 'VELOCITY RUSH',
    igl_name: 'NitroIGL',
    igl_bgmi_uid: '5600000001',
    whatsapp_number: '+919876543215',
    player_2_bgmi_id: '5600000002',
    player_3_bgmi_id: '5600000003',
    player_4_bgmi_id: '5600000004',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const initialAssignments: GroupAssignment[] = [
  { id: 'ga-1', group_id: 'g-1', team_id: 't-1', created_at: new Date().toISOString() },
  { id: 'ga-2', group_id: 'g-1', team_id: 't-2', created_at: new Date().toISOString() },
  { id: 'ga-3', group_id: 'g-1', team_id: 't-3', created_at: new Date().toISOString() },
  { id: 'ga-4', group_id: 'g-2', team_id: 't-4', created_at: new Date().toISOString() },
  { id: 'ga-5', group_id: 'g-2', team_id: 't-5', created_at: new Date().toISOString() },
]

// Initial seed match with 8-kill Chicken Dinner demo (26 pts total)
const initialMatches: Match[] = [
  {
    id: 'm-1',
    stage: 'round_1',
    match_number: 1,
    group_id: 'g-1',
    scheduled_at: new Date().toISOString(),
    status: 'completed',
    publication_status: 'published',
    official_mvp_player_id: '5100000001',
    official_mvp_player_name: 'ShadowIGL',
    official_mvp_team_id: 't-1',
    mvp_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const initialResults: MatchTeamResult[] = [
  {
    id: 'mtr-1',
    match_id: 'm-1',
    team_id: 't-1',
    team_name: 'TEAM CYPRESS APEX',
    placement: 1,
    player_1_kills: 3,
    player_2_kills: 2,
    player_3_kills: 2,
    player_4_kills: 1,
    total_kills: 8,
    kill_points: 16, // 8 * 2
    placement_points: 10, // 1st = 10 pts
    total_points: 26, // 16 + 10 = 26
    created_at: new Date().toISOString(),
  },
  {
    id: 'mtr-2',
    match_id: 'm-1',
    team_id: 't-2',
    team_name: 'SANDSTORM WARRIORS',
    placement: 2,
    player_1_kills: 2,
    player_2_kills: 1,
    player_3_kills: 0,
    player_4_kills: 1,
    total_kills: 4,
    kill_points: 8,
    placement_points: 6, // 2nd = 6 pts
    total_points: 14,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mtr-3',
    match_id: 'm-1',
    team_id: 't-3',
    team_name: 'NORTHERN TITANS',
    placement: 3,
    player_1_kills: 1,
    player_2_kills: 0,
    player_3_kills: 0,
    player_4_kills: 0,
    total_kills: 1,
    kill_points: 2,
    placement_points: 2, // 3rd = 2 pts
    total_points: 4,
    created_at: new Date().toISOString(),
  },
]

export class TournamentStore {
  static getSettings(): TournamentSettings {
    return loadFromStorage('settings', initialSettings)
  }

  static updateSettings(updates: Partial<TournamentSettings>): TournamentSettings {
    const current = this.getSettings()
    const next = { ...current, ...updates, updated_at: new Date().toISOString() }
    saveToStorage('settings', next)
    return next
  }

  static getTeams(): TeamRegistration[] {
    return loadFromStorage('teams', initialTeams)
  }

  static getPublicApprovedTeams(): Omit<TeamRegistration, 'whatsapp_number'>[] {
    const teams = this.getTeams()

    // Never expose WhatsApp numbers in public queries.
    return teams
      .filter((team) => team.status === 'approved')
      .map((team) => {
        const { whatsapp_number, ...safeTeam } = team
        void whatsapp_number
        return safeTeam
      })
  }

  static addTeamRegistration(
    teamData: Omit<TeamRegistration, 'id' | 'status' | 'created_at' | 'updated_at'>
  ): TeamRegistration {
    const teams = this.getTeams()
    const settings = this.getSettings()
    if (!settings.registration_open) {
      throw new Error('Team registration is currently closed by the tournament organizer.')
    }

    // Check duplicate team name
    if (teams.some((t) => t.team_name.toLowerCase() === teamData.team_name.toLowerCase())) {
      throw new Error('A squad with this name has already registered.')
    }

    const newTeam: TeamRegistration = {
      ...teamData,
      id: `t-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updated = [...teams, newTeam]
    saveToStorage('teams', updated)
    return newTeam
  }

  static setTeamStatus(teamId: string, status: 'approved' | 'rejected'): void {
    const teams = this.getTeams()
    const updated = teams.map((t) =>
      t.id === teamId ? { ...t, status, updated_at: new Date().toISOString() } : t
    )
    saveToStorage('teams', updated)
    this.addAuditLog(`Set team ${teamId} status to ${status}`)
  }

  static getGroups(): Group[] {
    return loadFromStorage('groups', initialGroups)
  }

  static addGroup(name: string): Group {
    const groups = this.getGroups()
    if (groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('A group with this name already exists.')
    }
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
    }
    saveToStorage('groups', [...groups, newGroup])
    this.addAuditLog(`Created group ${name}`)
    return newGroup
  }

  static getGroupAssignments(): GroupAssignment[] {
    return loadFromStorage('assignments', initialAssignments)
  }

  static assignTeamToGroup(groupId: string, teamId: string): void {
    const assignments = this.getGroupAssignments()
    // A team can have only one active Round 1 group assignment at a time
    const filtered = assignments.filter((a) => a.team_id !== teamId)
    const newAssignment: GroupAssignment = {
      id: `ga-${Date.now()}`,
      group_id: groupId,
      team_id: teamId,
      created_at: new Date().toISOString(),
    }
    saveToStorage('assignments', [...filtered, newAssignment])
    this.addAuditLog(`Assigned team ${teamId} to group ${groupId}`)
  }

  static getQualifications(): Qualification[] {
    return loadFromStorage('qualifications', [])
  }

  static qualifyTeam(teamId: string, notes?: string): void {
    const qualifications = this.getQualifications()
    if (qualifications.some((q) => q.team_id === teamId)) {
      return // Already qualified
    }
    const newQual: Qualification = {
      id: `q-${Date.now()}`,
      team_id: teamId,
      notes,
      qualified_at: new Date().toISOString(),
    }
    saveToStorage('qualifications', [...qualifications, newQual])
    this.addAuditLog(`Manually qualified team ${teamId} for Round 2 Final`)
  }

  static unqualifyTeam(teamId: string): void {
    const qualifications = this.getQualifications()
    const updated = qualifications.filter((q) => q.team_id !== teamId)
    saveToStorage('qualifications', updated)
    this.addAuditLog(`Removed qualification for team ${teamId}`)
  }

  static getMatches(): Match[] {
    return loadFromStorage('matches', initialMatches)
  }

  static getPublicMatches(): Match[] {
    const matches = this.getMatches()
    // STRICT PRIVACY: Public visitors only see published matches, credentials never stored/exposed
    return matches.filter((m) => m.publication_status === 'published')
  }

  static createMatch(matchData: {
    stage: 'round_1' | 'round_2'
    match_number: number
    group_id?: string | null
    scheduled_at?: string
  }): Match {
    const matches = this.getMatches()
    const newMatch: Match = {
      id: `m-${Date.now()}`,
      stage: matchData.stage,
      match_number: matchData.match_number,
      group_id: matchData.group_id ?? null,
      scheduled_at: matchData.scheduled_at || new Date().toISOString(),
      status: 'scheduled',
      publication_status: 'draft',
      mvp_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    saveToStorage('matches', [...matches, newMatch])
    this.addAuditLog(`Created ${matchData.stage} match #${matchData.match_number}`)
    return newMatch
  }

  static updateMatchPublication(matchId: string, publication_status: 'draft' | 'published'): void {
    const matches = this.getMatches()
    const updated = matches.map((m) =>
      m.id === matchId ? { ...m, publication_status, updated_at: new Date().toISOString() } : m
    )
    saveToStorage('matches', updated)
    this.addAuditLog(`Match ${matchId} publication status set to ${publication_status}`)
  }

  static setMatchMvp(matchId: string, mvpData: {
    player_id: string
    player_name: string
    team_id: string
    publish: boolean
  }): void {
    const matches = this.getMatches()
    const updated = matches.map((m) =>
      m.id === matchId
        ? {
          ...m,
          official_mvp_player_id: mvpData.player_id,
          official_mvp_player_name: mvpData.player_name,
          official_mvp_team_id: mvpData.team_id,
          mvp_published: mvpData.publish,
          updated_at: new Date().toISOString(),
        }
        : m
    )
    saveToStorage('matches', updated)
    this.addAuditLog(`Updated Match MVP for ${matchId}: ${mvpData.player_name}`)
  }

  static getMatchResults(): MatchTeamResult[] {
    return loadFromStorage('results', initialResults)
  }

  static saveMatchResults(matchId: string, results: MatchTeamResult[]): void {
    const allResults = this.getMatchResults()
    const filtered = allResults.filter((r) => r.match_id !== matchId)
    saveToStorage('results', [...filtered, ...results])
    this.addAuditLog(`Recorded scores for match ${matchId} (${results.length} teams)`)
  }

  static getAuditLogs(): AuditLog[] {
    return loadFromStorage('audit_logs', [])
  }

  static addAuditLog(action: string, details: Record<string, unknown> = {}): void {
    const logs = this.getAuditLogs()
    const entry: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      created_at: new Date().toISOString(),
    }
    saveToStorage('audit_logs', [entry, ...logs.slice(0, 100)])
  }
}
