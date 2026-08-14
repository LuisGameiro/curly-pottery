'use server'

import { assertAdmin } from '@lib/auth/admin'
import { ActionResponse } from '@lib/types/types'
import { prisma } from 'prisma/prisma'
import * as Sentry from '@sentry/nextjs'
import { toClientMessage } from '@lib/errors'

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
      totalInventoryAgg,
      productsWithStock,
      lowStockVariants,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.productVariant.aggregate({ _sum: { stock: true } }),
      prisma.product.count({
        where: {
          variants: {
            some: { stock: { gt: 0 } },
          },
        },
      }),
      prisma.productVariant.count({
        where: { stock: { gt: 0, lte: 5 } },
      }),
    ])

    const totalInventoryUnits = totalInventoryAgg._sum.stock ?? 0
    const productsOutOfStock = totalProducts - productsWithStock

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
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}

export interface StockMovementItem {
  id: string
  quantity: number
  type: string
  note: string | null
  createdAt: Date
  variant: {
    id: string
    sku: string
    colorName: string
    sizeName: string
    product: { name: string } | null
  } | null
}

export async function getRecentStockMovements(
  limit = 50,
): Promise<ActionResponse<StockMovementItem[]>> {
  try {
    const admin = await assertAdmin()
    if (!admin || 'success' in admin) return admin

    const movements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            colorName: true,
            sizeName: true,
            product: { select: { name: true } },
          },
        },
      },
    })

    return {
      success: true,
      message: 'Fetched stock movements successfully',
      data: movements as unknown as StockMovementItem[],
    }
  } catch (error) {
    console.error('getRecentStockMovements_ERROR:', error)
    Sentry.captureException(error)
    return {
      success: false,
      message: toClientMessage(error, 'A database error occurred'),
      errors: error,
    }
  }
}
