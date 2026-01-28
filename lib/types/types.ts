import type { CurrencyCode as PrismaCurrencyCode } from 'prisma/generated/prisma/client'
import { Prisma } from 'prisma/generated/prisma/client'

export interface EditVariant extends Omit<Variant, 'createdAt' | 'updatedAt'> {
  files: (File | string)[]
  previews: string[]
  isExpanded: boolean
}

export interface EditProduct extends Omit<
  Product,
  'categories' | 'variants' | 'createdAt' | 'updatedAt'
> {
  categoryIds: string[]
  files: (File | string)[]
  previews: string[]
}

export interface CreateProduct extends EditProduct {
  variants: EditVariant[]
}

export type Product = Prisma.ProductGetPayload<null>

export type Variant = Prisma.ProductVariantGetPayload<null>

export type ProductWithVariantsCategories = Prisma.ProductGetPayload<{
  include: { categories: true; variants: true }
}>
export const CurrencyCode: Record<CurrencyCode, CurrencyCode> = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const

export type CurrencyCode = PrismaCurrencyCode

export const SizeNames = {
  XXS: 'XXS',
  XS: 'XS',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
  XXL: 'XXL',
} as const

export type SizeNames = (typeof SizeNames)[keyof typeof SizeNames]

export const Detailtype = {
  Materials: 'Materials',
  Size: 'Size',
  Finish: 'Finish',
  Features: 'Features',
  Capacity: 'Capacity',
  Shape: 'Shape',
  Glazes: 'Glazes',
} as const

export type Detailtype = (typeof Detailtype)[keyof typeof Detailtype]

export type Detail = {
  title: Detailtype | string
  description: string
}

export type Category = Prisma.CategoryGetPayload<null>
export interface ProductFull extends Product {
  variants: Variant[]
}

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]

export type CartLineItem = {
  id: string
  variantId: string
  slug: string
  sku: string
  name: string
  images: string
  quantity: number
  stock: number
  price: number
  currency: CurrencyCode
  colorName: string
  sizeName: string
  discounts: Discount[]
}

export type Discount = {
  code?: string
  type: DiscountType
  value: number
}

export type CreateOrder = {
  userId?: string
  address: InputAddress
  lineItems: CartLineItem[]
  discounts: Discount[]
  subtotalPrice: number
  totalPrice: number
  taxes: number
  firstName: string
  lastName: string
  email: string
  phone: string
  currency: CurrencyCode
  shippingPrice: number
  shippingMethod: string
}

type PrismaOrderWithUser = Prisma.OrderGetPayload<{
  include: { user: true }
}>
export type OrderWithUser = PrismaOrderWithUser

type PrismaOrder = Prisma.OrderGetPayload<null>
export type Order = PrismaOrder

type PrismaCart = Prisma.CartGetPayload<null>

export type Cart = PrismaCart

export type Address = Prisma.AddressGetPayload<null>

export type InputAddress = Omit<
  Address,
  'id' | 'createdAt' | 'type' | 'company'
>

export type User = Prisma.UserGetPayload<null>

export type UserWithOrders = Prisma.UserGetPayload<{
  include: {
    orders: true
  }
}>
export type UserWithOrdersAddress = Prisma.UserGetPayload<{
  include: { orders: true; addresses: true }
}>

export type ActionResponse<T> =
  | {
      success: true
      message: string
      data: T
      errors?: never
    }
  | {
      success: false
      message: string
      data?: never
      errors?: unknown
    }
