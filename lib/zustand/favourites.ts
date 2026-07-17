import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  addFavouriteAction,
  removeFavouriteAction,
  getFavouritesAction,
} from '@actions/Favourite.actions'
import { toast } from 'sonner'

interface FavouritesStore {
  favouriteIds: string[]
  isLoading: boolean
  isHydrated: boolean
  addFavourite: (productId: string) => Promise<void>
  removeFavourite: (productId: string) => Promise<void>
  toggleFavourite: (productId: string) => Promise<void>
  syncWithDatabase: () => Promise<void>
  setHydrated: (state: boolean) => void
}

export const useFavouritesStore = create<FavouritesStore>()(
  persist(
    (set, get) => ({
      favouriteIds: [],
      isLoading: false,
      isHydrated: false,

      addFavourite: async (productId: string) => {
        const { favouriteIds } = get()
        if (favouriteIds.includes(productId)) return

        set({ favouriteIds: [...favouriteIds, productId] })
        try {
          await addFavouriteAction(productId)
          toast.success('Added to favourites')
        } catch (error) {
          set({ favouriteIds })
          toast.error('Failed to add to favourites')
          console.error('Failed to add favourite', error)
        }
      },

      removeFavourite: async (productId: string) => {
        const { favouriteIds } = get()
        const newIds = favouriteIds.filter((id) => id !== productId)

        set({ favouriteIds: newIds })
        try {
          await removeFavouriteAction(productId)
          toast.success('Removed from favourites')
        } catch (error) {
          set({ favouriteIds })
          toast.error('Failed to remove from favourites')
          console.error('Failed to remove favourite', error)
        }
      },

      toggleFavourite: async (productId: string) => {
        const { favouriteIds, addFavourite, removeFavourite } = get()
        if (favouriteIds.includes(productId)) {
          await removeFavourite(productId)
        } else {
          await addFavourite(productId)
        }
      },

      syncWithDatabase: async () => {
        if (get().isLoading) return
        set({ isLoading: true })
        try {
          const ids = await getFavouritesAction()
          set({ favouriteIds: ids })
        } catch (error) {
          console.error('Failed to sync favourites', error)
        } finally {
          set({ isLoading: false })
        }
      },

      setHydrated: (state: boolean) => {
        set({ isHydrated: state })
      },
    }),
    {
      name: 'favourites-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
