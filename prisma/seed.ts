import { Address, Order, Variant } from "@lib/types/types";
import {
  categories,
  customers,
  products,
} from "../app/api/admin/fakeapi/seedData";
import { prisma } from "./prisma";

async function main() {
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned database...");

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
          create: item.variants.map((v: Variant) => ({
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

  for (const cust of customers) {
    // const account = await prisma.account.create({
    //   data: {
    //     id: cust.account.id,
    //     type: cust.account.type,
    //     provider: cust.account.provider,
    //     providerAccountId: cust.account.providerAccountId,
    //     admin: cust.account.admin,
    //   },
    // });

    await prisma.user.create({
      data: {
        id: cust.id,
        firstName: cust.firstName,
        lastName: cust.lastName,
        email: cust.email,
        company: cust.company,
        acceptsMarketing: cust.acceptsMarketing,
        addresses: {
          create: cust.addresses.map((a: Address) => ({
            type: a.type,
            address: a.address,
            postalCode: a.postalCode,
            city: a.city,
            country: a.country,
          })),
        },
        // Create Cart
        cart: {
          create: {
            id: cust.cart.id,

            taxes: cust.cart.taxesIncluded,
            lineItems: cust.cart.lineItems,
            totalPrice: cust.cart.totalPrice,
            subtotalPrice: cust.cart.subtotalPrice,
            currency: cust.cart.currency,
            createdAt: cust.cart.createdAt,
            updatedAt: cust.cart.updatedAt,
          },
        },
        // Create Orders
        orders: {
          create: cust.orders.map((o: Order) => ({
            id: o.id,

            status: o.status,
            // customerId: o.customerId,
            // taxesIncluded: o?.taxesIncluded,
            totalPrice: o.totalPrice,
            subtotalPrice: o.subtotalPrice,
            currency: o.currency,
            lineItems: o.lineItems,
            discounts: o.discounts,
            taxesIncluded: o.taxesIncluded,

            shippingAddress: cust.addresses[0] || {},
            billingAddress: cust.addresses[0] || {},
            paymentCard: { mask: "4242" },
          })),
        },
      },
    });
  }
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
