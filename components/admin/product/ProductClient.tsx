'use client'

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form'
import { Container, Text, Button } from '@components/ui'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Loading from 'app/loading'
import { VariantManager } from './VariantManager'
import Link from 'next/link'
import { Category, ProductWithVariantsCategories } from '@lib/types/types'
import { Variant } from '@lib/types/types'
import { ProductInput, ProductSchema } from '@lib/form-validator'
import GeneralInformationSection from './GeneralInformationSection'
import { toast } from 'sonner'
import { slugify } from '@lib/slugify'
import { upsertProduct } from 'actions/product.actions'
import { syncImages } from 'actions/images.actions'
import { zodResolver } from '@hookform/resolvers/zod'

interface ProductFormProps {
  product: ProductWithVariantsCategories | null
  categories: Category[]
  isEditMode: boolean
}

export default function ProductClient({
  product,
  categories = [],
  isEditMode,
}: ProductFormProps) {
  const initialVariants = product?.variants.map((v: Variant) => ({
    id: v.id,
    sku: v.sku ?? '',
    price: v.price ?? 0,
    stock: v.stock ?? 0,
    sizeName: v.sizeName ?? '',
    colorName: v.colorName ?? '',
    colorHex: v.colorHex ?? '#FFFFFF',
    details: Array.isArray(v.details)
      ? (v.details as Array<{ title?: string; description?: string }>)
      : [],
    discounts: Array.isArray(v.discounts)
      ? (v.discounts as Array<{
          type?: string
          value?: number
          percentage?: number
          code?: string
        }>)
      : [],
    files: v.images ?? [],
    images: v.images ?? [],
    previews: v.images ?? [],
    isExpanded: false,
    availableForSale: v.availableForSale ?? true,
  })) ?? [
    {
      id: `temp-${Date.now()}`,
      productId: product?.id ?? '',
      sku: '',
      price: 0,
      currency: 'GBP',
      stock: 0,
      sizeName: 'M',
      colorName: '',
      colorHex: '#FFFFFF',
      files: [],
      previews: [],
      details: [],
      discounts: [],
      images: [],
      availableForSale: true,
      isExpanded: true,
    },
  ]

  const methods = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      requiresShipping: product?.requiresShipping || false,
      categoryIds: product?.categories.map((c: Category) => c.id) || [],
      files: product?.images || [],
      previews: product?.images || [],
      variants: initialVariants,
    },
  })

  const [loading, setLoading] = useState(false)

  const onSubmit: SubmitHandler<ProductInput> = async (data) => {
    console.log('Form Data Submitted:', data)
    try {
      setLoading(true)

      const skus = data.variants.map((v) => v.sku?.trim()).filter(Boolean)
      if (new Set(skus).size !== skus.length) {
        toast.error('Each variant must have a unique SKU.')
        return
      }

      const productImages = await syncImages(
        data.files || [],
        product?.images ?? [],
      )
      if (!productImages.success) throw new Error(productImages.message)

      const updatedVariants = await Promise.all(
        data.variants.map(async (variant) => {
          const originalVariant = initialVariants.find(
            (v: Variant) => v.id === variant?.id,
          )
          const oldImages = originalVariant?.images ?? []
          const variantImages = await syncImages(variant.files || [], oldImages)
          if (!variantImages.success) throw new Error(variantImages.message)

          return {
            ...variant,
            images: variantImages.data,
            files: [],
            previews: [],
          }
        }),
      )

      const response = await upsertProduct({
        ...data,
        files: [],
        previews: [],
        id: product?.id,
        slug: slugify(data.name),
        images: productImages.data,
        variants: updatedVariants,
      })

      if (response.success) {
        toast.success('Product saved successfully!')
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
      console.error('Submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return Loading()

  return (
    <Container>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit, (errors) => {
            toast.error('Please fix the missing data in the form.')
            console.log('Validation Errors:', errors)
          })}
          className="space-y-8"
        >
          <header>
            <Link
              href="/admin/products"
              className="flex items-center gap-2 text-muted-foreground hover:text-accent-6  transition"
            >
              <ArrowLeft size={16} /> Back to products
            </Link>

            <div className="flex items-center justify-between">
              <Text variant="heading">
                {isEditMode ? 'Edit Product' : 'New Product'}
              </Text>
              <Button type="submit" variant="slim">
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </header>

          <main>
            <GeneralInformationSection categories={categories} />
            <VariantManager />
          </main>
        </form>
      </FormProvider>
    </Container>
  )
}
