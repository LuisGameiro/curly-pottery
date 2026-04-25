'use client'

import { useState, useCallback, useMemo } from 'react'

export interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const CONSENT_COOKIE_NAME = 'cookie-consent'
const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60

function parseCookieValue(
  value: string | undefined,
): ConsentPreferences | null {
  if (!value) return null
  try {
    return JSON.parse(value) as ConsentPreferences
  } catch {
    return null
  }
}

function getCookieClient(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (match) return match[2]
  return undefined
}

function setCookieClient(
  name: string,
  value: string,
  maxAge: number,
  sameSite: 'strict' | 'lax' | 'none' = 'lax',
): void {
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString()
  document.cookie = `${name}=${value};expires=${expires};path=/;max-age=${maxAge};SameSite=${sameSite}`
}

function deleteCookieClient(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

function getStoredConsent(): ConsentPreferences | null {
  const stored = getCookieClient(CONSENT_COOKIE_NAME)
  return parseCookieValue(stored)
}

export function useConsent() {
  const initialConsent = useMemo(() => {
    if (typeof document === 'undefined') return DEFAULT_CONSENT
    return getStoredConsent() ?? DEFAULT_CONSENT
  }, [])

  const [consent, setConsent] = useState<ConsentPreferences>(initialConsent)
  const [hasConsented, setHasConsented] = useState(() => {
    if (typeof document === 'undefined') return false
    return getStoredConsent() !== null
  })

  const isClient = typeof document !== 'undefined'

  const acceptAll = useCallback(() => {
    if (!isClient) return
    const newConsent: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setConsent(newConsent)
    setCookieClient(
      CONSENT_COOKIE_NAME,
      JSON.stringify(newConsent),
      CONSENT_COOKIE_MAX_AGE,
    )
    setHasConsented(true)
  }, [isClient])

  const acceptEssential = useCallback(() => {
    if (!isClient) return
    const newConsent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setConsent(newConsent)
    setCookieClient(
      CONSENT_COOKIE_NAME,
      JSON.stringify(newConsent),
      CONSENT_COOKIE_MAX_AGE,
    )
    setHasConsented(true)
  }, [isClient])

  const updateConsent = useCallback(
    (preferences: Partial<ConsentPreferences>) => {
      if (!isClient) return
      const newConsent: ConsentPreferences = {
        ...consent,
        ...preferences,
        necessary: true,
      }
      setConsent(newConsent)
      setCookieClient(
        CONSENT_COOKIE_NAME,
        JSON.stringify(newConsent),
        CONSENT_COOKIE_MAX_AGE,
      )
    },
    [consent, isClient],
  )

  const resetConsent = useCallback(() => {
    if (!isClient) return
    deleteCookieClient(CONSENT_COOKIE_NAME)
    setConsent(DEFAULT_CONSENT)
    setHasConsented(false)
  }, [isClient])

  return {
    consent,
    hasConsented,
    showBanner: !hasConsented,
    acceptAll,
    acceptEssential,
    updateConsent,
    resetConsent,
  }
}

export function hasAnalyticsConsent(consent: ConsentPreferences): boolean {
  return consent.analytics === true
}

export function hasMarketingConsent(consent: ConsentPreferences): boolean {
  return consent.marketing === true
}
