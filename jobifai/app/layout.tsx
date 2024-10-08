import { ClerkProvider } from '@clerk/nextjs'
import { Header } from '@/components/header'
import { UserProvider } from '@/components/user-provider'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobifAI',
  description: 'Your AI-powered job search assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <UserProvider>
        <html lang="en">
          <body className={inter.className}>
            <Header />
            {children}
          </body>
        </html>
      </UserProvider>
    </ClerkProvider>
  )
}
