import { Category } from "./category";

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

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  currency: CurrencyCode;
  stock: number;
  availableForSale: boolean;
  sizeName: SizeNames;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  glazes?: string[];
  colorName?: string;
  colorHex?: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  images: string[];
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
