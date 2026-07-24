import { prisma } from './prisma'
import { hashPassword } from '@lib/auth/password'

async function main() {
  console.log('🧹 Cleaning database...')

  // Delete in dependency order
  await prisma.newsletterLinkClick.deleteMany()
  await prisma.newsletterDelivery.deleteMany()
  await prisma.newsletterCampaignProduct.deleteMany()
  await prisma.newsletterCampaign.deleteMany()
  await prisma.newsletterSubscriber.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.favourite.deleteMany()
  await prisma.cartLineItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.optionValue.deleteMany()
  await prisma.option.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Database cleaned')

  // ─── Users ────────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      email: 'admin@curlypottery.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      password: await hashPassword('admin123'),
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user created:', admin.email)

  const user = await prisma.user.create({
    data: {
      email: 'user@test.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'USER',
      password: await hashPassword('password123'),
      emailVerified: new Date(),
      phone: '+441234567890',
    },
  })
  console.log('✅ Regular user created:', user.email)

  // ─── Categories ───────────────────────────────────────────

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Vases',
        slug: 'vases',
        image: 'https://picsum.photos/seed/vase-e2e/800/800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mugs',
        slug: 'mugs',
        image: 'https://picsum.photos/seed/mug-e2e/800/800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bowls',
        slug: 'bowls',
        image: 'https://picsum.photos/seed/bowl-e2e/800/800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Plates',
        slug: 'plates',
        image: 'https://picsum.photos/seed/plate-e2e/800/800',
      },
    }),
  ])
  const [vasesCat, mugsCat, bowlsCat, platesCat] = categories
  console.log('✅ Categories created:', categories.length)

  // ─── Products ─────────────────────────────────────────────

  // Product 1: Hand-Thrown Stoneware Vase
  const product1 = await prisma.product.create({
    data: {
      name: 'Hand-Thrown Stoneware Vase',
      slug: 'hand-thrown-stoneware-vase',
      description:
        'A beautiful hand-thrown stoneware vase with a natural glaze finish. Perfect for displaying fresh flowers or as a standalone sculptural piece.',
      hide: false,
      images: [
        'https://picsum.photos/seed/vase1/800/800',
        'https://picsum.photos/seed/vase1b/800/800',
      ],
      requiresShipping: true,
      categories: { connect: [{ id: vasesCat.id }] },
      variants: {
        create: [
          {
            sku: 'VASE-SMW-S',
            price: 35.0,
            currency: 'GBP',
            stock: 10,
            availableForSale: true,
            sizeName: 'S',
            colorName: 'Speckled White',
            colorHex: '#F5F0EB',
            images: ['https://picsum.photos/seed/vase1-s/800/800'],
          },
          {
            sku: 'VASE-SMW-M',
            price: 48.0,
            currency: 'GBP',
            stock: 5,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'Speckled White',
            colorHex: '#F5F0EB',
            images: ['https://picsum.photos/seed/vase1-m/800/800'],
          },
          {
            sku: 'VASE-SMW-L',
            price: 65.0,
            currency: 'GBP',
            stock: 0,
            availableForSale: false,
            sizeName: 'L',
            colorName: 'Speckled White',
            colorHex: '#F5F0EB',
            images: ['https://picsum.photos/seed/vase1-l/800/800'],
          },
        ],
      },
    },
  })
  console.log('✅ Product created:', product1.name)

  // Product 2: Porcelain Teapot
  const product2 = await prisma.product.create({
    data: {
      name: 'Porcelain Teapot',
      slug: 'porcelain-teapot',
      description:
        'Elegant porcelain teapot with a delicate hand-painted floral motif. Holds 1 litre and comes with a removable infuser.',
      hide: false,
      images: [
        'https://picsum.photos/seed/teapot1/800/800',
        'https://picsum.photos/seed/teapot1b/800/800',
      ],
      requiresShipping: true,
      categories: { connect: [{ id: vasesCat.id }] },
      variants: {
        create: [
          {
            sku: 'TEAPOT-WHT',
            price: 52.0,
            currency: 'GBP',
            stock: 7,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'White',
            colorHex: '#FFFFFF',
            images: ['https://picsum.photos/seed/teapot-w/800/800'],
          },
          {
            sku: 'TEAPOT-BLU',
            price: 58.0,
            currency: 'GBP',
            stock: 3,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'Blue',
            colorHex: '#4A90D9',
            images: ['https://picsum.photos/seed/teapot-b/800/800'],
          },
        ],
      },
    },
  })
  console.log('✅ Product created:', product2.name)

  // Product 3: Ceramic Mug Set
  const product3 = await prisma.product.create({
    data: {
      name: 'Ceramic Mug Set',
      slug: 'ceramic-mug-set',
      description:
        'Set of 4 handcrafted ceramic mugs with earthy glazes. Each mug is slightly unique, making this set perfect for the modern table.',
      hide: false,
      images: [
        'https://picsum.photos/seed/mugset1/800/800',
        'https://picsum.photos/seed/mugset1b/800/800',
      ],
      requiresShipping: true,
      categories: { connect: [{ id: mugsCat.id }] },
      variants: {
        create: [
          {
            sku: 'MUGSET-EARTH',
            price: 42.0,
            currency: 'GBP',
            stock: 15,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'Earthy',
            colorHex: '#8B7355',
            images: ['https://picsum.photos/seed/mugset-e/800/800'],
          },
          {
            sku: 'MUGSET-SAGE',
            price: 42.0,
            currency: 'GBP',
            stock: 8,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'Sage',
            colorHex: '#87A878',
            images: ['https://picsum.photos/seed/mugset-s/800/800'],
          },
          {
            sku: 'MUGSET-TERRA',
            price: 45.0,
            currency: 'GBP',
            stock: 4,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'Terracotta',
            colorHex: '#C1663C',
            images: ['https://picsum.photos/seed/mugset-t/800/800'],
          },
        ],
      },
    },
  })
  console.log('✅ Product created:', product3.name)

  // Product 4: Espresso Cup & Saucer
  const product4 = await prisma.product.create({
    data: {
      name: 'Espresso Cup & Saucer',
      slug: 'espresso-cup-saucer',
      description:
        'Miniature hand-thrown espresso cup with matching saucer. Fits perfectly under your espresso machine. Microwave and dishwasher safe.',
      hide: false,
      images: [
        'https://picsum.photos/seed/espresso1/800/800',
        'https://picsum.photos/seed/espresso1b/800/800',
      ],
      requiresShipping: true,
      categories: { connect: [{ id: mugsCat.id }] },
      variants: {
        create: [
          {
            sku: 'ESPRESSO-WHT',
            price: 18.0,
            currency: 'GBP',
            stock: 25,
            availableForSale: true,
            sizeName: 'XS',
            colorName: 'White',
            colorHex: '#FFFFFF',
            images: ['https://picsum.photos/seed/espresso-w/800/800'],
          },
          {
            sku: 'ESPRESSO-BLK',
            price: 20.0,
            currency: 'GBP',
            stock: 12,
            availableForSale: true,
            sizeName: 'XS',
            colorName: 'Black',
            colorHex: '#2D2D2D',
            images: ['https://picsum.photos/seed/espresso-b/800/800'],
          },
        ],
      },
    },
  })
  console.log('✅ Product created:', product4.name)

  // Product 5: Mixing Bowl Set
  const product5 = await prisma.product.create({
    data: {
      name: 'Mixing Bowl Set',
      slug: 'mixing-bowl-set',
      description:
        'Nesting set of 3 stoneware mixing bowls in graduated sizes. Perfect for prep, serving, and storage. Each bowl features a unique reactive glaze.',
      hide: false,
      images: [
        'https://picsum.photos/seed/bowlset1/800/800',
        'https://picsum.photos/seed/bowlset1b/800/800',
      ],
      requiresShipping: true,
      categories: { connect: [{ id: bowlsCat.id }] },
      variants: {
        create: [
          {
            sku: 'BOWLSET-SML',
            price: 55.0,
            currency: 'GBP',
            stock: 6,
            availableForSale: true,
            sizeName: 'S',
            colorName: 'Speckled Grey',
            colorHex: '#B0B0B0',
            images: ['https://picsum.photos/seed/bowlset-s/800/800'],
          },
          {
            sku: 'BOWLSET-MED',
            price: 60.0,
            currency: 'GBP',
            stock: 4,
            availableForSale: true,
            sizeName: 'M',
            colorName: 'Speckled Grey',
            colorHex: '#A0A0A0',
            images: ['https://picsum.photos/seed/bowlset-m/800/800'],
          },
          {
            sku: 'BOWLSET-LRG',
            price: 70.0,
            currency: 'GBP',
            stock: 2,
            availableForSale: true,
            sizeName: 'L',
            colorName: 'Speckled Grey',
            colorHex: '#909090',
            images: ['https://picsum.photos/seed/bowlset-l/800/800'],
          },
        ],
      },
    },
  })
  console.log('✅ Product created:', product5.name)

  // Product 6: Dinner Plate Set
  const product6 = await prisma.product.create({
    data: {
      name: 'Dinner Plate Set',
      slug: 'dinner-plate-set',
      description:
        'Set of 4 large dinner plates with a hand-applied reactive glaze. Each plate has its own unique pattern. 27cm diameter.',
      hide: false,
      images: [
        'https://picsum.photos/seed/plate1/800/800',
        'https://picsum.photos/seed/plate1b/800/800',
      ],
      requiresShipping: true,
      categories: { connect: [{ id: platesCat.id }] },
      variants: {
        create: [
          {
            sku: 'PLATESET-WHT',
            price: 48.0,
            currency: 'GBP',
            stock: 10,
            availableForSale: true,
            sizeName: 'L',
            colorName: 'White',
            colorHex: '#F8F8F8',
            images: ['https://picsum.photos/seed/plate-w/800/800'],
          },
          {
            sku: 'PLATESET-BLU',
            price: 52.0,
            currency: 'GBP',
            stock: 6,
            availableForSale: true,
            sizeName: 'L',
            colorName: 'Blue Rim',
            colorHex: '#336699',
            images: ['https://picsum.photos/seed/plate-b/800/800'],
          },
        ],
      },
    },
  })
  console.log('✅ Product created:', product6.name)

  // ─── Order ────────────────────────────────────────────────

  const firstVariant = await prisma.productVariant.findFirst({
    where: { productId: product1.id, availableForSale: true },
  })

  if (firstVariant) {
    await prisma.order.create({
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 'PAID',
        lineItems: [
          {
            variantId: firstVariant.id,
            sku: firstVariant.sku,
            name: product1.name,
            quantity: 1,
            unitPrice: Number(firstVariant.price),
            totalPrice: Number(firstVariant.price),
          },
        ],
        subtotalPrice: Number(firstVariant.price),
        shippingPrice: 5.99,
        taxes: 0.0,
        totalPrice: Number(firstVariant.price) + 5.99,
        shippingMethod: 'Standard',
        currency: 'GBP',
        shippingAddress: {
          line1: '123 High Street',
          city: 'London',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
        billingAddress: {
          line1: '123 High Street',
          city: 'London',
          postalCode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
        createdAt: new Date('2026-06-15'),
      },
    })
    console.log('✅ Order created for user')
  }

  // ─── Favourite ────────────────────────────────────────────

  await prisma.favourite.create({
    data: {
      userId: user.id,
      productId: product1.id,
    },
  })
  console.log('✅ Favourite created')

  // ─── Newsletter Subscriber ────────────────────────────────

  await prisma.newsletterSubscriber.create({
    data: {
      email: 'subscriber@test.com',
      firstName: 'Sub',
      lastName: 'Scriber',
      status: 'SUBSCRIBED',
      source: 'GUEST',
    },
  })
  console.log('✅ Newsletter subscriber created')

  // ─── Gallery Images ───────────────────────────────────────

  await prisma.galleryImage.createMany({
    data: [
      {
        url: 'https://picsum.photos/seed/gallery1/800/800',
        alt: 'Gallery pottery image 1',
        sortOrder: 0,
      },
      {
        url: 'https://picsum.photos/seed/gallery2/800/800',
        alt: 'Gallery pottery image 2',
        sortOrder: 1,
      },
      {
        url: 'https://picsum.photos/seed/gallery3/800/800',
        alt: 'Gallery pottery image 3',
        sortOrder: 2,
      },
    ],
  })
  console.log('✅ Gallery images created')

  console.log('')
  console.log('🎉 E2E test data seeded successfully!')
}

main()
  .catch((e) => {
    console.error('SEED_E2E_ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
