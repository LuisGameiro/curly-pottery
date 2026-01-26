'use client'

import { ActionResponse } from '@lib/types/types'
import { upload } from '@vercel/blob/client'
import { deleteAllBlobs } from './deleteImages.action'
import { cropToSquare } from '@lib/cropToSquare'
const generateRandomImages = (amount: number, width = 1000, height = 1000) => {
  return Array.from({ length: amount }, () => {
    const randomId = Math.floor(Math.random() * 1000)
    return `https://picsum.photos/seed/${randomId}/${width}/${height}`
  })
}

export async function syncImages(
  currentItems: (File | string)[],
  existingUrls: string[],
): Promise<ActionResponse<string[]>> {

  if (process.env.NEXT_PUBLIC_APP_ENV === 'dev') 
  return {
    success: true,
    message: 'Sync images skipped in development mode',
    data: generateRandomImages(currentItems.length),
  }

  try {
    const urlsToDelete = existingUrls
      .filter((oldUrl) => !currentItems.includes(oldUrl))
      .filter((url) => typeof url === 'string' && url.length > 0)

    if (urlsToDelete.length > 0) {
      await Promise.all(urlsToDelete.map(async (url) => deleteAllBlobs(url)))
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
// import { put, del } from "@vercel/blob";

// export async function uploadImages(
//   formData: FormData
// ): Promise<ActionResponse<string[] | null>> {
//   try {
//     const files = formData.getAll("files") as File[];

//     if (!files || files.length === 0) {
//       throw new Error("No files uploaded");
//     }

//     const uploads = await Promise.all(
//       files.map(async (file) => {
//         if (!file || file.size === 0) return null;

//         const blob = await put(
//           `products/${crypto.randomUUID()}-${file.name}`,
//           file,
//           {
//             access: "public",
//             contentType: file.type,
//           }
//         );

//         return blob.url;
//       })
//     );

//     return {
//       success: true,
//       message: "Upload images successfully",
//       data: uploads.filter(Boolean) as string[],
//     };
//   } catch (error) {
//     console.error("uploadImages_ERROR:", error);
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "A database error occurred",
//       errors: error,
//     };
//   }
// }

// export async function deleteImage(blobUrl: string) {
//   try {
//     if (!blobUrl) {
//       throw new Error("Missing blob URL");
//     }

//     const images = await del(blobUrl);

//     return {
//       success: true,
//       message: "Deleted images successfully",
//       data: images,
//     };
//   } catch (error) {
//     console.error("getCategoryById_ERROR:", error);
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "A database error occurred",
//       errors: error,
//     };
//   }
// }

/**
 * Processes an array of mixed Files and existing URLs.
 * Uploads only the new Files to the storage provider.
 */
