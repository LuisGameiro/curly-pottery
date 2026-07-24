import { hasAnalyticsConsent, hasMarketingConsent } from './consent-utils'
import type { ConsentPreferences } from './hooks/useConsent'

describe('hasAnalyticsConsent', () => {
  it('should return true when analytics is true', () => {
    const consent: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: false,
    }
    expect(hasAnalyticsConsent(consent)).toBe(true)
  })

  it('should return false when analytics is false', () => {
    const consent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    expect(hasAnalyticsConsent(consent)).toBe(false)
  })
})

describe('hasMarketingConsent', () => {
  it('should return true when marketing is true', () => {
    const consent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: true,
    }
    expect(hasMarketingConsent(consent)).toBe(true)
  })

  it('should return false when marketing is false', () => {
    const consent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    expect(hasMarketingConsent(consent)).toBe(false)
  })
})
