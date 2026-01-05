"use server";
import { prisma } from "prisma/prisma"; // Adjust based on your setup

export async function getDashboardStats() {
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

  // Logic for Products with Stock vs Without
  // We check if a product has AT LEAST one variant with stock > 0
  const productsWithStock = await prisma.product.count({
    where: {
      variants: {
        some: { stock: { gt: 0 } },
      },
    },
  });

  const productsOutOfStock = totalProducts - productsWithStock;

  // Aggregate variant-level data
  const totalInventoryUnits = variants.reduce((acc, v) => acc + v.stock, 0);
  const lowStockThreshold = 5;
  const lowStockVariants = variants.filter(
    (v) => v.stock > 0 && v.stock <= lowStockThreshold,
  ).length;

  return {
    totalCategories,
    totalProducts,
    totalCustomers,
    pendingOrders,
    productsWithStock,
    productsOutOfStock,
    totalInventoryUnits,
    lowStockVariants,
  };
}
