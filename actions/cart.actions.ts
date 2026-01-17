"use server";

import { authOptions } from "@lib/auth/authOptions";
import { CartLineItem } from "@lib/types/types";
import { getServerSession } from "next-auth";
import { prisma } from "prisma/prisma";

export async function getCartFromDbAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      cart: true,
    },
  });

  return user?.cart ? user.cart : [];
}

export async function syncCartAction(items: CartLineItem[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  await prisma.cart.upsert({
    where: { userId: session.user.id },
    update: { lineItems: JSON.stringify(items) },
    create: { lineItems: JSON.stringify(items) },
  });
}

export async function deleteCart(cartId: string) {
  await prisma.cart.delete({
    where: { id: cartId },
  });
}
