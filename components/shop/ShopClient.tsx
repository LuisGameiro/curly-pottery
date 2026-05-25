'use client'

import { Container, Text } from '@components/ui'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Category, ProductWithVariantsCategories } from '@lib/types/types'
import { ProductCard } from '@components/product'
import { getProductsByCategorySlug as getProductsByCategorySlugAction } from 'actions/product.actions'
import { sortProducts, SortLabels } from './sortProducts'
import MenuProducts from './MenuProducts'
import { SHOP_PAGE_SIZE } from '@lib/pagination'

export default function ShopClient({
  sortMethod: _initialSort,
  categories,
  activeCategory,
  productCount: initialCount,
  categorySlug,
  initialProducts,
  initialCursor,
  initialHasMore,
}: Readonly<{
  sortMethod: SortLabels
  categories: Category[]
  activeCategory: string | null
  productCount: number
  categorySlug: string | null
  initialProducts: ProductWithVariantsCategories[]
  initialCursor: string | null
  initialHasMore: boolean
}>) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [productCount, setProductCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  const sort = searchParams.get('sort') || 'newest'
  const sortedProducts = sortProducts(products, sort)

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoading) return
    setIsLoading(true)
    try {


      const response = await getProductsByCategorySlugAction(categorySlug, {
        cursor: nextCursor,
        take: SHOP_PAGE_SIZE,
      })
      if (response.success && response.data) {
        setProducts((prev) => [...prev, ...response.data!.items])
        setNextCursor(response.data.nextCursor)
        setHasMore(response.data.hasMore)
        setProductCount(response.data.total)
      }
    } finally {
      setIsLoading(false)
    }
  }, [nextCursor, isLoading, categorySlug])

  useEffect(() => {
    setProducts(initialProducts)
    setNextCursor(initialCursor)
    setHasMore(initialHasMore)
    setProductCount(initialCount)
  }, [
    categorySlug,
    initialCursor,
    initialHasMore,
    initialCount,
    initialProducts,
  ])

  return (
    <Container>
      <div className="flex flex-col mt-4 lg:mt-8 mb-4">
        <Text variant="heading" className="text-3xl font-bold mb-2">
          Welcome to My Shop
        </Text>
        <Text variant="muted" className="max-w-2xl">
          Discover my handmade ceramic pieces made with love in North London.
          All have been crafted to bring warmth, charm and a little everyday joy
          to your home.
        </Text>
      </div>

      <div className="mb-6">
        <MenuProducts
          sortMethod={sort}
          categories={categories}
          activeCategory={activeCategory}
          productCount={productCount}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          {sortedProducts.length === 0 ? (
            <div className="py-10 text-center">
              <Text variant="bold">No products found!</Text>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="simple"
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center py-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-2 rounded-full border border-border hover:bg-accent-1 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
