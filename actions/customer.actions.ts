"use server";

import { prisma } from "prisma/prisma";
import { User } from "prisma/generated/prisma/client";
import {
  UserWithOrders,
  UserWithOrdersAddress,
  ActionResponse,
} from "@lib/types/types";

export async function getAllCustomers(): Promise<
  ActionResponse<UserWithOrders[]>
> {
  try {
    const user = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orders: true,
      },
    });

    return {
      success: true,
      message: "Fecthed all user successfully",
      data: user,
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

export async function getUserById(
  id: string,
): Promise<ActionResponse<UserWithOrdersAddress | null>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        addresses: true,
      },
    });
    return {
      success: true,
      message: "Fecthed user successfully",
      data: user,
    };
  } catch (error) {
    console.error("getUserById:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function updateNotes(
  id: string,
  notes: string,
): Promise<ActionResponse<User | null>> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { notes },
    });
    return {
      success: true,
      message: "User note updated successfully",
      data: user,
    };
  } catch (error) {
    console.error("updateNotes_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

// export async function createUser(formData: FormData) {
//   await prisma.user.create({
//     data: {
//       firstName: formData.get("firstName") as string,
//       lastName: formData.get("lastName") as string,
//       email: formData.get("email") as string,
//       phone: formData.get("phone") as string,
//       company: formData.get("company") as string,
//       notes: formData.get("notes") as string,
//     },
//   });

//   revalidatePath("/admin/users");
// }

// export async function updateUser(id: string, formData: FormData) {
//   await prisma.user.update({
//     where: { id },
//     data: {
//       firstName: formData.get("firstName") as string,
//       lastName: formData.get("lastName") as string,
//       email: formData.get("email") as string,
//       phone: formData.get("phone") as string,
//       company: formData.get("company") as string,
//       notes: formData.get("notes") as string,
//     },
//   });

//   revalidatePath("/admin/users");
// }

// export async function deleteUser(id: string) {
//   await prisma.user.delete({
//     where: { id },
//   });

//   revalidatePath("/admin/users");
// }
