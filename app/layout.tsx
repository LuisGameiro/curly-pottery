'use client'

import '../globals.css'
import 'keen-slider/keen-slider.min.css'

import { Layout } from '@components/common'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { PHProvider } from '@lib/analytics/posthogProvider'
import { GoogleAnalytics } from '@lib/analytics/GoogleAnalytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <PHProvider>
        <head>
          <GoogleAnalytics />
        </head>
        <body className="loading bg-primary">
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              themes={['light', 'dark']}
            >
              <Layout>{children}</Layout>
            </ThemeProvider>
          </SessionProvider>
        </body>
      </PHProvider>
    </html>
  )
}
