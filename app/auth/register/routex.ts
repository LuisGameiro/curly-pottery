// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "prisma/prisma";
// import { z } from "zod";
// import { hashPassword } from "@lib/auth/password";

// const registerSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   name: z.string().min(1, "Name is required"),
//   phone: z.string().optional(),
//   acceptsMarketing: z.boolean().default(false),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const validation = registerSchema.safeParse(body);

//     if (!validation.success) {
//       // Return Zod errors formatted nicely
//       return NextResponse.json(
//         { error: validation.error.errors[0].message },
//         { status: 400 },
//       );
//     }

//     const { email, password, name, phone, acceptsMarketing } = validation.data;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User already exists" },
//         { status: 400 },
//       );
//     }

//     const customer = await prisma.user.create({
//       data: {
//         email,
//         password: await hashPassword(password),
//         name,
//         phone,
//         acceptsMarketing: !!acceptsMarketing,
//         emailVerified: new Date(),
//         role: "USER",
//       },
//     });

//     // Remove password from response
//     const { password: _, ...customerWithoutPassword } = customer;

//     return NextResponse.json(
//       {
//         message: "User created successfully",
//         user: customerWithoutPassword,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Registration error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }
