import { PaymentCard } from "inspiration/packages/kibocommerce/schema";
import { CurrencyCode } from "./product";

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

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  acceptsMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses: Address[];
  orders: Order[];
  cart: Cart;
};

export type Address = {
  id: string;
  type?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  customerId?: string;
  createdAt?: Date;
};

export type Cart = {
  id: string;
  customerId: string;
  taxesIncluded: boolean;
  lineItems: CartLineItem[];
  discounts: Discount[];
  subtotalPrice: number;
  totalPrice: number;
  currency: CurrencyCode;
  createdAt: Date;
  updatedAt: Date;
};

export type CartLineItem = {
  sku: string;
  name: string;
  images: string;
  quantity: number;
  price: number;
  currency: CurrencyCode;
  colorName?: string;
  sizeName?: string;
  variant: { price: number };
};

export type Discount = {
  code: string;
  type: DiscountType;
  value: number;
  percentage: number;
  amountSaved: number;
};

export type Order = {
  id: string;
  userId: string | null;
  user: User;
  email: string;
  phone: string;
  status: OrderStatus;
  taxesIncluded: boolean;
  lineItems: CartLineItem[];
  discounts: Discount[];
  subtotalPrice: number;
  totalPrice: number;
  currency: CurrencyCode;
  shipping: { price: number; method: string };
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
};
