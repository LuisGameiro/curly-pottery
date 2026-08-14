'use client'

import { Container, Text } from '@components/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Category, ProductWithVariantsCategories } from '@lib/types/types'
import { ProductCard } from '@components/product'
import { getProductsByCategorySlug as getProductsByCategorySlugAction } from '@actions/product.actions'
import { sortProducts, SortLabels } from './sortProducts'
import MenuProducts from './MenuProducts'
import { SHOP_PAGE_SIZE } from '@lib/pagination'

export default function ShopClient({
  sortMethod: _initialSort,
  categories,
  activeCategory,
  categorySlug,
  initialProducts,
  initialCursor,
  initialHasMore,
}: Readonly<{
  sortMethod: SortLabels
  categories: Category[]
  activeCategory: string | null
  categorySlug: string | null
  initialProducts: ProductWithVariantsCategories[]
  initialCursor: string | null
  initialHasMore: boolean
}>) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Tracks the category at the latest reset so an in-flight load-more from an
  // old category can't append its items to the new category's list.
  const activeSlugRef = useRef(categorySlug)

  const sort = searchParams.get('sort') || 'newest'
  const sortedProducts = sortProducts(products, sort)

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoading) return
    const slugAtRequest = categorySlug
    setIsLoading(true)
    setError(null)
    try {
      const response = await getProductsByCategorySlugAction(categorySlug, {
        cursor: nextCursor,
        take: SHOP_PAGE_SIZE,
      })
      if (activeSlugRef.current !== slugAtRequest) return
      if (response.success && response.data) {
        setProducts((prev) => [...prev, ...response.data!.items])
        setNextCursor(response.data.nextCursor)
        setHasMore(response.data.hasMore)
      } else {
        setError(response.message)
      }
    } catch (err) {
      console.error('Failed to load more products', err)
      setError('Failed to load more products. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [nextCursor, isLoading, categorySlug])

  useEffect(() => {
    activeSlugRef.current = categorySlug
    setProducts(initialProducts)
    setNextCursor(initialCursor)
    setHasMore(initialHasMore)
    setError(null)
  }, [categorySlug, initialCursor, initialHasMore, initialProducts])

  return (
    <Container data-testid="shop-client">
      <div className="flex flex-col mt-4 lg:mt-8 ml-4 lg:ml-8">
        <Text variant="heading" className="text-3xl font-bold ">
          Welcome to My Shop
        </Text>
        <Text variant="body" className="max-w-2xl">
          Discover my handmade ceramic pieces made with love in North London.
          All have been crafted to bring warmth, charm and a little everyday joy
          to your home.
        </Text>
      </div>

      <MenuProducts
        sortMethod={sort}
        categories={categories}
        activeCategory={activeCategory}
      />

      <div className="flex gap-4 my-4">
        <div className="flex-1">
          {sortedProducts.length === 0 ? (
            <div className="py-10 text-center">
              <Text variant="bold">No products found!</Text>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
              data-testid="shop-product-grid"
            >
              {sortedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="simple"
                  priority={index < 3}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex flex-col items-center gap-2 py-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-2 rounded-full border border-border hover:bg-accent-1 transition-colors disabled:opacity-50"
                data-testid="shop-load-more-btn"
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </button>
              {error && <p className="text-red text-sm">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
