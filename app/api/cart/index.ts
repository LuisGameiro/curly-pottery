import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "prisma/prisma";

export default async function handler(req: any, res: any) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    const cart = await prisma.cart.findUnique({
      where: { customerId: session.user.id },
      include: { items: true }
    });
    return res.json(cart || { items: [] });
  }

  if (req.method === "POST") {
    const { items } = req.body;
    // Simple logic: Upsert the cart and its items
    const cart = await prisma.cart.upsert({
      where: { customerId: session.user.id },
      update: { items: { deleteMany: {}, create: items } },
      create: { customerId: session.user.id, items: { create: items } }
    });
    return res.json(cart);
  }
}