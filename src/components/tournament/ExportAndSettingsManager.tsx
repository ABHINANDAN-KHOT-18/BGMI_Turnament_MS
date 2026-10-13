import React, { useState } from 'react'
import { TournamentStore } from '../../lib/tournament-store'
import { FileJson, FileSpreadsheet, Lock } from 'lucide-react'

export const ExportAndSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState(TournamentStore.getSettings())
  const [auditLogs] = useState(TournamentStore.getAuditLogs())

  const handleToggleRegistration = () => {
    const nextState = !settings.registration_open
    TournamentStore.updateSettings({ registration_open: nextState })
    setSettings(TournamentStore.getSettings())
  }

  const exportAsJson = () => {
    const data = {
      settings: TournamentStore.getSettings(),
      teams: TournamentStore.getTeams(),
      groups: TournamentStore.getGroups(),
      assignments: TournamentStore.getGroupAssignments(),
      qualifications: TournamentStore.getQualifications(),
      matches: TournamentStore.getMatches(),
      results: TournamentStore.getMatchResults(),
      auditLogs: TournamentStore.getAuditLogs(),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bgmi-tournament-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const exportTeamsCsv = () => {
    const teams = TournamentStore.getTeams()
    const headers = ['ID', 'Team Name', 'IGL Name', 'IGL UID', 'WhatsApp', 'Player 2 UID', 'Player 3 UID', 'Player 4 UID', 'Status']
    const rows = teams.map((t) => [
      t.id,
      `"${t.team_name}"`,
      `"${t.igl_name}"`,
      t.igl_bgmi_uid,
      `"${t.whatsapp_number}"`,
      t.player_2_bgmi_id,
      t.player_3_bgmi_id,
      t.player_4_bgmi_id,
      t.status,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bgmi-teams-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="space-y-8">
      {/* 1. Global Tournament Controls */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand mb-2">
          Global Tournament Settings
        </h3>
        <p className="font-interface text-xs text-sand/60 mb-4">
          Control public squad registrations and review configured tie-break rules.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-[#050807] border border-cypress/30">
          <div>
            <span className="font-interface text-xs font-bold uppercase text-white block">
              Public Squad Registration Status
            </span>
            <span className="font-interface text-xs text-sand/60 block">
              When closed, anonymous visitors cannot submit new squad applications.
            </span>
          </div>

          <button
            onClick={handleToggleRegistration}
            className={`px-4 py-2 rounded text-xs font-interface font-bold uppercase transition-colors ${
              settings.registration_open
                ? 'bg-red-950 text-red-200 border border-red-800 hover:bg-red-900'
                : 'bg-cypress text-white hover:bg-[#003833]'
            }`}
          >
            {settings.registration_open ? 'Close Registration' : 'Open Registration'}
          </button>
        </div>
      </div>

      {/* 2. Admin Secure Backups & Exports */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <div className="flex items-center space-x-2 mb-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand">
            Tournament Data Backups & Exports
          </h3>
        </div>
        <p className="font-interface text-xs text-sand/60 mb-4">
          Export full tournament state for reporting or database migration. Sensitive contact numbers are protected and restricted to administrators.
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportAsJson}
            className="flex items-center gap-2 px-4 py-2.5 bg-cypress text-white rounded text-xs font-interface font-bold uppercase hover:bg-[#003833]"
          >
            <FileJson className="w-4 h-4" />
            <span>Export Full Tournament (JSON)</span>
          </button>

          <button
            onClick={exportTeamsCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-sand text-black rounded text-xs font-interface font-bold uppercase hover:bg-white"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Squads & Contacts (CSV)</span>
          </button>
        </div>
      </div>

      {/* 3. Administrative Audit History */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand mb-2">
          Administrator Audit Trail
        </h3>
        <p className="font-interface text-xs text-sand/60 mb-4">
          Audit log tracking recent sensitive operations, qualifications, and score modifications.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <p className="text-xs font-interface text-sand/40">No audit events logged yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded bg-[#050807] border border-cypress/20 flex items-center justify-between text-xs font-interface"
              >
                <span className="text-sand/90 font-medium">{log.action}</span>
                <span className="text-sand/40 text-[10px]">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
