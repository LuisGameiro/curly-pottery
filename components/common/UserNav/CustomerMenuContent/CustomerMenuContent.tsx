'use client'

import cn from 'clsx'
import { useTheme } from 'next-themes'
import { useParams, useRouter } from 'next/navigation'
import s from './CustomerMenuContent.module.css'
import {
  DropdownContent,
  DropdownMenuItem,
} from '@components/ui/Dropdown/Dropdown'
import { Moon, Sun } from 'lucide-react'
import { useUser } from '@lib/hooks/useUser'
import { signOut } from 'next-auth/react'
import { Heart } from 'lucide-react'

const LINKS = [
  {
    name: 'Shop',
    href: '/shop',
  },
  {
    name: 'About',
    href: '/about',
  },
  {
    name: 'Mugs',
    href: '/search?q=mugs',
  },
  {
    name: 'Vases',
    href: '/search?q=vases',
  },
  {
    name: 'Plates',
    href: '/search?q=plates',
  },
]

export default function CustomerMenuContent() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useUser()

  const pathname = params?.slug ? `/${params.slug}` : '/'
  const { theme, setTheme } = useTheme()

  function handleClick(href: string) {
    router.push(href)
  }

  return (
    <DropdownContent
      sideOffset={10}
      id="CustomerMenuContent"
      className={s.container}
    >
      {LINKS.map(({ name, href }) => (
        <DropdownMenuItem key={href}>
          <button
            type="button"
            className={cn(s.link, {
              [s.active]: pathname === href,
            })}
            onClick={() => handleClick(href)}
          >
            {name}
          </button>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem>
        <button
          type="button"
          className={cn(s.link, 'justify-between')}
          aria-pressed={theme === 'dark'}
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark')
          }}
        >
          <div>
            Theme: <strong>{theme}</strong>{' '}
          </div>
          <div className="ml-3">
            {theme == 'dark' ? (
              <Moon width={20} height={20} />
            ) : (
              <Sun width={20} height={20} />
            )}
          </div>
        </button>
      </DropdownMenuItem>
      <DropdownMenuItem>
        {isAuthenticated ? (
          <div className={s.auth}>
            {isAdmin && (
              <button
                type="button"
                className={s.link}
                onClick={() => handleClick('/admin')}
              >
                Admin
              </button>
            )}
            <button
              type="button"
              className={s.link}
              onClick={() => handleClick('/user')}
            >
              My Account
            </button>
            <button
              type="button"
              className={s.link}
              onClick={() => handleClick('/user/favourites')}
            >
              <Heart size={16} className="mr-2" />
              Favourites
            </button>
            <button type="button" className={s.link} onClick={() => signOut()}>
              Logout
            </button>
          </div>
        ) : (
          <div className={s.auth}>
            <button
              type="button"
              className={s.link}
              onClick={() => handleClick('/auth/login')}
            >
              Login
            </button>
          </div>
        )}
      </DropdownMenuItem>
    </DropdownContent>
  )
}
