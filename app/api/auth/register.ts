import { prisma } from "prisma/prisma";
import { z } from "zod";
import { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "@lib/auth/password";

const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  password2: z.string().min(6, "Password must be at least 6 characters"),

  name: z.string().min(1, "name is required"),
  phone: z.string().optional(),
  acceptsMarketing: z.boolean().default(false),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const body = req.body;
    const validation = registerSchema.safeParse(body);
    console.log(validation);
    if (!validation.success) {
      // Return the first error message for simplicity on the frontend
      return res.status(400).json({
        error: validation.error.message[0],
      });
    }

    const { email, password, name, phone, acceptsMarketing } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const customer = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        name,
        phone,
        acceptsMarketing: !!acceptsMarketing,
        emailVerified: new Date(),
        role: "USER",
      },
    });

    const { password: _, ...customerWithoutPassword } = customer;

    return res.status(201).json({
      message: "User created successfully",
      user: customerWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
