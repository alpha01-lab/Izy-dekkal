'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
        return
      }
      setMessage({ type: 'success', text: 'Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.' })
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-dark)' }}>
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>Dëkkal</span>
          </div>
          <p className="text-gray-500 text-sm">Réinitialisez votre mot de passe</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500 mb-6">
            Saisissez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm border ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="vous@exemple.sn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isPending ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="font-medium" style={{ color: 'var(--primary)' }}>
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
