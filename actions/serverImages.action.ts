'use server'

import { del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import * as Sentry from '@sentry/nextjs'

export async function deleteBlob(blobs: string) {
  if (!blobs || typeof blobs !== 'string') {
    return {
      success: false,
      message: 'Invalid blob reference',
    }
  }

  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message:
          'Unauthorized: Administrative privileges required to delete images.',
      }
    }

    await del(blobs)
    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    return { success: true, message: 'Blob deleted successfully.' }
  } catch (error) {
    console.error('Error deleting blobs:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to delete blob.',
    }
  }
}
