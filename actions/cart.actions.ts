'use server'

import { authOptions } from "@lib/auth/authOptions";
import { auth } from "app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
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

export async function syncCartAction(items: any[]) {
const session = await getServerSession(authOptions);
  if (!session?.user) return; // Silent return if guest

  // Upsert logic: Update the user's cart in Prisma
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
