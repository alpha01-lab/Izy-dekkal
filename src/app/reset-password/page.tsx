'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PasswordInput } from '@/components/ui/password-input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setMessage({ type: 'error', text: "Le lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau." })
        }
        setReady(true)
      })
    } else {
      setReady(true)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string

    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' })
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
        return
      }
      await supabase.auth.signOut()
      router.push('/login?reset=success')
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
          <p className="text-gray-500 text-sm">Choisissez un nouveau mot de passe</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Nouveau mot de passe</h1>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <PasswordInput name="password" required minLength={6} placeholder="Minimum 6 caractères" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <PasswordInput name="confirmPassword" required placeholder="••••••••" />
            </div>

            <button
              type="submit"
              disabled={isPending || !ready}
              className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
