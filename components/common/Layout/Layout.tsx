'use client'

import dynamic from 'next/dynamic'
import { Navbar, Footer } from '@components/common'
import { LoadingDots } from '@components/ui'
import { Toaster } from 'sonner'

const Loading = () => (
  <div className="w-full min-h-[40vh] flex items-center text-center justify-center p-3">
    <LoadingDots />
  </div>
)

const dynamicProps = {
  loading: Loading,
  ssr: false,
}

const FeatureBar = dynamic(() => import('@components/common/FeatureBar'), {
  ...dynamicProps,
})

const NewsletterBanner = dynamic(
  () => import('../NewsletterBanner/NewsletterBanner'),
  {
    ...dynamicProps,
  },
)

interface Props {
  children?: React.ReactNode
}

export default function Layout({ children }: Props) {
  const navBarlinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Contacts', href: '/contacts' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar links={navBarlinks} />
      <NewsletterBanner />
      <main className="bg-background w-full flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
      <FeatureBar />
    </div>
  )
}
