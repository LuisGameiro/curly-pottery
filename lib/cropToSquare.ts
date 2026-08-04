export async function cropToSquare(file: File): Promise<Blob> {
  let fileToProcess = file

  // 1. Convert HEIC/HEIF files to JPEG first (for Samsung/Apple devices)
  if (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  ) {
    try {
      const heic2any = (await import('heic2any')).default
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      })
      const blob = Array.isArray(convertedBlob)
        ? convertedBlob[0]
        : convertedBlob
      fileToProcess = new File(
        [blob],
        file.name.replace(/\.(heic|heif)$/i, '.jpeg'),
        { type: 'image/jpeg' },
      )
    } catch (err) {
      console.error('Failed to convert HEIC/HEIF file:', err)
      throw new Error('Failed to convert HEIC/HEIF image format.')
    }
  }

  // 2. Load the image via <img>, crop to center square, resize to 1000x1000
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(fileToProcess)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      try {
        const targetSize = 1000
        const minSide = Math.min(img.naturalWidth, img.naturalHeight)
        const sx = (img.naturalWidth - minSide) / 2
        const sy = (img.naturalHeight - minSide) / 2

        const canvas = document.createElement('canvas')
        canvas.width = targetSize
        canvas.height = targetSize
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Crop center square and resize in a single draw
        ctx.drawImage(
          img,
          sx, sy, minSide, minSide, // source: center square
          0, 0, targetSize, targetSize, // dest: 1000x1000
        )

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to encode image as JPEG'))
          },
          'image/jpeg',
          0.9,
        )
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error('Failed to process image'),
        )
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(
        new Error(
          'Failed to decode image. The file may be too large or in an unsupported format.',
        ),
      )
    }

    img.src = objectUrl
  })
}
