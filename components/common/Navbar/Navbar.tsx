import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import { Logo } from '@components/ui'
import { UserNav } from '@components/common'

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
      <div className="flex items-center">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
          <h1>Curly Pottery</h1>
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
      </div>

      <UserNav />
    </div>
  </NavbarRoot>
)

export default Navbar
