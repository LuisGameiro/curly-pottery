import { useCartStore } from './cart'
import { getCartFromDbAction, syncCartAction } from '@actions/cart.actions'
import type { ProductWithVariantsCategories } from '@lib/types/types'

jest.mock('@actions/cart.actions', () => ({
  getCartFromDbAction: jest.fn(),
  syncCartAction: jest.fn(),
}))

const mockProduct = {
  id: 'prod-1',
  name: 'Test Mug',
  slug: 'test-mug',
  images: ['https://example.com/mug.jpg'],
  categories: [],
  variants: [
    {
      id: 'var-1',
      sku: 'MUG-001',
      price: 24.99,
      currency: 'GBP' as const,
      stock: 10,
      colorName: 'Sand',
      sizeName: 'One Size',
      discounts: [],
      optionValues: [],
    },
  ],
} as unknown as ProductWithVariantsCategories

const mockProductNoVariant = {
  id: 'prod-2',
  name: 'No Variant Product',
  slug: 'no-variant',
  images: [],
  categories: [],
  variants: [],
} as unknown as ProductWithVariantsCategories

const initialStoreState = {
  cartItems: [],
  isLoading: false,
  isHydrated: false,
}

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState(initialStoreState)
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty cartItems, isLoading false, isHydrated false', () => {
      const state = useCartStore.getState()
      expect(state.cartItems).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.isHydrated).toBe(false)
    })
  })

  describe('addItem', () => {
    it('should add a new item with correct fields', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)

      const state = useCartStore.getState()
      expect(state.cartItems).toHaveLength(1)
      expect(state.cartItems[0]).toMatchObject({
        variantId: 'var-1',
        id: 'prod-1',
        name: 'Test Mug',
        slug: 'test-mug',
        sku: 'MUG-001',
        images: 'https://example.com/mug.jpg',
        quantity: 1,
        stock: 10,
        price: 24.99,
        currency: 'GBP',
        colorName: 'Sand',
        sizeName: 'One Size',
        discounts: [],
      })
    })

    it('should cap initial quantity at stock', async () => {
      await useCartStore.getState().addItem(mockProduct, 20)

      expect(useCartStore.getState().cartItems[0].quantity).toBe(10)
    })

    it('should use defaults for missing optional fields', async () => {
      const sparseProduct = {
        id: 'prod-3',
        name: 'Sparse',
        slug: 'sparse',
        images: [],
        categories: [],
        variants: [
          {
            id: 'var-3',
            sku: null,
            price: null,
            currency: null,
            stock: null,
            colorName: null,
            sizeName: null,
            discounts: null,
            optionValues: [],
          },
        ],
      } as unknown as ProductWithVariantsCategories

      await useCartStore.getState().addItem(sparseProduct, 1)

      const item = useCartStore.getState().cartItems[0]
      expect(item.sku).toBe('')
      expect(item.price).toBe(0)
      expect(item.currency).toBe('GBP')
      expect(item.stock).toBe(0)
      expect(item.colorName).toBe('')
      expect(item.sizeName).toBe('')
      expect(item.images).toBe('')
      expect(item.discounts).toEqual([])
    })

    it('should increment quantity when item already exists', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)
      await useCartStore.getState().addItem(mockProduct, 3)

      const items = useCartStore.getState().cartItems
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(4)
    })

    it('should cap incremented quantity at stock', async () => {
      await useCartStore.getState().addItem(mockProduct, 8)
      await useCartStore.getState().addItem(mockProduct, 5)

      expect(useCartStore.getState().cartItems[0].quantity).toBe(10)
    })

    it('should call syncCartAction with updated items', async () => {
      await useCartStore.getState().addItem(mockProduct, 2)

      expect(syncCartAction).toHaveBeenCalledTimes(1)
      expect(syncCartAction).toHaveBeenCalledWith(
        useCartStore.getState().cartItems,
      )
    })

    it('should do nothing and log error when product has no variants', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await useCartStore.getState().addItem(mockProductNoVariant, 1)

      expect(useCartStore.getState().cartItems).toHaveLength(0)
      expect(syncCartAction).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'No variant available for this product',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('removeItem', () => {
    it('should remove item by variantId', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)
      expect(useCartStore.getState().cartItems).toHaveLength(1)

      await useCartStore.getState().removeItem('var-1')

      expect(useCartStore.getState().cartItems).toHaveLength(0)
    })

    it('should call syncCartAction with remaining items', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)
      jest.clearAllMocks()

      await useCartStore.getState().removeItem('var-1')

      expect(syncCartAction).toHaveBeenCalledWith([])
    })

    it('should do nothing when variantId does not exist', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)

      await useCartStore.getState().removeItem('non-existent')

      expect(useCartStore.getState().cartItems).toHaveLength(1)
    })
  })

  describe('updateItem', () => {
    it('should update quantity for an existing item', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)

      await useCartStore.getState().updateItem('var-1', 7)

      expect(useCartStore.getState().cartItems[0].quantity).toBe(7)
    })

    it('should cap updated quantity at stock', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)

      await useCartStore.getState().updateItem('var-1', 99)

      expect(useCartStore.getState().cartItems[0].quantity).toBe(10)
    })

    it('should call syncCartAction with updated items', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)
      jest.clearAllMocks()

      await useCartStore.getState().updateItem('var-1', 5)

      expect(syncCartAction).toHaveBeenCalledTimes(1)
      expect(syncCartAction).toHaveBeenCalledWith(
        useCartStore.getState().cartItems,
      )
    })

    it('should do nothing when item is not found', async () => {
      await useCartStore.getState().updateItem('non-existent', 5)

      expect(syncCartAction).not.toHaveBeenCalled()
    })
  })

  describe('deleteAll', () => {
    it('should clear cartItems', async () => {
      await useCartStore.getState().addItem(mockProduct, 1)
      expect(useCartStore.getState().cartItems).not.toHaveLength(0)

      await useCartStore.getState().deleteAll()

      expect(useCartStore.getState().cartItems).toEqual([])
    })

    it('should call syncCartAction with empty array', async () => {
      await useCartStore.getState().deleteAll()

      expect(syncCartAction).toHaveBeenCalledWith([])
    })
  })

  describe('syncWithDatabase', () => {
    it('should fetch from DB and set cartItems', async () => {
      const dbItems = {
        lineItems: [
          {
            id: 'prod-1',
            variantId: 'var-1',
            slug: 'test-mug',
            sku: 'MUG-001',
            name: 'Test Mug',
            images: 'https://example.com/mug.jpg',
            quantity: 2,
            stock: 10,
            price: 24.99,
            currency: 'GBP' as const,
            colorName: 'Sand',
            sizeName: 'One Size',
            discounts: [],
          },
        ],
      }
      jest.mocked(getCartFromDbAction).mockResolvedValue(dbItems as any)

      await useCartStore.getState().syncWithDatabase()

      expect(useCartStore.getState().cartItems).toHaveLength(1)
      expect(useCartStore.getState().cartItems[0].variantId).toBe('var-1')
      expect(useCartStore.getState().isLoading).toBe(false)
    })

    it('should skip when already loading', async () => {
      useCartStore.setState({ isLoading: true })

      await useCartStore.getState().syncWithDatabase()

      expect(getCartFromDbAction).not.toHaveBeenCalled()
      expect(useCartStore.getState().isLoading).toBe(true)
    })

    it('should handle fetch error gracefully', async () => {
      jest
        .mocked(getCartFromDbAction)
        .mockRejectedValue(new Error('Network error'))
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await useCartStore.getState().syncWithDatabase()

      expect(useCartStore.getState().isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync cart',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('setHydrated', () => {
    it('should set isHydrated to true', () => {
      useCartStore.getState().setHydrated(true)

      expect(useCartStore.getState().isHydrated).toBe(true)
    })

    it('should set isHydrated to false', () => {
      useCartStore.getState().setHydrated(false)

      expect(useCartStore.getState().isHydrated).toBe(false)
    })
  })
})
