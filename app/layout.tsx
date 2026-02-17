// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { LogoutButton } from '@/app/components/LogoutButton'
import GlassSurface from '@/app/components/GlassSurface'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SSW Leaderboard',
  description: 'Solace Speed Week Time Attack',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const isLoggedIn = !!session
  const role = session?.role as string | undefined

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0e0e12] selection:bg-indigo-500/30`}>
        <main className="container mx-auto px-4 py-8 relative z-10 pt-4">
            {children}
        </main>
      </body>
    </html>
  )
}
