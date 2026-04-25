import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import { Logo } from '@components/ui'
import { UserNav, SearchBar } from '@components/common'

interface Link {
  href: string
  label: string
}

interface NavbarProps {
  links?: Link[]
}

const Navbar = ({ links }: NavbarProps) => (
  <NavbarRoot>
    <div className={s.nav}>
      <div className="flex items-center gap-6">
        <Link href="/" className={s.logo} aria-label="Curly Pottery home">
          <Logo />
          <span className={s.brandName}>Curly Pottery</span>
        </Link>

        {links && (
          <nav className={s.navMenu}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={s.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden md:block">
          <SearchBar />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar className="md:hidden" />
        <UserNav />
      </div>
    </div>
  </NavbarRoot>
)

export default Navbar
