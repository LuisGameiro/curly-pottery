import '../globals.css'
import 'keen-slider/keen-slider.min.css'

import { Layout } from '@components/common'
import { Providers } from '@components/common/Providers/Providers'
import { GoogleAnalytics } from '@lib/analytics/GoogleAnalytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="loading bg-primary">
        <Providers>
          <GoogleAnalytics />
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
