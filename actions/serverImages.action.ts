'use server'

import { del } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '@lib/auth/authOptions'

export async function deleteBlob(blobs: string) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'ADMIN') {
      throw new Error(
        'Unauthorized: Administrative privileges required to delete images.',
      )
    }

    await del(blobs)
  } catch (error) {
    console.error('Error deleting blobs:', error)
  }
}
