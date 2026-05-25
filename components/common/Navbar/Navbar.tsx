import Link from 'next/link'
import s from './Navbar.module.css'
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
      <div className="flex flex-col w-full ">
        <div className={s.nav}>
          <div className="flex items-center">
            <Link href="/" className={s.logo} aria-label="Curly Pottery home">
              <Logo width={120} height={40} />
            </Link>

            <nav className={s.navMenu}>
              {navBarLinks.map((link) => (
                <Link key={link.href} href={link.href} className={s.link}>
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(s.link, 'hidden lg:inline-flex')}
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
