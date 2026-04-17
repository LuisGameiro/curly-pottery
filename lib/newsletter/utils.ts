import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  getAppUrl,
  resolveSiteUrl as resolveSiteUrlFromSiteUrl,
} from '@lib/site-url'

export const resolveSiteUrl = resolveSiteUrlFromSiteUrl

export const NEWSLETTER_DEFAULT_DAILY_LIMIT = 50

const getTrackingSecret = () => {
  const secret =
    process.env.NEWSLETTER_LINK_SECRET || process.env.NEXTAUTH_SECRET

  if (secret) {
    return secret
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'newsletter-dev-secret'
  }

  throw new Error(
    'NEWSLETTER_LINK_SECRET or NEXTAUTH_SECRET must be configured in production.',
  )
}

export const normalizeNewsletterEmail = (email: string) =>
  email.trim().toLowerCase()

const serializeTrackedLink = ({
  token,
  url,
  label,
  productId,
}: {
  token: string
  url: string
  label?: string | null
  productId?: string | null
}) => [token, resolveSiteUrl(url), label || '', productId || ''].join('|')

export const signTrackedNewsletterLink = ({
  token,
  url,
  label,
  productId,
}: {
  token: string
  url: string
  label?: string | null
  productId?: string | null
}) =>
  createHmac('sha256', getTrackingSecret())
    .update(
      serializeTrackedLink({
        token,
        url,
        label,
        productId,
      }),
    )
    .digest('hex')

export const verifyTrackedNewsletterSignature = ({
  token,
  url,
  label,
  productId,
  signature,
}: {
  token: string
  url: string
  label?: string | null
  productId?: string | null
  signature: string
}) => {
  const expected = signTrackedNewsletterLink({
    token,
    url,
    label,
    productId,
  })

  if (expected.length !== signature.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export const buildNewsletterClickUrl = ({
  token,
  url,
  label,
  productId,
}: {
  token: string
  url: string
  label?: string | null
  productId?: string | null
}) => {
  const absoluteUrl = resolveSiteUrl(url)
  const signature = signTrackedNewsletterLink({
    token,
    url: absoluteUrl,
    label,
    productId,
  })
  const searchParams = new URLSearchParams({
    token,
    url: absoluteUrl,
    signature,
  })

  if (label) {
    searchParams.set('label', label)
  }

  if (productId) {
    searchParams.set('productId', productId)
  }

  return `${getAppUrl()}/api/newsletter/click?${searchParams.toString()}`
}

export const buildNewsletterOpenUrl = (token: string) =>
  `${getAppUrl()}/api/newsletter/open?token=${encodeURIComponent(token)}`

export const buildNewsletterUnsubscribeUrl = (token: string) =>
  `${getAppUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
