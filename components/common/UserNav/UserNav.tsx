'use client'

import s from './UserNav.module.css'
import { Button, Dropdown, DropdownTrigger } from '@components/ui'
import { cn } from '@lib/utils'
import useCart from '@lib/hooks/useCart'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUser } from '@lib/hooks/useUser'
import { Menu } from 'lucide-react'
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
    <nav className={cn(s.root, className)}>
      <ul className={s.list}>
        <li className="flex-row md:flex items-center gap-6 md:block hidden">
          <Button
            variant="naked"
            type="button"
            aria-label="User Account"
            onClick={() =>
              router.push(isAuthenticated ? '/user' : '/auth/login')
            }
            className="p-0"
          >
            <Image
              src="/User.svg"
              alt="User"
              width={32}
              height={32}
              className="text-secondary"
            />
          </Button>

          {isAuthenticated && (
            <Button
              variant="naked"
              type="button"
              aria-label="Favourites"
              onClick={() => router.push('/user/favourites')}
              className="p-0"
            >
              <Image
                src="/Favourite.svg"
                alt="Favourite"
                width={30}
                height={30}
                className="text-secondary"
              />
            </Button>
          )}


        </li>
        <li>
          <div className="relative">
            <Button
              variant="naked"
              type="button"
              aria-label={`Cart items: ${itemsCount}`}
              onClick={() => router.push('/cart')}
              className="p-0"
            >
              <Image
                src="/Cart.svg"
                alt="Cart"
                width={32}
                height={32}
                className="text-secondary"
              />
            </Button>
            {itemsCount > 0 && <span className={s.bagCount}>{itemsCount}</span>}
          </div>
        </li>
        <li className={cn(s.mobileMenu, 'md:hidden')}>
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
