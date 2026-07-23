import { ConsentPreferences } from './hooks/useConsent'

export function hasAnalyticsConsent(consent: ConsentPreferences): boolean {
  return consent.analytics === true
}

export function hasMarketingConsent(consent: ConsentPreferences): boolean {
  return consent.marketing === true
}
