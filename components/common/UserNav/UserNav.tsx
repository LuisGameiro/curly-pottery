'use client'

// Removed CSS module import
import { Button, Dropdown, DropdownTrigger } from '@components/ui'
import { cn } from '@lib/utils'
import useCart from '@lib/hooks/useCart'
import { useRouter } from 'next/navigation'
import { useUser } from '@lib/hooks/useUser'
import { Menu, ShoppingBag, User, Heart } from 'lucide-react'
import CustomerMenuContent from './CustomerMenuContent'

type UserNavProps = {
  className?: string
}

export default function UserNav({ className }: UserNavProps) {
  const { isAuthenticated } = useUser()
  const router = useRouter()

  const { data } = useCart()
  const itemsCount =
    data?.lineItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <nav
      className={cn('relative flex items-center', className)}
      data-testid="user-nav"
    >
      <ul className="flex flex-row items-center justify-items-end h-full">
        <li className="ml-0 flex items-center relative flex-row items-center gap-6 md:block hidden">
          <Button
            variant="naked"
            type="button"
            aria-label="User Account"
            onClick={() =>
              router.push(isAuthenticated ? '/user' : '/auth/login')
            }
            className="p-0"
            data-testid="user-nav-account-btn"
          >
            <User size={24} className="text-secondary" />
          </Button>
        </li>
        <li className="ml-6 flex items-center relative">
          {isAuthenticated && (
            <Button
              variant="naked"
              type="button"
              aria-label="Favourites"
              onClick={() => router.push('/user/favourites')}
              className="p-0"
            >
              <Heart size={24} className="text-secondary" />
            </Button>
          )}
        </li>
        <li className="ml-6 flex items-center relative">
          <Button
            variant="naked"
            type="button"
            aria-label={`Cart items: ${itemsCount}`}
            onClick={() => router.push('/cart')}
            className="p-0 relative"
            data-testid="user-nav-cart-btn"
          >
            <ShoppingBag size={24} className="text-secondary" />
            {itemsCount > 0 && (
              <span className="absolute right-0 bottom-0 bg-secondary/60 text-primary rounded-full flex items-center justify-center text-xs pl-[2.5px] pr-[2.5px] min-w-[1.25rem] min-h-[1.25rem]">
                {itemsCount}
              </span>
            )}
          </Button>
        </li>
        <li className="p-2 rounded-lg flex md:hidden ml-6 text-on-primary hover:text-on-secondary hover:bg-secondary/20 focus:outline-2 focus:outline-offset-2 focus:outline-secondary">
          <Dropdown modal={false}>
            <DropdownTrigger
              id="user-nav-mobile-trigger"
              aria-label="Open Navigation Menu"
              aria-haspopup="menu"
              data-testid="user-nav-mobile-trigger"
            >
              <Menu size={28} />
            </DropdownTrigger>
            <CustomerMenuContent />
          </Dropdown>
        </li>
      </ul>
    </nav>
  )
}

UserNav.displayName = 'UserNav'
