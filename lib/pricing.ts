import { calculateDiscount } from './calculate-price'
import { Discount } from './types/types'

/**
 * Server-controlled pricing. Client-supplied taxes/shipping/totals must
 * never feed the amount that gets charged — derive everything from here.
 */
export const SHIPPING_METHODS = {
  standard: 5.95,
  express: 9.95,
} as const

export type ShippingMethod = keyof typeof SHIPPING_METHODS

export const getShippingPrice = (method?: string | null): number =>
  SHIPPING_METHODS[method as ShippingMethod] ?? SHIPPING_METHODS.standard

/** Taxes are not configurable in this store — always charge 0. */
export const getServerTaxes = () => 0

/** SumUp Checkouts API expects amounts in minor units (cents). */
export const toMinorUnits = (amount: number) => Math.round(amount * 100)

/** Final per-unit price after discounts, used for server-side totals. */
export const computeFinalPrice = (
  price: number,
  discounts: Discount[] | null | undefined,
): number => calculateDiscount(price, discounts ?? null).finalPrice

/** Clamp a client-supplied number to a safe non-negative range. */
export const clampNonNegative = (value: number | undefined, max = Infinity) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(Math.max(0, value), max)
}
