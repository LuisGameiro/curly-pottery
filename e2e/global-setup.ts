/**
 * Global Playwright setup.
 * Seeds the test database before all E2E tests run.
 *
 * Requires DB_DATABASE_URL to be set in .env or as an environment variable
 * pointing to the test database (separate from dev/prod).
 */
import { execSync } from 'child_process'
import path from 'path'

async function globalSetup(): Promise<void> {
  const testDbUrl = process.env.DB_DATABASE_URL

  if (!testDbUrl) {
    console.warn('\n⚠️  DB_DATABASE_URL not set — skipping test DB seed.')
    console.warn(
      '   Set DB_DATABASE_URL to a test database in .env or environment.\n',
    )
    return
  }

  console.log('\n🌱 Seeding test database...')
  console.log(`   Using: ${testDbUrl.replace(/:.+@/, '://***:***@')}`)

  // Run the e2e seed script using tsx (TypeScript executor)
  const seedPath = path.resolve(__dirname, '../prisma/seed-e2e.ts')

  try {
    execSync(`npx tsx "${seedPath}"`, {
      env: {
        ...process.env,
        DB_DATABASE_URL: testDbUrl,
      },
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    })
    console.log('✅ Test database seeded successfully\n')
  } catch (error) {
    console.error('❌ Failed to seed test database:', error)
    process.exit(1)
  }
}

export default globalSetup
