import { renderHook, act } from '@testing-library/react'
import Cookies from 'js-cookie'
import { useAcceptCookies } from './useAcceptCookies'

jest.mock('js-cookie')

describe('useAcceptCookies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with false when cookie is not set', () => {
    ;(Cookies.get as jest.Mock).mockReturnValue(undefined)

    const { result } = renderHook(() => useAcceptCookies())

    expect(result.current.acceptedCookies).toBe(false)
  })

  it('should initialize with true when cookie is already set', () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('accepted')

    const { result } = renderHook(() => useAcceptCookies())

    expect(result.current.acceptedCookies).toBe(true)
  })

  it('should set cookie when acceptCookies is called', () => {
    ;(Cookies.get as jest.Mock).mockReturnValue(undefined)

    const { result } = renderHook(() => useAcceptCookies())

    act(() => {
      result.current.onAcceptCookies()
    })

    expect(Cookies.set).toHaveBeenCalledWith('accept_cookies', 'accepted', {
      expires: 365,
    })
    expect(result.current.acceptedCookies).toBe(true)
  })

  it('should return false when window is undefined', () => {
    const originalWindow = global.window
    ;(global as { window?: Window }).window = undefined

    const { result } = renderHook(() => useAcceptCookies())

    expect(result.current.acceptedCookies).toBe(false)
    global.window = originalWindow
  })
})
