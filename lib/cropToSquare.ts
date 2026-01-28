export async function cropToSquare(file: File): Promise<Blob> {
  // 1. Load the image into a bitmap
  const sourceBitmap = await createImageBitmap(file)

  const targetSize = 1000
  const minSide = Math.min(sourceBitmap.width, sourceBitmap.height)

  // Calculate source offsets to grab the center square
  const sx = (sourceBitmap.width - minSide) / 2
  const sy = (sourceBitmap.height - minSide) / 2

  // 2. Crop directly while creating a new bitmap
  const croppedBitmap = await createImageBitmap(
    sourceBitmap,
    sx,
    sy,
    minSide,
    minSide, // Source crop area
    { resizeWidth: targetSize, resizeHeight: targetSize }, // Final resize
  )

  // 3. Convert back to Blob using an OffscreenCanvas (no DOM needed)
  const offscreen = new OffscreenCanvas(targetSize, targetSize)
  const ctx = offscreen.getContext('2d')
  ctx?.drawImage(croppedBitmap, 0, 0)

  return offscreen.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
}
