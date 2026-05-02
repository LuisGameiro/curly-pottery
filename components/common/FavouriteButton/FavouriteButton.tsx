'use client'

import { Heart } from 'lucide-react'
import { cn } from '@lib/utils'
import useFavourites from '@lib/hooks/useFavourites'
import { useUser } from '@lib/hooks/useUser'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const filled = isFavourite(productId)
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 22

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    toggleFavourite(productId)
  }

  return (
    <button
      type="button"
      aria-label={filled ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={filled}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200 rounded-full',
        filled
          ? 'text-red-500 hover:text-red-600'
          : 'text-white/80 hover:text-red-500',
        className,
      )}
    >
      <Heart
        size={iconSize}
        fill={filled ? 'currentColor' : 'rgba(0,0,0,0.1)'}
        className={cn(
          'transition-all duration-200',
          !filled && 'hover:scale-110',
        )}
      />
    </button>
  )
}
