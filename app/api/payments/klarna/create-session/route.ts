import { NextRequest, NextResponse } from 'next/server'
import {
  createKlarnaSession,
  isKlarnaConfigured,
} from '@lib/payments/klarna-client'
import { getAppUrl } from '@lib/site-url'

export async function POST(request: NextRequest) {
  if (!isKlarnaConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Klarna is not configured' },
      { status: 503 },
    )
  }

  try {
    const body = await request.json()
    const { orderId, amount, currency = 'GBP', countryCode = 'GB' } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId or amount' },
        { status: 400 },
      )
    }

    const baseUrl = getAppUrl()
    const returnUrl = `${baseUrl}/checkout/success?order=${orderId}&provider=klarna`
    const cancelUrl = `${baseUrl}/checkout?order=${orderId}&provider=klarna&cancelled=true`

    const result = await createKlarnaSession({
      orderId,
      amount,
      currency,
      returnUrl,
      cancelUrl,
      countryCode,
      locale: 'en-GB',
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      clientToken: result.data?.client_token,
      sessionId: result.data?.session_id,
      paymentMethods: result.data?.payment_method_categories,
    })
  } catch (error) {
    console.error('Klarna session API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 },
  )
}
