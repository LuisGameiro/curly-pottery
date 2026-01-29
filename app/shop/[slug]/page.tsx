import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductView from '@components/product/ProductView/ProductView'
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from 'actions/product.actions'
import constructMetadata from '@components/common/SEO/SEO'

export async function generateStaticParams() {
  try {
    const response = await getAllProducts()
    if (!response?.success || !Array.isArray(response?.data)) {
      console.error('Failed to fetch products for static params')
      return []
    }
    return response.data.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const response = await getProductBySlug(slug)

  if (!response.success || !response.data) {
    return { title: 'Product Not Found' }
  }

  const product = response.data
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/product/${slug}`
  const productImage = product.images?.[0] || '/logo.png'

  return constructMetadata({
    title: product.name,
    description:
      product.description?.slice(0, 160) ||
      `Unique hand-crafted ${product.name} by Curly Pottery.`,
    canonical: url,
    openGraph: {
      title: product.name,
      description: product.description || 'Beautiful hand-crafted pottery.',
      url: url,
      siteName: 'Curly Pottery',
      images: [
        { url: productImage, width: 500, height: 500, alt: product.name },
      ],
      locale: 'en_UK',
      type: 'website',
    },
  })
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const response = await getProductBySlug(slug)

  if (!response.success || !response.data) {
    notFound()
  }

  const product = response.data

  const relatedResponse = await getRelatedProducts({
    categories: product.categories,
    excludeId: product.id,
  })

  return (
    <ProductView
      product={product}
      relatedProducts={relatedResponse.data ?? []}
    />
  )
}
