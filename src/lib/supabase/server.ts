import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Récupère le user_id de l'utilisateur connecté.
 * getSession/getUser ne fonctionnent pas avec le format sb_publishable_*.
 *
 * Stratégie :
 * 1. Requête DB via RLS : si auth.uid() est valide, la ligne settings est retournée
 * 2. Parse direct du JWT dans les cookies : fonctionne même sans ligne settings
 */
export async function getCurrentUserId(): Promise<string | null> {
  // Méthode 1 : requête DB via RLS (fiable si la ligne settings existe)
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('settings').select('user_id').maybeSingle()
    if (data?.user_id) return data.user_id
  } catch {}

  // Méthode 2 : lecture directe du JWT dans les cookies Supabase
  try {
    const cookieStore = await cookies()
    for (const cookie of cookieStore.getAll()) {
      if (!cookie.name.includes('auth-token')) continue
      const raw = cookie.value

      // Cookie non-chunké : base64url JSON ou base64 JSON
      let sessionJson: string | null = null
      if (raw.startsWith('{') || raw.startsWith('[')) {
        sessionJson = raw
      } else {
        try {
          const decoded = Buffer.from(raw, 'base64').toString('utf8')
          if (decoded.startsWith('{')) sessionJson = decoded
        } catch {}
      }

      if (sessionJson) {
        const session = JSON.parse(sessionJson)
        if (session?.user?.id) return session.user.id as string
        // Extraire sub du JWT access_token
        const token: string = session?.access_token ?? ''
        if (token) {
          const parts = token.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
            if (payload.sub) return payload.sub as string
          }
        }
      }
    }
  } catch {}

  return null
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                // Sur HTTP (localhost dev), les cookies Secure ne fonctionnent pas
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              })
            )
          } catch {
            // Ignoré dans les Server Components (lecture seule)
          }
        },
      },
    }
  )
}
