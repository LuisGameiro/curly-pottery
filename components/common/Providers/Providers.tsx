'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { PHProvider } from '@lib/analytics/posthogProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={['light', 'dark']}
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </PHProvider>
  )
}
