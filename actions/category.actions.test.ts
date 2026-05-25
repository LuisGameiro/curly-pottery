import {
  deleteCategory,
  getAllCategories,
  getCategoryById,
  upsertCategory,
} from './category.actions'
import { prisma } from 'prisma/prisma'
import { getServerSession } from 'next-auth'

jest.mock('prisma/prisma', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prisma: require('jest-mock-extended').mockDeep(),
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('./serverImages.action', () => ({
  deleteBlob: jest.fn().mockResolvedValue(undefined),
}))

describe('getAllCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should return all categories sorted by name', async () => {
    const mockCategories = [
      { id: '1', name: 'Category A', slug: 'category-a', image: 'img1.jpg' },
      { id: '2', name: 'Category B', slug: 'category-b', image: 'img2.jpg' },
    ]

    ;(prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories)

    const result = await getAllCategories()

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched all Categories successfully')
    expect(result.data).toEqual(mockCategories)
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('should return empty array when no categories exist', async () => {
    ;(prisma.category.findMany as jest.Mock).mockResolvedValue([])

    const result = await getAllCategories()

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('should handle database errors', async () => {
    const error = new Error('Database connection failed')
    ;(prisma.category.findMany as jest.Mock).mockRejectedValue(error)

    const result = await getAllCategories()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(error)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.category.findMany as jest.Mock).mockRejectedValue('Unknown error')

    const result = await getAllCategories()

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('getCategoryById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should return a category by id', async () => {
    const mockCategory = {
      id: '1',
      name: 'Category A',
      slug: 'category-a',
      image: 'img1.jpg',
    }
    ;(prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory)

    const result = await getCategoryById({ id: '1' })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Fetched Category successfully')
    expect(result.data).toEqual(mockCategory)
    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: '1' },
    })
  })

  it('should return null when category does not exist', async () => {
    ;(prisma.category.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await getCategoryById({ id: 'non-existent-id' })

    expect(result.success).toBe(true)
    expect(result.data).toBeNull()
  })

  it('should handle database errors', async () => {
    const error = new Error('Database connection failed')
    ;(prisma.category.findFirst as jest.Mock).mockRejectedValue(error)

    const result = await getCategoryById({ id: '1' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(error)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.category.findFirst as jest.Mock).mockRejectedValue('Unknown error')

    const result = await getCategoryById({ id: '1' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('upsertCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should create a new category when id is not provided', async () => {
    const mockCategory = {
      id: '1',
      name: 'New Category',
      slug: 'new-category',
      image: 'img.jpg',
    }
    ;(prisma.category.create as jest.Mock).mockResolvedValue(mockCategory)

    const result = await upsertCategory({
      name: 'New Category',
      image: 'img.jpg',
    })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Updated category successfully')
    expect(result.data).toEqual(mockCategory)
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        name: 'New Category',
        slug: 'new-category',
        image: 'img.jpg',
      },
    })
  })

  it('should update an existing category when id is provided', async () => {
    const mockCategory = {
      id: '1',
      name: 'Updated Category',
      slug: 'updated-category',
      image: 'new-img.jpg',
    }
    ;(prisma.category.update as jest.Mock).mockResolvedValue(mockCategory)

    const result = await upsertCategory({
      id: '1',
      name: 'Updated Category',
      image: 'new-img.jpg',
    })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Updated category successfully')
    expect(result.data).toEqual(mockCategory)
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        name: 'Updated Category',
        slug: 'updated-category',
        image: 'new-img.jpg',
      },
    })
  })

  it('should handle database errors during creation', async () => {
    const error = new Error('Database connection failed')
    ;(prisma.category.create as jest.Mock).mockRejectedValue(error)

    const result = await upsertCategory({
      name: 'New Category',
      image: 'img.jpg',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Database connection failed')
    expect(result.errors).toBe(error)
  })

  it('should handle database errors during update', async () => {
    const error = new Error('Category not found')
    ;(prisma.category.update as jest.Mock).mockRejectedValue(error)

    const result = await upsertCategory({
      id: '1',
      name: 'Updated Category',
      image: 'img.jpg',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Category not found')
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.category.create as jest.Mock).mockRejectedValue('Unknown error')

    const result = await upsertCategory({
      name: 'New Category',
      image: 'img.jpg',
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})

describe('deleteCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    })
  })

  it('should delete a category and its image', async () => {
    const mockCategory = {
      id: '1',
      name: 'Category A',
      slug: 'category-a',
      image: 'img1.jpg',
    }
    ;(prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory)

    const result = await deleteCategory({ id: '1', image: 'img1.jpg' })

    expect(result.success).toBe(true)
    expect(result.message).toBe('Deleted category successfully')
    expect(result.data).toEqual(mockCategory)
    expect(prisma.category.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    })
  })

  it('should handle database errors during deletion', async () => {
    const error = new Error('Category not found')
    ;(prisma.category.delete as jest.Mock).mockRejectedValue(error)

    const result = await deleteCategory({ id: '1', image: 'img1.jpg' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('Category not found')
    expect(result.errors).toBe(error)
  })

  it('should handle non-Error exceptions', async () => {
    ;(prisma.category.delete as jest.Mock).mockRejectedValue('Unknown error')

    const result = await deleteCategory({ id: '1', image: 'img1.jpg' })

    expect(result.success).toBe(false)
    expect(result.message).toBe('A database error occurred')
  })
})
