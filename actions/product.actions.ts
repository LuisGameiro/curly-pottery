'use server'

import { ProductInput, VariantInput } from '@lib/form-validator'
import {
  Product,
  ActionResponse,
  ProductWithVariantsCategories,
  Category,
} from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import { deleteBlob } from './serverImages.action'

export async function getProductBySlug(
  slug: string | null,
): Promise<ActionResponse<ProductWithVariantsCategories | null>> {
  if (!slug)
    return {
      success: false,
      message: 'Slug not provided',
      errors: null,
    }
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        hide: false,
      },
      include: {
        variants: true,
        categories: true,
      },
    })

    return {
      success: true,
      message: 'Fecthed product successfully',
      data: product,
    }
  } catch (error) {
    console.error('getProductBySlugd_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getProductById(
  id: string,
): Promise<ActionResponse<ProductWithVariantsCategories | null>> {
  if (!id)
    return {
      success: false,
      message: 'Id not provided',
      errors: null,
    }
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        variants: true,
        categories: true,
      },
    })

    return {
      success: true,
      message: 'Fecthed product successfully',
      data: product,
    }
  } catch (error) {
    console.error('getProductById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function deleteProduct(
  id: string,
  images: string[],
): Promise<ActionResponse<Product | null>> {
  try {
    Promise.all(
      images.map(async (img) => {
        await deleteBlob(img)
      }),
    )

    const product = await prisma.product.delete({
      where: { id },
    })

    return {
      success: true,
      message: 'Fecthed Category successfully',
      data: product,
    }
  } catch (error) {
    console.error('getCategoryById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getAllProducts(): Promise<
  ActionResponse<ProductWithVariantsCategories[] | null>
> {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      message: 'Fecthed Category successfully',
      data: products,
    }
  } catch (error) {
    console.error('getCategoryById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function getRandomProducts(
  limit = 3,
): Promise<ActionResponse<Product[] | null>> {
  try {
    const products = await prisma.product.findMany({
      where: { variants: { some: { stock: { gt: 0 } } }, hide: false },
   
    })

    return {
      success: true,
      message: 'Fecthed random products successfully',
      data: products.sort(() => 0.5 - Math.random()).slice(0, limit),
    }
  } catch (error) {
    console.error('getRandomProducts_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function getRelatedProducts(
  categories: Category[],
  excludeId?: string,
  limit: number = 4,
): Promise<ActionResponse<Product[] | null>> {
  try {
    if (!categories.length)
      return {
        success: true,
        message: 'No related Products',
        data: [],
      }
    const categoriesName = categories.map((c) => c.name)
    const count = await prisma.product.count({
      where: {
        categories: {
          some: {
            name: { in: categoriesName },
          },
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    })

    if (count === 0)
      return {
        success: true,
        message: 'No related Products',
        data: [],
      }

    const skip = Math.floor(Math.random() * Math.max(1, count - limit))

    const relatedProducts = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            name: { in: categoriesName },
          },
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
      take: limit,
      skip,
    })
    return {
      success: true,
      message: 'Fecthed Category successfully',
      data: relatedProducts,
    }
  } catch (error) {
    console.error('getCategoryById_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}

export async function getProductsByCategorySlug(
  category: string | null,
): Promise<ActionResponse<ProductWithVariantsCategories[] | null>> {
  try {
    const products = await prisma.product.findMany({
      where: category
        ? {
            categories: {
              some: { slug: category },
            },
          }
        : undefined,
      include: {
        variants: true,
        categories: true,
      },
    })

    return {
      success: true,
      message: 'Fetched products successfully',
      data: products,
    }
  } catch (error) {
    console.error('getRelatedProducts_ERROR:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
export async function upsertProduct(
  payload: ProductInput,
): Promise<ActionResponse<Product | null>> {
  try {
    const {
      categoryIds,
      variants,
      id,
      files: _files,
      previews: _previews,
      ...productData
    } = payload

    const existingVariantIds = variants
      .map((v) => v.id)
      .filter((id) => id && !id.startsWith('temp-'))

    const productId =
      id && !id.startsWith('temp-') ? id : '000000000000000000000000'

    const prepareVariant = (v: VariantInput) => {
      const {
        id: _vId,
        files: _files,
        previews: _previews,
        isExpanded: _isExpanded,
        ...variantData
      } = v

      return {
        ...variantData,
        details: v.details ?? [],
        discounts: v.discounts ?? [],
        images: v.images ?? [],
      }
    }

    const product = await prisma.product.upsert({
      where: { id: productId },
      update: {
        ...productData,
        categories: {
          set: categoryIds.map((catId) => ({ id: catId })),
        },
        variants: {
          deleteMany: {
            productId: id,
            id: { notIn: existingVariantIds },
          },
          upsert: variants.map((v) => {
            const isTemp = !v.id || v.id.startsWith('temp-')
            const variantData = prepareVariant(v)

            return {
              where: { id: isTemp ? '000000000000000000000000' : v.id },
              update: variantData,
              create: variantData,
            }
          }),
        },
      },
      create: {
        ...productData,
        categories: {
          connect: categoryIds.map((catId) => ({ id: catId })),
        },
        variants: {
          create: variants.map((v) => prepareVariant(v)),
        },
      },
    })

    return {
      success: true,
      message: 'Product saved successfully',
      data: product,
    }
  } catch (error) {
    console.error('upsertProduct_ERROR:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Database error',
      errors: error,
    }
  }
}
