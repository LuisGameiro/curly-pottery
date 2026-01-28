import { renderHook } from '@testing-library/react'
import { useToggleTheme } from './useToggleTheme'
import * as nextThemes from 'next-themes'

jest.mock('next-themes')

describe('useToggleTheme', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return current theme when theme is defined', () => {
    ;(nextThemes.useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      themes: ['light', 'dark'],
      setTheme: mockSetTheme,
    })

    const { result } = renderHook(() => useToggleTheme())

    expect(result.current.theme).toBe('dark')
    expect(result.current.setTheme).toBe(mockSetTheme)
    expect(result.current.themes).toEqual(['light', 'dark'])
  })

  it('should return light as default theme when theme is undefined', () => {
    ;(nextThemes.useTheme as jest.Mock).mockReturnValue({
      theme: undefined,
      themes: ['light', 'dark'],
      setTheme: mockSetTheme,
    })

    const { result } = renderHook(() => useToggleTheme())

    expect(result.current.theme).toBe('light')
  })

  it('should return setTheme and themes from useTheme', () => {
    ;(nextThemes.useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      themes: ['light', 'dark', 'auto'],
      setTheme: mockSetTheme,
    })

    const { result } = renderHook(() => useToggleTheme())

    expect(result.current.setTheme).toBe(mockSetTheme)
    expect(result.current.themes).toEqual(['light', 'dark', 'auto'])
  })
})
