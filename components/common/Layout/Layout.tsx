'use client'

import dynamic from 'next/dynamic'
import { Navbar, Footer } from '@components/common'
import { LoadingDots } from '@components/ui'
import { Toaster } from 'sonner'

const Loading = () => (
  <div className="w-80 h-80 flex items-center text-center justify-center p-3">
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

interface Props {
  children?: React.ReactNode
}

export default function Layout({ children }: Props) {
  const navBarlinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Contacts', href: '/contacts' },
  ]

  return (
    <div>
      {/* <Navbar links={navBarlinks} /> */}
      <main className="bg-background w-full h-full min-h-[calc(100vh-310px)] flex flex-col">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
      <FeatureBar />
    </div>
  )
}
