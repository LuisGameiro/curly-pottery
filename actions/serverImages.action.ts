'use server'

import { del } from '@vercel/blob'

export async function deleteBlob(blobs: string) {
  try {
    await del(blobs)
  } catch (error) {
    console.error('Error deleting blobs:', error)
  }
}
