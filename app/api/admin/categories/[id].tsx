import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  switch (req.method) {
    // 1. GET: Fetch all categories or a single category by ID
    case "GET":
      try {
        if (id) {
          const category = await prisma.category.findUnique({
            where: { id: String(id) },
          });
          return res.status(200).json(category);
        }
        const categories = await prisma.category.findMany();
        return res.status(200).json(categories);
      } catch (error) {
        return res.status(500).json({ error: "Failed to fetch categories" });
      }

    // 2. POST: Create a new category
    case "POST":
      try {
        const { name, slug, image } = req.body;
        const newCategory = await prisma.category.create({
          data: { name, slug, image: image || "" },
        });
        return res.status(201).json({ success: true, data: newCategory });
      } catch (error) {
        return res.status(500).json({ error: "Failed to create category" });
      }

    // 3. PUT: Update an existing category
    case "PUT":
      try {
        const { name, slug, image } = req.body;
        const updatedCategory = await prisma.category.update({
          where: { id: String(id) },
          data: { name, slug, image },
        });
        return res.status(200).json({ success: true, data: updatedCategory });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Update failed. Ensure ID exists." });
      }

    // 4. DELETE: Remove a category
    case "DELETE":
      try {
        await prisma.category.delete({
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
