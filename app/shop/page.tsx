import ShopClient from '../../components/shop/ShopClient'
import { getAllCategories } from 'actions/category.actions'
import ProductListWrapper from '@components/shop/ProductList'
import ProductsLoading from '@components/shop/ProductsLoading'
import { Suspense } from 'react'
import constructMetadata from '@components/common/SEO'

export const metadata = constructMetadata({
  title: 'Shop',
  description:
    'Explore our unique collection of handcrafted pottery at Curly Pottery. Discover artisanal ceramics perfect for your home or as thoughtful gifts.',
})

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>
}) {
  const { category, sort } = await searchParams

  const categorySlug = category || null
  const categories = await getAllCategories()

  if (!categories.success) throw new Error(categories.message)

  const sortMethod = category || 'newest'
  return (
    <ShopClient
      sortMethod={sort || 'newest'}
      categories={categories.data || []}
      activeCategory={categorySlug}
    >
      <Suspense key={categorySlug} fallback={<ProductsLoading />}>
        <ProductListWrapper
          sortMethod={sortMethod}
          categorySlug={categorySlug}
        />
      </Suspense>
    </ShopClient>
  )
}
