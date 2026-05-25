import { prisma } from './prisma'
import { hashPassword } from '@lib/auth/password'

async function main() {
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

  // Create admin user
  const _admin = await prisma.user.create({
    data: {
      email: 'admin@curlypottery.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      password: await hashPassword('admin123'),
      emailVerified: new Date(),
    },
  })
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
