'use client'

import Link from 'next/link'
// Removed CSS module import
import NavbarRoot from './NavbarRoot'
import { Logo } from '@components/ui'
import UserNav from '../UserNav'
import SearchBar from '../SearchBar/SearchBar'

import { useUser } from '@lib/hooks/useUser'
import { cn } from '@lib/utils'

const navBarLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
]

const Navbar = () => {
  const { isAdmin } = useUser()

  return (
    <NavbarRoot>
      <div className="flex flex-col w-full " data-testid="navbar">
        <div className="relative flex flex-row items-center justify-between py-4 p-0 md:px-6 w-full h-20">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center flex-row cursor-pointer transform duration-100 ease-in-out"
              aria-label="Curly Pottery home"
              data-testid="navbar-logo"
            >
              <Logo width={120} height={40} />
            </Link>

            <nav
              className="hidden ml-10 space-x-8 sm:flex items-center"
              aria-label="Main navigation"
            >
              {navBarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center leading-6 text-xl font-semibold transition ease-in-out duration-75 cursor-pointer text-on-primary hover:text-on-primary/60 focus:outline-none focus:text-on-primary/60"
                  data-testid={`navbar-${link.label.toLowerCase()}-link`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'inline-flex items-center leading-6 text-xl font-semibold transition ease-in-out duration-75 cursor-pointer text-on-primary hover:text-on-primary/60 focus:outline-none focus:text-on-primary/60',
                    'hidden lg:inline-flex',
                  )}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <UserNav />
          </div>
        </div>
      </div>
    </NavbarRoot>
  )
}

export default Navbar
