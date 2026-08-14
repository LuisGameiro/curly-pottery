import { prisma } from './prisma'
import { hashPassword } from '@lib/auth/password'
import crypto from 'node:crypto'

async function main() {
  // Guard: never wipe a non-empty production database by accident.
  const existingUsers = await prisma.user.count()
  if (existingUsers > 0 && process.env.ALLOW_DB_WIPE !== 'true') {
    throw new Error(
      'Refusing to seed: the database already contains data. Set ALLOW_DB_WIPE=true to force a wipe.',
    )
  }

  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.favourite.deleteMany()
  await prisma.newsletterDelivery.deleteMany()
  await prisma.newsletterLinkClick.deleteMany()
  await prisma.newsletterCampaignProduct.deleteMany()
  await prisma.newsletterCampaign.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleaned database...')

  // Create admin user — credentials come from env, never hardcoded defaults.
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@curlypottery.com'
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex')
  const _admin = await prisma.user.create({
    data: {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      password: await hashPassword(adminPassword),
      emailVerified: new Date(),
    },
  })
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn(
      `⚠️  No SEED_ADMIN_PASSWORD set — generated a random one: ${adminPassword}\n` +
        '   Save it now; it will not be shown again.',
    )
  }
  console.log('✅ Admin user created')

  // Create categories
  const categoryData = [
    {
      name: 'Vases',
      slug: 'vases',
      image: 'https://picsum.photos/seed/vase/800/800',
    },
    {
      name: 'Mugs',
      slug: 'mugs',
      image: 'https://picsum.photos/seed/mug/800/800',
    },
    {
      name: 'Bowls',
      slug: 'bowls',
      image: 'https://picsum.photos/seed/bowl/800/800',
    },
    {
      name: 'Plates',
      slug: 'plates',
      image: 'https://picsum.photos/seed/plate/800/800',
    },
  ]

  const _categories = await Promise.all(
    categoryData.map((cat) => prisma.category.create({ data: cat })),
  )
  console.log('✅ Categories seeded')

  console.log('✅ Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
