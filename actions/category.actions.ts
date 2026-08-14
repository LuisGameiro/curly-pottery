'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { Category, ActionResponse } from '@lib/types/types'
import { slugify } from '@lib/slugify'
import { deleteBlob } from './serverImages.action'
import { assertAdmin } from '@lib/auth/admin'
import { CategorySchema } from '@lib/form-validator'
import { toClientMessage } from '@lib/errors'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

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
    const admin = await assertAdmin()
    if (!admin || 'success' in admin) return admin

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
      message: toClientMessage(error, 'A database error occurred'),
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
    const admin = await assertAdmin()
    if (!admin || 'success' in admin) return admin

    // Delete the DB row first, then clean up the blob best-effort (deleteBlob
    // never throws) so a failure can't leave a broken record.
    const category = await prisma.category.delete({
      where: { id },
    })
    await deleteBlob(image)

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
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}
