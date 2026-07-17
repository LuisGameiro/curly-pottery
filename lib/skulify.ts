export function skulify({
  name,
  sizeName,
  colorName,
}: {
  name: string
  sizeName: string
  colorName: string
}): string {
  const safeName = String(name || '')
  const safeSize = String(sizeName || '')
  const safeColor = String(colorName || '')
  const namePart = safeName
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.slice(0, 3))
    .join('-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')

  return `${namePart}-${safeSize}-${safeColor}`
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
}
