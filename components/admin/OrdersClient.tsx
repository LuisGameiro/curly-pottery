'use client'

import { Button, Container, Text } from '@components/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import InputSearch from '@components/ui/Input/InputSearch'
import OrderTable from '@components/tables/OrderTable'
import { OrderWithUser } from '@lib/types/types'
import { getAllOrders } from '@actions/order.actions'
import { PaginatedResult, ADMIN_PAGE_SIZE } from '@lib/pagination'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function OrdersClient({
  initialData,
  initialSearch,
}: Readonly<{
  initialData: PaginatedResult<OrderWithUser>
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
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  // Monotonic request id — ignores stale responses so an older search can't
  // overwrite a newer one.
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(
    async (opts: { search?: string; cursor?: string | null }) => {
      const requestId = ++requestIdRef.current
      setIsLoading(true)
      setError(null)
      try {
        const response = await getAllOrders({
          search: opts.search,
          cursor: opts.cursor,
          take: ADMIN_PAGE_SIZE,
        })
        if (requestId !== requestIdRef.current) return
        if (response.success && response.data) {
          setItems(response.data.items)
          setNextCursor(response.data.nextCursor)
          setHasMore(response.data.hasMore)
          setTotal(response.data.total)
        } else {
          setError(response.message)
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          console.error('Failed to load orders', err)
          setError('Failed to load orders. Please try again.')
        }
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false)
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

  const pendingOrders = items.filter((o) => o.status === 'PENDING')
  const otherOrders = items.filter((o) => o.status !== 'PENDING')

  return (
    <Container data-testid="orders-client">
      <header>
        <Text variant="heading">Order Management</Text>
        <Text variant="subHeading">
          Review and process your store transactions.
        </Text>
        <div className="mt-4 max-w-md">
          <InputSearch
            placeholder="Search by name, email or order ID..."
            value={searchTerm}
            onValueChange={handleSearch}
            data-testid="orders-search-input"
          />
        </div>
      </header>

      <main>
        {pendingOrders.length > 0 && (
          <>
            <div className="flex items-center gap-2 w-full md:w-auto mt-6">
              <AlertCircle size={24} />
              <Text variant="sectionHeading" className="mt-2">
                Pending Orders ({pendingOrders.length})
              </Text>
            </div>
            <OrderTable orders={pendingOrders} isLoading={isLoading} />
          </>
        )}

        <div className="flex items-center gap-2 w-full md:w-auto mt-6">
          <CheckCircle2 size={24} />
          <Text variant="sectionHeading" className="mt-2">
            {pendingOrders.length > 0
              ? `Order History (${otherOrders.length})`
              : `Orders (${total})`}
          </Text>
        </div>
        <OrderTable orders={otherOrders} isLoading={isLoading} />

        {error && <div className="py-4 text-center text-red text-sm">{error}</div>}

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
      </main>
    </Container>
  )
}
