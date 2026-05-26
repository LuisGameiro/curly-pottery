export const dynamic = 'force-dynamic'

import constructMetadata from '@components/common/SEO'
import NewsletterClient from '@components/admin/NewsletterClient'
import { getNewsletterAdminOverview } from '@actions/newsletter.actions'
import { getAllProducts } from '@actions/product.actions'

export const metadata = constructMetadata({
  title: 'Newsletter Admin',
  description:
    'Manage newsletter subscribers, build product campaigns, and trigger queued sends at Curly Pottery.',
})

export default async function NewsletterPage() {
  const [newsletterResponse, productResponse] = await Promise.all([
    getNewsletterAdminOverview(),
    getAllProducts({ take: 200 }),
  ])

  if (!newsletterResponse.success || !newsletterResponse.data) {
    throw new Error(newsletterResponse.message || 'Failed to load newsletter')
  }

  if (!productResponse.success || !productResponse.data) {
    throw new Error(productResponse.message || 'Failed to load products')
  }

  return (
    <NewsletterClient
      overview={newsletterResponse.data}
      products={productResponse.data}
    />
  )
}
