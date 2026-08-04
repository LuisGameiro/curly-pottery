import '../globals.css'
import 'keen-slider/keen-slider.min.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Layout } from '@components/common'
import { Providers } from '@components/common/Providers/Providers'
import { GoogleAnalytics } from '@lib/analytics/GoogleAnalytics'

const josefinSans = localFont({
  src: [
    {
      path: '../public/JosefinSans-VariableFont_wght.ttf',
      style: 'normal',
    },
    {
      path: '../public/JosefinSans-Italic-VariableFont_wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-josefin-sans',
  display: 'swap',
})

const grandHotel = localFont({
  src: '../public/GrandHotel-Regular.ttf',
  variable: '--font-grand-hotel',
  display: 'swap',
})

// Versioned favicon URL so browsers fetch the new icon instead of their
// aggressively-cached copy of /favicon.ico. Bump ?v= whenever the icon changes.
export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/favicon.ico?v=2', sizes: 'any', type: 'image/x-icon' }],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${josefinSans.variable} ${grandHotel.variable}`}
    >
      <body className="bg-linear-to-r from-background to-accent-2">
        <Providers>
          <GoogleAnalytics />
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
