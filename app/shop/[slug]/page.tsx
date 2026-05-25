import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductView from '@components/product/ProductView/ProductView'
import { getProductBySlug, getRelatedProducts } from 'actions/product.actions'
import { prisma } from 'prisma/prisma'
import constructMetadata from '@components/common/SEO/SEO'

export async function generateStaticParams() {
  try {
    const slugs = await prisma.product.findMany({
      where: { hide: false },
      select: { slug: true },
      take: 50,
    })
    return slugs.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

export const revalidate = 3600

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

  return {
    ...constructMetadata({
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
        locale: 'en_GB',
        type: 'website',
      },
    }),
    other: {
      'product:price': product.variants[0]?.price?.toString() || '0',
      'product:currency': product.variants[0]?.currency || 'GBP',
    },
  }
}

export default async function ProductPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>
}>) {
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
