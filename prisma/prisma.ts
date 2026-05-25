import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from './generated/prisma/client'

const databaseUrl = process.env.DB_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error(
    'Missing DATABASE_URL environment variable. Set DB_DATABASE_URL or DATABASE_URL.',
  )
}
const adapter = new PrismaNeon({
  connectionString: databaseUrl,
})

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
