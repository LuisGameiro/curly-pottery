import { useEffect, useMemo, useRef } from 'react'
import { useUser } from './useUser'
import { calculateDiscount } from '@lib/calculate-price'
import { useCartStore } from '@lib/zustand/cart'
import { CurrencyCode } from '@lib/types/types'

export default function useCart() {
  const { isAuthenticated } = useUser()
  const {
    syncWithDatabase,
    cartItems,
    isLoading,
    addItem,
    removeItem,
    updateItem,
    deleteAll,
  } = useCartStore()

  const prevAuthRef = useRef(isAuthenticated)
  
  useEffect(() => {
    if (prevAuthRef.current !== isAuthenticated) {
      prevAuthRef.current = isAuthenticated
      syncWithDatabase()
    }
  }, [isAuthenticated, syncWithDatabase])

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          calculateDiscount(item.price, item.discounts).finalPrice *
            item.quantity,
        0,
      ),
    [cartItems],
  )

  return {
    data: {
      lineItems: cartItems,
      subtotalPrice: subtotal,
      totalPrice: subtotal,
      currency: CurrencyCode.GBP,
    },
    isLoading,
    isEmpty: cartItems.length === 0,
    addItem,
    removeItem,
    updateItem,
    deleteAll,
  }
}
