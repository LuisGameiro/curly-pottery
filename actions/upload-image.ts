"use server";

import { put, del } from "@vercel/blob";
export async function uploadImages(formData: FormData) {
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
        },
      );

      return blob.url;
    }),
  );

  return uploads.filter(Boolean) as string[];
}

export async function deleteImage(blobUrl: string) {
  if (!blobUrl) {
    throw new Error("Missing blob URL");
  }

  await del(blobUrl);
}
