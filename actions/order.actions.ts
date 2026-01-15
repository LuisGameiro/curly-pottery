"use server";

import { prisma } from "prisma/prisma";
import { serializeOrders, serializeProduct } from "./helpers";
import { OrderStatus } from "@lib/types/customer";
import { revalidatePath } from "next/cache";

// app/actions/orders.ts
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // 1. Validate the status against your Prisma Enum (Case-Sensitive!)
    // If your schema says "PAID", sending "Paid" will fail.
    const status = newStatus.toUpperCase() as OrderStatus;

    await prisma.order.update({
      where: { id: orderId },
      data: { status: status },
    });

    // 2. Refresh the data on the page immediately
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("Database Update Error:", error);
    return { success: false, error: "Failed to update order" };
  }
}
export async function getAllOrders() {
  const ordersRaw = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  return ordersRaw;
}

export async function getOrderById(id: string) {
  const orderRaw = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  if (!orderRaw) {
    throw new Error("Order not found");
  }

  return orderRaw;
}

export async function OrderUpdateStatus(id: string, status: OrderStatus) {
  const orderRaw = await prisma.order.update({
    where: { id },
    data: { status },
  });

  if (!orderRaw) {
    throw new Error("Order not found");
  }

  return orderRaw;
}

// export async function updateOrderStatus(id: string, status: OrderStatus) {
//     const updatedOrder = await prisma.order.update({
//         where: { id },
//         data: { status },
//     });

//     // revalidatePath("/admin/orders");
//   //  return serializeOrders([updatedOrder])[0];
// }

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

export async function createOrder(input: {
  cartId: string;
  userId?: string;
  shippingAddress: any;
  billingAddress: any;
  cart: any;
  shipping:any;
}) {
  console.log(input)

  try {
    const order = await prisma.order.create({
      data: {
        lineItems: input.cart.lineItems || [], 
        discounts: input.cart.discounts || [],
        subtotalPrice: Number(input.cart.subtotalPrice)||0,
        totalPrice: Number(input.cart.totalPrice)||0,
        currency: input.cart.currency || "GBP",
        shippingAddress: input.shippingAddress||{},
        billingAddress: input.billingAddress ||{},
        status: "PENDING",
        shipping: input.shipping,
        ...(input.userId && {
          user: {
            connect: { id: input.userId }
          }
        })
      },
    });

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error(`Could not process order. Please try again.${JSON.stringify(error)}`);
  }
}