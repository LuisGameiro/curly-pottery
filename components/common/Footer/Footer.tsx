import { FC } from 'react'
import cn from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { Page } from '@lib/types/page'
import getSlug from '@lib/get-slug'
import { Github, Vercel } from '@components/icons'
import { Logo, Container } from '@components/ui'
import { I18nWidget } from '@components/common'
import ThemeSwitcher from '@components/ui/ThemeSwitcher'
import s from './Footer.module.css'
import FAQ from 'pages/faq'

interface Props {
  className?: string
  children?: any
  pages?: Page[]
}

const links = [
  {
    name: 'Home',
    url: '/',
  },
]

const Footer: FC<Props> = ({ className, pages }) => {
  // const { sitePages } = usePages(pages)
  const rootClassName = cn(s.root, className)

  return (
    <footer className={rootClassName}>
      <Container>
        <div className="grid grid-cols-12  max-w-12/12 py-8   border-b border-accent-2 pt-4 text-primary transition-colors duration-150">
          {/* <div className="col-span-1 lg:col-span-2">
            <Link
              href="/"
              className="flex flex-initial items-center font-bold md:mr-24"
            >
              <span className="rounded-full border border-accent-6 mr-2">
                <Logo />
              </span>
              <span>Curly Pottery</span>
            </Link>
          </div> */}
          <div className="col-span-5 mx-8 md:ml-64">
            <div className="grid space-y-3 ">
              <span key={'faq'}>
                <Link
                  href={'/faq'}
                  className="text-accent-9 hover:text-accent-6 transition ease-in-out duration-150"
                >
                  FAQ
                </Link>
              </span>
              <span key={'contacts'}>
                <Link
                  href={'/contacts'}
                  className="text-accent-9 hover:text-accent-6 transition ease-in-out duration-150"
                >
                  Contacts
                </Link>
              </span>
                     <span key={'about'}>
                <Link
                  href={'/about'}
                  className="text-accent-9 hover:text-accent-6 transition ease-in-out duration-150"
                >
                  About
                </Link>
              </span>
            </div>
          </div>
          <div className="col-span-7 flex items-start justify-end text-primary">
            <div className="flex space-x-4 items-center h-10">
              <ThemeSwitcher />
              <I18nWidget />

            </div>
          </div>
        </div>
        <div className="py-2 flex flex-col md:flex-row justify-between items-center px-4 text-accent-6 text-sm">
          <span>&copy; 2025 curly pottery, Inc. All rights reserved.</span>
          <span >Created by Luis Gameiro</span>

        </div>
      </Container>
    </footer>
  )
}

// function usePages(pages?: Page[]) {
//   const { locale } = useRouter()
//   const sitePages: Page[] = []

//   if (pages) {
//     pages.forEach((page) => {
//       const slug = page.url && getSlug(page.url)
//       if (!slug) return
//       if (locale && !slug.startsWith(`${locale}/`)) return
//       sitePages.push(page)
//     })
//   }

//   return {
//     sitePages: sitePages.sort(bySortOrder),
//   }
// }

// // Sort pages by the sort order assigned in the BC dashboard
// function bySortOrder(a: Page, b: Page) {
//   return (a.sort_order ?? 0) - (b.sort_order ?? 0)
// }

export default Footer
