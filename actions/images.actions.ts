"use server";

import { ActionResponse } from "@lib/types/types";
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
export const uploadImagesToBlob = async (
  items: (File | string)[],
): Promise<string[]> => {
  const uploadPromises = items.map(async (item) => {
    // 1. Check if it is already a permanent URL (string)
    if (typeof item === "string") {
      return item;
    }
    // 2. If it is a File object, perform the upload
    try {
      const formData = new FormData();
      formData.append("file", item);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data.url; // The new permanent URL from your blob storage
    } catch (error) {
      console.error("Error uploading file:", item.name, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

const generateRandomImages = (amount: number, width = 600, height = 400) => {
  return Array.from({ length: amount }, () => {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/${width}/${height}`;
  });
};

export async function syncImages(
  currentItems: (File | string)[],
  existingUrls: string[],
): Promise<ActionResponse<string[]>> {
  return {
    success: true,
    message: "Upload images successfully",
    data: generateRandomImages(currentItems.length) ?? [],
  };

  try {
    // 1. Identify images to delete
    // (Items that are in existingUrls but NOT in currentItems)
    const urlsToDelete = existingUrls.filter(
      (oldUrl) => !currentItems.includes(oldUrl),
    );

    // 2. Perform deletions
    await Promise.all(
      urlsToDelete.map(async (url) => {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            body: JSON.stringify({ url }),
          });
        } catch (e) {
          console.error("Failed to delete orphaned image:", url, e);
        }
      }),
    );

    // 3. Upload new files and return the full list of strings
    const finalUrls = await Promise.all(
      currentItems.map(async (item) => {
        if (typeof item === "string") return item; // Keep existing

        const formData = new FormData();
        formData.append("file", item);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.url;
      }),
    );

    return {
      success: true,
      message: "Upload images successfully",
      data: finalUrls,
    };
  } catch (error: any) {
    console.error("uploadImages_ERROR:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "A database error occurred", 
      errors: error,
    };
  }
}
