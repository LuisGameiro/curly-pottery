import type { MetadataRoute } from 'next'
import { getAppUrl } from '@lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/auth',
          '/cart',
          '/checkout',
          '/newsletter/unsubscribe',
          '/user',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
