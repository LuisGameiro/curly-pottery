'use client'

import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { useConsent } from '@lib/hooks/useConsent'
import { hasAnalyticsConsent } from '@lib/consent-utils'
import type posthogJs from 'posthog-js'

export function PHProvider({ children }: { children: React.ReactNode }) {
  const { consent } = useConsent()
  const [client, setClient] = useState<typeof posthogJs | null>(null)

  // posthog-js (~40KB) is only loaded once the visitor consents, so it never
  // ships to users who decline tracking.
  useEffect(() => {
    const shouldTrack = hasAnalyticsConsent(consent)

    if (shouldTrack && !client) {
      let cancelled = false
      import('posthog-js')
        .then(({ default: posthog }) => {
          if (cancelled) return
          try {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
              api_host: '/ingest',
              ui_host: 'https://eu.posthog.com',
              person_profiles: 'always',
              capture_pageview: false,
            })
            setClient(posthog)
          } catch (e) {
            console.error('PostHog init error:', e)
          }
        })
        .catch((e) => {
          console.error('Failed to load PostHog:', e)
        })
      return () => {
        cancelled = true
      }
    }

    if (!shouldTrack && client) {
      client.opt_out_capturing()
      setClient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consent])

  if (!client) return <>{children}</>
  return <PostHogProvider client={client}>{children}</PostHogProvider>
}
