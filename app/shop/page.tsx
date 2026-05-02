import ShopClient from '../../components/shop/ShopClient'
import { getAllCategories } from 'actions/category.actions'
import { getProductsByCategorySlug } from 'actions/product.actions'
import { SortLabels } from '@components/shop/sortProducts'
import ProductListWrapper from '@components/shop/ProductList'
import ProductsLoading from '@components/shop/ProductsLoading'
import { Suspense } from 'react'
import constructMetadata from '@components/common/SEO'

export const metadata = constructMetadata({
  title: 'Shop',
  description:
    'Explore our unique collection of handcrafted pottery at Curly Pottery. Discover artisanal ceramics perfect for your home or as thoughtful gifts.',
  canonical: '/shop',
})

export default async function ShopPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ category?: string; sort?: string }>
}>) {
  const { category, sort } = await searchParams

  const categorySlug = category || null
  const [categories, productsResponse] = await Promise.all([
    getAllCategories(),
    getProductsByCategorySlug(categorySlug),
  ])

  if (!categories.success) throw new Error(categories.message)
  if (!productsResponse.success) throw new Error(productsResponse.message)

  const products = productsResponse.data || []
  const sortMethod = category || 'newest'

  return (
    <ShopClient
      sortMethod={sort || 'newest'}
      categories={categories.data || []}
      activeCategory={categorySlug}
      productCount={products.length}
    >
      <Suspense key={categorySlug} fallback={<ProductsLoading />}>
        <ProductListWrapper
          sortMethod={sortMethod as SortLabels}
          categorySlug={categorySlug}
          products={products}
        />
      </Suspense>
    </ShopClient>
  )
}
