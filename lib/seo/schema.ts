interface ProductSchemaProps {
  name: string
  description: string
  sku: string
  price: number
  currency: string
  availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock'
  images: string[]
  url: string
  brand?: string
}

export function generateProductSchema({
  name,
  description,
  sku,
  price,
  currency,
  availability,
  images,
  url,
  brand = 'Curly Pottery',
}: ProductSchemaProps): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability,
      url,
    },
    image: images,
  })
}

interface BreadcrumbItemProps {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItemProps[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })
}

interface OrganizationSchemaProps {
  name: string
  url: string
  logo?: string
  description?: string
  email?: string
  telephone?: string
}

export function generateOrganizationSchema({
  name,
  url,
  logo,
  description,
  email,
  telephone,
}: OrganizationSchemaProps): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    contactPoint: email
      ? {
          '@type': 'ContactPoint',
          email,
          telephone,
          contactType: 'customer service',
        }
      : undefined,
  })
}
