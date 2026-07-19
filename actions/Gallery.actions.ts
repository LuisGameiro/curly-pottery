'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { GalleryImage, ActionResponse } from '@lib/types/types'
import { deleteBlob } from './serverImages.action'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'

export async function getGalleryImages(): Promise<ActionResponse<GalleryImage[]>> {
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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function addGalleryImage(
  url: string,
): Promise<ActionResponse<GalleryImage>> {
  try {
    const session = await getServerSession(authOptions)

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
    return {
      success: true,
      message: 'Image added to gallery successfully',
      data: image,
    }
  } catch (error) {
    console.error('addGalleryImage_ERROR:', error)
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
  try {
    const session = await getServerSession(authOptions)

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
    return {
      success: true,
      message: 'Image deleted from gallery successfully',
      data: deletedImage,
    }
  } catch (error) {
    console.error('deleteGalleryImage_ERROR:', error)
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
  try {
    const session = await getServerSession(authOptions)

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
    return {
      success: true,
      message: 'Gallery images reordered successfully',
      data: reorderedImages,
    }
  } catch (error) {
    console.error('reorderGalleryImages_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
