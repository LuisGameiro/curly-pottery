export const dynamic = 'force-dynamic'

import { getAllCustomers } from 'actions/customer.actions'
import CustomersClient from '../../../components/admin/CustomersClient'
import { ADMIN_PAGE_SIZE } from '@lib/pagination'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; cursor?: string }>
}) {
  const { search, cursor } = await searchParams

  const response = await getAllCustomers({
    search,
    cursor,
    take: ADMIN_PAGE_SIZE,
  })

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch customers')
  }

  return (
    <CustomersClient initialData={response.data} initialSearch={search || ''} />
  )
}
