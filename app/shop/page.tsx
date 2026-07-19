import { getAllCategories } from '@actions/category.actions'
import ShopClient from '../../components/shop/ShopClient'
import { getProductsByCategorySlug as getProductsByCategorySlugAction } from '@actions/product.actions'
import constructMetadata from '@components/common/SEO'
import { SHOP_PAGE_SIZE } from '@lib/pagination'

export const metadata = constructMetadata({
  title: 'Shop',
  description:
    'Explore our unique collection of handcrafted pottery at Curly Pottery. Discover artisanal ceramics perfect for your home or as thoughtful gifts.',
  canonical: '/shop',
})

export default async function ShopPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ category?: string; sort?: string; cursor?: string }>
}>) {
  const { category, sort, cursor } = await searchParams

  const categorySlug = category || null
  const [categories, productsResponse] = await Promise.all([
    getAllCategories(),
    getProductsByCategorySlugAction(categorySlug, {
      cursor,
      take: SHOP_PAGE_SIZE,
    }),
  ])

  if (!categories.success) throw new Error(categories.message)
  if (!productsResponse.success) throw new Error(productsResponse.message)

  const { items, nextCursor, hasMore } = productsResponse.data!

  return (
    <ShopClient
      sortMethod={sort || 'newest'}
      categories={categories.data || []}
      activeCategory={categorySlug}
      categorySlug={categorySlug}
      initialProducts={items}
      initialCursor={nextCursor}
      initialHasMore={hasMore}
    />
  )
}
