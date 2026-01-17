"use server";
import { ActionResponse } from "@lib/types/utils";
import { prisma } from "prisma/prisma";

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  productsWithStock: number;
  productsOutOfStock: number;
  totalInventoryUnits: number;
  lowStockVariants: number;
}

export async function getDashboardStats(): Promise<
  ActionResponse<DashboardStats>
> {
  try {
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
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.productVariant.findMany({
        select: { stock: true, availableForSale: true },
      }),
    ]);

    const productsWithStock = await prisma.product.count({
      where: {
        variants: {
          some: { stock: { gt: 0 } },
        },
      },
    });

    const productsOutOfStock = totalProducts - productsWithStock;

    const totalInventoryUnits = variants.reduce((acc, v) => acc + v.stock, 0);
    const lowStockThreshold = 5;
    const lowStockVariants = variants.filter(
      (v) => v.stock > 0 && v.stock <= lowStockThreshold,
    ).length;

    return {
      success: true,
      message: "Fecthed dashboard data successfully",
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
    };
  } catch (error) {
    console.error("getDashboardStats_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}
