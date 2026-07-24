import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../../prisma/generated/prisma/client'

let prisma: PrismaClient | null = null

/**
 * Get a Prisma client connected to the test database.
 * Uses DB_DATABASE_URL env var (set via playwright config webServer).
 */
export function getTestDb(): PrismaClient {
  if (!prisma) {
    const databaseUrl = process.env.DB_DATABASE_URL
    if (!databaseUrl) {
      throw new Error(
        'DB_DATABASE_URL is not set. Configure it in playwright.config.ts webServer env.',
      )
    }
    const adapter = new PrismaNeon({ connectionString: databaseUrl })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}

/**
 * Disconnect the test database client.
 */
export async function disconnectTestDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}
