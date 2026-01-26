import { Discount } from './types/types'
import { CurrencyCode } from './types/types'

export function calculateDiscount(
  price: number = 0,
  discounts: Discount[] | null = null,
) {
  let finalPrice = price

  if (discounts && discounts.length > 0) {
    discounts.forEach((discount) => {
      if (discount.type === 'FIXED_AMOUNT') {
        finalPrice -= discount.value
      } else if (discount.type === 'PERCENTAGE') {
        finalPrice -= finalPrice * discount.value
      }
    })
  }

  return {
    price: price,
    finalPrice: finalPrice,
    hasDiscount: finalPrice < price,
  }
}

export const showCurrency: Record<CurrencyCode, string> = {
  GBP: '£',
  EUR: '$',
  USD: '$',
}
