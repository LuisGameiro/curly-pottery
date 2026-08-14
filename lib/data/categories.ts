import { unstable_cache } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { Category, ActionResponse } from '@lib/types/types'
import * as Sentry from '@sentry/nextjs'
import { toClientMessage } from '@lib/errors'

export const getAllCategories = unstable_cache(
  async (): Promise<ActionResponse<Category[]>> => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      })

      return {
        success: true,
        message: 'Fetched all Categories successfully',
        data: categories,
      }
    } catch (error) {
      console.error('getAllCategories_ERROR:', error)
      Sentry.captureException(error)
      return {
        success: false,
        message: toClientMessage(error, 'A database error occurred'),
        errors: error,
      }
    }
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] },
)

export const getCategoryById = unstable_cache(
  async ({ id }: { id: string }): Promise<ActionResponse<Category | null>> => {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id,
        },
      })

      return {
        success: true,
        message: 'Fetched Category successfully',
        data: category,
      }
    } catch (error) {
      console.error('getCategoryById_ERROR:', error)
      Sentry.captureException(error)
      return {
        success: false,
        message: toClientMessage(error, 'A database error occurred'),
        errors: error,
      }
    }
  },
  ['category-by-id'],
  { revalidate: 3600, tags: ['categories'] },
)
