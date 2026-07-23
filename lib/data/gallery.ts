import { unstable_cache } from 'next/cache'
import { prisma } from 'prisma/prisma'
import { GalleryImage, ActionResponse } from '@lib/types/types'
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
  ['gallery'],
  { revalidate: 3600, tags: ['gallery'] },
)
