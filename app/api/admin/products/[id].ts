import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  switch (req.method) {
    // 1. GET: Fetch all categories or a single product by ID
    case "GET":
      try {
        if (id) {
          const product = await prisma.product.findUnique({
            where: { id: String(id) },
          });
          return res.status(200).json(product);
        }
        const categories = await prisma.product.findMany();
        return res.status(200).json(categories);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch categories" });
      }

    // 2. POST: Create a new product
    case "POST":
      try {
        // const { name, slug, image } = req.body;
        const newProduct = await prisma.product.create({
          data: req.body,
        });
        return res.status(201).json({ success: true, data: newProduct });
      } catch (error) {
        return res.status(500).json({ error: "Failed to create product" });
      }

    // 3. PUT: Update an existing product
    case "PUT":
      try {
        // const { name, slug, image } = req.body;
        const updatedProduct = await prisma.product.update({
          where: { id: String(id) },
          data: req.body,
        });
        console.log();
        return res.status(200).json({ success: true, data: updatedProduct });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Update failed. Ensure ID exists." });
      }

    // 4. DELETE: Remove a product
    case "DELETE":
      try {
        await prisma.product.delete({
          where: { id: String(id) },
        });
        return res
          .status(200)
          .json({ success: true, message: "Deleted successfully" });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Delete failed. Ensure ID exists." });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
