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
    name: 'Contact',
    url: '/contact',
  },
  {
    name: 'About',
    url: '/about',
  },
  {
    name: 'Terms of service',
    url: '/terms',
  },
  {
    name: 'Privacy Policy',
    url: '/privacy',
  },
]

import Image from 'next/image'

const Footer = () => {
  return (
    <footer className={s.root}>

      <div className={s.menuContainer}>
        {/* Instagram Column */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <h3 className="text-secondary font-bold text-xl text-center leading-tight">
            Follow me<br />on Instagram
          </h3>
          <div className="w-32 h-40 relative rounded-lg overflow-hidden border-2 border-secondary/20 shadow-lg">
            <Image
              src="/instagram.jpg"
              alt="Instagram feed"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-[1px] bg-secondary/20 h-40 self-center"></div>

        {/* Links Column */}
        <div className="flex flex-col gap-2 flex-1 lg:pl-10">
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              className="text-secondary font-medium text-lg hover:underline transition-all"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div className={s.signature}>
        <div className="flex-1">
          <span>&copy; 2025 Curly Pottery. Created by Luis Gameiro</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeSwitcher />
          <I18nWidget />
        </div>
      </div>
    </footer>
  )
}

export default Footer
