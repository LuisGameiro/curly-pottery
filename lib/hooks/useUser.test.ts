import { renderHook } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useUser } from './useUser'

jest.mock('next-auth/react')

describe('useUser', () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useUser())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('returns authenticated user data', () => {
    const mockUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER',
    }
    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '' },
      status: 'authenticated',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useUser())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAdmin).toBe(false)
  })

  it('returns admin status when user role is ADMIN', () => {
    const mockUser = {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'ADMIN',
    }
    mockUseSession.mockReturnValue({
      data: { user: mockUser, expires: '' },
      status: 'authenticated',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useUser())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('returns unauthenticated state when session is null', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useUser())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBeUndefined()
    expect(result.current.isAdmin).toBe(false)
  })
})
