import { NextRequest, NextResponse } from 'next/server'
import {
  createKlarnaSession,
  isKlarnaConfigured,
} from '@lib/payments/klarna-client'
import { getAppUrl } from '@lib/site-url'

import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'
import { prisma } from 'prisma/prisma'

export async function POST(request: NextRequest) {
  if (!isKlarnaConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Klarna is not configured' },
      { status: 503 },
    )
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please sign in.' },
        { status: 401 },
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found.' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const { currency = 'GBP', countryCode = 'GB' } = body

    // Always use the server-validated price and Order ID (Cart ID)
    const amount = cart.totalPrice
    const orderId = `KLARNA-${cart.id}-${Date.now()}`

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
