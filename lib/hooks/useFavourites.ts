'use client'

import { useEffect } from 'react'
import { useFavouritesStore } from '@lib/zustand/favourites'
import { useUser } from '@lib/hooks/useUser'

export default function useFavourites() {
  const { isAuthenticated } = useUser()
  const {
    isHydrated,
    syncWithDatabase,
    favouriteIds,
    isLoading,
    addFavourite,
    removeFavourite,
    toggleFavourite,
  } = useFavouritesStore()

  useEffect(() => {
    if (isAuthenticated && isHydrated) {
      syncWithDatabase()
    }
  }, [isAuthenticated, isHydrated, syncWithDatabase])

  return {
    favouriteIds,
    isLoading,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    isFavourite: (productId: string) => favouriteIds.includes(productId),
  }
}
