'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { Category, ActionResponse } from '@lib/types/types'
import { slugify } from '@lib/slugify'
import { deleteBlob } from './serverImages.action'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'

export async function getAllCategories(): Promise<ActionResponse<Category[]>> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return {
      success: true,
      message: 'Fecthed all Categories successfully',
      data: categories,
    }
  } catch (error) {
    console.error('getAllCustomers_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getCategoryById({
  id,
}: {
  id: string
}): Promise<ActionResponse<Category | null>> {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id,
      },
    })

    return {
      success: true,
      message: 'Fecthed Category successfully',
      data: category,
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
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
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

    revalidatePath('/admin/categories')
    return {
      success: true,
      message: 'Updated category successfully',
      data: category,
    }
  } catch (error) {
    console.error('upsertCategory_ERROR:', error)
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
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
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

    revalidatePath('/admin/categories')
    return {
      success: true,
      message: 'Deleted category successfully',
      data: category,
    }
  } catch (error) {
    console.error('deleteCategory_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
