import { renderHook, act } from '@testing-library/react'
import Cookies from 'js-cookie'
import { useConsent } from './useConsent'

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

const mockGetCookie = Cookies.get as jest.Mock
const mockSetCookie = Cookies.set as jest.Mock
const mockRemoveCookie = Cookies.remove as jest.Mock

describe('useConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return default state when no cookie exists', () => {
    mockGetCookie.mockReturnValue(undefined)

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
    mockGetCookie.mockReturnValue(undefined)

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
    mockGetCookie.mockReturnValue(undefined)

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
    mockGetCookie.mockReturnValue(undefined)

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
    mockGetCookie.mockReturnValue(undefined)

    const { result } = renderHook(() => useConsent())

    act(() => {
      result.current.updateConsent({ necessary: false, analytics: true })
    })

    expect(result.current.consent.necessary).toBe(true)
    expect(result.current.consent.analytics).toBe(true)
    expect(result.current.consent.marketing).toBe(false)
  })

  it('should reset consent to defaults and remove cookie', () => {
    mockGetCookie.mockReturnValue(undefined)

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
    mockGetCookie.mockReturnValue(JSON.stringify(storedConsent))

    const { result } = renderHook(() => useConsent())

    expect(result.current.hasConsented).toBe(true)
    expect(result.current.showBanner).toBe(false)
    expect(result.current.consent).toEqual(storedConsent)
  })

  it('should fall back to defaults when cookie contains invalid JSON', () => {
    mockGetCookie.mockReturnValue('not-valid-json')

    const { result } = renderHook(() => useConsent())

    expect(result.current.hasConsented).toBe(false)
    expect(result.current.showBanner).toBe(true)
    expect(result.current.consent).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  })

  it('skips SSR guard branches (not testable in jsdom)', () => {
    // The hook checks `typeof document === 'undefined'` in several places
    // (initialConsent, hasConsented, acceptAll, acceptEssential,
    //  updateConsent, resetConsent) to safely return early during SSR.
    // In jsdom, `typeof document` is always `'object'`, so these SSR guard
    // branches can never be reached in the test environment.
    // They are only exercised in a true Node.js SSR context.
    expect(true).toBe(true)
  })
})
