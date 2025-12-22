"use server";

import { prisma } from "prisma/prisma";
import { revalidatePath } from "next/cache";

// export async function createOrderFromCart(input: {
//   cartId: string;
//   userId?: string;
//   shippingAddress: any;
//   billingAddress: any;
//   paymentCard: any;
// }) {
//   const cart = await prisma.cart.findUnique({
//     where: { id: input.cartId },
//   });

//   if (!cart) throw new Error("Cart not found");

//   const order = await prisma.order.create({
//     data: {
//       userId: input.userId,
//       cartId: cart.id,
//       lineItems: cart.lineItems,
//       discounts: cart.discounts,
//       subtotalPrice: cart.subtotalPrice,
//       totalPrice: cart.totalPrice,
//       currency: cart.currency,
//       shippingAddress: input.shippingAddress,
//       billingAddress: input.billingAddress,
//       paymentCard: input.paymentCard,
//     },
//   });

//   revalidatePath("/admin/orders");
//   return order;
// }
