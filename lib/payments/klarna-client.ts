import { ActionResponse } from '@lib/types/types'

const KLANA_API_URL = process.env.KLANA_API_URL || 'https://api.klarna.com'
const KLANA_MERCHANT_ID = process.env.KLANA_MERCHANT_ID!
const KLANA_SHARED_SECRET = process.env.KLANA_SHARED_SECRET!

interface CreateSessionParams {
  orderId: string
  amount: number
  currency: string
  returnUrl: string
  cancelUrl: string
  countryCode?: string
  locale?: string
}

interface SessionResponse {
  session_id: string
  client_token: string
  payment_method_categories: Array<{
    identifier: string
    name: string
    assets: Array<{ url: string; width: number; height: number }>
  }>
}

interface AuthorizeParams {
  sessionId: string
  paymentMethodCategory: string
}

interface AuthorizeResponse {
  order_id: string
  redirect_url?: string
  authorized?: boolean
}

function getKlarnaAuth(): string {
  const credentials = Buffer.from(
    `${KLANA_MERCHANT_ID}:${KLANA_SHARED_SECRET}`
  ).toString('base64')
  return `Basic ${credentials}`
}

export async function createKlarnaSession({
  orderId,
  amount,
  currency,
  returnUrl,
  cancelUrl,
  countryCode = 'GB',
  locale = 'en-GB',
}: CreateSessionParams): Promise<ActionResponse<SessionResponse>> {
  if (!KLANA_MERCHANT_ID || !KLANA_SHARED_SECRET) {
    return {
      success: false,
      message: 'Klarna API credentials not configured',
      errors: new Error('Klarna not configured'),
    }
  }

  try {
    const response = await fetch(`${KLANA_API_URL}/payments/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getKlarnaAuth(),
      },
      body: JSON.stringify({
        payment_method_categories: [
          { identifier: 'pay_now' },
          { identifier: 'pay_later' },
          { identifier: 'pay_over_time' },
        ],
        options: {
          allow_separate_shipping_address: false,
          date_of_birth_mandatory: false,
          require_validate_callback_info: false,
        },
        order_lines: [
          {
            type: 'physical',
            reference: orderId,
            name: `Order ${orderId}`,
            quantity: 1,
            unit_price: Math.round(amount * 100),
            total_amount: Math.round(amount * 100),
            total_tax: 0,
          },
        ],
        order_amount: Math.round(amount * 100),
        order_tax_amount: 0,
        order_currency: currency,
        merchant_reference1: orderId,
        country_code: countryCode,
        locale: locale,
        urls: {
          success: returnUrl,
          cancel: cancelUrl,
          authorization: returnUrl,
          pending: returnUrl,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Klarna session error:', errorText)
      return {
        success: false,
        message: 'Failed to create Klarna payment session',
        errors: new Error(errorText),
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Klarna session created',
      data: {
        session_id: data.session_id,
        client_token: data.client_token,
        payment_method_categories: data.payment_method_categories || [],
      },
    }
  } catch (error) {
    console.error('Klarna API error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Klarna API error',
      errors: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

export async function authorizeKlarnaPayment({
  sessionId,
  paymentMethodCategory,
}: AuthorizeParams): Promise<ActionResponse<AuthorizeResponse>> {
  if (!KLANA_MERCHANT_ID || !KLANA_SHARED_SECRET) {
    return {
      success: false,
      message: 'Klarna API credentials not configured',
      errors: new Error('Klarna not configured'),
    }
  }

  try {
    const response = await fetch(
      `${KLANA_API_URL}/payments/v1/sessions/${sessionId}/authorize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getKlarnaAuth(),
        },
        body: JSON.stringify({
          payment_method_category: paymentMethodCategory,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Klarna authorize error:', errorText)
      return {
        success: false,
        message: 'Failed to authorize Klarna payment',
        errors: new Error(errorText),
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Payment authorized',
      data: {
        order_id: data.order_id,
        redirect_url: data.redirect_url,
        authorized: data.authorized,
      },
    }
  } catch (error) {
    console.error('Klarna authorize API error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Klarna authorize error',
      errors: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

export const KlarnaPaymentMethods = {
  PAY_NOW: 'pay_now',
  PAY_LATER: 'pay_later',
  PAY_OVER_TIME: 'pay_over_time',
} as const

export type KlarnaPaymentMethod = (typeof KlarnaPaymentMethods)[keyof typeof KlarnaPaymentMethods]

export function getKlarnaPaymentMethodName(identifier: string): string {
  const names: Record<string, string> = {
    pay_now: 'Pay Now',
    pay_later: 'Pay in 30 Days',
    pay_over_time: 'Financing',
  }
  return names[identifier] || identifier
}

export function isKlarnaConfigured(): boolean {
  return !!(KLANA_MERCHANT_ID && KLANA_SHARED_SECRET)
}