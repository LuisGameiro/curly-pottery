'use client'

import { Button, Container, Text } from '@components/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import InputSearch from '@components/ui/Input/InputSearch'
import CustomerTable from '@components/tables/CustomerTable'
import { UserWithOrders } from '@lib/types/types'
import { getAllCustomers } from '@actions/customer.actions'
import { PaginatedResult, ADMIN_PAGE_SIZE } from '@lib/pagination'

export default function CustomersClient({
  initialData,
  initialSearch,
}: Readonly<{
  initialData: PaginatedResult<UserWithOrders>
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
        const response = await getAllCustomers({
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
          console.error('Failed to load customers', err)
          setError('Failed to load customers. Please try again.')
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

  return (
    <Container data-testid="customers-client">
      <header>
        <div className="w-full flex flex-row justify-between">
          <Text variant="heading" className="w-full">
            Customers
          </Text>

          <InputSearch
            placeholder="Search by name or email..."
            value={searchTerm}
            onValueChange={handleSearch}
            data-testid="customers-search-input"
          />
        </div>
        <Text variant="subHeading">
          {total > 0
            ? `Showing ${items.length} of ${total} customers`
            : 'View and manage your customer relationships.'}
        </Text>
      </header>

      <CustomerTable customers={items} isLoading={isLoading} />

      {error && (
        <div className="py-4 text-center text-red text-sm">{error}</div>
      )}

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
