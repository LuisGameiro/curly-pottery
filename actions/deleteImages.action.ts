'use server'

import { del } from '@vercel/blob'

export async function deleteAllBlobs(blobs: string) {
  try {
    await del(blobs)

    console.log(`All blobs were deleted`)
  } catch (error) {
    console.log('Error deleting blobs:', error)
  }
}
