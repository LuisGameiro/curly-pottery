'use server'

import { del, BlobServiceRateLimited } from '@vercel/blob'
import { setTimeout } from 'node:timers/promises'

export async function deleteAllBlobs(blobs: string[]) {
  let totalDeleted = 0

  const DELAY_MS = 1000

  let retries = 0
  const maxRetries = 3

  while (retries <= maxRetries) {
    try {
      await del(blobs)
      totalDeleted += blobs.length
      console.log(`Deleted ${blobs.length} blobs (${totalDeleted} total)`)
      break
    } catch (error) {
      retries++

      if (retries > maxRetries) {
        console.error(
          `Failed to delete batch after ${maxRetries} retries:`,
          error,
        )
        throw error
      }

      let backoffDelay = 2 ** retries * 1000

      if (error instanceof BlobServiceRateLimited) {
        backoffDelay = error.retryAfter * 1000
      }

      console.warn(
        `Retry ${retries}/${maxRetries} after ${backoffDelay}ms delay`,
      )

      await setTimeout(backoffDelay)
    }

    await setTimeout(DELAY_MS)
  }

  console.log(`All blobs were deleted. Total: ${totalDeleted}`)
}
