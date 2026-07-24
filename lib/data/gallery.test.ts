import { getGalleryImages } from './gallery'
import { prisma } from 'prisma/prisma'
import * as Sentry from '@sentry/nextjs'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

const mockImages = [
  {
    id: '1',
    url: 'img1.jpg',
    alt: 'Image 1',
    sortOrder: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    url: 'img2.jpg',
    alt: 'Image 2',
    sortOrder: 1,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
] as never

describe('getGalleryImages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns images ordered by sortOrder with success', async () => {
    jest.mocked(prisma.galleryImage.findMany).mockResolvedValue(mockImages)

    const result = await getGalleryImages()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockImages)
      expect(result.message).toBe('Fetched gallery images successfully')
    }
    expect(prisma.galleryImage.findMany).toHaveBeenCalledWith({
      orderBy: { sortOrder: 'asc' },
    })
  })

  it('handles Prisma error by returning error response', async () => {
    const testError = new Error('Database connection failed')
    jest.mocked(prisma.galleryImage.findMany).mockRejectedValue(testError)
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getGalleryImages()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBe('Database connection failed')
    }
    expect(Sentry.captureException).toHaveBeenCalledWith(testError)
  })
})
