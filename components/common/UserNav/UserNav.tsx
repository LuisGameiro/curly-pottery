'use client'

import s from './UserNav.module.css'
import { Button, Dropdown, DropdownTrigger } from '@components/ui'
import { signOut } from 'next-auth/react'
import { cn } from '@lib/utils'
import useCart from '@lib/hooks/useCart'
import { Menu, ShoppingBasket } from 'lucide-react'
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
  const itemsCount = data?.lineItems.length ?? 0

  return (
    <nav className={cn(s.root, className)}>
      <ul className={s.list}>
        <li className="hidden gap-4 md:block">
          {isAuthenticated ? (
            <div>
              {isAdmin && (
                <Button
                  variant="naked"
                  type="button"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                variant="naked"
                type="button"
                onClick={() => router.push('/user')}
              >
                My Account
              </Button>
              <Button
                color="danger"
                variant="naked"
                type="button"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
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
        <li className={s.item}>
          <Button
            variant="naked"
            type="button"
            aria-label={`Cart items: ${itemsCount}`}
            onClick={() => router.push('/cart')}
          >
            <ShoppingBasket size={28} />
            {itemsCount > 0 && <span className={s.bagCount}>{itemsCount}</span>}
          </Button>
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
