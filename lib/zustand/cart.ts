import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCartFromDbAction, syncCartAction } from 'actions/cart.actions'
import {
  CartLineItem,
  Discount,
  ProductWithVariantsCategories,
} from '@lib/types/types'

interface CartStore {
  cartItems: CartLineItem[]
  isLoading: boolean
  addItem: (item: ProductWithVariantsCategories, quantity: number) => void
  removeItem: (id: string) => void
  updateItem: (id: string, q: number) => void
  deleteAll: () => void
  syncWithDatabase: () => Promise<void>
}

/**
 * Zustand store for managing shopping cart state and operations.
 *
 * Persists cart data to localStorage with the key 'cart-storage'.
 *
 * @store
 * @example
 * ```typescript
 * const { cartItems, addItem, removeItem } = useCartStore();
 * ```
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isLoading: false,

      addItem: async (
        item: ProductWithVariantsCategories,
        quantity: number,
      ) => {
        const { cartItems } = get()
        const firstVariant = item.variants?.[0]
        if (!firstVariant) {
          console.error('No variant available for this product')
          return
        }
        const existing = cartItems.find(
          (i: CartLineItem) => i.variantId === firstVariant.id,
        )
        let newItems: CartLineItem[]

        if (existing) {
          const newQuantity = Math.min(
            existing.quantity + quantity,
            firstVariant.stock,
          )
          newItems = cartItems.map((i: CartLineItem) =>
            i.variantId === firstVariant.id
              ? { ...i, quantity: newQuantity }
              : i,
          )
        } else {
          newItems = [
            ...cartItems,
            {
              quantity: Math.min(quantity, firstVariant.stock),
              images: item.images[0] || '',
              variantId: firstVariant.id,
              sku: firstVariant.sku || '',
              stock: firstVariant.stock || 0,
              price: Number(firstVariant.price) || 0,
              currency: firstVariant.currency || 'GBP',
              discounts: (firstVariant.discounts ?? []) as Discount[],
              id: item.id,
              slug: item.slug,
              name: item.name,
              colorName: firstVariant.colorName ?? '',
              sizeName: firstVariant.sizeName ?? '',
            },
          ]
        }

        set({ cartItems: newItems })
        await syncCartAction(newItems)
      },

      removeItem: async (variantId: string) => {
        const newItems = get().cartItems.filter(
          (i: CartLineItem) => i.variantId !== variantId,
        )
        set({ cartItems: newItems })
        await syncCartAction(newItems)
      },

      updateItem: async (variantId: string, q: number) => {
        const item = get().cartItems.find((i) => i.variantId === variantId)
        if (!item) return

        const cappedQuantity = Math.min(q, item.stock)
        const newItems = get().cartItems.map((i: CartLineItem) =>
          i.variantId === variantId ? { ...i, quantity: cappedQuantity } : i,
        )
        set({ cartItems: newItems })
        await syncCartAction(newItems)
      },

      deleteAll: async () => {
        set({ cartItems: [] })
        await syncCartAction([])
      },

      syncWithDatabase: async () => {
        if (get().isLoading) return
        set({ isLoading: true })
        try {
          const dbItems = await getCartFromDbAction()
          if (dbItems) set({ cartItems: dbItems.lineItems as CartLineItem[] })
        } catch (error) {
          console.error('Failed to sync cart', error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
