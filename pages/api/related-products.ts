import { serializeProductVariant } from "actions/product.actions";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { categories, excludeId, limit = "3" } = req.query;

    // Validate categories
    if (!categories) {
      return res.status(400).json({ error: "Missing categories" });
    }

    const categoriesArray: string[] = Array.isArray(categories)
      ? categories
      : String(categories)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

    if (!categoriesArray.length) {
      return res.status(400).json({ error: "Categories array is empty" });
    }

    // Validate limit
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ error: "Invalid limit value" });
    }

    // Validate excludeId (numeric)
    const excludeIdNum =
      excludeId && !isNaN(Number(excludeId)) ? Number(excludeId) : undefined;

    // Count matching products
    const count = await prisma.product.count({
      where: {
        categories: { some: { name: { in: categoriesArray } } },
        ...(excludeIdNum && { id: { not: excludeIdNum } }),
      },
    });

    if (count === 0) {
      return res.status(200).json([]); // No related products
    }

    // Random skip (ensure non-negative)
    const skip =
      count > limitNum ? Math.floor(Math.random() * (count - limitNum)) : 0;

    // Fetch related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categories: { some: { name: { in: categoriesArray } } },
        ...(excludeIdNum && { id: { not: excludeIdNum } }),
      },
      take: limitNum,
      skip,
    });

    res.status(200).json(serializeProductVariant(relatedProducts));
  } catch (err) {
    console.error("Error fetching related products:", err);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
}
