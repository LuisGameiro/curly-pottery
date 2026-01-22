"use server";

import { authOptions } from "@lib/auth/authOptions";
import { CartLineItem, Cart } from "@lib/types/types";
import { getServerSession } from "next-auth";
import { Prisma } from "prisma/generated/prisma/client";
import { prisma } from "prisma/prisma";

export async function getCartFromDbAction(): Promise<Cart | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cart: true,
    },
  });

  return user?.cart ? (user.cart as Cart) : null;
}

export async function syncCartAction(items: CartLineItem[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const cart = {
    lineItems: items ?? ([] as Prisma.InputJsonValue),
    userId: session.user.id,
  } as Cart;

  await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: { lineItems: items },
    create: cart,
  });
}

export async function deleteCart(cartId: string) {
  await prisma.cart.delete({
    where: { id: cartId },
  });
}
