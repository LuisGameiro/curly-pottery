"use server";

import { ActionResponse } from "@lib/types/utils";
import { put, del } from "@vercel/blob";

export async function uploadImages(
  formData: FormData
): Promise<ActionResponse<string[] | null>> {
  try {
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!file || file.size === 0) return null;

        const blob = await put(
          `products/${crypto.randomUUID()}-${file.name}`,
          file,
          {
            access: "public",
            contentType: file.type,
          }
        );

        return blob.url;
      })
    );

    return {
      success: true,
      message: "Upload images successfully",
      data: uploads.filter(Boolean) as string[],
    };
  } catch (error) {
    console.error("uploadImages_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function deleteImage(blobUrl: string) {
  try {
    if (!blobUrl) {
      throw new Error("Missing blob URL");
    }

    const images = await del(blobUrl);

    return {
      success: true,
      message: "Deleted images successfully",
      data: images,
    };
  } catch (error) {
    console.error("getCategoryById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}
