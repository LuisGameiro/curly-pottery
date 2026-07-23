'use client'

import { useEffect, useState } from 'react'
import { Container, Text, Button, InputCheckbox } from '@components/ui'
import { useConsent, ConsentPreferences } from '@lib/hooks/useConsent'
import { hasAnalyticsConsent, hasMarketingConsent } from '@lib/consent-utils'
import Link from 'next/link'

export default function CookieSettingsPage() {
  const { consent, updateConsent, acceptAll, acceptEssential, hasConsented } =
    useConsent()
  const [localConsent, setLocalConsent] = useState<ConsentPreferences>(consent)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setLocalConsent(consent)
  }, [consent])

  const handleToggle = (key: keyof Omit<ConsentPreferences, 'necessary'>) => {
    setLocalConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = () => {
    if (localConsent.analytics && localConsent.marketing) {
      acceptAll()
    } else if (!localConsent.analytics && !localConsent.marketing) {
      acceptEssential()
    } else {
      updateConsent(localConsent)
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleReset = () => {
    window.location.reload()
  }

  return (
    <Container className="py-12 max-w-2xl">
      <div className="space-y-6">
        <div>
          <Text variant="pageHeading">Cookie Settings</Text>
          <Text>
            Manage your cookie preferences. Essential cookies are required for
            the site to function and cannot be disabled.
          </Text>
        </div>

        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Text variant="bold">Essential Cookies</Text>
              <Text variant="muted" className="text-sm">
                Required for the site to function. Cannot be disabled.
              </Text>
            </div>
            <InputCheckbox checked={true} disabled onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <Text variant="bold">Analytics Cookies</Text>
              <Text variant="muted" className="text-sm">
                Help us understand how visitors interact with our website
                through PostHog and Google Analytics.
              </Text>
            </div>
            <InputCheckbox
              checked={localConsent.analytics}
              onChange={() => handleToggle('analytics')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <Text variant="bold">Marketing Cookies</Text>
              <Text variant="muted" className="text-sm">
                Used to track visitors across websites for advertising purposes.
              </Text>
            </div>
            <InputCheckbox
              checked={localConsent.marketing}
              onChange={() => handleToggle('marketing')}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleSave} color="success">
            {isSaved ? 'Saved!' : 'Save Preferences'}
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>

        {isSaved && (
          <Text variant="muted" className="text-green">
            Your preferences have been saved. Some analytics may take a few
            minutes to update.
          </Text>
        )}

        <div className="pt-6 border-t">
          <Text variant="bold">Current Status</Text>
          <div className="mt-2 space-y-1 text-sm">
            <Text>
              Analytics: {hasAnalyticsConsent(consent) ? 'Enabled' : 'Disabled'}
            </Text>
            <Text>
              Marketing: {hasMarketingConsent(consent) ? 'Enabled' : 'Disabled'}
            </Text>
            <Text>Last updated: {hasConsented ? 'Yes' : 'No'}</Text>
          </div>
        </div>

        <div className="pt-6">
          <Text variant="bold">Learn More</Text>
          <Text className="mt-2">
            Read our{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{' '}
            to understand how we process your data.
          </Text>
        </div>
      </div>
    </Container>
  )
}
