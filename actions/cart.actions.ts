import { prisma } from "prisma/prisma";

export async function getCart(cartId?: string) {
  if (!cartId) return null;
  return prisma.cart.findUnique({ where: { id: cartId } });
}
 
export async function deleteCart(cartId: string) {
  await prisma.cart.delete({
    where: { id: cartId },
  });
}