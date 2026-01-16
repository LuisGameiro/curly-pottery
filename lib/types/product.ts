import { Prisma } from "prisma/generated/prisma/client";
import { Category } from "./category";
import { Discount } from "./customer";

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

export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;

  images: string[];
  categories: Category[];
  variants: ProductVariant[];
  requiresShipping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  currency: CurrencyCode;
  stock: number;
  availableForSale: boolean;
  sizeName: string | null;
  colorName: string | null;
  colorHex: string | null;
  details: Detail[] | Prisma.JsonValue;
  discounts: Discount[] | Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  images: string[];
};

export type ProductBasicInfo = Omit<Product, 'categories' | 'variants'>;

export interface ProductFull extends Product {
  variants: ProductVariant[]
}


export type Detail = {
  title: Detailtype | string;
  description: string;
};

export type FullProduct = {
  id: string;
  name: string;
  description: string;
  slug: string;

  images: string[];
  categories: string[];
  variants: ProductVariant[];
  requiresShipping: boolean;

  sku: string;
  price: number;
  currency: CurrencyCode;
  stock: number;
  availableForSale: boolean;
  sizeName?: SizeNames;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  colorName?: string;
  colorHex?: string;
  createdAt: Date;
  updatedAt: Date;
};
