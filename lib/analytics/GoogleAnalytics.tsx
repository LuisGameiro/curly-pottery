'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { useConsent } from '@lib/hooks/useConsent'
import { hasAnalyticsConsent } from '@lib/consent-utils'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (command: string, ...args: unknown[]) => void
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export function GoogleAnalytics() {
  const { consent } = useConsent()
  const isInitialized = useRef(false)

  useEffect(() => {
    const shouldTrack = hasAnalyticsConsent(consent)

    if (shouldTrack && GA_ID && !isInitialized.current) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtagFn(...args: unknown[]) {
        window.dataLayer.push(args)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_ID)
      isInitialized.current = true
    } else if (!shouldTrack && isInitialized.current) {
      window.gtag('set', 'allow_ad_personalization', false)
      window.gtag('set', 'allow_analytics', false)
      isInitialized.current = false
    }
  }, [consent])

  if (!GA_ID || !hasAnalyticsConsent(consent)) return null

  return (
    <Script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
    />
  )
}
