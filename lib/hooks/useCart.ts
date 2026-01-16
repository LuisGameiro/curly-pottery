import { useEffect, useMemo } from "react";
import { useUser } from "./useUser";
import { calculateDiscount } from "@lib/calculate-price";
import { useCartStore } from "@lib/zustand/cart";

export default function useCart() {
  const { isAuthenticated } = useUser();
  const store = useCartStore();

  useEffect(() => {
    store.syncWithDatabase();
  }, [isAuthenticated]);

  const subtotal = useMemo(
    () =>
      store.cartItems.reduce(
        (acc, item) =>
          acc +
          calculateDiscount(item.variant.price, item.variant.discounts)
            .finalPrice *
            item.quantity,
        0,
      ),
    [store.cartItems],
  );

  return {
    data: {
      lineItems: store.cartItems,
      subtotalPrice: subtotal,
      totalPrice: subtotal,
      currency: "GBP",
    },
    isLoading: store.isLoading,
    isEmpty: store.cartItems.length === 0,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateItem: store.updateItem,
    deleteAll: store.deleteAll,
  };
}
