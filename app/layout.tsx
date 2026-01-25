'use client'

import '../globals.css'
import 'keen-slider/keen-slider.min.css'

import { Layout } from '@components/common'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { PHProvider } from '@lib/analytics/posthogProvider'
import { GoogleAnalytics } from '@lib/analytics/GoogleAnalytics'
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <PHProvider>
        <head />

        <body className="loading bg-primary">
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              themes={['light', 'dark']}
            >
              <GoogleAnalytics />
              <Layout>{children}</Layout>
            </ThemeProvider>

            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-ZG8YLH673J"
              strategy="afterInteractive"
            />

            <Script id="google-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZG8YLH673J');
          `}
            </Script>
          </SessionProvider>
        </body>
      </PHProvider>
    </html>
  )
}
