'use server'

import { assertAdmin } from '@lib/auth/admin'
import { ActionResponse } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import * as Sentry from '@sentry/nextjs'

export interface DashboardStats {
  totalCategories: number
  totalProducts: number
  totalCustomers: number
  pendingOrders: number
  productsWithStock: number
  productsOutOfStock: number
  totalInventoryUnits: number
  lowStockVariants: number
}

export async function getDashboardStats(): Promise<
  ActionResponse<DashboardStats>
> {
  try {
    const admin = await assertAdmin()
    if (!admin || 'success' in admin) return admin

    const [
      totalCategories,
      totalProducts,
      totalCustomers,
      pendingOrders,
      variants,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.productVariant.findMany({
        select: { stock: true, availableForSale: true },
      }),
    ])

    const productsWithStock = await prisma.product.count({
      where: {
        variants: {
          some: { stock: { gt: 0 } },
        },
      },
    })

    const productsOutOfStock = totalProducts - productsWithStock
    const totalInventoryUnits = variants.reduce((acc, v) => acc + v.stock, 0)
    const lowStockThreshold = 5
    const lowStockVariants = variants.filter(
      (v) => v.stock > 0 && v.stock <= lowStockThreshold,
    ).length

    return {
      success: true,
      message: 'Fetched dashboard data successfully',
      data: {
        totalCategories,
        totalProducts,
        totalCustomers,
        pendingOrders,
        productsWithStock,
        productsOutOfStock,
        totalInventoryUnits,
        lowStockVariants,
      },
    }
  } catch (error) {
    console.error('getDashboardStats_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'A database error occurred',
      errors: error,
    }
  }
}
