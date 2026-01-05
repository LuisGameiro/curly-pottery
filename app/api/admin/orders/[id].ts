import { updateOrderStatus } from 'actions/order.actions';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'prisma/prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {


    // 3. PUT: Update an existing category
    case "PUT":
      try {
        const { status } = req.body;
        const result = await updateOrderStatus(id as string, status);
        return res.status(200).json({ success: true, data: result });
      } catch (error) {
        return res.status(500).json({ error: "Update failed. Ensure ID exists." });
      }

      
    default:
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
