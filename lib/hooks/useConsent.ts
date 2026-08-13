'use client'

import { useCallback, useSyncExternalStore } from 'react'
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

// The consent cookie is an external store that must only be read on the
// client after hydration. Reading it during render would make the server
// HTML disagree with the client for visitors who already have a consent
// cookie, causing React hydration errors. useSyncExternalStore solves this:
// the server (and the initial hydration render) uses getServerSnapshot,
// which never touches cookies, and the real value is read afterwards.
let cachedConsent: ConsentPreferences | null | undefined
let cachedCookie: string | undefined

const consentListeners = new Set<() => void>()

function subscribeConsent(listener: () => void) {
  consentListeners.add(listener)
  return () => {
    consentListeners.delete(listener)
  }
}

function getConsentSnapshot(): ConsentPreferences | null {
  const stored = Cookies.get(CONSENT_COOKIE_NAME)
  if (stored !== cachedCookie) {
    cachedCookie = stored
    cachedConsent = getStoredConsent()
  }
  return cachedConsent ?? null
}

function getConsentServerSnapshot(): ConsentPreferences | null {
  return null
}

function setConsentCookie(consent: ConsentPreferences) {
  const serialized = JSON.stringify(consent)
  Cookies.set(CONSENT_COOKIE_NAME, serialized, {
    expires: CONSENT_COOKIE_MAX_AGE / 86400,
    sameSite: 'lax',
  })
  cachedCookie = serialized
  cachedConsent = consent
  consentListeners.forEach((listener) => listener())
}

function removeConsentCookie() {
  Cookies.remove(CONSENT_COOKIE_NAME)
  cachedCookie = undefined
  cachedConsent = null
  consentListeners.forEach((listener) => listener())
}

function subscribeHydration() {
  return () => {}
}

export function useConsent() {
  // Flips to true right after hydration, so cookie-consent UI only renders on
  // the client. The initial hydration render matches the server HTML exactly.
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  )

  const storedConsent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  )

  const consent = storedConsent ?? DEFAULT_CONSENT
  const hasConsented = storedConsent !== null

  const acceptAll = useCallback(() => {
    setConsentCookie({ necessary: true, analytics: true, marketing: true })
  }, [])

  const acceptEssential = useCallback(() => {
    setConsentCookie({ necessary: true, analytics: false, marketing: false })
  }, [])

  const updateConsent = useCallback(
    (preferences: Partial<ConsentPreferences>) => {
      setConsentCookie({ ...consent, ...preferences, necessary: true })
    },
    [consent],
  )

  const resetConsent = useCallback(() => {
    removeConsentCookie()
  }, [])

  return {
    consent,
    hasConsented,
    showBanner: !hasConsented && isHydrated,
    acceptAll,
    acceptEssential,
    updateConsent,
    resetConsent,
  }
}
