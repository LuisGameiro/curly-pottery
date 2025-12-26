import { upsertCategory } from "actions/category.actions";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "prisma/prisma";

// This code ONLY runs on the server
export default async function handler(req: NextApiRequest,
  res: NextApiResponse,) {

  if (req.method === 'GET') {
    const { id } = req.query;
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({ data: category });
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { name, slug, image } = req.body; 
    const result = await upsertCategory({ id: id as string, name, slug, image });

    if (!result) {
      return res.status(500).json({ error: "Failed to update category" });
    }

    return res.status(200).json({ success: true });
  } 
    

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const a = await prisma.category.delete({ where: { id } });

    if (!a) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({ success: true });
  }
}