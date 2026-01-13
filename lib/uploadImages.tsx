/**
 * Processes an array of mixed Files and existing URLs.
 * Uploads only the new Files to the storage provider.
 */
export const uploadImagesToBlob = async (items: (File | string)[]): Promise<string[]> => {
  const uploadPromises = items.map(async (item) => {
    // 1. Check if it is already a permanent URL (string)
    if (typeof item === 'string') {
      return item;
    }

    // 2. If it is a File object, perform the upload
    try {
      const formData = new FormData();
      formData.append('file', item);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url; // The new permanent URL from your blob storage
    } catch (error) {
      console.error("Error uploading file:", item.name, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};