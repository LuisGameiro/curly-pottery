'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Text, Button } from '@components/ui'
import {
  getKlarnaPaymentMethodName,
  isKlarnaConfigured,
} from '@lib/payments/klarna-client'

interface KlarnaPaymentWidgetProps {
  clientToken: string
  onPaymentAuthorized: (result: {
    orderId: string
    redirectUrl?: string
  }) => void
  onError: (error: string) => void
  onCancelled: () => void
  returnUrl: string
}

interface KlarnaWidget {
  init: (config: { container: string; client_token: string }) => void
  load: () => void
  authorize: (
    paymentMethodCategory: string,
    callback: (result: {
      authorization_token: string
      redirect_url?: string
    }) => void,
  ) => void
  on: (
    event: string,
    callback: (data: { code: string; message: string }) => void,
  ) => void
  resume: () => void
}

declare global {
  interface Window {
    Klarna: {
      Payments: new (config: { base: string }) => KlarnaWidget
    }
  }
}

export default function KlarnaPaymentWidget({
  clientToken,
  onPaymentAuthorized,
  onError,
  onCancelled,
  returnUrl,
}: KlarnaPaymentWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<KlarnaWidget | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadKlarnaSDK = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.Klarna) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.klarna.com/web-sdk/v1/klarna.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Klarna SDK'))
      document.head.appendChild(script)
    })
  }, [])

  useEffect(() => {
    // Prevent re-initialisation if widget is already mounted
    if (widgetRef.current) return

    async function initKlarna() {
      if (!clientToken || !containerRef.current) return

      try {
        setIsLoading(true)
        await loadKlarnaSDK()

        const Klarna = window.Klarna?.Payments
        if (!Klarna) {
          throw new Error('Klarna SDK not loaded')
        }

        const klarna = new Klarna({
          base: 'https://js.klarna.com/web-sdk/v1',
        })

        klarna.init({
          container: '#klarna-payment-container',
          client_token: clientToken,
        })

        klarna.load()

        klarna.on('change', (data: { code: string; message: string }) => {
          if (data.code === 'SELECT_PAYMENT_METHOD') {
            setSelectedMethod(data.message)
          }
        })

        klarna.on('error', (data: { code: string; message: string }) => {
          onError(data.message)
        })

        klarna.on('cancel', () => {
          onCancelled()
        })

        widgetRef.current = klarna
        setIsReady(true)
      } catch (error) {
        console.error('Klarna init error:', error)
        onError('Failed to initialize Klarna payment widget')
      } finally {
        setIsLoading(false)
      }
    }

    initKlarna()
  }, [clientToken, loadKlarnaSDK, onError, onCancelled])

  const handleAuthorize = async () => {
    if (!selectedMethod) {
      onError('Please select a payment method')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/payments/klarna/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: clientToken,
          paymentMethodCategory: selectedMethod,
          returnUrl,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      } else {
        onPaymentAuthorized({
          orderId: result.orderId,
          redirectUrl: result.redirectUrl,
        })
      }
    } catch (error) {
      console.error('Authorization error:', error)
      onError(
        error instanceof Error ? error.message : 'Payment authorization failed',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isKlarnaConfigured()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <Text variant="error">
          Klarna is not configured. Please contact support.
        </Text>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div id="klarna-payment-container" ref={containerRef} />

      {!isReady && (
        <div className="text-center py-4">
          <Text variant="muted">Loading payment options...</Text>
        </div>
      )}

      {selectedMethod && (
        <Button
          type="button"
          width="100%"
          loading={isLoading}
          color="success"
          onClick={handleAuthorize}
        >
          Pay with {getKlarnaPaymentMethodName(selectedMethod)}
        </Button>
      )}
    </div>
  )
}
