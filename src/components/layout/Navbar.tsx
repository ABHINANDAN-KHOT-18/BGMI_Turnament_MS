import React from 'react'
import { Trophy, LayoutDashboard, Globe } from 'lucide-react'

interface NavbarProps {
  currentView: 'public' | 'admin'
  onViewChange: (view: 'public' | 'admin') => void
  isAdminLoggedIn?: boolean
  adminEmail?: string | null
  onLogout?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  isAdminLoggedIn = false,
  adminEmail,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-cypress/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onViewChange('public')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded bg-cypress border border-sand/30 flex items-center justify-center text-sand shadow-inner group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-sand" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-wider text-sand block uppercase">
                BGMI <span className="text-emerald-400">CHAMPIONSHIP</span>
              </span>
              <span className="font-interface text-xs tracking-widest text-sand/60 block uppercase">
                Official Esports Tournament System
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => onViewChange('public')}
              className={`flex items-center space-x-2 px-3 py-2 rounded font-interface text-xs sm:text-sm tracking-wider uppercase transition-colors ${
                currentView === 'public'
                  ? 'bg-cypress text-white font-bold border border-emerald-500/30'
                  : 'text-sand/70 hover:text-white hover:bg-cypress/20'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Public Portal</span>
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center space-x-2 px-3 py-2 rounded font-interface text-xs sm:text-sm tracking-wider uppercase transition-colors ${
                currentView === 'admin'
                  ? 'bg-cypress text-white font-bold border border-emerald-500/30'
                  : 'text-sand/70 hover:text-white hover:bg-cypress/20'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>

            {isAdminLoggedIn && onLogout && (
              <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-sand/20">
                <span className="text-xs text-sand/60 font-interface">
                  {adminEmail || 'Admin'}
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-400 hover:text-red-300 font-interface uppercase"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
