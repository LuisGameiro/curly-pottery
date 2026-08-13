import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import Cookies from 'js-cookie'
import { useConsent } from './useConsent'

// In-memory cookie jar so `set`/`remove` are visible to subsequent `get`
// calls, mirroring how document.cookie behaves in the browser.
const mockCookieJar = new Map<string, string>()

jest.mock('js-cookie', () => ({
  get: jest.fn((name: string) => mockCookieJar.get(name)),
  set: jest.fn((name: string, value: string) => {
    mockCookieJar.set(name, value)
  }),
  remove: jest.fn((name: string) => {
    mockCookieJar.delete(name)
  }),
}))

const mockSetCookie = Cookies.set as jest.Mock
const mockRemoveCookie = Cookies.remove as jest.Mock

describe('useConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieJar.clear()
  })

  it('should return default state when no cookie exists', () => {
    const { result } = renderHook(() => useConsent())

    expect(result.current.hasConsented).toBe(false)
    expect(result.current.showBanner).toBe(true)
    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  })

  it('should set all consents to true and save cookie on acceptAll', () => {
    const { result } = renderHook(() => useConsent())

    act(() => {
      result.current.acceptAll()
    })

    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
    })
    expect(result.current.hasConsented).toBe(true)
    expect(result.current.showBanner).toBe(false)
    expect(mockSetCookie).toHaveBeenCalledWith(
      'cookie-consent',
      JSON.stringify({ necessary: true, analytics: true, marketing: true }),
      { expires: expect.any(Number), sameSite: 'lax' },
    )
  })

  it('should set only essential consents on acceptEssential', () => {
    const { result } = renderHook(() => useConsent())

    act(() => {
      result.current.acceptEssential()
    })

    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    })
    expect(result.current.hasConsented).toBe(true)
    expect(mockSetCookie).toHaveBeenCalledWith(
      'cookie-consent',
      JSON.stringify({ necessary: true, analytics: false, marketing: false }),
      { expires: expect.any(Number), sameSite: 'lax' },
    )
  })

  it('should update partial preferences via updateConsent', () => {
    const { result } = renderHook(() => useConsent())

    act(() => {
      result.current.updateConsent({ analytics: true })
    })

    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    })
    expect(mockSetCookie).toHaveBeenCalledWith(
      'cookie-consent',
      JSON.stringify({ necessary: true, analytics: true, marketing: false }),
      { expires: expect.any(Number), sameSite: 'lax' },
    )
  })

  it('should force necessary to true even if updateConsent attempts to set it false', () => {
    const { result } = renderHook(() => useConsent())

    act(() => {
      result.current.updateConsent({ necessary: false, analytics: true })
    })

    expect(result.current.consent.necessary).toBe(true)
    expect(result.current.consent.analytics).toBe(true)
    expect(result.current.consent.marketing).toBe(false)
  })

  it('should reset consent to defaults and remove cookie', () => {
    const { result } = renderHook(() => useConsent())

    // Prime the hook state by accepting all first
    act(() => {
      result.current.acceptAll()
    })
    expect(result.current.hasConsented).toBe(true)

    act(() => {
      result.current.resetConsent()
    })

    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    })
    expect(result.current.hasConsented).toBe(false)
    expect(result.current.showBanner).toBe(true)
    expect(mockRemoveCookie).toHaveBeenCalledWith('cookie-consent')
  })

  it('should restore state from an existing cookie', () => {
    const storedConsent = { necessary: true, analytics: true, marketing: false }
    mockCookieJar.set('cookie-consent', JSON.stringify(storedConsent))

    const { result } = renderHook(() => useConsent())

    expect(result.current.hasConsented).toBe(true)
    expect(result.current.showBanner).toBe(false)
    expect(result.current.consent).toEqual(storedConsent)
  })

  it('should fall back to defaults when cookie contains invalid JSON', () => {
    mockCookieJar.set('cookie-consent', 'not-valid-json')

    const { result } = renderHook(() => useConsent())

    expect(result.current.hasConsented).toBe(false)
    expect(result.current.showBanner).toBe(true)
    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  })

  it('renders defaults on the server even when a consent cookie exists', () => {
    mockCookieJar.set(
      'cookie-consent',
      JSON.stringify({ necessary: true, analytics: true, marketing: false }),
    )

    function Probe() {
      const { consent, hasConsented, showBanner } = useConsent()
      return createElement('div', {
        'data-necessary': String(consent.necessary),
        'data-analytics': String(consent.analytics),
        'data-marketing': String(consent.marketing),
        'data-has-consented': String(hasConsented),
        'data-show-banner': String(showBanner),
      })
    }

    const html = renderToString(createElement(Probe))

    expect(html).toContain('data-necessary="true"')
    expect(html).toContain('data-analytics="false"')
    expect(html).toContain('data-marketing="false"')
    expect(html).toContain('data-has-consented="false"')
    expect(html).toContain('data-show-banner="false"')
  })
})
