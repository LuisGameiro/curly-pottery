'use server'

import { del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@lib/auth/admin'
import * as Sentry from '@sentry/nextjs'
import { toClientMessage } from '@lib/errors'

export async function deleteBlob(blobs: string) {
  if (!blobs || typeof blobs !== 'string') {
    return {
      success: false,
      message: 'Invalid blob reference',
    }
  }

  try {
    const admin = await assertAdmin()
    if (!admin || 'success' in admin) return admin

    await del(blobs)
    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    return { success: true, message: 'Blob deleted successfully.' }
  } catch (error) {
    console.error('Error deleting blobs:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: toClientMessage(error, 'Failed to delete blob.'),
    }
  }
}
