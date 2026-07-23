'use client'

import { useState, useCallback, useMemo } from 'react'
import Cookies from 'js-cookie'

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

function getStoredConsent(): ConsentPreferences | null {
  const stored = Cookies.get(CONSENT_COOKIE_NAME)
  if (!stored) return null
  try {
    return JSON.parse(stored) as ConsentPreferences
  } catch {
    return null
  }
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
    Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(newConsent), {
      expires: CONSENT_COOKIE_MAX_AGE / 86400,
      sameSite: 'lax',
    })
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
    Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(newConsent), {
      expires: CONSENT_COOKIE_MAX_AGE / 86400,
      sameSite: 'lax',
    })
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
      Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(newConsent), {
        expires: CONSENT_COOKIE_MAX_AGE / 86400,
        sameSite: 'lax',
      })
    },
    [consent, isClient],
  )

  const resetConsent = useCallback(() => {
    if (!isClient) return
    Cookies.remove(CONSENT_COOKIE_NAME)
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
