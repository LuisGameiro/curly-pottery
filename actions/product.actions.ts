"use server";

import { Product, ProductFull, ActionResponse, ProductWithVariantsCategories } from "@lib/types/types";
import { prisma } from "prisma/prisma";
import { Category } from "prisma/generated/prisma/client";

export async function getProductBySlug(
  slug: string | null,
): Promise<ActionResponse<ProductWithVariantsCategories | null>> {
  if (!slug)
    return {
      success: false,
      message: "Slug not provided",
      errors: null,
    };
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        variants: true,
        categories: true,
      },
    });

    return {
      success: true,
      message: "Fecthed product successfully",
      data: product,
    };
  } catch (error) {
    console.error("getProductBySlugd_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function getProductById(
  id: string,
): Promise<ActionResponse<ProductWithVariantsCategories | null>> {
  if (!id)
    return {
      success: false,
      message: "Id not provided",
      errors: null,
    };
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        variants: true,
        categories: true,
      },
    });

    return {
      success: true,
      message: "Fecthed product successfully",
      data: product,
    };
  } catch (error) {
    console.error("getProductById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function deleteProduct(
  id: string,
): Promise<ActionResponse<Product | null>> {
  try {
    const product = await prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Fecthed Category successfully",
      data: product,
    };
  } catch (error) {
    console.error("getCategoryById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
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
        createdAt: "desc",
      },
    });

    return {
      success: true,
      message: "Fecthed Category successfully",
      data: products,
    };
  } catch (error) {
    console.error("getCategoryById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}
export async function getRandomProducts(
  limit = 3,
): Promise<ActionResponse<Product[] | null>> {
  try {
    const products = await prisma.product.findMany();

    return {
      success: true,
      message: "Fecthed random products successfully",
      data: products.sort(() => 0.5 - Math.random()).slice(0, limit),
    };
  } catch (error) {
    console.error("getRandomProducts_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}
export async function getRelatedProducts(
  categories: Category[],
  excludeId?: string,
  limit: number = 3,
): Promise<ActionResponse<Product[] | null>> {
  try {
    if (!categories.length)
      return {
        success: true,
        message: "No related Products",
        data: [],
      };
    const categoriesName = categories.map((c) => c.name);
    const count = await prisma.product.count({
      where: {
        categories: {
          some: {
            name: { in: categoriesName },
          },
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (count === 0)
      return {
        success: true,
        message: "No related Products",
        data: [],
      };

    const skip = Math.floor(Math.random() * Math.max(1, count - limit));

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
    });
    return {
      success: true,
      message: "Fecthed Category successfully",
      data: relatedProducts,
    };
  } catch (error) {
    console.error("getCategoryById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function getProductsByCategorySlug(
  category: string | null,
): Promise<ActionResponse<Product[] | null>> {
  try {
    const products = prisma.product.findMany({
      where: category
        ? {
          categories: {
            some: { slug: category },
          },
        }
        : undefined,
    });

    return {
      success: true,
      message: "Fetched products successfully",
      data: products,
    };
  } catch (error) {
    console.error("getRelatedProducts_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}
export async function upsertProduct(
  payload: any,
): Promise<ActionResponse<Product| null>> {
  try {
    const { categoryIds, variants, id, previews, files, ...productData } =
      payload;
    const categoriesForUpdate = {
      set: categoryIds.map((catId: string) => ({ id: catId })),
    };

    const categoriesForCreate = {
      connect: categoryIds.map((catId: string) => ({ id: catId })),
    };
    const prepareVariant = (v: any) => {
      const {
        id: variantId,
        isExpanded,
        files,
        previews,
        productId,
        ...dbData
      } = v;
      return { ...dbData };
    };
    const product = await prisma.product.upsert({
      where: { id: id || "new-id" },
      update: {
        ...productData,
        categories: categoriesForUpdate,
        variants: {
          upsert: variants.map((v: any) => ({
            where: { id: v.id.startsWith("temp-") ? "0" : v.id },
            update: prepareVariant(v),
            create: prepareVariant(v),
          })),
        },
      },
      create: {
        ...productData,
        categories: categoriesForCreate,
        variants: {
          create: variants.map((v: any) => prepareVariant(v)),
        },
      },
    });

    return {
      success: true,
      message: "Upsert of product was successfully",
      data: product,
    };
  } catch (error) {
    console.error("upsertProduct_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

// export async function createProduct(formData: FormData) {
//   const categories = formData.getAll("categories") as string[];
//   const variants = JSON.parse(formData.get("variants") as string); // array of variants

//   await prisma.product.create({
//     data: {
//       name: formData.get("name") as string,
//       description: formData.get("description") as string,
//       slug: formData.get("slug") as string,
//       images: JSON.parse(formData.get("images") as string),
//       requiresShipping: formData.get("requiresShipping") === "on",

//       categories: {
//         connect: categories.map((id) => ({ id })),
//       },

//       variants: {
//         create: variants.map((variant: any) => ({
//           sku: variant.sku,
//           price: Number(variant.price),
//           currency: variant.currency,
//           stock: Number(variant.stock),
//           availableForSale: variant.availableForSale,
//           images: variant.images,

//           sizeName: variant.sizeName ?? null,
//           widthCm: variant.widthCm ?? null,
//           heightCm: variant.heightCm ?? null,
//           depthCm: variant.depthCm ?? null,

//           colorName: variant.colorName ?? null,
//           colorHex: variant.colorHex ?? null,
//           glazes: variant.glazes ?? [],
//         })),
//       },
//     },
//   });

//   revalidatePath("/admin/products");
// }

// export async function updateProduct(id: string, formData: FormData) {
//   const categories = formData.getAll("categories") as string[];
//   const variants = JSON.parse(formData.get("variants") as string);

//   await prisma.product.update({
//     where: { id },
//     data: {
//       name: formData.get("name") as string,
//       description: formData.get("description") as string,
//       slug: formData.get("slug") as string,
//       images: JSON.parse(formData.get("images") as string),
//       requiresShipping: formData.get("requiresShipping") === "on",

//       categories: {
//         set: categories.map((id) => ({ id })),
//       },

//       // Simplest approach: delete & recreate variants
//       variants: {
//         deleteMany: {},
//         create: variants.map((variant: any) => ({
//           sku: variant.sku,
//           price: Number(variant.price),
//           currency: variant.currency,
//           stock: Number(variant.stock),
//           availableForSale: variant.availableForSale,
//           images: variant.images,

//           sizeName: variant.sizeName ?? null,
//           widthCm: variant.widthCm ?? null,
//           heightCm: variant.heightCm ?? null,
//           depthCm: variant.depthCm ?? null,

//           colorName: variant.colorName ?? null,
//           colorHex: variant.colorHex ?? null,
//           glazes: variant.glazes ?? [],
//         })),
//       },
//     },
//   });

//   revalidatePath("/admin/products");
// }
