'use client'

import { ActionResponse } from '@lib/types/types'
import { upload } from '@vercel/blob/client'
import { deleteBlob } from './serverImages.action'
import { cropToSquare } from '@lib/cropToSquare'
function generateRandomImages({
  amount,
  width = 1000,
  height = 1000,
}: {
  amount: number
  width?: number
  height?: number
}) {
  return Array.from({ length: amount }, () => {
    const randomId = Math.floor(Math.random() * 1000)
    return `https://picsum.photos/seed/${randomId}/${width}/${height}`
  })
}

export async function syncImages({
  currentItems,
  existingUrls,
}: {
  currentItems: (File | string)[]
  existingUrls: string[]
}): Promise<ActionResponse<string[]>> {
  if (process.env.NEXT_PUBLIC_APP_ENV === 'dev')
    return {
      success: true,
      message: 'Sync images skipped in development mode',
      data: generateRandomImages({ amount: currentItems.length }),
    }

  try {
    const urlsToDelete = existingUrls
      .filter((oldUrl) => !currentItems.includes(oldUrl))
      .filter((url) => typeof url === 'string' && url.length > 0)

    if (urlsToDelete.length > 0) {
      const deleteResults = await Promise.allSettled(
        urlsToDelete.map(async (url) => {
          try {
            await deleteBlob(url)
            return { success: true, url }
          } catch (error) {
            console.error('Failed to delete blob:', url, error)
            return { success: false, url, error }
          }
        })
      )
      const failed = deleteResults.filter(r => r.status === 'rejected' || !r.value.success)
      if (failed.length > 0) {
        console.error('Some blobs failed to delete:', failed.length)
      }
    }

    const finalUrls = await Promise.all(
      currentItems.map(async (item) => {
        if (typeof item === 'string') return item

        const blob = await upload(item.name, await cropToSquare(item), {
          access: 'public',
          handleUploadUrl: '/api/images',
        })

        return blob.url
      }),
    )

    return {
      success: true,
      message: 'Images synced successfully',
      data: finalUrls,
    }
  } catch (error) {
    console.error('VercelBlob_Sync_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}
