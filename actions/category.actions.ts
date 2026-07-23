'use server'

import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { Category, ActionResponse } from '@lib/types/types'
import { slugify } from '@lib/slugify'
import { deleteBlob } from './serverImages.action'
import { auth } from '@/auth'
import { CategorySchema } from '@lib/form-validator'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

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
      console.error('getAllCustomers_ERROR:', error)
      Sentry.captureException(error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'A database error occurred',
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
        message:
          error instanceof Error ? error.message : 'A database error occurred',
        errors: error,
      }
    }
  },
  ['category-by-id'],
  { revalidate: 3600, tags: ['categories'] },
)

export async function upsertCategory({
  id,
  name,
  image,
}: {
  id?: string
  name: string
  image: string
}): Promise<ActionResponse<Category>> {
  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const validation = CategorySchema.safeParse({ name, image })
    if (!validation.success) {
      return {
        success: false,
        message: 'Validation error',
        errors: z.flattenError(validation.error),
      }
    }
    let category
    if (id) {
      category = await prisma.category.update({
        where: { id },
        data: {
          name,
          slug: slugify(name),
          image,
        },
      })
    } else {
      category = await prisma.category.create({
        data: {
          name,
          slug: slugify(name),
          image,
        },
      })
    }

    revalidatePath('/', 'layout')
    revalidateTag('categories', 'max')
    return {
      success: true,
      message: 'Updated category successfully',
      data: category,
    }
  } catch (error) {
    console.error('upsertCategory_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function deleteCategory({
  id,
  image,
}: {
  id: string
  image: string
}): Promise<ActionResponse<Category>> {
  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }
    await deleteBlob(image)

    const category = await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/', 'layout')
    revalidateTag('categories', 'max')
    return {
      success: true,
      message: 'Deleted category successfully',
      data: category,
    }
  } catch (error) {
    console.error('deleteCategory_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
