import React, { lazy, Suspense, useState } from 'react'
import { Navbar } from './components/layout/Navbar'
import { PublicHomepage } from './pages/public/PublicHomepage'
import { supabase } from './lib/supabase'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
)

const AdminLogin = lazy(() =>
  import('./pages/admin/AdminLogin').then((m) => ({
    default: m.AdminLogin,
  }))
)

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // Securely verify admin session against public.admin_users
  const verifyAdminSession = React.useCallback(async (user: { id: string; email?: string | null } | null) => {
    if (!user) {
      setIsAdminLoggedIn(false)
      setAdminEmail(null)
      setIsAuthChecking(false)
      return
    }

    try {
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()

      if (adminError || !adminRecord || !['admin', 'superadmin'].includes(adminRecord.role)) {
        setIsAdminLoggedIn(false)
        setAdminEmail(null)
      } else {
        setIsAdminLoggedIn(true)
        setAdminEmail(user.email ?? 'admin')
      }
    } catch (err) {
      console.error('Session verification error:', err)
      setIsAdminLoggedIn(false)
      setAdminEmail(null)
    } finally {
      setIsAuthChecking(false)
    }
  }, [])

  // Restore session on mount and listen to auth changes safely
  React.useEffect(() => {
    let isMounted = true

    // 1. Initial session check on mount/refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      verifyAdminSession(session?.user ?? null)
    }).catch(() => {
      if (!isMounted) return
      setIsAdminLoggedIn(false)
      setIsAuthChecking(false)
    })

    // 2. Auth state subscription (Avoid awaiting supabase queries inside callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return
      if (event === 'SIGNED_OUT' || !session) {
        setIsAdminLoggedIn(false)
        setAdminEmail(null)
        setIsAuthChecking(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Defer database check to avoid deadlock inside onAuthStateChange
        setTimeout(() => {
          if (isMounted) {
            verifyAdminSession(session.user)
          }
        }, 0)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [verifyAdminSession])

  const handleAdminLogin = (email: string) => {
    setIsAdminLoggedIn(true)
    setAdminEmail(email)
  }

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsAdminLoggedIn(false)
      setAdminEmail(null)
      setCurrentView('public')
    }
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
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-sand">
              Loading tournament panel...
            </div>
          }
        >
          {currentView === 'public' && <PublicHomepage />}

          {currentView === 'admin' &&
            (isAuthChecking ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-sand">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="font-interface text-xs uppercase tracking-widest text-sand/70">
                  Verifying administrator credentials...
                </p>
              </div>
            ) : isAdminLoggedIn ? (
              <AdminDashboard onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLogin} />
            ))}
        </Suspense>
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
