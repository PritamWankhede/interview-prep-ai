import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'

import { SessionProvider } from '@/components/shared/SessionProvider'

import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'InterviewPrep AI',
    template: '%s | InterviewPrep AI',
  },
  description:
    'AI-powered interview preparation platform. Practice questions, get instant feedback, and track your progress.',
  keywords: ['interview prep', 'AI feedback', 'coding interview', 'system design'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  )
}
