'use server'

import { del } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'

export async function deleteBlob(blobs: string) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Administrative privileges required to delete images.',
      }
    }

    await del(blobs)
    return { success: true, message: 'Blob deleted successfully.' }
  } catch (error) {
    console.error('Error deleting blobs:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete blob.',
    }
  }
}
