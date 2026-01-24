'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { Category, ActionResponse } from '@lib/types/types'

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

export async function getCategoryById(
  id: string,
): Promise<ActionResponse<Category | null>> {
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

export async function upsertCategory(formData: {
  id?: string
  name: string
  slug: string
  image: string
}) {
  try {
    let category
    if (formData.id) {
      category = await prisma.category.update({
        where: { id: formData.id },
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
        },
      })
    } else {
      category = await prisma.category.create({
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
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

export async function deleteCategory(id: string) {
  try {
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
