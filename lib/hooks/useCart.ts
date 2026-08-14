'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useUser } from './useUser'
import { calculateDiscount } from '@lib/calculate-price'
import { useCartStore } from '@lib/zustand/cart'
import { CurrencyCode } from '@lib/types/types'
import { useShallow } from 'zustand/react/shallow'

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
  } = useCartStore(
    useShallow((s) => ({
      syncWithDatabase: s.syncWithDatabase,
      cartItems: s.cartItems,
      isLoading: s.isLoading,
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateItem: s.updateItem,
      deleteAll: s.deleteAll,
    })),
  )

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

  // totalPrice equals subtotalPrice here — taxes/shipping are computed at checkout
  const totalPrice = subtotal

  return {
    data: {
      lineItems: cartItems,
      subtotalPrice: subtotal,
      totalPrice,
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
