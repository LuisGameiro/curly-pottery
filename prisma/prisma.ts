// import { PrismaNeon } from '@prisma/adapter-neon'
// import dotenv from 'dotenv'
// import { PrismaClient } from './generated/prisma/client'

// dotenv.config()
// const connectionString = `${process.env.DATABASE_URL}`

// const adapter = new PrismaNeon({ connectionString })
// export const prisma = new PrismaClient({ adapter })

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma/client";

// const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
// export const prisma = new PrismaClient({ adapter });
// // ✅ Add PrismaClient options if required

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
