import { dispatchQueuedNewsletterBatch } from '@lib/newsletter/service'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const isAuthorized = (request: Request) => {
  const secret =
    process.env.NEWSLETTER_DISPATCH_SECRET || process.env.CRON_SECRET

  if (!secret) {
    return false
  }

  return request.headers.get('authorization') === `Bearer ${secret}`
}

const runDispatch = async (request: Request) => {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized newsletter dispatch request.' },
      { status: 401 },
    )
  }

  try {
    const result = await dispatchQueuedNewsletterBatch()

    return NextResponse.json({
      success: true,
      message: 'Newsletter dispatch completed.',
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Newsletter dispatch failed.',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  return runDispatch(request)
}

export async function POST(request: Request) {
  return runDispatch(request)
}
