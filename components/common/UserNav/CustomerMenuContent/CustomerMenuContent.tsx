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

const LINKS = [
  {
    name: 'Shop',
    href: '/shop',
  },
  {
    name: 'Contact Us',
    href: '/contacts',
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
          <a
            className={cn(s.link, {
              [s.active]: pathname === href,
            })}
            onClick={() => handleClick(href)}
          >
            {name}
          </a>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem>
        <a
          className={cn(s.link, 'justify-between')}
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
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem>
        {isAuthenticated ? (
          <div className={s.auth}>
            {isAdmin && (
              <a className={s.link} onClick={() => handleClick('/admin')}>
                Admin
              </a>
            )}
            <a className={s.link} onClick={() => handleClick('/user')}>
              My Account
            </a>

            <a className={s.link} onClick={() => signOut()}>
              Logout
            </a>
          </div>
        ) : (
          <div className={s.auth}>
            <a className={s.link} onClick={() => handleClick('/auth/login')}>
              Login
            </a>
          </div>
        )}
      </DropdownMenuItem>
    </DropdownContent>
  )
}
