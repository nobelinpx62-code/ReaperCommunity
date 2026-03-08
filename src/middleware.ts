import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Pegar Sessão do Supabase
  const { data: { session } } = await supabase.auth.getSession()

  // Se não estiver logado e tentar acessar algo interno, manda pro login
  // (O login agora será pelo botão do Discord via Supabase Auth)
  if (!session && !req.nextUrl.pathname.startsWith('/login') && req.nextUrl.pathname !== '/') {
    // return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
