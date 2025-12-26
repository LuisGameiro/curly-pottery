"use server";

import { prisma } from "prisma/prisma";
import { revalidatePath } from "next/cache";
import { serializeCustomers } from "./helpers";

export async function getAllCustomers() {
    const customersRaw = await prisma.customer.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            orders: true,
        },
    });

    return serializeCustomers(customersRaw);
}

export async function getCustomerById(id: string) {
    const customerRaw = await prisma.customer.findUnique({
        where: { id },
        include: {
            orders: true,
        }

    });
    return serializeCustomers([customerRaw])[0];

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
