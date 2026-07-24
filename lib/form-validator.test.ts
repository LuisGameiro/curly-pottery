import {
  isInternalUrl,
  CategorySchema,
  VariantSchema,
  ProductSchema,
  registerSchema,
  newsletterSubscriptionSchema,
  newsletterCampaignSchema,
  newsletterTokenSchema,
  newsletterCampaignIdSchema,
  newsletterTrackedLinkSchema,
} from './form-validator'

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
})

afterAll(() => {
  process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
})

describe('isInternalUrl', () => {
  it('returns true for URLs on the same host', () => {
    expect(isInternalUrl('https://example.com/page')).toBe(true)
    expect(isInternalUrl('https://example.com/products/vase')).toBe(true)
  })

  it('returns false for external URLs', () => {
    expect(isInternalUrl('https://google.com')).toBe(false)
    expect(isInternalUrl('https://external.org/path')).toBe(false)
  })

  it('returns true for relative paths', () => {
    expect(isInternalUrl('/about')).toBe(true)
    expect(isInternalUrl('/products/vase')).toBe(true)
    expect(isInternalUrl('/')).toBe(true)
  })
})

describe('CategorySchema', () => {
  it('accepts valid category input', () => {
    const result = CategorySchema.parse({
      name: 'Vases',
      image: 'https://example.com/vases.jpg',
    })
    expect(result.name).toBe('Vases')
    expect(result.image).toBe('https://example.com/vases.jpg')
  })

  it('rejects name shorter than 2 characters', () => {
    const result = CategorySchema.safeParse({
      name: 'A',
      image: 'https://example.com/vases.jpg',
    })
    expect(result.success).toBe(false)
  })

  it('rejects name longer than 50 characters', () => {
    const result = CategorySchema.safeParse({
      name: 'A'.repeat(51),
      image: 'https://example.com/vases.jpg',
    })
    expect(result.success).toBe(false)
  })

  it('rejects relative image URL', () => {
    const result = CategorySchema.safeParse({
      name: 'Vases',
      image: '/images/vases.jpg',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-URL image string', () => {
    const result = CategorySchema.safeParse({
      name: 'Vases',
      image: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })
})

describe('VariantSchema', () => {
  const validVariant = {
    id: 'var-1',
    price: 29.99,
    sku: 'SKU-001',
    stock: 10,
    sizeName: 'One Size',
    colorName: 'Natural',
    colorHex: '#f0e3d4',
    availableForSale: true,
    isExpanded: false,
    details: [{ title: 'Material', description: 'Stoneware' }],
    discounts: [{ type: 'PERCENTAGE', value: 10 }],
    files: ['file1.jpg'],
    previews: ['preview1.jpg'],
  }

  it('accepts valid variant', () => {
    const result = VariantSchema.parse(validVariant)
    expect(result.price).toBe(29.99)
    expect(result.colorName).toBe('Natural')
    expect(result.images).toEqual([])
  })

  it('rejects negative price', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      price: -1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative stock', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      stock: -5,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty colorName', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      colorName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty sizeName', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      sizeName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty colorHex', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      colorHex: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty files array', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      files: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty previews array', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      previews: [],
    })
    expect(result.success).toBe(false)
  })

  it('provides default empty array for images when omitted', () => {
    // validVariant does not include images; schema should apply default([])
    const result = VariantSchema.parse(validVariant)
    expect(result.images).toEqual([])
  })

  it('rejects detail with empty description', () => {
    const result = VariantSchema.safeParse({
      ...validVariant,
      details: [{ title: 'Material', description: '' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('ProductSchema', () => {
  const validProduct = {
    slug: 'test-vase',
    hide: false,
    name: 'Test Vase',
    description: 'A beautiful handcrafted stoneware vase perfect for any home.',
    files: ['file1.jpg'],
    previews: ['https://example.com/preview1.jpg'],
    requiresShipping: true,
    categoryIds: ['cat-1'],
    variants: [
      {
        id: 'var-1',
        price: 29.99,
        sku: 'SKU-001',
        stock: 10,
        sizeName: 'One Size',
        colorName: 'Natural',
        colorHex: '#f0e3d4',
        availableForSale: true,
        isExpanded: false,
        details: [{ title: 'Material', description: 'Stoneware' }],
        discounts: [],
        files: ['file1.jpg'],
        previews: ['preview1.jpg'],
      },
    ],
  }

  it('accepts valid product', () => {
    const result = ProductSchema.parse(validProduct)
    expect(result.name).toBe('Test Vase')
    expect(result.slug).toBe('test-vase')
    expect(result.variants).toHaveLength(1)
    expect(result.images).toEqual([])
  })

  it('accepts product with optional id', () => {
    const result = ProductSchema.parse({ ...validProduct, id: 'prod-1' })
    expect(result.id).toBe('prod-1')
  })

  it('rejects name shorter than 2 characters', () => {
    const result = ProductSchema.safeParse({ ...validProduct, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects name longer than 100 characters', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      name: 'A'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('rejects description shorter than 10 characters', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      description: 'Short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects relative URL in previews', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      previews: ['/relative/path.jpg'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty files array', () => {
    const result = ProductSchema.safeParse({ ...validProduct, files: [] })
    expect(result.success).toBe(false)
  })

  it('rejects empty categoryIds', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      categoryIds: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty variants array', () => {
    const result = ProductSchema.safeParse({ ...validProduct, variants: [] })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const validRegistration = {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  }

  it('accepts valid registration', () => {
    const result = registerSchema.parse(validRegistration)
    expect(result.email).toBe('user@example.com')
    expect(result.acceptsMarketing).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      email: 'not-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty firstName', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      firstName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty lastName', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      lastName: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional phone number', () => {
    const result = registerSchema.parse({
      ...validRegistration,
      phone: '+44123456789',
    })
    expect(result.phone).toBe('+44123456789')
  })

  it('accepts acceptsMarketing flag', () => {
    const result = registerSchema.parse({
      ...validRegistration,
      acceptsMarketing: true,
    })
    expect(result.acceptsMarketing).toBe(true)
  })
})

describe('newsletterSubscriptionSchema', () => {
  it('accepts valid email', () => {
    const result = newsletterSubscriptionSchema.parse({
      email: 'user@example.com',
    })
    expect(result.email).toBe('user@example.com')
  })

  it('rejects invalid email', () => {
    const result = newsletterSubscriptionSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('accepts optional firstName and lastName', () => {
    const result = newsletterSubscriptionSchema.parse({
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    })
    expect(result.firstName).toBe('John')
    expect(result.lastName).toBe('Doe')
  })

  it('accepts empty string for optional name fields', () => {
    const result = newsletterSubscriptionSchema.parse({
      email: 'user@example.com',
      firstName: '',
      lastName: '',
    })
    expect(result.firstName).toBe('')
    expect(result.lastName).toBe('')
  })

  it('trims whitespace from name fields', () => {
    const result = newsletterSubscriptionSchema.parse({
      email: 'user@example.com',
      firstName: '  John  ',
    })
    expect(result.firstName).toBe('John')
  })
})

describe('newsletterCampaignSchema', () => {
  const validCampaign = {
    name: 'Summer Sale',
    subject: 'Summer Sale - Up to 50% Off',
    heading: "Don't Miss Our Summer Sale",
    message:
      'We are excited to announce our biggest sale of the year with amazing discounts on all pottery items.',
    productIds: ['prod-1', 'prod-2'],
    dailySendLimit: 100,
  }

  it('accepts valid campaign', () => {
    const result = newsletterCampaignSchema.parse(validCampaign)
    expect(result.name).toBe('Summer Sale')
    expect(result.subject).toBe('Summer Sale - Up to 50% Off')
    expect(result.productIds).toHaveLength(2)
    expect(result.dailySendLimit).toBe(100)
  })

  it('uses default dailySendLimit when not provided', () => {
    const { dailySendLimit: _dailySendLimit, ...rest } = validCampaign
    const result = newsletterCampaignSchema.parse(rest)
    expect(result.dailySendLimit).toBe(50)
  })

  it('rejects name shorter than 2 characters', () => {
    const result = newsletterCampaignSchema.safeParse({
      ...validCampaign,
      name: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('rejects subject shorter than 3 characters', () => {
    const result = newsletterCampaignSchema.safeParse({
      ...validCampaign,
      subject: 'AB',
    })
    expect(result.success).toBe(false)
  })

  it('rejects message shorter than 20 characters', () => {
    const result = newsletterCampaignSchema.safeParse({
      ...validCampaign,
      message: 'Short message',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty productIds', () => {
    const result = newsletterCampaignSchema.safeParse({
      ...validCampaign,
      productIds: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 6 productIds', () => {
    const result = newsletterCampaignSchema.safeParse({
      ...validCampaign,
      productIds: Array.from({ length: 7 }, (_, i) => `prod-${i}`),
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer dailySendLimit', () => {
    const result = newsletterCampaignSchema.safeParse({
      ...validCampaign,
      dailySendLimit: 1.5,
    })
    expect(result.success).toBe(false)
  })

  describe('CTA label and URL refinement', () => {
    it('accepts both ctaLabel and ctaUrl together', () => {
      const result = newsletterCampaignSchema.safeParse({
        ...validCampaign,
        ctaLabel: 'Shop Now',
        ctaUrl: '/shop',
      })
      expect(result.success).toBe(true)
    })

    it('rejects ctaLabel without ctaUrl', () => {
      const result = newsletterCampaignSchema.safeParse({
        ...validCampaign,
        ctaLabel: 'Shop Now',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('provided together')
      }
    })

    it('rejects ctaUrl without ctaLabel', () => {
      const result = newsletterCampaignSchema.safeParse({
        ...validCampaign,
        ctaUrl: '/shop',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('provided together')
      }
    })

    it('accepts neither ctaLabel nor ctaUrl', () => {
      const result = newsletterCampaignSchema.safeParse(validCampaign)
      expect(result.success).toBe(true)
    })

    it('rejects ctaUrl with invalid protocol', () => {
      const result = newsletterCampaignSchema.safeParse({
        ...validCampaign,
        ctaLabel: 'Click',
        ctaUrl: 'ftp://invalid.com/path',
      })
      expect(result.success).toBe(false)
    })
  })

  it('accepts optional previewText', () => {
    const result = newsletterCampaignSchema.parse({
      ...validCampaign,
      previewText: 'A preview of the email content',
    })
    expect(result.previewText).toBe('A preview of the email content')
  })
})

describe('newsletterTokenSchema', () => {
  it('accepts valid token', () => {
    const result = newsletterTokenSchema.parse({ token: 'abc-123' })
    expect(result.token).toBe('abc-123')
  })

  it('rejects empty token', () => {
    const result = newsletterTokenSchema.safeParse({ token: '' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from token', () => {
    const result = newsletterTokenSchema.parse({ token: '  token-123  ' })
    expect(result.token).toBe('token-123')
  })
})

describe('newsletterCampaignIdSchema', () => {
  it('accepts valid campaign ID', () => {
    const result = newsletterCampaignIdSchema.parse({ campaignId: 'camp-123' })
    expect(result.campaignId).toBe('camp-123')
  })

  it('rejects empty campaign ID', () => {
    const result = newsletterCampaignIdSchema.safeParse({ campaignId: '' })
    expect(result.success).toBe(false)
  })
})

describe('newsletterTrackedLinkSchema', () => {
  const validLink = {
    token: 'tok-123',
    url: '/path/to/page',
    signature: 'sig-abc',
  }

  it('accepts valid tracked link with relative URL', () => {
    const result = newsletterTrackedLinkSchema.parse(validLink)
    expect(result.token).toBe('tok-123')
    expect(result.url).toBe('/path/to/page')
  })

  it('accepts internal absolute URL', () => {
    const result = newsletterTrackedLinkSchema.parse({
      ...validLink,
      url: 'https://example.com/page',
    })
    expect(result.url).toBe('https://example.com/page')
  })

  it('rejects external URL', () => {
    const result = newsletterTrackedLinkSchema.safeParse({
      ...validLink,
      url: 'https://external.com/page',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid URL string', () => {
    const result = newsletterTrackedLinkSchema.safeParse({
      ...validLink,
      url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty token', () => {
    const result = newsletterTrackedLinkSchema.safeParse({
      ...validLink,
      token: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty signature', () => {
    const result = newsletterTrackedLinkSchema.safeParse({
      ...validLink,
      signature: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional label', () => {
    const result = newsletterTrackedLinkSchema.parse({
      ...validLink,
      label: 'Summer Sale',
    })
    expect(result.label).toBe('Summer Sale')
  })

  it('accepts optional productId', () => {
    const result = newsletterTrackedLinkSchema.parse({
      ...validLink,
      productId: 'prod-1',
    })
    expect(result.productId).toBe('prod-1')
  })

  it('accepts empty string for optional fields', () => {
    const result = newsletterTrackedLinkSchema.parse({
      ...validLink,
      label: '',
      productId: '',
    })
    expect(result.label).toBe('')
    expect(result.productId).toBe('')
  })
})
