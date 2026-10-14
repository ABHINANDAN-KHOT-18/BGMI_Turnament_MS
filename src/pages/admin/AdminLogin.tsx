import React, { useState } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError || !data.user) {
        setError('Invalid email or password.')
        return
      }

      const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (
        adminError ||
        !admin ||
        !['admin', 'superadmin'].includes(admin.role)
      ) {
        console.error('Admin authorization check failed:', {
          code: adminError?.code,
          message: adminError?.message,
          userId: data.user.id,
        })

        await supabase.auth.signOut()

        setError('Access denied: Unauthorized account or insufficient administrator privileges.')
        return
      }

      onLoginSuccess(data.user.email ?? email.trim())
    } catch {
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0a0f0d] border border-cypress rounded-xl p-8 shadow-2xl text-sand space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-cypress/80 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
            <Lock className="w-6 h-6 text-sand" />
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-wider text-sand">
            Admin <span className="text-emerald-400">Authentication</span>
          </h2>
          <p className="font-interface text-xs text-sand/60 uppercase tracking-widest">
            Restricted Tournament Official Access
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-800 rounded flex items-center gap-2 text-red-200 text-xs font-interface">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-interface uppercase tracking-wider text-sand/80 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bgmitournament.com"
              className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-interface uppercase tracking-wider text-sand/80 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cypress text-white font-interface font-bold uppercase tracking-wider rounded hover:bg-[#003833] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Verifying...' : 'Sign In To Dashboard'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] font-interface text-sand/50">
            Authorized tournament administrators only.
          </p>
        </div>
      </div>
    </div>
  )
}
