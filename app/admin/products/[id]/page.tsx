export const dynamic = 'force-dynamic'

import { getProductById } from '@actions/product.actions'
import { getAllCategories } from '@actions/category.actions'
import notFound from 'app/not-found'
import { Category, ProductWithVariantsCategories } from '@lib/types/types'
import ProductClient from '@components/admin/product/ProductClient'
import constructMetadata from '@components/common/SEO'

export const metadata = constructMetadata({
  title: 'Product Admin ',
  description: 'Manage your store product at Curly Pottery.',
})

export default async function ProductForm({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isEditMode = id !== 'new'

  let productData: ProductWithVariantsCategories | null = null
  let categoriesData: Category[] = []

  const responseCategories = await getAllCategories()

  if (!responseCategories.success) {
    throw new Error(responseCategories.message)
  }

  categoriesData = responseCategories.data

  if (isEditMode) {
    const responseProduct = await getProductById(id as string)

    if (!responseProduct.success) {
      throw new Error(responseProduct.message)
    }

    if (!responseProduct.data) {
      return notFound()
    }
    productData = responseProduct.data
  }

  return (
    <ProductClient
      isEditMode={isEditMode}
      product={productData}
      categories={categoriesData}
    />
  )
}
