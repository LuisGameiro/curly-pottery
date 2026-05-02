import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import { Logo } from '@components/ui'
import UserNav from '../UserNav'
import SearchBar from '../SearchBar/SearchBar'

interface Link {
  href: string
  label: string
}

interface NavbarProps {
  links?: Link[]
}

const Navbar = ({ links }: NavbarProps) => (
  <NavbarRoot>
    <div className="flex flex-col w-full ">
      <div className={s.nav}>
        <div className="flex items-center">
          <Link href="/" className={s.logo} aria-label="Curly Pottery home">
            <Logo width={120} height={40} />
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

export default Navbar
