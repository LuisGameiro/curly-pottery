import { serializeProductVariant } from "actions/helpers";
import { getProductBySlug } from "actions/product.actions";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Invalid or missing slug" });
    }
    const product = await getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(serializeProductVariant([product])[0]);
  } catch (err) {
    console.error("Error fetching related products:", err);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
}
