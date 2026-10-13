import React, { useState } from 'react'
import { TournamentStore } from '../../lib/tournament-store'


export const GroupsAndTeamsManager: React.FC = () => {
  const [teams, setTeams] = useState(TournamentStore.getTeams())
  const [groups, setGroups] = useState(TournamentStore.getGroups())
  const [assignments, setAssignments] = useState(TournamentStore.getGroupAssignments())
  const [qualifications, setQualifications] = useState(TournamentStore.getQualifications())
  const [newGroupName, setNewGroupName] = useState('')

  const handleStatusChange = (teamId: string, status: 'approved' | 'rejected') => {
    TournamentStore.setTeamStatus(teamId, status)
    setTeams(TournamentStore.getTeams())
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    try {
      TournamentStore.addGroup(newGroupName.trim())
      setGroups(TournamentStore.getGroups())
      setNewGroupName('')
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message)
    }
  }

  const handleAssignGroup = (groupId: string, teamId: string) => {
    TournamentStore.assignTeamToGroup(groupId, teamId)
    setAssignments(TournamentStore.getGroupAssignments())
  }

  const toggleQualification = (teamId: string) => {
    const isQual = qualifications.some((q) => q.team_id === teamId)
    if (isQual) {
      TournamentStore.unqualifyTeam(teamId)
    } else {
      TournamentStore.qualifyTeam(teamId, 'Manual admin qualification from Round 1')
    }
    setQualifications(TournamentStore.getQualifications())
  }

  const approvedTeams = teams.filter((t) => t.status === 'approved')

  return (
    <div className="space-y-8">
      {/* 1. Pending Squad Registrations Review */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand">
              Squad Registrations & Approvals
            </h3>
            <p className="font-interface text-xs text-sand/60">
              Review registered teams. WhatsApp contacts are visible strictly to verified administrators.
            </p>
          </div>
          <span className="px-3 py-1 bg-cypress/40 border border-emerald-500/40 rounded text-xs font-interface text-emerald-300 font-bold">
            Total Squads: {teams.length}
          </span>
        </div>

        <div className="overflow-x-auto rounded bg-[#050807] border border-cypress/40">
          <table className="w-full text-left text-xs font-interface">
            <thead>
              <tr className="bg-cypress text-white uppercase border-b border-sand/20">
                <th className="py-2.5 px-3">Squad Name</th>
                <th className="py-2.5 px-3">IGL & UID</th>
                <th className="py-2.5 px-3 text-emerald-300">WhatsApp (Admin Only)</th>
                <th className="py-2.5 px-3">Squad IDs</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cypress/20 text-sand">
              {teams.map((t) => (
                <tr key={t.id} className="hover:bg-cypress/10">
                  <td className="py-2.5 px-3 font-bold uppercase text-white">{t.team_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold">{t.igl_name}</span>
                    <span className="block text-[10px] text-sand/50">UID: {t.igl_bgmi_uid}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                    {t.whatsapp_number}
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-sand/60">
                    P2: {t.player_2_bgmi_id} • P3: {t.player_3_bgmi_id} • P4: {t.player_4_bgmi_id}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === 'approved'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                          : t.status === 'rejected'
                          ? 'bg-red-900/60 text-red-300 border border-red-600'
                          : 'bg-yellow-950/60 text-yellow-300 border border-yellow-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center space-x-1">
                    {t.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(t.id, 'approved')}
                        className="px-2.5 py-1 bg-cypress text-white font-bold rounded text-[10px] uppercase hover:bg-[#003833]"
                      >
                        Approve
                      </button>
                    )}
                    {t.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(t.id, 'rejected')}
                        className="px-2.5 py-1 bg-red-950 text-red-200 border border-red-800 rounded text-[10px] uppercase hover:bg-red-900"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Round 1 Groups Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand mb-2">
            Round 1 Groups
          </h3>
          <p className="font-interface text-xs text-sand/60 mb-4">
            Create independent Round 1 qualifier groups (Group A, B, C, D).
          </p>

          <form onSubmit={handleCreateGroup} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. Group C"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1 px-3 py-2 bg-black border border-cypress/60 rounded text-sand text-xs font-interface"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cypress text-white font-interface font-bold uppercase text-xs rounded hover:bg-[#003833]"
            >
              Add Group
            </button>
          </form>

          <div className="space-y-2">
            {groups.map((g) => {
              const assignedCount = assignments.filter((a) => a.group_id === g.id).length
              return (
                <div
                  key={g.id}
                  className="p-3 rounded bg-[#050807] border border-cypress/30 flex items-center justify-between"
                >
                  <span className="font-display font-bold uppercase text-sm text-sand">
                    {g.name}
                  </span>
                  <span className="font-interface text-xs text-emerald-400">
                    {assignedCount} Squads Assigned
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Assign Approved Teams to Groups */}
        <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand mb-2">
            Assign Squads to Round 1 Groups
          </h3>
          <p className="font-interface text-xs text-sand/60 mb-4">
            Only approved squads can receive group assignments.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {approvedTeams.map((t) => {
              const currentGroup = assignments.find((a) => a.team_id === t.id)?.group_id || ''
              return (
                <div
                  key={t.id}
                  className="p-2.5 rounded bg-[#050807] border border-cypress/30 flex items-center justify-between gap-3 text-xs font-interface"
                >
                  <span className="font-bold uppercase text-white truncate">{t.team_name}</span>
                  <select
                    value={currentGroup}
                    onChange={(e) => handleAssignGroup(e.target.value, t.id)}
                    className="px-2 py-1 bg-black border border-cypress rounded text-sand text-xs font-interface uppercase"
                  >
                    <option value="">-- Unassigned --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. Manual Round 2 Qualifications Selection */}
      <div className="p-5 rounded-lg bg-[#0a0f0d] border border-cypress/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-sand">
              Manual Round 2 Final Qualification
            </h3>
            <p className="font-interface text-xs text-sand/60">
              Only manually selected squads will be admitted to Round 2 Grand Final matches.
            </p>
          </div>
          <span className="px-3 py-1 bg-cypress text-white rounded font-interface text-xs font-bold uppercase">
            Qualified: {qualifications.length} Squads
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {approvedTeams.map((t) => {
            const isQual = qualifications.some((q) => q.team_id === t.id)
            return (
              <div
                key={t.id}
                onClick={() => toggleQualification(t.id)}
                className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                  isQual
                    ? 'bg-cypress/60 border-emerald-400 text-white shadow-md'
                    : 'bg-[#050807] border-cypress/30 text-sand/70 hover:border-cypress'
                }`}
              >
                <div>
                  <span className="font-interface font-bold uppercase text-xs block">
                    {t.team_name}
                  </span>
                  <span className="font-interface text-[10px] text-sand/50">
                    IGL: {t.igl_name}
                  </span>
                </div>
                {isQual ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-400 text-black font-interface text-[10px] font-black uppercase">
                    QUALIFIED
                  </span>
                ) : (
                  <span className="text-[10px] font-interface uppercase text-sand/40">
                    Click to Qualify
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
