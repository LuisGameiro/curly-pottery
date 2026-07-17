import '../globals.css'
import 'keen-slider/keen-slider.min.css'

import { Layout } from '@components/common'
import { Providers } from '@components/common/Providers/Providers'
import { GoogleAnalytics } from '@lib/analytics/GoogleAnalytics'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-linear-to-r from-background to-accent-2">
        <Providers>
          <GoogleAnalytics />
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
