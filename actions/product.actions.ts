"use server";

import { Product } from "@lib/types/product";
import { revalidatePath } from "next/cache";
import { prisma } from "prisma/prisma";
import { ca } from "zod/v4/locales";
import { serializeProductVariant, serializeProduct } from "./helpers";

export async function createProduct(formData: FormData) {
  const categories = formData.getAll("categories") as string[];
  const variants = JSON.parse(formData.get("variants") as string); // array of variants

  await prisma.product.create({
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      slug: formData.get("slug") as string,
      images: JSON.parse(formData.get("images") as string),
      requiresShipping: formData.get("requiresShipping") === "on",

      categories: {
        connect: categories.map((id) => ({ id })),
      },

      variants: {
        create: variants.map((variant: any) => ({
          sku: variant.sku,
          price: Number(variant.price),
          currency: variant.currency,
          stock: Number(variant.stock),
          availableForSale: variant.availableForSale,
          images: variant.images,

          sizeName: variant.sizeName ?? null,
          widthCm: variant.widthCm ?? null,
          heightCm: variant.heightCm ?? null,
          depthCm: variant.depthCm ?? null,

          colorName: variant.colorName ?? null,
          colorHex: variant.colorHex ?? null,
          glazes: variant.glazes ?? [],
        })),
      },
    },
  });

  revalidatePath("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const categories = formData.getAll("categories") as string[];
  const variants = JSON.parse(formData.get("variants") as string);

  await prisma.product.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      slug: formData.get("slug") as string,
      images: JSON.parse(formData.get("images") as string),
      requiresShipping: formData.get("requiresShipping") === "on",

      categories: {
        set: categories.map((id) => ({ id })),
      },

      // Simplest approach: delete & recreate variants
      variants: {
        deleteMany: {},
        create: variants.map((variant: any) => ({
          sku: variant.sku,
          price: Number(variant.price),
          currency: variant.currency,
          stock: Number(variant.stock),
          availableForSale: variant.availableForSale,
          images: variant.images,

          sizeName: variant.sizeName ?? null,
          widthCm: variant.widthCm ?? null,
          heightCm: variant.heightCm ?? null,
          depthCm: variant.depthCm ?? null,

          colorName: variant.colorName ?? null,
          colorHex: variant.colorHex ?? null,
          glazes: variant.glazes ?? [],
        })),
      },
    },
  });

  revalidatePath("/admin/products");
}

export async function getProductBySlug(slug: string) {
  const productsRaw = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      variants: true,
      categories: true,
    },
  });

  return serializeProductVariant([productsRaw])[0];
}

export async function getProductById(id: string) {
  const productsRaw = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      variants: true,
      categories: true,
    },
  });

  return ([productsRaw])[0];
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/admin/products");
}

export async function getRandomProducts(limit = 3) {
  const productsRaw = await prisma.product.findMany();
  const products = serializeProduct(productsRaw);
  return products.sort(() => 0.5 - Math.random()).slice(0, limit);
}

export async function getAllProducts() {
  const productsRaw = await prisma.product.findMany({
    include: {
      variants: true,
      categories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (productsRaw);
}

export async function getRelatedProducts(
  categories: string[],
  excludeId?: string,
  limit: number = 3,
) {
  if (!categories.length) return [];

  // Count how many products match
  const count = await prisma.product.count({
    where: {
      categories: {
        some: {
          name: { in: categories }, // check if product has any of these categories
        },
      },
      ...(excludeId && { id: { not: excludeId } }), // exclude current product if needed
    },
  });

  if (count === 0) return [];

  const skip = Math.floor(Math.random() * Math.max(1, count - limit));

  const relatedProducts = await prisma.product.findMany({
    where: {
      categories: {
        some: {
          name: { in: categories },
        },
      },
      ...(excludeId && { id: { not: excludeId } }),
    },
    take: limit,
    skip,
  });
  return (relatedProducts);
}
