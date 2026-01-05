export const serializeProduct = (productsRaw: any[]) => {
  return productsRaw.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
};

export const serializeProductVariant = (productsRaw: any[]) => {

  return productsRaw.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map((variant: any) => ({
      ...variant,
  createdAt: variant?.createdAt ? new Date(variant.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: variant?.updatedAt ? new Date(variant.updatedAt).toISOString() : new Date().toISOString(),
    })),
    categories: product.categories.map((category: any) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    })),
  }));
};

// A simple helper to omit keys
export function exclude(obj: object, keys: string[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key)),
  );
}

export const serializeOrders = (ordersRaw: any[]) => {
  return ordersRaw.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      ...order.customer,
      createdAt: order.customer.createdAt.toISOString(),
      updatedAt: order.customer.updatedAt.toISOString(),
    },
  }));
};

export const serializeCustomers = (customersRaw: any[]) => {
  return customersRaw.map((customer) => ({
    ...customer,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    orders: customer.orders.map((order: any) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
  }));
};
