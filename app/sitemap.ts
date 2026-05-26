import type { MetadataRoute } from 'next'
import { getAllProducts } from '@actions/product.actions'
import { resolveSiteUrl } from '@lib/site-url'

const staticRoutes: Array<{
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contacts', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: resolveSiteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const productsResponse = await getAllProducts()

  if (!productsResponse.success || !productsResponse.data) {
    return staticEntries
  }

  const productEntries: MetadataRoute.Sitemap = productsResponse.data.items
    .filter((product) => !product.hide)
    .map((product) => ({
      url: resolveSiteUrl(`/shop/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticEntries, ...productEntries]
}
