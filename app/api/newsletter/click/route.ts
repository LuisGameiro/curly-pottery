import { newsletterTrackedLinkSchema } from '@lib/form-validator'
import { recordNewsletterClick } from '@lib/newsletter/service'
import { resolveSiteUrl } from '@lib/newsletter/utils'
import { NextResponse } from 'next/server'

const redirectHome = () => NextResponse.redirect(new URL(resolveSiteUrl('/')))

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const validation = newsletterTrackedLinkSchema.safeParse({
    token: searchParams.get('token') || '',
    url: searchParams.get('url') || '',
    signature: searchParams.get('signature') || '',
    label: searchParams.get('label') || '',
    productId: searchParams.get('productId') || '',
  })

  if (!validation.success) {
    return redirectHome()
  }

  try {
    const destination = await recordNewsletterClick(validation.data)
    return NextResponse.redirect(new URL(destination))
  } catch {
    return redirectHome()
  }
}
