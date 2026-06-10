import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Vérification de session : getSession() lit les cookies localement (pas de réseau)
  // Plus fiable que getUser() avec le format sb_publishable_* sur localhost
  let user = null
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    user = sessionData.session?.user ?? null
  } catch {}
  if (!user) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      user = userData.user ?? null
    } catch {}
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register') ||
                     request.nextUrl.pathname.startsWith('/auth/') ||
                     request.nextUrl.pathname.startsWith('/forgot-password')

  // La page de réinitialisation doit rester accessible avec ou sans session
  // (le lien email établit une session de récupération à traiter côté client)
  const isResetPasswordPage = request.nextUrl.pathname.startsWith('/reset-password')

  // Ne pas bloquer les appels de server actions (header Next-Action présent)
  const isServerAction = request.headers.has('next-action')

  if (!user && !isAuthPage && !isResetPasswordPage && !isServerAction) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isResetPasswordPage) {
    return supabaseResponse
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
