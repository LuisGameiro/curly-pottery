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
        {
          type: 'image/jpeg',
        },
      )
    } catch (err) {
      console.error('Failed to convert HEIC/HEIF file:', err)
      throw new Error('Failed to convert HEIC/HEIF image format.')
    }
  }

  // 2. Load the image into a bitmap
  const sourceBitmap = await createImageBitmap(fileToProcess)

  const targetSize = 1000
  const minSide = Math.min(sourceBitmap.width, sourceBitmap.height)

  // Calculate source offsets to grab the center square
  const sx = (sourceBitmap.width - minSide) / 2
  const sy = (sourceBitmap.height - minSide) / 2

  // 3. Crop directly while creating a new bitmap
  const croppedBitmap = await createImageBitmap(
    sourceBitmap,
    sx,
    sy,
    minSide,
    minSide, // Source crop area
    { resizeWidth: targetSize, resizeHeight: targetSize }, // Final resize
  )

  // 4. Convert back to Blob using an OffscreenCanvas (no DOM needed)
  const offscreen = new OffscreenCanvas(targetSize, targetSize)
  const ctx = offscreen.getContext('2d')
  ctx?.drawImage(croppedBitmap, 0, 0)

  return offscreen.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
}
