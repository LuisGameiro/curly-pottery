import { categories, customers, products } from "../app/api/fakeapi/seedData";
import { prisma } from "./prisma";

async function main() {
  // 1. Clean existing data - IMPORTANT: Order matters due to foreign key constraints
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.account.deleteMany(); // Add this
  await prisma.customer.deleteMany(); // Customer depends on Account

  console.log("Cleaned database...");

  // 2. Seed categories
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        url: cat.url,
        slug: cat.slug,
        image: cat.image,
      },
    });
  }
  console.log("✅ Seeding categories successful");

  // 3. Seed products
  const categoryMap = await prisma.category
    .findMany()
    .then((categories) =>
      Object.fromEntries(categories.map((c) => [c.slug, c.id])),
    );

  for (const item of products) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        id: item.id,
        name: item.name,
        description: item.description,
        categories: {
          connect: { id: categoryMap["vases"] },
        },
        slug: item.slug,
        images: item.images,
        requiresShipping: item.requiresShipping,
        variants: {
          create: item.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            price: v.price,
            currency: v.currency,
            stock: v.stock,
            availableForSale: v.availableForSale,
            sizeName: v.sizeName,
            colorName: v.colorName,
            colorHex: v.colorHex,
            images: v.images,
            details: v.details,
          })),
        },
      },
    });
  }
  console.log("✅ Seeding products successful");

  // 4. Seed customers with accounts
  for (const cust of customers) {
    // First create the account
    const account = await prisma.account.create({
      data: {
        id: cust.account.id,
        type: cust.account.type,
        provider: cust.account.provider,
        providerAccountId: cust.account.providerAccountId,
        admin: cust.account.admin,
        createdAt: cust.account.createdAt,
        updatedAt: cust.account.updatedAt,
      },
    });

    // Then create the customer with the accountId
    await prisma.customer.create({
      data: {
        id: cust.id,
        firstName: cust.firstName,
        lastName: cust.lastName,
        email: cust.email,
        company: cust.company,
        acceptsMarketing: cust.acceptsMarketing,
        createdAt: cust.createdAt,
        updatedAt: cust.updatedAt,
        accountId: account.id, // Link to the account

        // Create addresses
        addresses: {
          create: cust.addresses.map((a) => ({
            id: a.id,
            type: a.type,
            firstName: a.firstName,
            lastName: a.lastName,
            streetNumber: a.streetNumber,
            apartments: a.apartments,
            postalCode: a.postalCode,
            city: a.city,
            country: a.country,
            createdAt: a.createdAt,
          })),
        },
        // Create Cart
        cart: {
          create: {
            id: cust.cart.id,
            taxesIncluded: cust.cart.taxesIncluded,
            lineItems: cust.cart.lineItems,
            totalPrice: cust.cart.totalPrice,
            subtotalPrice: cust.cart.subtotalPrice,
            lineItemsSubtotalPrice: cust.cart.lineItemsSubtotalPrice,
            currency: cust.cart.currency,
            createdAt: cust.cart.createdAt,
            updatedAt: cust.cart.updatedAt,
          },
        },
        // Create Orders
        orders: {
          create: cust.orders.map((o) => ({
            id: o.id,
            status: o.status,
            totalPrice: o.totalPrice,
            subtotalPrice: o.subtotalPrice,
            currency: o.currency,
            lineItems: o.lineItems,
            discounts: o.discounts,
            taxesIncluded: o.taxesIncluded,
            shippingAddress: cust.addresses[0] || {},
            billingAddress: cust.addresses[0] || {},
            paymentCard: { mask: "4242" },
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
          })),
        },
      },
    });
  }
  console.log("✅ Seeding customers with accounts successful");
  console.log("✅ Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
