import { unstable_cache } from 'next/cache'
import { prisma } from 'prisma/prisma'
import {
  ActionResponse,
  ProductWithVariantsCategories,
} from '@lib/types/types'
import {
  PaginationInput,
  PaginatedResult,
  SEARCH_PAGE_SIZE,
  encodeCursor,
  decodeCursor,
} from '@lib/pagination'
import * as Sentry from '@sentry/nextjs'
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

export const searchProducts = unstable_cache(
  async (
    query: string,
    pagination?: PaginationInput,
  ): Promise<
    ActionResponse<PaginatedResult<ProductWithVariantsCategories> | null>
  > => {
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
      const nextCursor = hasMore ? encodeCursor(items.at(-1)!.id) : null

      return {
        success: true,
        message: 'Searched products successfully',
        data: { items, nextCursor, hasMore, total },
      }
    } catch (error) {
      console.error('searchProducts_ERROR:', error)
      Sentry.captureException(error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'A database error occurred',
        errors: error,
      }
    }
  },
  ['search-products'],
  { revalidate: 3600, tags: ['products'] },
)
