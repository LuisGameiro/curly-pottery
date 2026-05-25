'use server'

import { ProductInput, VariantInput } from '@lib/form-validator'
import {
  Product,
  ActionResponse,
  ProductWithVariantsCategories,
  Category,
} from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { deleteBlob } from './serverImages.action'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'
import { revalidatePath } from 'next/cache'
import {
  PaginationInput,
  PaginatedResult,
  ADMIN_PAGE_SIZE,
  SHOP_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from '@lib/pagination'

import { Prisma } from 'prisma/generated/prisma/client'

const formatVariant = (
  v: Prisma.ProductVariantGetPayload<{
    include: { optionValues: { include: { option: true } } }
  }>,
) => ({
  ...v,
  price: Number(v.price),
})

const formatProduct = (
  product: Prisma.ProductGetPayload<{
    include: {
      variants: { include: { optionValues: { include: { option: true } } } }
      categories: true
    }
  }>,
) => ({
  ...product,
  variants: product.variants.map(formatVariant),
})

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
      return {
        success: true,
        message: 'Fetched product successfully',
        data: formatProduct(
          product,
        ) as unknown as ProductWithVariantsCategories,
      }
    }

    return {
      success: true,
      message: 'Fetched product successfully',
      data: null,
    }
  } catch (error) {
    console.error('getProductBySlug_ERROR:', error)
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
      return {
        success: true,
        message: 'Fetched product successfully',
        data: formatProduct(
          product,
        ) as unknown as ProductWithVariantsCategories,
      }
    }

    return {
      success: true,
      message: 'Fetched product successfully',
      data: null,
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
export async function getAllProducts(
  pagination?: PaginationInput,
): Promise<
  ActionResponse<PaginatedResult<ProductWithVariantsCategories> | null>
> {
  try {
    const take = pagination?.take ?? ADMIN_PAGE_SIZE
    const search = pagination?.search?.trim()

    const where: Prisma.ProductWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        {
          variants: {
            some: { sku: { contains: search, mode: 'insensitive' } },
          },
        },
      ]
    }

    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            include: { optionValues: { include: { option: true } } },
          },
          categories: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.product.count({ where }),
    ])

    const hasMore = products.length > take
    const items = products
      .slice(0, take)
      .map(formatProduct) as unknown as ProductWithVariantsCategories[]
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id) : null

    return {
      success: true,
      message: 'Fetched products successfully',
      data: { items, nextCursor, hasMore, total },
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
    const raw = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Product"
      WHERE hide = false
        AND EXISTS (SELECT 1 FROM "ProductVariant" WHERE "productId" = "Product".id AND stock > 0)
      ORDER BY RANDOM()
      LIMIT ${limit}
    `

    if (raw.length === 0) {
      return {
        success: true,
        message: 'No products found',
        data: [],
      }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: raw.map((r) => r.id) } },
      include: {
        variants: { include: { optionValues: { include: { option: true } } } },
        categories: true,
      },
    })

    const formattedProducts = products.map(formatProduct)

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

    const formattedProducts = relatedProducts.map(formatProduct)

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
  pagination?: PaginationInput,
): Promise<
  ActionResponse<PaginatedResult<ProductWithVariantsCategories> | null>
> {
  try {
    const take = pagination?.take ?? SHOP_PAGE_SIZE

    const where: Prisma.ProductWhereInput = { hide: false }

    if (category) {
      where.categories = { some: { slug: category } }
    }

    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            include: { optionValues: { include: { option: true } } },
          },
          categories: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.product.count({ where }),
    ])

    const hasMore = products.length > take
    const items = products
      .slice(0, take)
      .map(formatProduct) as unknown as ProductWithVariantsCategories[]
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id) : null

    return {
      success: true,
      message: 'Fetched products successfully',
      data: { items, nextCursor, hasMore, total },
    }
  } catch (error) {
    console.error('getProductsByCategorySlug_ERROR:', error)
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
      errors: error,
    }
  }
}

export async function searchProducts(
  query: string,
  pagination?: PaginationInput,
): Promise<
  ActionResponse<PaginatedResult<ProductWithVariantsCategories> | null>
> {
  try {
    const take = pagination?.take ?? SEARCH_PAGE_SIZE

    const where: Prisma.ProductWhereInput = {
      hide: false,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        {
          categories: {
            some: { name: { contains: query, mode: 'insensitive' } },
          },
        },
      ],
    }

    const cursor = pagination?.cursor
      ? decodeCursor(pagination.cursor)
      : undefined

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            include: { optionValues: { include: { option: true } } },
          },
          categories: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        ...(cursor ? { cursor: { id: cursor.id }, skip: 1 } : {}),
        take: take + 1,
      }),
      prisma.product.count({ where }),
    ])

    const hasMore = products.length > take
    const items = products
      .slice(0, take)
      .map(formatProduct) as unknown as ProductWithVariantsCategories[]
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].id) : null

    return {
      success: true,
      message: 'Searched products successfully',
      data: { items, nextCursor, hasMore, total },
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
