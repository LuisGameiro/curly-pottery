'use client'

import { useState } from 'react'
import { Text } from '@components/ui'
import SumUpPayment from '@components/checkout/SumUpPayment'
import KlarnaPaymentWidget from '@components/checkout/KlarnaPayment'
import { isKlarnaConfigured } from '@lib/payments/klarna-client'

interface PaymentSelectorProps {
  sumupCheckoutId: string
  klarnaClientToken?: string
  onSumUpComplete: () => void
  onKlarnaSuccess: (result: { orderId: string }) => void
  onError: (error: string) => void
  onCancelled: () => void
  totalAmount: number
  currency: string
}

type PaymentProvider = 'sumup' | 'klarna'

export default function PaymentSelector({
  sumupCheckoutId,
  klarnaClientToken,
  onSumUpComplete,
  onKlarnaSuccess,
  onError,
  onCancelled,
  totalAmount,
  currency,
}: PaymentSelectorProps) {
  const [provider, setProvider] = useState<PaymentProvider>('sumup')
  const [showKlarna, setShowKlarna] = useState(false)

  const handleProviderChange = async (newProvider: PaymentProvider) => {
    setProvider(newProvider)

    if (newProvider === 'klarna' && !klarnaClientToken) {
      try {
        const response = await fetch('/api/payments/klarna/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: `ORDER-${Date.now()}`,
            amount: totalAmount,
            currency,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setShowKlarna(true)
        } else {
          onError(data.message || 'Failed to initialize Klarna')
          setProvider('sumup')
        }
      } catch (error) {
        console.error('Klarna init error:', error)
        onError('Failed to load Klarna payment options')
        setProvider('sumup')
      }
    } else {
      setShowKlarna(false)
    }
  }

  const handleKlarnaSuccess = (result: { orderId: string; redirectUrl?: string }) => {
    onKlarnaSuccess({ orderId: result.orderId })
  }

  return (
    <div className="space-y-4">
      <Text variant="bold">Select Payment Method</Text>

      <div className="space-y-3">
        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
          <input
            type="radio"
            name="payment-provider"
            value="sumup"
            checked={provider === 'sumup'}
            onChange={() => handleProviderChange('sumup')}
            className="mr-3"
          />
          <div className="flex-1">
            <Text variant="bold">Credit/Debit Card</Text>
            <Text variant="muted" className="text-sm">
              Secure payment via SumUp
            </Text>
          </div>
        </label>

        {isKlarnaConfigured() && (
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
            <input
              type="radio"
              name="payment-provider"
              value="klarna"
              checked={provider === 'klarna'}
              onChange={() => handleProviderChange('klarna')}
              className="mr-3"
            />
            <div className="flex-1">
              <Text variant="bold">Klarna</Text>
              <Text variant="muted" className="text-sm">
                Buy now, pay later or in installments
              </Text>
            </div>
          </label>
        )}
      </div>

      <div className="mt-4">
        {provider === 'sumup' && (
          <SumUpPayment
            checkoutId={sumupCheckoutId}
            onComplete={onSumUpComplete}
          />
        )}

        {provider === 'klarna' && showKlarna && klarnaClientToken && (
          <KlarnaPaymentWidget
            clientToken={klarnaClientToken}
            onPaymentAuthorized={handleKlarnaSuccess}
            onError={onError}
            onCancelled={onCancelled}
            returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success`}
          />
        )}

        {provider === 'klarna' && !showKlarna && (
          <div className="py-4 text-center">
            <Text variant="muted">Loading Klarna payment options...</Text>
          </div>
        )}
      </div>
    </div>
  )
}