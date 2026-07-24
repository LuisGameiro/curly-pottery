import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from './schema'

describe('generateProductSchema', () => {
  const baseProps = {
    name: 'Test Vase',
    description: 'A beautiful handcrafted vase',
    sku: 'VAS-001',
    price: 49.99,
    currency: 'GBP',
    availability: 'https://schema.org/InStock' as const,
    images: ['https://example.com/vase1.jpg', 'https://example.com/vase2.jpg'],
    url: 'https://curlypottery.com/products/test-vase',
  }

  it('returns valid JSON string with correct fields', () => {
    const result = generateProductSchema(baseProps)
    const parsed = JSON.parse(result)

    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('Product')
    expect(parsed.name).toBe('Test Vase')
    expect(parsed.description).toBe('A beautiful handcrafted vase')
    expect(parsed.sku).toBe('VAS-001')
    expect(parsed.brand).toEqual({
      '@type': 'Brand',
      name: 'Curly Pottery',
    })
    expect(parsed.offers).toEqual({
      '@type': 'Offer',
      price: 49.99,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: 'https://curlypottery.com/products/test-vase',
    })
    expect(parsed.image).toEqual([
      'https://example.com/vase1.jpg',
      'https://example.com/vase2.jpg',
    ])
  })

  it('sets brand default to Curly Pottery, overridable', () => {
    const defaultResult = generateProductSchema(baseProps)
    const defaultParsed = JSON.parse(defaultResult)
    expect(defaultParsed.brand).toEqual({
      '@type': 'Brand',
      name: 'Curly Pottery',
    })

    const customResult = generateProductSchema({
      ...baseProps,
      brand: 'My Brand',
    })
    const customParsed = JSON.parse(customResult)
    expect(customParsed.brand).toEqual({
      '@type': 'Brand',
      name: 'My Brand',
    })
  })

  it('uses correct InStock/OutOfStock availability', () => {
    const inStock = generateProductSchema({
      ...baseProps,
      availability: 'https://schema.org/InStock',
    })
    expect(JSON.parse(inStock).offers.availability).toBe(
      'https://schema.org/InStock',
    )

    const outOfStock = generateProductSchema({
      ...baseProps,
      availability: 'https://schema.org/OutOfStock',
    })
    expect(JSON.parse(outOfStock).offers.availability).toBe(
      'https://schema.org/OutOfStock',
    )
  })
})

describe('generateBreadcrumbSchema', () => {
  it('returns valid JSON-LD breadcrumb list', () => {
    const result = generateBreadcrumbSchema([{ name: 'Home', url: '/' }])
    const parsed = JSON.parse(result)

    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('BreadcrumbList')
    expect(parsed.itemListElement).toHaveLength(1)
    expect(parsed.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: '/',
    })
  })

  it('handles multiple items with correct position numbers', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Category', url: '/category' },
      { name: 'Product', url: '/product' },
    ]
    const result = generateBreadcrumbSchema(items)
    const parsed = JSON.parse(result)

    expect(parsed.itemListElement).toHaveLength(3)
    expect(parsed.itemListElement[0].position).toBe(1)
    expect(parsed.itemListElement[1].position).toBe(2)
    expect(parsed.itemListElement[2].position).toBe(3)
    expect(parsed.itemListElement[0].name).toBe('Home')
    expect(parsed.itemListElement[1].name).toBe('Category')
    expect(parsed.itemListElement[2].name).toBe('Product')
  })

  it('handles empty items array', () => {
    const result = generateBreadcrumbSchema([])
    const parsed = JSON.parse(result)

    expect(parsed['@type']).toBe('BreadcrumbList')
    expect(parsed.itemListElement).toEqual([])
  })
})

describe('generateOrganizationSchema', () => {
  const baseProps = {
    name: 'Curly Pottery',
    url: 'https://curlypottery.com',
  }

  it('returns valid JSON string', () => {
    const result = generateOrganizationSchema(baseProps)
    const parsed = JSON.parse(result)

    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('Organization')
    expect(parsed.name).toBe('Curly Pottery')
    expect(parsed.url).toBe('https://curlypottery.com')
  })

  it('includes optional fields when provided', () => {
    const result = generateOrganizationSchema({
      ...baseProps,
      logo: 'https://curlypottery.com/logo.png',
      description: 'A pottery studio',
    })
    const parsed = JSON.parse(result)

    expect(parsed.logo).toBe('https://curlypottery.com/logo.png')
    expect(parsed.description).toBe('A pottery studio')
  })

  it('includes contactPoint only when email provided', () => {
    const result = generateOrganizationSchema({
      ...baseProps,
      email: 'hello@curlypottery.com',
      telephone: '+44123456789',
    })
    const parsed = JSON.parse(result)

    expect(parsed.contactPoint).toEqual({
      '@type': 'ContactPoint',
      email: 'hello@curlypottery.com',
      telephone: '+44123456789',
      contactType: 'customer service',
    })
  })

  it('omits contactPoint when no email', () => {
    const result = generateOrganizationSchema(baseProps)
    const parsed = JSON.parse(result)

    expect(parsed.contactPoint).toBeUndefined()
  })
})
