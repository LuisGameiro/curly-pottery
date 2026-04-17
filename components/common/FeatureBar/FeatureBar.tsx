'use client'

import { useEffect, useState } from 'react'
import cn from 'clsx'
import s from './FeatureBar.module.css'
import { Text, Button } from '@components/ui'
import Link from 'next/link'

interface FeatureBarProps {
  className?: string
}

const FeatureBar = ({ className }: FeatureBarProps) => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setTimeout(() => {
        setShowBanner(true)
      }, 0)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ analytics: true, marketing: true }),
    )
    setShowBanner(false)
  }

  const handleAcceptEssential = () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ analytics: false, marketing: false }),
    )
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className={cn(s.root, className)}>
      <div className="max-w-screen mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-on-primary">
        <div className="text-sm">
          <Text variant="bold">We value your privacy</Text>
          <Text>
            We use cookies to enhance your experience. Essential cookies are
            necessary for the site to function. Others help us analyze traffic.
            View our{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
          <Button
            type="button"
            variant="slim"
            className="w-full sm:w-auto"
            onClick={handleAcceptEssential}
          >
            Essential Only
          </Button>
          <Button
            type="button"
            color="success"
            variant="slim"
            className="w-full sm:w-auto"
            onClick={handleAcceptAll}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeatureBar
