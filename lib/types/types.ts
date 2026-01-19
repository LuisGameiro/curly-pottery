import { JsonValue } from "@prisma/client/runtime/client";
import { Prisma } from "prisma/generated/prisma/client";

export interface EditVariant extends Omit<Variant, "createdAt" | "updatedAt"> {
  files: (File | string)[];
  previews: string[];
  isExpanded: boolean;
}

export interface EditProduct extends Omit<
  Product,
  "categories" | "variants" | "createdAt" | "updatedAt"
> {
  categoryIds: string[];
  files: (File | string)[];
  previews: string[];
}

export interface CreateProduct extends EditProduct {
  variants: EditVariant[];
}

export type Product = Prisma.ProductGetPayload<null>;

type PrismaVariant = Prisma.ProductVariantGetPayload<null>;

export type Variant = Omit<PrismaVariant, "details" | "discounts"> & {
  details: Detail[] | Prisma.InputJsonValue | JsonValue;
  discounts: Discount[] | Prisma.InputJsonValue | JsonValue;
};

export type ProductWithVariantsCategories = Prisma.ProductGetPayload<{
  include: { categories: true; variants: true };
}>;

export const CurrencyCode = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
} as const;

export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode];

export const SizeNames = {
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
} as const;

export type SizeNames = (typeof SizeNames)[keyof typeof SizeNames];

export const Detailtype = {
  Materials: "Materials",
  Size: "Size",
  Finish: "Finish",
  Features: "Features",
  Capacity: "Capacity",
  Shape: "Shape",
  Glazes: "Glazes",
} as const;

export type Detailtype = (typeof Detailtype)[keyof typeof Detailtype];

export type Detail = {
  title: Detailtype | string;
  description: string;
};

export type Category = Prisma.CategoryGetPayload<null>;
export interface ProductFull extends Product {
  variants: Variant[];
}

export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export type CartLineItem = {
  id: string;
  variantId: string;
  slug: string;
  sku: string;
  name: string;
  images: string;
  quantity: number;
  stock: number;
  price: number;
  currency: CurrencyCode;
  colorName?: string;
  sizeName?: string;
  discounts: Discount[];
};

export type Discount = {
  code: string;
  type: DiscountType;
  value: number;
  percentage: number;
  amountSaved: number;
};

export type CreateOrder = {
  userId?: string;
  address: InputAddress;
  lineItems: CartLineItem[];
  discounts: Discount[];
  subtotalPrice: number;
  totalPrice: number;
  taxes: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currency: CurrencyCode;
  shippingPrice: number;
  shippingMethod: string;
};

type PrismaOrderWithUser = Prisma.OrderGetPayload<{
  include: { user: true };
}>;
export type OrderWithUser = Omit<PrismaOrderWithUser, "lineItems"> & {
  lineItems: CartLineItem[] | JsonValue | Prisma.InputJsonValue;
};

type PrismaOrder = Prisma.OrderGetPayload<null>;
export type Order = Omit<PrismaOrder, "lineItems"> & {
  lineItems: CartLineItem[] | JsonValue | Prisma.InputJsonValue;
};

type PrismaCart = Prisma.CartGetPayload<null>;

export type Cart = Omit<PrismaCart, "lineItems" | "discounts"> & {
  lineItems: CartLineItem[] | Prisma.InputJsonValue;
  discounts: Discount[] | Prisma.InputJsonValue;
};

export type Address = Prisma.AddressGetPayload<null>;

export type InputAddress = Omit<
  Address,
  "id" | "createdAt" | "type" | "company"
>;

export type User = Prisma.UserGetPayload<null>;

export type UserWithOrders = Prisma.UserGetPayload<{
  include: {
    orders: true;
  };
}>;
export type UserWithOrdersAddress = Prisma.UserGetPayload<{
  include: { orders: true; addresses: true };
}>;

export type ActionResponse<T> =
  | {
      success: true;
      message: string;
      data: T;
      errors?: never;
    }
  | {
      success: false;
      message: string;
      data?: never;
      errors?: unknown;
    };

// export type Order = {
//   id: string;
//   userId: string | null;
//   email: string;
//   phone: string;
//   status: OrderStatus;
//   taxesIncluded: boolean;
//   lineItems: CartLineItem[];
//   discounts: Discount[];
//   subtotalPrice: number;
//   totalPrice: number;
//   currency: CurrencyCode;
//   shipping: { price: number; method: string };
//   shippingAddress: Address;
//   billingAddress: Address;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export type User = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone?: string;
//   company?: string;
//   notes?: string;
//   acceptsMarketing: boolean;
//   createdAt: Date;
//   updatedAt: Date;
//   addresses: Address[];
//   // orders: Order[];
//   cart: Cart;
// };

// export type Address = {
//   id: string;
//   type?: string;
//   firstName: string;
//   lastName: string;
//   company?: string;
//   address: string;
//   postalCode: string;
//   city: string;
//   country: string;
//   customerId?: string;
//   createdAt?: Date;
// };

// export type Cart = {
//   id: string;
//   customerId: string;
//   taxesIncluded: boolean;
//   lineItems: CartLineItem[];
//   discounts: Discount[];
//   subtotalPrice: number;
//   totalPrice: number;
//   currency: CurrencyCode;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export type ProductWithVariantsCategories = {
//   id: string;
//   name: string;
//   description: string;
//   slug: string;

//   images: string[];
//   categories: string[];
//   variants: Variant[];
//   requiresShipping: boolean;

//   sku: string;
//   price: number;
//   currency: CurrencyCode;
//   stock: number;
//   availableForSale: boolean;
//   sizeName?: SizeNames;
//   widthCm?: number;
//   heightCm?: number;
//   depthCm?: number;
//   colorName?: string;
//   colorHex?: string;
//   createdAt: Date;
//   updatedAt: Date;
// };
// export interface Product {
//   id: string;
//   name: string;
//   description: string;
//   slug: string;

//   images: string[];
//   categories: Category[];
//   variants: Variant[];
//   requiresShipping: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Variant {
//   id: string;
//   sku: string;
//   price: number;
//   currency: CurrencyCode;
//   stock: number;
//   availableForSale: boolean;
//   sizeName: string | null;
//   colorName: string | null;
//   colorHex: string | null;
//   details: Detail[] | Prisma.JsonValue;
//   discounts: Discount[] | Prisma.JsonValue;
//   createdAt: Date;
//   updatedAt: Date;
//   productId: string;
//   images: string[];
// };
