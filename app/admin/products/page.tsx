export const dynamic = 'force-dynamic'

import ProductsClient from '../../../components/admin/ProductsClient'
import { getAllProducts } from '@actions/product.actions'
import { ADMIN_PAGE_SIZE } from '@lib/pagination'

export default async function ProductsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ search?: string; cursor?: string }>
}>) {
  const { search, cursor } = await searchParams

  const response = await getAllProducts({
    search,
    cursor,
    take: ADMIN_PAGE_SIZE,
  })

  if (!response.success) {
    throw new Error(response.message)
  }

  return (
    <ProductsClient initialData={response.data!} initialSearch={search || ''} />
  )
}
