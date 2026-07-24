jest.mock('@lib/site-url', () => ({
  getAppUrl: () => 'https://example.com',
  resolveSiteUrl: (url: string | URL) =>
    new URL(url.toString(), 'https://example.com').toString(),
}))

import {
  buildNewsletterClickUrl,
  buildNewsletterOpenUrl,
  buildNewsletterUnsubscribeUrl,
  normalizeNewsletterEmail,
  NEWSLETTER_DEFAULT_DAILY_LIMIT,
  signTrackedNewsletterLink,
  verifyTrackedNewsletterSignature,
} from './utils'

beforeAll(() => {
  process.env.NEWSLETTER_LINK_SECRET = 'test-secret-for-hmac'
})

afterAll(() => {
  delete process.env.NEWSLETTER_LINK_SECRET
})

describe('NEWSLETTER_DEFAULT_DAILY_LIMIT', () => {
  it('is set to 50', () => {
    expect(NEWSLETTER_DEFAULT_DAILY_LIMIT).toBe(50)
  })
})

describe('normalizeNewsletterEmail', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeNewsletterEmail('  JANE@Example.com ')).toBe(
      'jane@example.com',
    )
  })

  it('handles mixed case', () => {
    expect(normalizeNewsletterEmail('User.Name+Tag@Domain.Co.UK')).toBe(
      'user.name+tag@domain.co.uk',
    )
  })

  it('trims leading and trailing spaces', () => {
    expect(normalizeNewsletterEmail('   hello@world.com   ')).toBe(
      'hello@world.com',
    )
  })
})

describe('signTrackedNewsletterLink', () => {
  it('produces a 64-character hex signature', () => {
    const sig = signTrackedNewsletterLink({
      token: 'token-1',
      url: 'https://example.com/shop/mug',
    })

    expect(sig).toMatch(/^[a-f0-9]{64}$/)
  })

  it('produces different signatures for different inputs', () => {
    const sig1 = signTrackedNewsletterLink({
      token: 'token-1',
      url: 'https://example.com/shop/mug',
    })
    const sig2 = signTrackedNewsletterLink({
      token: 'token-2',
      url: 'https://example.com/shop/mug',
    })
    const sig3 = signTrackedNewsletterLink({
      token: 'token-1',
      url: 'https://example.com/shop/bowl',
    })

    expect(sig1).not.toBe(sig2)
    expect(sig1).not.toBe(sig3)
    expect(sig2).not.toBe(sig3)
  })

  it('includes optional label and productId in signature', () => {
    const withLabel = signTrackedNewsletterLink({
      token: 'token-1',
      url: 'https://example.com/shop/mug',
      label: 'product:studio-mug',
      productId: 'product-1',
    })
    const withoutLabel = signTrackedNewsletterLink({
      token: 'token-1',
      url: 'https://example.com/shop/mug',
    })

    expect(withLabel).not.toBe(withoutLabel)
  })
})

describe('verifyTrackedNewsletterSignature', () => {
  it('returns true for a valid signature', () => {
    const url = 'https://example.com/shop/mug'
    const signature = signTrackedNewsletterLink({
      token: 'token-1',
      url,
    })

    const result = verifyTrackedNewsletterSignature({
      token: 'token-1',
      url,
      signature,
    })

    expect(result).toBe(true)
  })

  it('returns false for a wrong signature', () => {
    const result = verifyTrackedNewsletterSignature({
      token: 'token-1',
      url: 'https://example.com/shop/mug',
      signature:
        '0000000000000000000000000000000000000000000000000000000000000000',
    })

    expect(result).toBe(false)
  })

  it('returns false when signature length differs', () => {
    const result = verifyTrackedNewsletterSignature({
      token: 'token-1',
      url: 'https://example.com/shop/mug',
      signature: 'too-short',
    })

    expect(result).toBe(false)
  })

  it('validates with optional label and productId', () => {
    const url = 'https://example.com/shop/mug'
    const signature = signTrackedNewsletterLink({
      token: 'token-1',
      url,
      label: 'product:studio-mug',
      productId: 'product-1',
    })

    const result = verifyTrackedNewsletterSignature({
      token: 'token-1',
      url,
      signature,
      label: 'product:studio-mug',
      productId: 'product-1',
    })

    expect(result).toBe(true)
  })
})

describe('buildNewsletterClickUrl', () => {
  it('returns correct URL format with token and signature params', () => {
    const result = buildNewsletterClickUrl({
      token: 'token-1',
      url: '/shop/mug',
    })

    expect(result).toMatch(/^https:\/\/example\.com\/api\/newsletter\/click\?/)
    expect(result).toContain('token=token-1')
    expect(result).toContain('url=https%3A%2F%2Fexample.com%2Fshop%2Fmug')
    expect(result).toContain('signature=')
  })

  it('includes label and productId when provided', () => {
    const result = buildNewsletterClickUrl({
      token: 'token-1',
      url: '/shop/mug',
      label: 'product:studio-mug',
      productId: 'product-1',
    })

    expect(result).toContain('label=product%3Astudio-mug')
    expect(result).toContain('productId=product-1')
  })

  it('produces a 64-character hex signature', () => {
    const result = buildNewsletterClickUrl({
      token: 'token-1',
      url: '/shop/mug',
    })
    const urlObj = new URL(result)
    const sig = urlObj.searchParams.get('signature')

    expect(sig).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe('buildNewsletterOpenUrl', () => {
  it('returns correct URL with token', () => {
    const result = buildNewsletterOpenUrl('token-1')

    expect(result).toBe('https://example.com/api/newsletter/open?token=token-1')
  })

  it('encodes special characters in token', () => {
    const result = buildNewsletterOpenUrl('token with spaces/and?chars')

    expect(result).toBe(
      'https://example.com/api/newsletter/open?token=token%20with%20spaces%2Fand%3Fchars',
    )
  })
})

describe('buildNewsletterUnsubscribeUrl', () => {
  it('returns correct URL with token', () => {
    const result = buildNewsletterUnsubscribeUrl('token-1')

    expect(result).toBe(
      'https://example.com/newsletter/unsubscribe?token=token-1',
    )
  })

  it('encodes special characters in token', () => {
    const result = buildNewsletterUnsubscribeUrl('token+with/special?chars')

    expect(result).toBe(
      'https://example.com/newsletter/unsubscribe?token=token%2Bwith%2Fspecial%3Fchars',
    )
  })
})

describe('getTrackingSecret', () => {
  beforeEach(() => {
    delete process.env.NEWSLETTER_LINK_SECRET
    delete process.env.NEXTAUTH_SECRET
  })

  it('uses NEWSLETTER_LINK_SECRET when both env vars are set', () => {
    process.env.NEWSLETTER_LINK_SECRET = 'custom-link-secret'
    process.env.NEXTAUTH_SECRET = 'fallback-secret'

    const url = 'https://example.com/shop/mug'
    const sig = signTrackedNewsletterLink({
      token: 'token-secret-1',
      url,
    })
    const verified = verifyTrackedNewsletterSignature({
      token: 'token-secret-1',
      url,
      signature: sig,
    })

    expect(verified).toBe(true)
  })

  it('falls back to NEXTAUTH_SECRET when NEWSLETTER_LINK_SECRET is not set', () => {
    process.env.NEXTAUTH_SECRET = 'nextauth-fallback-secret'

    const url = 'https://example.com/shop/mug'
    const sig = signTrackedNewsletterLink({
      token: 'token-fallback-1',
      url,
    })
    const verified = verifyTrackedNewsletterSignature({
      token: 'token-fallback-1',
      url,
      signature: sig,
    })

    expect(verified).toBe(true)
  })

  it('uses dev fallback when neither secret is set and NODE_ENV is not production', () => {
    // In Jest, NODE_ENV defaults to 'test' (not 'production'), so the dev
    // fallback 'newsletter-dev-secret' is used when neither env var is set.
    const url = 'https://example.com/shop/mug'
    const sig = signTrackedNewsletterLink({
      token: 'token-dev-1',
      url,
    })
    const verified = verifyTrackedNewsletterSignature({
      token: 'token-dev-1',
      url,
      signature: sig,
    })

    expect(verified).toBe(true)
  })

  it('throws in production when neither env var is set', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = 'production'

    expect(() =>
      signTrackedNewsletterLink({
        token: 'token-prod-1',
        url: 'https://example.com/shop/mug',
      }),
    ).toThrow(
      'NEWSLETTER_LINK_SECRET or NEXTAUTH_SECRET must be configured in production.',
    )
  })
})
