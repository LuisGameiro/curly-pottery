jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))
jest.mock('./serverImages.action', () => ({
  deleteBlob: jest.fn(),
}))
jest.mock('@lib/data/gallery', () => ({
  getGalleryImages: jest.fn(),
}))

import { auth } from '@/auth'
import { prisma } from 'prisma/prisma'
import {
  addGalleryImage,
  deleteGalleryImage,
  getGalleryImages,
  reorderGalleryImages,
} from './Gallery.actions'
import { deleteBlob } from './serverImages.action'
import { getGalleryImages as getGalleryImagesData } from '@lib/data/gallery'

beforeEach(() => {
  jest.clearAllMocks()
})

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } }
const nonAdminSession = { user: { id: 'user-1' } }

const mockGalleryImage = {
  id: 'img-1',
  url: 'https://example.com/image.jpg',
  alt: null,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('getGalleryImages', () => {
  it('delegates to getGalleryImagesData and returns its result', async () => {
    const expectedResult = {
      success: true,
      message: 'Fetched gallery images successfully',
      data: [mockGalleryImage],
    }
    ;(getGalleryImagesData as jest.Mock).mockResolvedValue(expectedResult)

    const result = await getGalleryImages()

    expect(result).toEqual(expectedResult)
    expect(getGalleryImagesData).toHaveBeenCalledTimes(1)
  })
})

describe('addGalleryImage', () => {
  it('admin user creates image with valid URL and returns success', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.galleryImage.create as jest.Mock).mockResolvedValue(
      mockGalleryImage,
    )

    const result = await addGalleryImage('https://example.com/image.jpg')

    expect(result).toEqual({
      success: true,
      message: 'Image added to gallery successfully',
      data: mockGalleryImage,
    })
    expect(prisma.galleryImage.findFirst).toHaveBeenCalledWith({
      orderBy: { sortOrder: 'desc' },
    })
    expect(prisma.galleryImage.create).toHaveBeenCalledWith({
      data: { url: 'https://example.com/image.jpg', sortOrder: 0 },
    })
  })

  it('assigns next sort order based on last image', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.findFirst as jest.Mock).mockResolvedValue({
      ...mockGalleryImage,
      sortOrder: 5,
    })
    ;(prisma.galleryImage.create as jest.Mock).mockResolvedValue({
      ...mockGalleryImage,
      sortOrder: 6,
    })

    const result = await addGalleryImage('https://example.com/image.jpg')

    expect(result.success).toBe(true)
    expect(prisma.galleryImage.create).toHaveBeenCalledWith({
      data: { url: 'https://example.com/image.jpg', sortOrder: 6 },
    })
  })

  it('non-admin user returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await addGalleryImage('https://example.com/image.jpg')

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(prisma.galleryImage.create).not.toHaveBeenCalled()
  })

  it('invalid URL (not https) returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await addGalleryImage('http://example.com/image.jpg')

    expect(result).toEqual({
      success: false,
      message: 'Invalid image URL',
      errors: null,
    })
    expect(prisma.galleryImage.create).not.toHaveBeenCalled()
  })

  it('URL too long returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const longUrl = 'https://' + 'a'.repeat(2000)
    const result = await addGalleryImage(longUrl)

    expect(result).toEqual({
      success: false,
      message: 'Image URL too long',
      errors: null,
    })
    expect(prisma.galleryImage.create).not.toHaveBeenCalled()
  })

  it('empty URL returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await addGalleryImage('')

    expect(result).toEqual({
      success: false,
      message: 'Invalid image URL',
      errors: null,
    })
  })

  it('returns error when create throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.galleryImage.create as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    )

    const result = await addGalleryImage('https://example.com/image.jpg')

    expect(result.success).toBe(false)
    expect(result.message).toBe('DB error')
  })
})

describe('deleteGalleryImage', () => {
  it('admin user deletes image and blob, returns success', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.findUnique as jest.Mock).mockResolvedValue(
      mockGalleryImage,
    )
    ;(prisma.galleryImage.delete as jest.Mock).mockResolvedValue(
      mockGalleryImage,
    )
    ;(deleteBlob as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Blob deleted successfully.',
    })

    const result = await deleteGalleryImage('img-1')

    expect(result).toEqual({
      success: true,
      message: 'Image deleted from gallery successfully',
      data: mockGalleryImage,
    })
    expect(prisma.galleryImage.findUnique).toHaveBeenCalledWith({
      where: { id: 'img-1' },
    })
    expect(deleteBlob).toHaveBeenCalledWith(mockGalleryImage.url)
    expect(prisma.galleryImage.delete).toHaveBeenCalledWith({
      where: { id: 'img-1' },
    })
  })

  it('non-admin user returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await deleteGalleryImage('img-1')

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(prisma.galleryImage.findUnique).not.toHaveBeenCalled()
  })

  it('invalid id returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await deleteGalleryImage('')

    expect(result).toEqual({
      success: false,
      message: 'Invalid image ID',
      errors: null,
    })
    expect(prisma.galleryImage.findUnique).not.toHaveBeenCalled()
  })

  it('returns not found when image does not exist', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await deleteGalleryImage('img-1')

    expect(result).toEqual({
      success: false,
      message: 'Image not found',
      errors: null,
    })
    expect(deleteBlob).not.toHaveBeenCalled()
    expect(prisma.galleryImage.delete).not.toHaveBeenCalled()
  })

  it('returns error when delete throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.findUnique as jest.Mock).mockResolvedValue(
      mockGalleryImage,
    )
    ;(deleteBlob as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Blob deleted successfully.',
    })
    ;(prisma.galleryImage.delete as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    )

    const result = await deleteGalleryImage('img-1')

    expect(result.success).toBe(false)
    expect(result.message).toBe('DB error')
  })
})

describe('reorderGalleryImages', () => {
  const ids = ['img-a', 'img-b', 'img-c']

  it('admin user updates sort orders in transaction and returns success', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.update as jest.Mock).mockResolvedValue({})
    ;(prisma.$transaction as jest.Mock).mockResolvedValue([])
    const reorderedImages = ids.map((id, index) => ({
      ...mockGalleryImage,
      id,
      sortOrder: index,
    }))
    ;(prisma.galleryImage.findMany as jest.Mock).mockResolvedValue(
      reorderedImages,
    )

    const result = await reorderGalleryImages(ids)

    expect(result).toEqual({
      success: true,
      message: 'Gallery images reordered successfully',
      data: reorderedImages,
    })
    expect(prisma.galleryImage.update).toHaveBeenCalledTimes(3)
    ids.forEach((id, index) => {
      expect(prisma.galleryImage.update).toHaveBeenCalledWith({
        where: { id },
        data: { sortOrder: index },
      })
    })
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.galleryImage.findMany).toHaveBeenCalledWith({
      orderBy: { sortOrder: 'asc' },
    })
  })

  it('non-admin user returns unauthorized error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(nonAdminSession)

    const result = await reorderGalleryImages(ids)

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized: Administrative privileges required.',
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('invalid ids array returns validation error', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await reorderGalleryImages([])

    expect(result).toEqual({
      success: false,
      message: 'Invalid image IDs array',
      errors: null,
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns error when ids contains a non-string', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)

    const result = await reorderGalleryImages([
      'img-a',
      123 as unknown as string,
    ])

    expect(result).toEqual({
      success: false,
      message: 'Invalid image IDs array',
      errors: null,
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns error when transaction throws', async () => {
    ;(auth as jest.Mock).mockResolvedValue(adminSession)
    ;(prisma.galleryImage.update as jest.Mock).mockResolvedValue({})
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(
      new Error('Transaction failed'),
    )

    const result = await reorderGalleryImages(ids)

    expect(result.success).toBe(false)
    expect(result.message).toBe('Transaction failed')
  })
})
