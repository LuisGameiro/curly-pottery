"use server";

import { prisma } from "prisma/prisma";
import {
  Address,
  Order,
  OrderStatus,
  OrderWithUser,
  ActionResponse,
  CartLineItem,
  CurrencyCode,
  CreateOrder,
} from "@lib/types/types";
import { revalidatePath } from "next/cache";

export async function getAllOrders(): Promise<
  ActionResponse<OrderWithUser[] | null>
> {
  try {
    const order = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    return {
      success: true,
      message: "Fetched all orders successfully",
      data: order,
    };
  } catch (error) {
    console.error("getAllOrders_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function getOrderById(
  id: string,
): Promise<ActionResponse<OrderWithUser | null>> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    return {
      success: true,
      message: "Fetched order successfully",
      data: order,
    };
  } catch (error) {
    console.error("getOrderById_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function createOrder({
  userId,
  address,
  lineItems,
  discounts,
  subtotalPrice,
  totalPrice,
  taxes,
  currency,
  shippingPrice,
  shippingMethod,
}:CreateOrder): Promise<ActionResponse<Order | null>> {
  try {
    const order = await prisma.order.create({
      data: {
        lineItems,
        discounts: discounts || [],
        currency: currency || "GBP",
        shippingAddress: address || {},
        billingAddress: address || {},
        status: "PENDING",
        taxes,
        shippingPrice: shippingPrice,
        subtotalPrice: Number(subtotalPrice) || 0,
        totalPrice: Number(totalPrice) || 0,
        shippingMethod: shippingMethod,
        ...(userId && {
          user: {
            connect: { id: userId },
          },
        }),
      },
    });

    return {
      success: true,
      message: "Order created successfully",
      data: order,
    };
  } catch (error) {
    console.error("createOrder", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<ActionResponse<Order | null>> {
  try {
    const status = newStatus.toUpperCase() as OrderStatus;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Updated order status successfully",
      data: order,
    };
  } catch (error) {
    console.error("updateOrderStatus_ERROR:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "A database error occurred",
      errors: error,
    };
  }
}

// export async function OrderUpdateStatus(id: string, status: OrderStatus) {
//   const orderRaw = await prisma.order.update({
//     where: { id },
//     data: { status },
//   });

//   if (!orderRaw) {
//     throw new Error("Order not found");
//   }

//   return orderRaw;
// }

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
