import Script from 'next/script'
import { Button, Text } from '@components/ui'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { CurrencyCode } from '@lib/types/types'
import { Loader2 } from 'lucide-react'

interface SumUpResponse {
  status: 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED'
  id: string
  transaction_code?: string
  amount: number
  currency: string
}
declare global {
  interface Window {
    SumUpCard: {
      mount: (options: {
        id: string
        checkoutId: string
        currency: CurrencyCode
        locale: string
        country: string
        showFooter: boolean
        onLoad: () => void

        onResponse: (type: string, body: SumUpResponse) => void
      }) => void
      unmount: () => void
    }
  }
}
export default function SumUpPayment({
  checkoutId,
  onComplete,
}: {
  checkoutId: string
  onComplete: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowRetry(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [loading])

  const mountSumUp = () => {
    setShowRetry(false)
    setLoading(true)

    if (!window.SumUpCard) return

    window.SumUpCard.mount({
      id: 'sumup-card',
      checkoutId: checkoutId,
      currency: CurrencyCode.GBP,
      locale: 'en_GB',
      country: 'GB',
      showFooter: false,
      onLoad: () => {
        setLoading(false)
      },
      onResponse: function (type: string, body: SumUpResponse) {
        if (type === 'success' || body.status === 'PAID') {
          onComplete()
        }
        if (type === 'error' || body.status === 'FAILED') {
          toast.error('Payment failed. Please try again.')
        }
        if (body.status === 'PENDING') {
          toast.warning('Payment is pending. Please complete the payment.')
        }
        if (body.status === 'EXPIRED') {
          toast.error('Payment session expired. Please try again.')
        } else {
          toast.error('An unexpected error occurred. Please try again.')
        }
        window.SumUpCard.unmount()
      },
    })
  }

  return (
    <div className="space-y-8">
      <Text variant="sectionHeading">Finalize Payment</Text>

      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        onLoad={mountSumUp}
        onError={() => setShowRetry(true)} // Handle network block/failure
      />

      <div
        id="sumup-card"
        className="relative border p-4 rounded-xl bg-accent-1 min-h-[250px] flex flex-col items-center justify-center"
      >
        {loading && !showRetry && (
          <div className="animate-pulse text-muted">
            <Loader2 className="mx-auto mb-2" />
            Loading Secure Gateway...
          </div>
        )}

        {showRetry && (
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500">
              Gateway taking too long to load.
            </p>
            <Button variant="secondary" onClick={mountSumUp}>
              Reload Payment Gateway
            </Button>
          </div>
        )}
      </div>

      <Button variant="secondary" onClick={onComplete}>
        test button
      </Button>
    </div>
  )
}
