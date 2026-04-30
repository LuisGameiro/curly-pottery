import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'prisma/prisma'
import crypto from 'crypto'

const KLARNA_WEBHOOK_SECRET = process.env.KLARNA_SHARED_SECRET!

interface KlarnaWebhookPayload {
  event_id: string
  event_type: string
  merchant_reference1: string
  order_id?: string
  klarna_order_id?: string
}

function verifyKlarnaSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', KLARNA_WEBHOOK_SECRET)
    .update(payload)
    .digest('base64')
  return expectedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-klarna-signature') || ''
    const rawBody = await request.text()

    if (!verifyKlarnaSignature(rawBody, signature)) {
      console.error('Invalid Klarna webhook signature')
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 },
      )
    }

    const payload: KlarnaWebhookPayload = JSON.parse(rawBody)
    console.log('Klarna webhook received:', payload.event_type)

    const {
      event_type,
      merchant_reference1,
      klarna_order_id: _klarnaOrderId,
    } = payload
    const orderId = merchant_reference1

    switch (event_type) {
      case 'CHECKOUT_EXPIRED':
      case 'ORDER_CANCELLED':
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        })
        break

      case 'PAYMENT_AUTHORIZED':
      case 'ORDER_CREATED':
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        })
        break

      case 'PAYMENT_CAPTURED':
      case 'ORDER_COMPLETED':
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        })
        break

      default:
        console.log('Unhandled Klarna event:', event_type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Klarna webhook error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
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
