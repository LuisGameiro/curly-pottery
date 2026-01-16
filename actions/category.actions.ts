"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "prisma/prisma";
import { Category } from "@lib/types/category";
import { ActionResponse } from "@lib/types/utils";

export async function getAllCategories(): Promise<ActionResponse<Category[]>> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      message: "Fecthed all Categories successfully",
      data: categories,
    };
  } catch (error) {
    console.error("getAllCustomers_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function getCategoryById(
  id: string
): Promise<ActionResponse<Category | null>> {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: "Fecthed Category successfully",
      data: category,
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

export async function upsertCategory(formData: {
  id?: string;
  name: string;
  slug: string;
  image: string;
}) {
  try {
    let category;
    if (formData.id) {
      category = await prisma.category.update({
        where: { id: formData.id },
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
        },
      });
    } else {
      category = await prisma.category.create({
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
        },
      });
    }

    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Updated category successfully",
      data: category,
    };
  } catch (error) {
    console.error("upsertCategory_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return {
      success: true,
      message: "Deleted category successfully",
      data: category,
    };
  } catch (error) {
    console.error("deleteCategory_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

// export async function createCategory(formData: FormData) {
//   await prisma.category.create({
//     data: {
//       name: formData.get("name") as string,
//       url: formData.get("url") as string,
//       image: formData.get("image") as string,
//       slug: formData.get("slug") as string,
//     },
//   });

//   revalidatePath("/admin/categories");
// }

// export async function updateCategory(id: string, formData: FormData) {
//   await prisma.category.update({
//     where: { id },
//     data: {
//       name: formData.get("name") as string,
//       url: formData.get("url") as string,
//       image: formData.get("image") as string,
//     },
//   });

//   revalidatePath("/admin/categories");
// }

// export async function getCategoryBySlug(slug: string) {
//   const caregoriesRaw = await prisma.category.findFirst({
//     where: {
//       slug,
//     },
//   });

//   return serializeProduct([caregoriesRaw])[0];
// }
