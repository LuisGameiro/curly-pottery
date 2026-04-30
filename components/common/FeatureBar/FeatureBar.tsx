'use client'

import Link from 'next/link'
import { useState } from 'react'
import s from './FeatureBar.module.css'
import { Text, Button } from '@components/ui'
import { useConsent } from '@lib/hooks/useConsent'
import { trackEvent } from '@lib/analytics/trackEvents'
import CookiePreferencesModal from '../CookiePreferencesModal'

interface FeatureBarProps {
  className?: string
}

export default function FeatureBar({ className }: FeatureBarProps) {
  const { showBanner, acceptAll, acceptEssential } = useConsent()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAcceptAll = () => {
    acceptAll()
    trackEvent('consent_accepted', { type: 'all' })
  }

  const handleAcceptEssential = () => {
    acceptEssential()
    trackEvent('consent_accepted', { type: 'essential' })
  }

  if (!showBanner && !isModalOpen) return null

  return (
    <>
      {showBanner && (
        <div className={`${s.root} ${className || ''}`}>
          <div className="max-w-screen mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-on-primary">
            <div className="text-sm">
              <Text variant="bold">We value your privacy</Text>
              <Text>
                We use cookies to enhance your experience. Essential cookies are
                necessary for the site to function. Others help us analyze traffic
                and provide personalized content.
                <Link href="/privacy" className="underline ml-1">
                  Privacy Policy
                </Link>
              </Text>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="button"
                variant="flat"
                className="w-full sm:w-auto bg-transparent border border-white hover:bg-white/10"
                onClick={() => setIsModalOpen(true)}
              >
                Manage Preferences
              </Button>
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
      )}
      <CookiePreferencesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

export { hasAnalyticsConsent, hasMarketingConsent } from '@lib/hooks/useConsent'
