"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "prisma/prisma";

export async function createCategory(formData: FormData) {
  await prisma.category.create({
    data: {
      name: formData.get("name") as string,
      url: formData.get("url") as string,
      image: formData.get("image") as string,
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
  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
}
export async function getAllCategories() {
  const categoriesRaw = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return categoriesRaw.map((cat) => ({
    ...cat,
    createdAt: cat.createdAt.toISOString(), // Convert Date to String
    updatedAt: cat.updatedAt.toISOString(),
  }));
}
