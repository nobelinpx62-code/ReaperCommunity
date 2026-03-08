import type { Metadata } from 'next'
import './globals.css'
import ThreeBackground from '@/components/ThreeBackground'
import { auth } from '@/auth'
import Header from '@/components/Header'
import Preloader from '@/components/Preloader'
import ClickSound from '@/components/ClickSound'

export const metadata: Metadata = {
  title: 'REAPER COMMUNITY',
  description: 'The Ultimate Hype Social Network for Reaper',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <ClickSound />
        <ThreeBackground />
        <Preloader>
          <Header session={session} />
          {children}
        </Preloader>
      </body>
    </html>
  )
}
