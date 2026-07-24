'use client'

import { useState } from 'react'
import { Button, Container, Text, InputCheckbox } from '@components/ui'
import { ConsentPreferences, useConsent } from '@lib/hooks/useConsent'
import { X } from 'lucide-react'

interface CookiePreferencesModalProps {
  onClose: () => void
}

export default function CookiePreferencesModal({
  onClose,
}: CookiePreferencesModalProps) {
  const { consent, updateConsent, acceptAll, acceptEssential } = useConsent()
  const [localConsent, setLocalConsent] = useState<ConsentPreferences>(consent)

  const handleSave = () => {
    if (localConsent.analytics && localConsent.marketing) {
      acceptAll()
    } else if (!localConsent.analytics && !localConsent.marketing) {
      acceptEssential()
    } else {
      updateConsent(localConsent)
    }
    onClose()
  }

  const handleToggle = (key: keyof Omit<ConsentPreferences, 'necessary'>) => {
    setLocalConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="cookie-modal"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <Container className="relative bg-background p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <Text variant="heading">Cookie Preferences</Text>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <Text variant="bold">Essential Cookies</Text>
              <Text variant="muted" className="text-sm">
                Required for the site to function. Cannot be disabled.
              </Text>
            </div>
            <InputCheckbox checked={true} disabled onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <Text variant="bold">Analytics Cookies</Text>
              <Text variant="muted" className="text-sm">
                Help us understand how visitors interact with our website.
              </Text>
            </div>
            <InputCheckbox
              checked={localConsent.analytics}
              onChange={() => handleToggle('analytics')}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <Text variant="bold">Marketing Cookies</Text>
              <Text variant="muted" className="text-sm">
                Used to track visitors across websites for advertising.
              </Text>
            </div>
            <InputCheckbox
              checked={localConsent.marketing}
              onChange={() => handleToggle('marketing')}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="secondary"
            width="100%"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            width="100%"
            variant="flat"
            onClick={handleSave}
            data-testid="cookie-save-btn"
          >
            Save Preferences
          </Button>
        </div>
      </Container>
    </div>
  )
}
