import { renderHook, act } from '@testing-library/react'
import { useUser } from './useUser'
import { calculateDiscount } from '@lib/calculate-price'
import useCart from './useCart'

jest.mock('@lib/hooks/useUser', () => ({
  useUser: jest.fn(),
}))

jest.mock('@lib/calculate-price', () => ({
  calculateDiscount: jest.fn(),
}))

let mockCartStore: Record<string, unknown>
jest.mock('@lib/zustand/cart', () => ({
  useCartStore: jest.fn(() => mockCartStore),
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

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCartStore = {
      syncWithDatabase: jest.fn(),
      cartItems: [],
      isLoading: false,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateItem: jest.fn(),
      deleteAll: jest.fn(),
    }
    jest.mocked(useUser).mockReturnValue(createMockUser())
  })

  it('should return empty cart state', () => {
    const { result } = renderHook(() => useCart())

    expect(result.current.isEmpty).toBe(true)
    expect(result.current.data.subtotalPrice).toBe(0)
    expect(result.current.data.totalPrice).toBe(0)
    expect(result.current.data.lineItems).toEqual([])
    expect(result.current.data.currency).toBe('GBP')
  })

  it('should compute subtotal for a single item with discount', () => {
    const item = {
      price: 100,
      discounts: [{ type: 'PERCENTAGE', value: 0.1 }],
      quantity: 2,
      variantId: 'v1',
      id: 'p1',
    }

    jest.mocked(calculateDiscount).mockReturnValue({
      price: 100,
      finalPrice: 90,
      hasDiscount: true,
    })

    mockCartStore.cartItems = [item]

    const { result } = renderHook(() => useCart())

    expect(result.current.isEmpty).toBe(false)
    expect(result.current.data.subtotalPrice).toBe(180) // 90 * 2
    expect(result.current.data.lineItems).toHaveLength(1)
    expect(calculateDiscount).toHaveBeenCalledWith(100, item.discounts)
  })

  it('should sum subtotals for multiple items', () => {
    const item1 = {
      price: 50,
      discounts: [],
      quantity: 3,
      variantId: 'v1',
      id: 'p1',
    }
    const item2 = {
      price: 20,
      discounts: [],
      quantity: 5,
      variantId: 'v2',
      id: 'p2',
    }

    jest
      .mocked(calculateDiscount)
      .mockReturnValueOnce({ price: 50, finalPrice: 50, hasDiscount: false })
      .mockReturnValueOnce({ price: 20, finalPrice: 20, hasDiscount: false })

    mockCartStore.cartItems = [item1, item2]

    const { result } = renderHook(() => useCart())

    expect(result.current.data.subtotalPrice).toBe(250) // 50*3 + 20*5
    expect(calculateDiscount).toHaveBeenCalledTimes(2)
  })

  it('should return loading state from store', () => {
    mockCartStore.isLoading = true

    const { result } = renderHook(() => useCart())

    expect(result.current.isLoading).toBe(true)
  })

  it('should delegate addItem to store', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.current.addItem({} as any, 1)
    })

    expect(mockCartStore.addItem).toHaveBeenCalledWith({}, 1)
  })

  it('should delegate removeItem to store', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.removeItem('v1')
    })

    expect(mockCartStore.removeItem).toHaveBeenCalledWith('v1')
  })

  it('should delegate updateItem to store', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.updateItem('v1', 3)
    })

    expect(mockCartStore.updateItem).toHaveBeenCalledWith('v1', 3)
  })

  it('should delegate deleteAll to store', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.deleteAll()
    })

    expect(mockCartStore.deleteAll).toHaveBeenCalled()
  })

  it('should sync with database when auth state changes to authenticated', () => {
    const { rerender } = renderHook(() => useCart())

    // Initially isAuthenticated is false — the ref matches, no sync
    expect(mockCartStore.syncWithDatabase).not.toHaveBeenCalled()

    // Change to authenticated
    jest
      .mocked(useUser)
      .mockReturnValue(createMockUser({ isAuthenticated: true }))
    rerender()

    expect(mockCartStore.syncWithDatabase).toHaveBeenCalledTimes(1)
  })

  it('should sync with database when auth state changes to unauthenticated', () => {
    jest
      .mocked(useUser)
      .mockReturnValue(createMockUser({ isAuthenticated: true }))

    const { rerender } = renderHook(() => useCart())

    expect(mockCartStore.syncWithDatabase).not.toHaveBeenCalled()

    // Change back to unauthenticated
    jest.mocked(useUser).mockReturnValue(createMockUser())
    rerender()

    expect(mockCartStore.syncWithDatabase).toHaveBeenCalledTimes(1)
  })

  it('should not sync on initial render when auth is unchanged', () => {
    jest
      .mocked(useUser)
      .mockReturnValue(createMockUser({ isAuthenticated: true }))

    renderHook(() => useCart())

    // ref is initialized with true from first render, so no change detected
    expect(mockCartStore.syncWithDatabase).not.toHaveBeenCalled()
  })
})
