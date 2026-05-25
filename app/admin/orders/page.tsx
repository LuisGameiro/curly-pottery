import { getAllOrders } from 'actions/order.actions'
import OrdersClient from '@components/admin/OrdersClient'
import { ADMIN_PAGE_SIZE } from '@lib/pagination'

export const dynamic = 'force-dynamic'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; cursor?: string }>
}) {
  const { search, cursor } = await searchParams

  const response = await getAllOrders({
    search,
    cursor,
    take: ADMIN_PAGE_SIZE,
  })

  if (!response.success) {
    throw new Error(response.message)
  }

  return (
    <OrdersClient initialData={response.data!} initialSearch={search || ''} />
  )
}
