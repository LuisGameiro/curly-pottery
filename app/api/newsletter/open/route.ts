import { recordNewsletterOpen } from '@lib/newsletter/service'
import { NextResponse } from 'next/server'

const transparentGif = Buffer.from(
  'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64',
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (token) {
    try {
      await recordNewsletterOpen(token)
    } catch {
      // Ignore tracking failures so email clients still render.
    }
  }

  return new NextResponse(transparentGif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
