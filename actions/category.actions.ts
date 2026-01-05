"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "prisma/prisma";
import { serializeProduct, serializeProductVariant } from "./helpers";

export async function createCategory(formData: FormData) {
  await prisma.category.create({
    data: {
      name: formData.get("name") as string,
      url: formData.get("url") as string,
      image: formData.get("image") as string,
      slug: formData.get("slug") as string,
    },
  });

  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  await prisma.category.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      url: formData.get("url") as string,
      image: formData.get("image") as string,
    },
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });

    // This tells Next.js to refresh the data on the categories page
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function getAllCategories() {
  const categoriesRaw = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return serializeProduct(categoriesRaw);
}

export async function getCategoryBySlug(slug: string) {
  const caregoriesRaw = await prisma.category.findFirst({
    where: {
      slug,
    },
  });

  return serializeProduct([caregoriesRaw])[0];
}

export async function getCategoryById(id: string) {
  const caregoriesRaw = await prisma.category.findFirst({
    where: {
      id,
    },
  });

  return ([caregoriesRaw])[0];
}

export async function upsertCategory(formData: {
  id?: string;
  name: string;
  slug: string;
  image?: string;
}) {
  try {
    if (formData.id) {
      await prisma.category.update({
        where: { id: formData.id },
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name: formData.name,
          slug: formData.slug,
          image: formData.image,
        },
      });
    }

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to save category",
    };
  }
}
