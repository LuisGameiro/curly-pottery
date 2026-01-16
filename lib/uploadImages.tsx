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
  return Array.from({ length: amount }, (_, i) => {
    // We use a random seed to ensure different images
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/${width}/${height}`;
  });
};
export const syncImagesWithBlob = async (
  currentItems: (File | string)[],
  existingUrls: string[],
): Promise<string[]> => {
  return generateRandomImages(currentItems.length);
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

  return finalUrls;
};
