import { upsertCategory } from "actions/category.actions";
import { updateOrderStatus } from "actions/order.actions";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/prisma";

// This code ONLY runs on the server
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "PUT") {
    const { id } = req.query;
    const { status } = req.body;
    const result = await updateOrderStatus(id as string, status);

    if (!result) {
      return res.status(500).json({ error: "Failed to update category" });
    }

    return res.status(200).json({ success: true });
  }
}
