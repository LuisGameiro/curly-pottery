import Link from 'next/link'
import { Logo } from '@components/ui'
import { I18nWidget } from '@components/common'
import ThemeSwitcher from '@components/ui/ThemeSwitcher'
import s from './Footer.module.css'
import NewsletterSignup from './NewsletterSignup'

type Page = {
  name: string
  url: string
}

const links: Page[] = [
  {
    name: 'FAQ',
    url: '/faq',
  },
  {
    name: 'Contacts',
    url: '/contacts',
  },
  {
    name: 'About',
    url: '/about',
  },
  {
    name: 'Terms of Service',
    url: '/terms',
  },
  {
    name: 'Privacy Policy',
    url: '/privacy',
  },
  {
    name: 'Cookie Settings',
    url: '/cookies',
  },
]

const Footer = () => {
  return (
    <footer className={s.root}>
      <div className={s.menuContainer}>
        <div className={s.brandColumn}>
          <Link href="/" className={s.logoContainer}>
            <Logo className={s.logo} />
            <span>Curly Pottery</span>
          </Link>

          <NewsletterSignup />
        </div>

        <div className={s.menu}>
          <nav className={s.navlist}>
            {links.map((item) => (
              <Link key={item.name} href={item.url}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={s.widgetContainer}>
            <ThemeSwitcher />
            <I18nWidget />
          </div>
        </div>
      </div>

      <div className={s.signature}>
        <span>&copy; 2025 Curly Pottery, Inc. All rights reserved.</span>
        <span>Created by Luis Gameiro</span>
      </div>
    </footer>
  )
}

export default Footer
