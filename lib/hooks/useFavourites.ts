'use client'

import { useEffect } from 'react'
import { useFavouritesStore } from '@lib/zustand/favourites'
import { useUser } from '@lib/hooks/useUser'

export default function useFavourites() {
  const { isAuthenticated } = useUser()
  const store = useFavouritesStore()

  useEffect(() => {
    if (isAuthenticated && store.isHydrated) {
      store.syncWithDatabase()
    }
  }, [isAuthenticated, store.isHydrated, store])

  return {
    favouriteIds: store.favouriteIds,
    isLoading: store.isLoading,
    addFavourite: store.addFavourite,
    removeFavourite: store.removeFavourite,
    toggleFavourite: store.toggleFavourite,
    isFavourite: (productId: string) => store.favouriteIds.includes(productId),
  }
}