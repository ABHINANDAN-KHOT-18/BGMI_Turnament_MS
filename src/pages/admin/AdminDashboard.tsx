import React, { useState } from 'react'
import { GroupsAndTeamsManager } from '../../components/tournament/GroupsAndTeamsManager'
import { MatchesManager } from '../../components/matches/MatchesManager'
import { MvpManager } from '../../components/mvp/MvpManager'
import { ExportAndSettingsManager } from '../../components/tournament/ExportAndSettingsManager'
import { Users, Crosshair, Award, Settings, Lock } from 'lucide-react'

interface AdminDashboardProps {
  onLogout: () => void
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'matches' | 'mvp' | 'settings'>('teams')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cypress/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cypress border border-emerald-500/40 text-sand">
              <Lock className="w-4 h-4 text-emerald-300" />
            </span>
            <span className="font-interface text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Tournament Command Center
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-wider text-sand mt-1">
            Administrator <span className="text-emerald-400">Dashboard</span>
          </h1>
          <p className="font-interface text-xs text-sand/60 mt-0.5">
            Manage registrations, group assignments, scorecards, manual qualification, and verified MVPs.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-red-800 text-red-300 hover:bg-red-950 font-interface text-xs uppercase rounded transition-colors"
        >
          Sign Out Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-cypress/40 pb-3">
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-interface font-bold uppercase transition-colors cursor-pointer ${
            activeTab === 'teams'
              ? 'bg-cypress text-white shadow-md'
              : 'text-sand/70 hover:text-white hover:bg-cypress/20'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Squads & Groups</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-interface font-bold uppercase transition-colors cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-cypress text-white shadow-md'
              : 'text-sand/70 hover:text-white hover:bg-cypress/20'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Matches & Scores</span>
        </button>

        <button
          onClick={() => setActiveTab('mvp')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-interface font-bold uppercase transition-colors cursor-pointer ${
            activeTab === 'mvp'
              ? 'bg-cypress text-white shadow-md'
              : 'text-sand/70 hover:text-white hover:bg-cypress/20'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>MVP Management</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-interface font-bold uppercase transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-cypress text-white shadow-md'
              : 'text-sand/70 hover:text-white hover:bg-cypress/20'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Backups & Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'teams' && <GroupsAndTeamsManager />}
        {activeTab === 'matches' && <MatchesManager />}
        {activeTab === 'mvp' && <MvpManager />}
        {activeTab === 'settings' && <ExportAndSettingsManager />}
      </div>
    </div>
  )
}
