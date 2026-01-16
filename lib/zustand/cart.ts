import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "prisma/generated/prisma/client";
import { syncCartAction, getCartFromDbAction } from "actions/cart.actions";

export interface CartItem extends Product {
  quantity: number;
  variantId: string;
}

interface CartStore {
  cartItems: CartItem[];
  isLoading: boolean;
  addItem: (item: Product, quantity: number) => void;
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

      addItem: async (item: any, quantity: number) => {
        const { cartItems } = get();
        const existing = cartItems.find(
          (i: CartItem) => i.variantId === item.variantId,
        );
        let newItems: CartItem[];

        if (existing) {
          newItems = cartItems.map((i: CartItem) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        } else {
          newItems = [...cartItems, { ...item, quantity }];
        }

        set({ cartItems: newItems });
        await syncCartAction(newItems);
      },

      removeItem: async (variantId: string) => {
        const newItems = get().cartItems.filter(
          (i: CartItem) => i.variantId !== variantId,
        );
        set({ cartItems: newItems });
        await syncCartAction(newItems);
      },

      updateItem: async (variantId: string, q: number) => {
        const newItems = get().cartItems.map((i: CartItem) =>
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
        set({ isLoading: true });
        try {
          // const dbItems = await getCartFromDbAction();
          //if (dbItems) set({ cartItems: dbItems });
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
