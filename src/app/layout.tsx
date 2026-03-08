import type { Metadata } from 'next'
import './globals.css'
import ThreeBackground from '@/components/ThreeBackground'
import Header from '@/components/Header'
import Preloader from '@/components/Preloader'
import ClickSound from '@/components/ClickSound'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'REAPER COMMUNITY',
  description: 'Comunidade Root do Reaper - Arquivos e Mocks',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="pt-BR">
      <body>
        <ClickSound />
        <ThreeBackground />
        <Preloader>
          <Header session={session as any} />
          {children}
        </Preloader>
      </body>
    </html>
  )
}
