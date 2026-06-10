import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Empêche la connexion automatique via un ?code= présent dans l'URL
        // (ex: lien de confirmation d'email) — l'utilisateur doit se reconnecter
        // manuellement avec ses identifiants après confirmation.
        detectSessionInUrl: false,
      },
    }
  )
}
