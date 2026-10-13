import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationFormSchema, type RegistrationFormData } from '../../lib/validation'
import { CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitSuccess: (team: {
    team_name: string
    igl_name: string
    igl_bgmi_uid: string
    whatsapp_number: string
    player_2_bgmi_id: string
    player_3_bgmi_id: string
    player_4_bgmi_id: string
  }) => Promise<{ id: string }>
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successReference, setSuccessReference] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
  })

  if (!isOpen) return null

  const handleFormSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const savedTeam = await onSubmitSuccess(data)
      setSuccessReference(`BGMI-REG-${savedTeam.id}`)
      reset()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Failed to submit registration. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a0f0d] border border-cypress rounded-lg p-6 sm:p-8 text-sand shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cypress/40 mb-6">
          <div>
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-wider text-sand">
              Squad <span className="text-emerald-400">Registration</span>
            </h2>
            <p className="font-interface text-xs text-sand/60 uppercase tracking-widest mt-0.5">
              4-Player Squad • No Player Account Required
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-sand/50 hover:text-white font-interface text-xl p-1"
          >
            ✕
          </button>
        </div>

        {successReference ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="font-display text-xl font-bold uppercase text-white">
              Squad Registration Submitted!
            </h3>
            <p className="font-interface text-sm text-sand/80 max-w-md mx-auto">
              Your registration is under review with tournament officials. Your registration ID is:
            </p>
            <div className="inline-block p-3 bg-cypress/40 border border-emerald-500/50 rounded font-interface text-lg font-bold text-emerald-300 tracking-wider">
              {successReference}
            </div>
            <p className="font-interface text-xs text-sand/50">
              Only authorized tournament administrators can view private contact credentials.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSuccessReference(null)
                  onClose()
                }}
                className="px-6 py-2.5 bg-cypress text-white font-interface font-bold uppercase tracking-wider rounded hover:bg-[#003833]"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/70 border border-red-800 rounded flex items-center space-x-2 text-red-200 text-xs font-interface">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Team Name */}
            <div>
              <label className="block font-interface text-xs uppercase tracking-wider text-sand/80 mb-1">
                Squad / Team Name *
              </label>
              <input
                {...register('team_name')}
                placeholder="e.g. CYPRESS WARRIORS"
                className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-sm focus:outline-none focus:border-emerald-400"
              />
              {errors.team_name && (
                <p className="text-red-400 text-xs mt-1 font-interface">{errors.team_name.message}</p>
              )}
            </div>

            {/* In-Game Leader Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-interface text-xs uppercase tracking-wider text-sand/80 mb-1">
                  IGL In-Game Name *
                </label>
                <input
                  {...register('igl_name')}
                  placeholder="e.g. ApexHunter"
                  className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-sm focus:outline-none focus:border-emerald-400"
                />
                {errors.igl_name && (
                  <p className="text-red-400 text-xs mt-1 font-interface">{errors.igl_name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-interface text-xs uppercase tracking-wider text-sand/80 mb-1">
                  IGL BGMI UID *
                </label>
                <input
                  {...register('igl_bgmi_uid')}
                  placeholder="e.g. 5182930192"
                  className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-sm focus:outline-none focus:border-emerald-400"
                />
                {errors.igl_bgmi_uid && (
                  <p className="text-red-400 text-xs mt-1 font-interface">{errors.igl_bgmi_uid.message}</p>
                )}
              </div>
            </div>

            {/* Contact Details (Confidential) */}
            <div>
              <label className="block font-interface text-xs uppercase tracking-wider text-sand/80 mb-1 flex items-center justify-between">
                <span>IGL WhatsApp Number *</span>
                <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Private (Admin-Only)
                </span>
              </label>
              <input
                {...register('whatsapp_number')}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-sm focus:outline-none focus:border-emerald-400"
              />
              {errors.whatsapp_number && (
                <p className="text-red-400 text-xs mt-1 font-interface">{errors.whatsapp_number.message}</p>
              )}
            </div>

            {/* Teammates BGMI UIDs */}
            <div className="pt-2 border-t border-cypress/30">
              <span className="block font-interface text-xs uppercase tracking-widest text-emerald-400 mb-2">
                Squad Members BGMI UIDs
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-interface text-[11px] text-sand/70 mb-1">Player 2 UID *</label>
                  <input
                    {...register('player_2_bgmi_id')}
                    placeholder="UID"
                    className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-xs focus:outline-none focus:border-emerald-400"
                  />
                  {errors.player_2_bgmi_id && (
                    <p className="text-red-400 text-[10px] mt-1 font-interface">{errors.player_2_bgmi_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-interface text-[11px] text-sand/70 mb-1">Player 3 UID *</label>
                  <input
                    {...register('player_3_bgmi_id')}
                    placeholder="UID"
                    className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-xs focus:outline-none focus:border-emerald-400"
                  />
                  {errors.player_3_bgmi_id && (
                    <p className="text-red-400 text-[10px] mt-1 font-interface">{errors.player_3_bgmi_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-interface text-[11px] text-sand/70 mb-1">Player 4 UID *</label>
                  <input
                    {...register('player_4_bgmi_id')}
                    placeholder="UID"
                    className="w-full px-3 py-2 bg-black border border-cypress/60 rounded text-white font-interface text-xs focus:outline-none focus:border-emerald-400"
                  />
                  {errors.player_4_bgmi_id && (
                    <p className="text-red-400 text-[10px] mt-1 font-interface">{errors.player_4_bgmi_id.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-sand/30 text-sand/70 rounded font-interface text-xs uppercase hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-cypress text-white font-interface font-bold text-xs uppercase tracking-wider rounded hover:bg-[#003833] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Submit Squad'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
