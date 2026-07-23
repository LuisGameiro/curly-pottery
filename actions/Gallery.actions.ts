'use server'

import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { GalleryImage, ActionResponse } from '@lib/types/types'
import { deleteBlob } from './serverImages.action'
import { auth } from '@/auth'
import * as Sentry from '@sentry/nextjs'

export const getGalleryImages = unstable_cache(
  async (): Promise<ActionResponse<GalleryImage[]>> => {
    try {
      const images = await prisma.galleryImage.findMany({
        orderBy: {
          sortOrder: 'asc',
        },
      })

      return {
        success: true,
        message: 'Fetched gallery images successfully',
        data: images,
      }
    } catch (error) {
      console.error('getGalleryImages_ERROR:', error)
      Sentry.captureException(error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'A database error occurred',
        errors: error,
      }
    }
  },
  ['gallery-images'],
  { revalidate: 3600, tags: ['gallery'] },
)

export async function addGalleryImage(
  url: string,
): Promise<ActionResponse<GalleryImage>> {
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
    return {
      success: false,
      message: 'Invalid image URL',
      errors: null,
    }
  }
  if (url.length > 2000) {
    return {
      success: false,
      message: 'Image URL too long',
      errors: null,
    }
  }

  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    // Get the current highest sort order
    const lastImage = await prisma.galleryImage.findFirst({
      orderBy: {
        sortOrder: 'desc',
      },
    })

    const nextSortOrder = (lastImage?.sortOrder ?? -1) + 1

    const image = await prisma.galleryImage.create({
      data: {
        url,
        sortOrder: nextSortOrder,
      },
    })

    revalidatePath('/', 'layout')
    revalidateTag('gallery', 'max')
    return {
      success: true,
      message: 'Image added to gallery successfully',
      data: image,
    }
  } catch (error) {
    console.error('addGalleryImage_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function deleteGalleryImage(
  id: string,
): Promise<ActionResponse<GalleryImage>> {
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      message: 'Invalid image ID',
      errors: null,
    }
  }

  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const image = await prisma.galleryImage.findUnique({
      where: { id },
    })

    if (!image) {
      return {
        success: false,
        message: 'Image not found',
        errors: null,
      }
    }

    await deleteBlob(image.url)

    const deletedImage = await prisma.galleryImage.delete({
      where: { id },
    })

    revalidatePath('/', 'layout')
    revalidateTag('gallery', 'max')
    return {
      success: true,
      message: 'Image deleted from gallery successfully',
      data: deletedImage,
    }
  } catch (error) {
    console.error('deleteGalleryImage_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function reorderGalleryImages(
  ids: string[],
): Promise<ActionResponse<GalleryImage[]>> {
  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    !ids.every((id) => typeof id === 'string')
  ) {
    return {
      success: false,
      message: 'Invalid image IDs array',
      errors: null,
    }
  }

  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required.',
        errors: null,
      }
    }

    const updates = ids.map((id, index) =>
      prisma.galleryImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    )

    await prisma.$transaction(updates)

    const reorderedImages = await prisma.galleryImage.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    })

    revalidatePath('/', 'layout')
    revalidateTag('gallery', 'max')
    return {
      success: true,
      message: 'Gallery images reordered successfully',
      data: reorderedImages,
    }
  } catch (error) {
    console.error('reorderGalleryImages_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
