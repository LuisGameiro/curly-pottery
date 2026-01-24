import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma/client'
import { Pool } from 'pg'

new Pool({ connectionString: process.env.DB_DATABASE_URL })

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaNeon({
  connectionString: process.env.DB_DATABASE_URL,
})

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
