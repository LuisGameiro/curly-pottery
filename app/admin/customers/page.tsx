import { getAllCustomers } from 'actions/customer.actions'
import CustomersClient from '../../../components/admin/CustomersClient'
import { Suspense } from 'react'
import Loading from 'app/loading'
import constructMetadata from '@components/common/SEO/SEO'

export const metadata = constructMetadata({
  title: 'Customers Admin',
  description: 'Manage your store customers at Curly Pottery.',
})

export default async function CustomersPage() {
  const response = await getAllCustomers()

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch customers')
  }

  return (
    <Suspense fallback={<Loading />}>
      <CustomersClient customers={response.data} />
    </Suspense>
  )
}
