import { useEffect, useMemo } from "react";
import { useUser } from "./useUser";
import { calculateDiscount } from "@lib/calculate-price";
import { useCartStore } from "@lib/zustand/cart";
import { CurrencyCode } from "prisma/generated/prisma/enums";

export default function useCart() {
  const { isAuthenticated } = useUser();
  const {
    syncWithDatabase,
    cartItems,
    isLoading,
    addItem,
    removeItem,
    updateItem,
    deleteAll,
  } = useCartStore();

  useEffect(() => {
    syncWithDatabase();
  }, [isAuthenticated, syncWithDatabase, cartItems]);

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
  );

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
  };
}
