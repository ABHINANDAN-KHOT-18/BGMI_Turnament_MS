export type RegistrationStatus = 'pending' | 'approved' | 'rejected'
export type TournamentStage = 'round_1' | 'round_2'
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type PublicationStatus = 'draft' | 'published'

export interface TournamentSettings {
  id: string
  name: string
  tagline: string
  description: string
  banner_url?: string
  logo_url?: string
  registration_open: boolean
  champion_team_id?: string | null
  champion_published?: boolean
  tournament_mvp_player_id?: string | null
  tournament_mvp_player_name?: string | null
  tournament_mvp_team_id?: string | null
  tournament_mvp_published?: boolean
  tie_break_rules: string[]
  created_at: string
  updated_at: string
}

export interface TeamRegistration {
  id: string
  team_name: string
  igl_name: string
  igl_bgmi_uid: string
  whatsapp_number?: string // Only visible to admins
  player_2_bgmi_id: string
  player_3_bgmi_id: string
  player_4_bgmi_id: string
  status: RegistrationStatus
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  created_at: string
}

export interface GroupAssignment {
  id: string
  group_id: string
  team_id: string
  created_at: string
}

export interface Qualification {
  id: string
  team_id: string
  qualified_at: string
  notes?: string
  created_by?: string
}

export interface Match {
  id: string
  stage: TournamentStage
  match_number: number
  scheduled_at: string
  group_id?: string | null
  status: MatchStatus
  publication_status: PublicationStatus
  official_mvp_player_id?: string | null
  official_mvp_player_name?: string | null
  official_mvp_team_id?: string | null
  mvp_published: boolean
  created_at: string
  updated_at: string
}

export interface MatchTeamResult {
  id: string
  match_id: string
  team_id: string
  team_name: string
  placement: number
  player_1_kills: number
  player_2_kills: number
  player_3_kills: number
  player_4_kills: number
  total_kills: number
  kill_points: number
  placement_points: number
  total_points: number
  created_at: string
}

export interface StandingRow {
  rank: number
  team_id: string
  team_name: string
  matches_played: number
  total_kills: number
  kill_points: number
  placement_points: number
  total_points: number
  is_qualified?: boolean
}

export interface MvpCandidate {
  player_id: string
  player_name: string
  team_id: string
  team_name: string
  kills: number
  matches_played?: number
  is_official?: boolean
}

export interface AuditLog {
  id: string
  action: string
  details: Record<string, unknown>
  user_email?: string
  created_at: string
}
