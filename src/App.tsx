import React, { useState } from 'react'
import { Navbar } from './components/layout/Navbar'
import { PublicHomepage } from './pages/public/PublicHomepage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminLogin } from './pages/admin/AdminLogin'

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  const handleAdminLogin = (email: string) => {
    setIsAdminLoggedIn(true)
    setAdminEmail(email)
  }

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setAdminEmail(null)
    setCurrentView('public')
  }

  return (
    <div className="min-h-screen bg-black text-sand font-interface flex flex-col selection:bg-cypress selection:text-white">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdminLoggedIn={isAdminLoggedIn}
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'public' && <PublicHomepage />}
        {currentView === 'admin' && (
          <>
            {isAdminLoggedIn ? (
              <AdminDashboard onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-cypress/40 bg-[#050807] py-8 text-sand/60 text-xs font-interface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="font-display font-extrabold uppercase text-sand text-sm block">
              BGMI Championship Series
            </span>
            <span className="text-[11px] text-sand/40 block mt-0.5">
              Official 2-Stage Tournament Platform • Brand Palette: Cypress Green & Sand
            </span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-sand/40">
            <span>Deterministic Scoring • High-Res PNG Exports • Supabase Security</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
