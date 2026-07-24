import constructMetadata from '@components/common/SEO/SEO'
import OrderUserTable from '@components/tables/OrderUserTable'
import { Container, Text } from '@components/ui'
import { auth } from '@/auth'
import { getOrdersById } from '@actions/order.actions'
import Loading from 'app/loading'
import { CarFront } from 'lucide-react'

import { Suspense } from 'react'
import { USER_ORDERS_PAGE_SIZE } from '@lib/pagination'
import Link from 'next/link'

export const metadata = constructMetadata({
  title: 'Your Orders',
  description:
    'View and manage your past orders at Curly Pottery. Keep track of your handcrafted pottery purchases and order history for a seamless shopping experience.',
})

export default async function Orders({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ cursor?: string }>
}>) {
  const { cursor } = await searchParams
  const session = await auth()
  const user = session?.user

  if (!user) {
    throw new Error('User not found')
  }

  const response = await getOrdersById(user.id, {
    cursor,
    take: USER_ORDERS_PAGE_SIZE,
  })

  if (!response.success) {
    throw new Error(response.message)
  }

  const { items: orders, total, nextCursor, hasMore } = response.data!

  if (orders.length === 0 && !cursor) {
    return (
      <div data-testid="user-orders-empty-state">
        <Container className="py-20 flex-center flex-col">
          <CarFront size={64} className="text-muted mb-4" />
          <Text variant="heading">Your Orders are empty</Text>
        </Container>
      </div>
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <div data-testid="user-orders-page">
        <Container>
          <header>
            <Text variant="heading">Orders</Text>
            <Text variant="subHeading">
              Review your orders and track their status.
            </Text>
          </header>

          <OrderUserTable orders={orders} />

          {hasMore && (
            <div className="flex justify-center py-6">
              <Link
                href={`/user/orders?cursor=${encodeURIComponent(nextCursor!)}`}
                className="px-6 py-2 rounded-full border border-border hover:bg-accent-1 transition-colors"
                data-testid="user-orders-next-page-btn"
              >
                Next page
              </Link>
            </div>
          )}

          {total > USER_ORDERS_PAGE_SIZE && (
            <Text variant="muted" className="text-center py-4">
              Showing {orders.length} of {total} orders
            </Text>
          )}
        </Container>
      </div>
    </Suspense>
  )
}
