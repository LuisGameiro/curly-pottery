'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useRef } from 'react'
import { useConsent, hasAnalyticsConsent } from '@lib/hooks/useConsent'

export function PHProvider({ children }: { children: React.ReactNode }) {
  const { consent } = useConsent()
  const isInitialized = useRef(false)

  useEffect(() => {
    const shouldTrack = hasAnalyticsConsent(consent)
    
    if (shouldTrack && !isInitialized.current) {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
          api_host: '/ingest',
          ui_host: 'https://eu.posthog.com',
          person_profiles: 'always',
          capture_pageview: false,
        })
        isInitialized.current = true
      } catch (e) {
        console.error('PostHog init error:', e)
      }
    } else if (!shouldTrack && isInitialized.current) {
      posthog.opt_out_capturing()
      isInitialized.current = false
    }
  }, [consent])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}