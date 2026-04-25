'use client'

import s from './UserNav.module.css'
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@components/ui'
import { signOut } from 'next-auth/react'
import { cn } from '@lib/utils'
import useCart from '@lib/hooks/useCart'
import {
  Menu,
  ShoppingBasket,
  Heart,
  User,
  Package,
  LogOut,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@lib/hooks/useUser'
import CustomerMenuContent from './CustomerMenuContent'

type UserNavProps = {
  className?: string
}

export default function UserNav({ className }: UserNavProps) {
  const { isAdmin, isAuthenticated } = useUser()
  const router = useRouter()

  const { data } = useCart()
  const itemsCount =
    data?.lineItems.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <nav className={cn(s.root, className)}>
      <ul className={s.list}>
        <li className="hidden gap-4 md:flex md:items-center">
          {isAuthenticated ? (
            <>
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="naked" type="button">
                    My Account
                  </Button>
                </DropdownTrigger>
                <DropdownContent sideOffset={8}>
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className={cn(s.dropdownItem, 'cursor-pointer')}
                    onSelect={() => router.push('/user')}
                  >
                    <User size={16} />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(s.dropdownItem, 'cursor-pointer')}
                    onSelect={() => router.push('/user/orders')}
                  >
                    <Package size={16} />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(s.dropdownItem, 'cursor-pointer')}
                    onSelect={() => router.push('/user/favourites')}
                  >
                    <Heart size={16} />
                    Favourites
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(s.dropdownItem, 'cursor-pointer')}
                    onSelect={() => signOut()}
                  >
                    <LogOut size={16} />
                    Logout
                  </DropdownMenuItem>
                </DropdownContent>
              </Dropdown>
              {isAdmin && (
                <Button
                  variant="naked"
                  type="button"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="naked"
              type="button"
              onClick={() => router.push('/auth/login')}
            >
              Login
            </Button>
          )}
        </li>
        <li className="flex items-center gap-2">
          {isAuthenticated && (
            <Button
              variant="naked"
              type="button"
              aria-label="Favourites"
              onClick={() => router.push('/user/favourites')}
            >
              <Heart size={24} />
            </Button>
          )}
          <div className="relative">
            <Button
              variant="naked"
              type="button"
              aria-label={`Cart items: ${itemsCount}`}
              onClick={() => router.push('/cart')}
            >
              <ShoppingBasket size={28} />
            </Button>
            {itemsCount > 0 && <span className={s.bagCount}>{itemsCount}</span>}
          </div>
        </li>
        <li className={s.mobileMenu}>
          <Dropdown modal={false}>
            <DropdownTrigger
              id="user-nav-mobile-trigger"
              aria-label="Open Navigation Menu"
              aria-haspopup="menu"
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
