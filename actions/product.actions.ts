'use server'

import { ProductInput, VariantInput } from '@lib/form-validator'
import {
  Product,
  ActionResponse,
  ProductWithVariantsCategories,
  Category,
  Variant,
} from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { deleteBlob } from './serverImages.action'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'
import { revalidatePath } from 'next/cache'

const pickRandomItems = <T>(items: T[], limit: number) => {
  const sanitizedLimit = Math.max(0, Math.floor(limit))

  if (sanitizedLimit >= items.length) {
    return [...items]
  }

  const shuffledItems = [...items]

  for (
    let currentIndex = shuffledItems.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    const currentItem = shuffledItems[currentIndex]
    shuffledItems[currentIndex] = shuffledItems[randomIndex]
    shuffledItems[randomIndex] = currentItem
  }

  return shuffledItems.slice(0, sanitizedLimit)
}

export async function getProductBySlug(
  slug: string | null,
): Promise<ActionResponse<ProductWithVariantsCategories | null>> {
  if (!slug)
    return {
      success: false,
      message: 'Slug not provided',
      errors: null,
    }
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        hide: false,
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })
    if (product) {
      product.variants = product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })) as unknown as Variant[]
    }

    return {
      success: true,
      message: 'Fecthed product successfully',
      data: product as unknown as ProductWithVariantsCategories,
    }
  } catch (error) {
    console.error('getProductBySlugd_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getProductById(
  id: string,
): Promise<ActionResponse<ProductWithVariantsCategories | null>> {
  if (!id)
    return {
      success: false,
      message: 'Id not provided',
      errors: null,
    }
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })

    if (product) {
      product.variants = product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })) as unknown as Variant[]
    }

    return {
      success: true,
      message: 'Fecthed product successfully',
      data: product as unknown as ProductWithVariantsCategories,
    }
  } catch (error) {
    console.error('getProductById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function deleteProduct({
  id,
  images,
}: {
  id: string
  images: string[]
}): Promise<ActionResponse<Product | null>> {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    await Promise.all(
      images.map(async (img) => {
        await deleteBlob(img)
      }),
    )

    const product = await prisma.product.delete({
      where: { id },
    })

    revalidatePath('/', 'layout')

    return {
      success: true,
      message: 'Deleted product successfully',
      data: product,
    }
  } catch (error) {
    console.error('deleteProduct_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function toggleVisibility({
  id,
  state,
}: {
  id: string
  state: boolean
}): Promise<ActionResponse<Product>> {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        hide: !state,
      },
    })

    revalidatePath('/', 'layout')

    return {
      success: true,
      message: 'Toggled product visibility successfully',
      data: product,
    }
  } catch (error) {
    console.error('toggleVisibility_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function getAllProducts(): Promise<
  ActionResponse<ProductWithVariantsCategories[] | null>
> {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedProducts = products.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    }))

    return {
      success: true,
      message: 'Fecthed products successfully',
      data: formattedProducts as unknown as ProductWithVariantsCategories[],
    }
  } catch (error) {
    console.error('getAllProducts_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function getRandomProducts(
  limit = 3,
): Promise<ActionResponse<ProductWithVariantsCategories[] | null>> {
  try {
    const products = await prisma.product.findMany({
      where: { variants: { some: { stock: { gt: 0 } } }, hide: false },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })

    const randomProducts = pickRandomItems(products, limit)

    const formattedProducts = randomProducts.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    }))

    return {
      success: true,
      message: 'Fetched random products successfully',
      data: formattedProducts as unknown as ProductWithVariantsCategories[],
    }
  } catch (error) {
    console.error('getRandomProducts_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function getRelatedProducts({
  categories,
  excludeId,
  limit = 12,
}: {
  categories: Category[]
  excludeId?: string
  limit?: number
}): Promise<ActionResponse<ProductWithVariantsCategories[] | null>> {
  try {
    if (!categories.length)
      return {
        success: true,
        message: 'No related Products',
        data: [],
      }
    const categoriesName = categories.map((c) => c.name)
    const count = await prisma.product.count({
      where: {
        hide: false,
        categories: {
          some: {
            name: { in: categoriesName },
          },
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (count === 0)
      return {
        success: true,
        message: 'No related Products',
        data: [],
      }

    const skip = Math.floor(Math.random() * Math.max(1, count - limit))

    const relatedProducts = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            name: { in: categoriesName },
          },
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
      take: limit,
      skip,
    })

    const formattedProducts = relatedProducts.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    }))

    return {
      success: true,
      message: 'Fetched Related successfully',
      data: formattedProducts as unknown as ProductWithVariantsCategories[],
    }
  } catch (error) {
    console.error('getCategoryById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getProductsByCategorySlug(
  category: string | null,
): Promise<ActionResponse<ProductWithVariantsCategories[] | null>> {
  try {
    if (!category) {
      const products = await prisma.product.findMany({
        where: {
          hide: false,
        },
        include: {
          variants: { include: { optionValues: { include: { option: true } } } },
          categories: true,
        },
      })
      const formattedProducts = products.map((product) => ({
        ...product,
        variants: product.variants.map((v) => ({
          ...v,
          price: Number(v.price),
        })),
      }))
      return {
        success: true,
        message: 'Category slug not provided',
        data: formattedProducts as unknown as ProductWithVariantsCategories[],
      }
    }
    const products = await prisma.product.findMany({
      where: {
        hide: false,
        categories: {
          some: {
            slug: category,
          },
        },
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })

    const formattedProducts = products.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    }))

    return {
      success: true,
      message: 'Fetched products successfully',
      data: formattedProducts as unknown as ProductWithVariantsCategories[],
    }
  } catch (error) {
    console.error('getRelatedProducts_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function upsertProduct(
  payload: ProductInput,
): Promise<ActionResponse<Product | null>> {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }
    const {
      categoryIds,
      variants,
      id,
      files: _files,
      previews: _previews,
      ...productData
    } = payload

    const existingVariantIds = variants
      .map((v) => v.id)
      .filter((id) => id && !id.startsWith('temp-'))

    const prepareVariant = (v: VariantInput) => {
      const {
        id: _vId,
        files: _files,
        previews: _previews,
        isExpanded: _isExpanded,
        ...variantData
      } = v

      return {
        ...variantData,
        details: v.details ?? [],
        discounts: v.discounts ?? [],
        images: v.images ?? [],
      }
    }

    const existingProduct = id
      ? await prisma.product.findUnique({
          where: { id },
          select: { id: true },
        })
      : null

    const variantsToKeep = existingVariantIds.filter((id) => id !== '')
    const variantUpserts = variants.map((v) => {
      const isTemp = v.id.startsWith('temp-')
      const variantData = prepareVariant(v)
      return {
        where: { id: isTemp ? '000000000000000000000000' : v.id },
        update: variantData,
        create: variantData,
      }
    })

    const product = await prisma.product.upsert({
      where: { id: existingProduct?.id || 'new' },
      update: {
        ...productData,
        categories: {
          set: categoryIds.map((catId) => ({ id: catId })),
        },
        variants: {
          deleteMany: { id: { notIn: variantsToKeep } },
          upsert: variantUpserts,
        },
      },
      create: {
        ...productData,
        categories: {
          connect: categoryIds.map((catId) => ({ id: catId })),
        },
        variants: {
          create: variants.map((v) => prepareVariant(v)),
        },
      },
    })

    revalidatePath('/', 'layout')

    return {
      success: true,
      message: 'Product saved successfully',
      data: product,
    }
  } catch (error) {
    console.error('upsertProduct_ERROR:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Database error',
    }
  }
}

export async function searchProducts(
  query: string,
): Promise<ActionResponse<ProductWithVariantsCategories[] | null>> {
  try {
    const products = await prisma.product.findMany({
      where: {
        hide: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          {
            categories: {
              some: { name: { contains: query, mode: 'insensitive' } },
            },
          },
        ],
      },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedProducts = products.map((product) => ({
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    }))

    return {
      success: true,
      message: 'Searched products successfully',
      data: formattedProducts as unknown as ProductWithVariantsCategories[],
    }
  } catch (error) {
    console.error('searchProducts_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
