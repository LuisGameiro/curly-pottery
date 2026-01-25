'use server'

import { del, BlobServiceRateLimited } from '@vercel/blob'
import { setTimeout } from 'node:timers/promises'

export async function deleteAllBlobs(blobs: string[]) {
  try {
    await del(blobs)

    console.log(`All blobs were deleted`)
  } catch (error) {
    console.log('Error deleting blobs:', error)
  }
}
