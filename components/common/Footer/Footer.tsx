import Link from 'next/link'
import I18nWidget from '../I18nWidget'
import ThemeSwitcher from '@components/ui/ThemeSwitcher'
import Image from 'next/image'
import s from './Footer.module.css'
import instagramImage from '@public/instagram.jpg'

type Page = {
  name: string
  url: string
}

const links: Page[] = [
  {
    name: 'About',
    url: '/about',
  },
  {
    name: 'Gallery',
    url: '/gallery',
  },
  {
    name: 'FAQ',
    url: '/faq',
  },
  {
    name: 'Contact',
    url: '/contacts',
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

const Footer = () => {
  return (
    <footer className={s.root}>
      <div className={s.menuContainer}>
        {/* Instagram Column */}
        <div className="flex flex-col items-end gap-4 flex-1">
          <h3 className="text-secondary font-bold text-xl text-center leading-tight">
            Follow me
            <br />
            on Instagram
          </h3>
          <a
            href="https://www.instagram.com/curly_pottery/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <div className="w-32 h-40 relative overflow-hidden bg-accent-1 animate-pulse">
              <Image
                src={instagramImage}
                alt="Instagram feed"
                fill
                sizes="128px"
                className="object-contain"
                placeholder="blur"
              />
            </div>
          </a>
        </div>

        {/* Links Column */}
        <div className="flex flex-col gap-6 flex-1">
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
          <span>
            &copy; {new Date().getFullYear()} Curly Pottery. Created by Luis
            Gameiro
          </span>
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
