'use client'

import { Button, Container, Text } from '@components/ui'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductWithVariantsCategories } from '@lib/types/types'
import InputSearch from '@components/ui/Input/InputSearch'
import ProductTable from '@components/tables/ProductTable'
import { Plus } from 'lucide-react'
import { getAllProducts } from '@actions/product.actions'
import { PaginatedResult, ADMIN_PAGE_SIZE } from '@lib/pagination'

export default function ProductsClient({
  initialData,
  initialSearch,
}: Readonly<{
  initialData: PaginatedResult<ProductWithVariantsCategories>
  initialSearch: string
}>) {
  const [items, setItems] = useState(initialData.items)
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialData.nextCursor,
  )
  const [hasMore, setHasMore] = useState(initialData.hasMore)
  const [total, setTotal] = useState(initialData.total)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const fetchPage = useCallback(
    async (opts: { search?: string; cursor?: string | null }) => {
      setIsLoading(true)
      try {
        const response = await getAllProducts({
          search: opts.search,
          cursor: opts.cursor,
          take: ADMIN_PAGE_SIZE,
        })
        if (response.success && response.data) {
          setItems(response.data.items)
          setNextCursor(response.data.nextCursor)
          setHasMore(response.data.hasMore)
          setTotal(response.data.total)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        fetchPage({ search: value })
      }, 300)
    },
    [fetchPage],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    setItems(initialData.items)
    setNextCursor(initialData.nextCursor)
    setHasMore(initialData.hasMore)
    setTotal(initialData.total)
    setSearchTerm(initialSearch)
  }, [initialData, initialSearch])

  return (
    <Container data-testid="products-client">
      <header>
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
          <Text className="w-full" variant="heading">
            Products
          </Text>
          <div className="flex gap-2 w-full flex-row">
            <InputSearch
              className="w-full"
              placeholder="Search name or SKU..."
              value={searchTerm}
              onValueChange={handleSearch}
              data-testid="products-search-input"
            />
            <Link
              href="/admin/products/new"
              passHref
              data-testid="products-new-btn"
            >
              <Button variant="slim" className="text-nowrap">
                <span className="mr-1">
                  <Plus size={18} />
                </span>
                <span>New Product</span>
              </Button>
            </Link>
          </div>
        </div>
        <Text variant="subHeading">
          {total > 0
            ? `Showing ${items.length} of ${total} products`
            : 'Manage your inventory and variants.'}
        </Text>
      </header>

      <ProductTable products={items} isLoading={isLoading} />

      {hasMore && !isLoading && (
        <div className="flex justify-center py-6">
          <Button
            variant="secondary"
            onClick={() =>
              fetchPage({ search: searchTerm, cursor: nextCursor })
            }
          >
            Next page
          </Button>
        </div>
      )}
    </Container>
  )
}
