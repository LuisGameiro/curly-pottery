import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncCartAction } from "actions/cart.actions";
import {
  CartLineItem,
  Discount,
  ProductWithVariantsCategories,
} from "@lib/types/types";

interface CartStore {
  cartItems: CartLineItem[];
  isLoading: boolean;
  addItem: (item: ProductWithVariantsCategories, quantity: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, q: number) => void;
  deleteAll: () => void;
  syncWithDatabase: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isLoading: false,

      addItem: async (
        item: ProductWithVariantsCategories,
        quantity: number,
      ) => {
        const { cartItems } = get();
        const existing = cartItems.find(
          (i: CartLineItem) => i.variantId === item.variants[0].id,
        );
        let newItems: CartLineItem[];

        if (existing) {
          newItems = cartItems.map((i: CartLineItem) =>
            i.variantId === item.variants[0].id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        } else {
          newItems = [
            ...cartItems,
            {
              quantity,
              images: item.images[0] || "",
              variantId: item.variants[0].id,
              sku: item.variants[0].sku || "",
              stock: item.variants[0].stock || 0,
              price: item.variants[0].price || 0,
              currency: item.variants[0].currency || "GBP",
              discounts: (item.variants[0].discounts ?? []) as Discount[],
              id: item.id,
              slug: item.slug,
              name: item.name,
              colorName: item.variants[0].colorName ?? "",
              sizeName: item.variants[0].sizeName ?? "",
            },
          ];
        }

        set({ cartItems: newItems });
        await syncCartAction(newItems);
      },

      removeItem: async (variantId: string) => {
        const newItems = get().cartItems.filter(
          (i: CartLineItem) => i.variantId !== variantId,
        );
        set({ cartItems: newItems });
        await syncCartAction(newItems);
      },

      updateItem: async (variantId: string, q: number) => {
        const newItems = get().cartItems.map((i: CartLineItem) =>
          i.variantId === variantId ? { ...i, quantity: q } : i,
        );
        set({ cartItems: newItems });
        await syncCartAction(newItems);
      },

      deleteAll: async () => {
        set({ cartItems: [] });
        await syncCartAction([]);
      },

      syncWithDatabase: async () => {
        if (get().isLoading) return;
        set({ isLoading: true });
        try {
          // const dbItems = await getCartFromDbAction();
          // if (dbItems) set({ cartItems: dbItems.lineItems });
        } catch (error) {
          console.error("Failed to sync cart", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
