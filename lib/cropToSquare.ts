export async function cropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const targetSize = 1000
      canvas.width = targetSize
      canvas.height = targetSize

      // 1. Calculate the scaling ratio
      // We scale based on the SHORTER side to ensure the 1000px square is fully covered
      const scale = targetSize / Math.min(img.width, img.height)

      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale

      // 2. Calculate offsets to pull the "middle"
      // These will be negative because we are positioning the large image
      // inside the smaller 1000x1000 "window"
      const xOffset = (targetSize - scaledWidth) / 2
      const yOffset = (targetSize - scaledHeight) / 2

      if (ctx) {
        // High-quality image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight)
      }

      canvas.toBlob(
        (blob) => {
          // Clean up memory
          URL.revokeObjectURL(img.src)
          resolve(blob!)
        },
        'image/jpeg',
        0.9, // Quality setting
      )
    }
  })
}
