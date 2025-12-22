import { createProduct, updateProduct, getProductsByCategorySlug, deleteProduct, getRandomProducts, getAllProducts, exclude } from '../../actions/product.actions'

// Mock prisma client and next/cache revalidatePath
jest.mock('prisma/prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const { prisma } = require('prisma/prisma')
const { revalidatePath } = require('next/cache')

function makeFormData(entries: Record<string, any>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) {
    if (Array.isArray(v)) {
      // For multi-value like categories, append each
      v.forEach((vv) => fd.append(k, vv))
    } else {
      fd.set(k, v as any)
    }
  }
  return fd
}

describe('actions/product.actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('createProduct creates product with parsed variants and categories and revalidates path', async () => {
    ;(prisma.product.create as jest.Mock).mockResolvedValue({ id: 'p1' })

    const variants = [
      {
        sku: 'SKU-1',
        price: '12.5',
        currency: 'USD',
        stock: '3',
        availableForSale: true,
        images: ['a.jpg'],
        sizeName: null,
        widthCm: null,
        heightCm: null,
        depthCm: null,
        colorName: 'Blue',
        colorHex: '#00f',
        glazes: ['g1'],
      },
    ]

    const fd = makeFormData({
      name: 'Cup',
      description: 'Nice cup',
      slug: 'cup',
      images: JSON.stringify(['a.jpg']),
      requiresShipping: 'on',
      categories: ['c1', 'c2'],
      variants: JSON.stringify(variants),
    })

    await createProduct(fd)

    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Cup',
          requiresShipping: true,
          categories: { connect: [{ id: 'c1' }, { id: 'c2' }] },
          variants: expect.objectContaining({
            create: [
              expect.objectContaining({
                sku: 'SKU-1',
                price: 12.5,
                stock: 3,
                availableForSale: true,
              }),
            ],
          }),
        }),
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/admin/products')
  })

  it('updateProduct updates and replaces variants, sets categories, and revalidates path', async () => {
    ;(prisma.product.update as jest.Mock).mockResolvedValue({ id: 'p1' })

    const variants = [
      { sku: 'A', price: '1', currency: 'USD', stock: '0', availableForSale: false, images: [] },
      { sku: 'B', price: '2', currency: 'USD', stock: '2', availableForSale: true, images: [] },
    ]

    const fd = makeFormData({
      name: 'Mug',
      description: 'desc',
      slug: 'mug',
      images: JSON.stringify([]),
      requiresShipping: 'off',
      categories: ['x'],
      variants: JSON.stringify(variants),
    })

    await updateProduct('prod-1', fd)

    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: expect.objectContaining({
          requiresShipping: false,
          categories: { set: [{ id: 'x' }] },
          variants: expect.objectContaining({
            deleteMany: {},
            create: [
              expect.objectContaining({ sku: 'A', price: 1, stock: 0 }),
              expect.objectContaining({ sku: 'B', price: 2, stock: 2 }),
            ],
          }),
        }),
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/admin/products')
  })

  it('getProductsByCategorySlug queries products with variants included', async () => {
    const rows = [{ id: '1', variants: [] }]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(rows)

    const out = await getProductsByCategorySlug('cups')

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categories: expect.objectContaining({ some: expect.any(Object) }),
        }),
        include: { variants: true },
      })
    )
    expect(out).toBe(rows)
  })

  it('deleteProduct deletes by id and revalidates', async () => {
    ;(prisma.product.delete as jest.Mock).mockResolvedValue({})

    await deleteProduct('del-1')

    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'del-1' } })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/products')
  })

  it('getRandomProducts returns limited randomized products with date fields serialized', async () => {
    const now = new Date('2024-01-01T00:00:00.000Z')
    const rows = [
      { id: '1', createdAt: now, updatedAt: now },
      { id: '2', createdAt: now, updatedAt: now },
      { id: '3', createdAt: now, updatedAt: now },
      { id: '4', createdAt: now, updatedAt: now },
    ]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(rows)

    const out = await getRandomProducts(2)

    expect(prisma.product.findMany).toHaveBeenCalled()
    expect(out).toHaveLength(2)
    out.forEach((p) => {
      expect(typeof p.createdAt).toBe('string')
      expect(typeof p.updatedAt).toBe('string')
    })
  })

  it('getAllProducts fetches with relations and sort order', async () => {
    const rows = [{ id: '1' }]
    ;(prisma.product.findMany as jest.Mock).mockResolvedValue(rows)

    const out = await getAllProducts()

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      include: { variants: true, categories: true },
      orderBy: { createdAt: 'desc' },
    })
    expect(out).toBe(rows)
  })

  it('exclude returns object without specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const res = exclude(obj, ['b', 'c']) as any
    expect(res).toEqual({ a: 1 })
  })
})
