import { renderHook, act } from '@testing-library/react'
import { useUser } from '@lib/hooks/useUser'
import useFavourites from './useFavourites'

jest.mock('@lib/hooks/useUser', () => ({
  useUser: jest.fn(),
}))

let mockFavouritesStore: Record<string, unknown>
jest.mock('@lib/zustand/favourites', () => ({
  useFavouritesStore: jest.fn(() => mockFavouritesStore),
}))

const createMockUser = (
  overrides: Partial<ReturnType<typeof useUser>> = {},
) => ({
  user: undefined,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  ...overrides,
})

describe('useFavourites', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFavouritesStore = {
      isHydrated: true,
      syncWithDatabase: jest.fn(),
      favouriteIds: [],
      isLoading: false,
      addFavourite: jest.fn(),
      removeFavourite: jest.fn(),
      toggleFavourite: jest.fn(),
    }
    jest.mocked(useUser).mockReturnValue(createMockUser())
  })

  it('should return empty favourites state', () => {
    const { result } = renderHook(() => useFavourites())

    expect(result.current.favouriteIds).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFavourite('some-id')).toBe(false)
  })

  it('should check if a product is in favourites', () => {
    mockFavouritesStore.favouriteIds = ['existing-id', 'another-id']

    const { result } = renderHook(() => useFavourites())

    expect(result.current.isFavourite('existing-id')).toBe(true)
    expect(result.current.isFavourite('another-id')).toBe(true)
    expect(result.current.isFavourite('other')).toBe(false)
  })

  it('should sync with database when authenticated and hydrated', () => {
    jest
      .mocked(useUser)
      .mockReturnValue(createMockUser({ isAuthenticated: true }))
    mockFavouritesStore.isHydrated = true

    renderHook(() => useFavourites())

    expect(mockFavouritesStore.syncWithDatabase).toHaveBeenCalledTimes(1)
  })

  it('should not sync with database when not authenticated', () => {
    jest
      .mocked(useUser)
      .mockReturnValue(createMockUser({ isAuthenticated: false }))
    mockFavouritesStore.isHydrated = true

    renderHook(() => useFavourites())

    expect(mockFavouritesStore.syncWithDatabase).not.toHaveBeenCalled()
  })

  it('should not sync with database when not hydrated', () => {
    jest
      .mocked(useUser)
      .mockReturnValue(createMockUser({ isAuthenticated: true }))
    mockFavouritesStore.isHydrated = false

    renderHook(() => useFavourites())

    expect(mockFavouritesStore.syncWithDatabase).not.toHaveBeenCalled()
  })

  it('should delegate addFavourite to store', () => {
    const { result } = renderHook(() => useFavourites())

    act(() => {
      result.current.addFavourite('product-1')
    })

    expect(mockFavouritesStore.addFavourite).toHaveBeenCalledWith('product-1')
  })

  it('should delegate removeFavourite to store', () => {
    const { result } = renderHook(() => useFavourites())

    act(() => {
      result.current.removeFavourite('product-1')
    })

    expect(mockFavouritesStore.removeFavourite).toHaveBeenCalledWith(
      'product-1',
    )
  })

  it('should delegate toggleFavourite to store', () => {
    const { result } = renderHook(() => useFavourites())

    act(() => {
      result.current.toggleFavourite('product-1')
    })

    expect(mockFavouritesStore.toggleFavourite).toHaveBeenCalledWith(
      'product-1',
    )
  })
})
