'use client'

import { Heart } from 'lucide-react'
import { cn } from '@lib/utils'
import useFavourites from '@lib/hooks/useFavourites'
import { useUser } from '@lib/hooks/useUser'

type FavouriteButtonProps = {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FavouriteButton({
  productId,
  className,
  size = 'md',
}: FavouriteButtonProps) {
  const { isAuthenticated } = useUser()
  const { isFavourite, toggleFavourite, isLoading } = useFavourites()

  if (!isAuthenticated) return null

  const filled = isFavourite(productId)
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 22

  return (
    <button
      type="button"
      aria-label={filled ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={filled}
      disabled={isLoading}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavourite(productId)
      }}
      className={cn(
        'transition-colors duration-200',
        filled ? 'text-red-500 hover:text-red-600' : 'text-neutral-400 hover:text-red-500',
        className,
      )}
    >
      <Heart size={iconSize} fill={filled ? 'currentColor' : 'none'} />
    </button>
  )
}