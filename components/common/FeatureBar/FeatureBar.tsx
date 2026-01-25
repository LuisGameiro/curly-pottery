'use client'

import { useEffect, useState } from 'react'
import cn from 'clsx'
import s from './FeatureBar.module.css'
import { Text, Button } from '@components/ui'

interface FeatureBarProps {
  className?: string
}

const FeatureBar = ({ className }: FeatureBarProps) => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
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
    <div
      className={cn(
        s.root,
        'fixed bottom-0 left-0 w-full p-4 z-50 border-t-2 border-secondary',
        className,
      )}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <Text variant="bold">We value your privacy</Text>
          <Text>
            We use cookies to enhance your experience. Essential cookies are
            necessary for the site to function. Others help us analyze traffic.
            View our{' '}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
            .
          </Text>
        </div>

        <div className="flex  sm:flex-row gap-2 shrink-0">
          <Button variant="slim" onClick={handleAcceptEssential}>
            Essential Only
          </Button>
          <Button color="success" variant="slim" onClick={handleAcceptAll}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeatureBar
