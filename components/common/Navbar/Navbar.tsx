import { FC } from 'react'
import Link from 'next/link'
import s from './Navbar.module.css'
import NavbarRoot from './NavbarRoot'
import { Logo, Container } from '@components/ui'
import { Searchbar, UserNav } from '@components/common'

interface Link {
  href: string
  label: string
}

interface NavbarProps {
  links?: Link[]
}

const Navbar: FC<NavbarProps> = () => (
  <NavbarRoot>
    <Container clean className="mx-auto max-w-10/12">
      <div className={s.nav}>
        <div className="flex items-center">

          <Link href="/" className={s.logo} aria-label="Logo">
            <div className="flex items-center flex-row">
              <Logo />
              <h1 className="ml-4 mr-8 text-primary-foreground">Curly Pottery</h1>
            </div>
          </Link>

          <nav className={s.navMenu}>
            <Link href="/search" className={s.link}>
              Shop
            </Link>
            <Link
              href={'/contacts'}
              className={s.link}
            >
              Contacts
            </Link>
          </nav>
        </div>
        
        {/* {process.env.COMMERCE_SEARCH_ENABLED && (
          <div className="justify-center flex-1 hidden lg:flex">
            <Searchbar />
          </div>
        )}*/}
        <div className="flex items-center justify-end flex-1 space-x-8">
          <UserNav />
        </div> 
      </div>
      {/* {process.env.COMMERCE_SEARCH_ENABLED && (
        <div className="flex pb-4 lg:px-6 lg:hidden">
          <Searchbar id="mobile-search" />
        </div>
      )} */}
    </Container>
  </NavbarRoot>
)

export default Navbar
