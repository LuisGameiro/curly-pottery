'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cookie-consent')
      const hasConsent = saved ? JSON.parse(saved).analytics : false

      if (hasConsent && !posthog.__loaded) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
          api_host: '/ingest',
          ui_host: 'https://eu.posthog.com',
          person_profiles: 'always',
          capture_pageview: false,
        })
      }
    } catch (e) {
      console.warn('Analytics blocked by browser extension', e)
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
