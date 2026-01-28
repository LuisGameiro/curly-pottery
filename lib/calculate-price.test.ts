import { calculateDiscount } from './calculate-price'
import { Discount } from './types/types'

describe('calculateDiscount', () => {
  it('should return original price when no discounts provided', () => {
    const result = calculateDiscount(100)
    expect(result).toEqual({
      price: 100,
      finalPrice: 100,
      hasDiscount: false,
    })
  })

  it('should return original price when discounts array is null', () => {
    const result = calculateDiscount(100, null)
    expect(result).toEqual({
      price: 100,
      finalPrice: 100,
      hasDiscount: false,
    })
  })

  it('should return original price when discounts array is empty', () => {
    const result = calculateDiscount(100, [])
    expect(result).toEqual({
      price: 100,
      finalPrice: 100,
      hasDiscount: false,
    })
  })

  it('should apply fixed amount discount', () => {
    const discounts: Discount[] = [
      {
        type: 'FIXED_AMOUNT',
        value: 20,
        code: '',
      },
    ]
    const result = calculateDiscount(100, discounts)
    expect(result).toEqual({
      price: 100,
      finalPrice: 80,
      hasDiscount: true,
    })
  })

  it('should apply percentage discount', () => {
    const discounts: Discount[] = [{ type: 'PERCENTAGE', value: 0.1 }]
    const result = calculateDiscount(100, discounts)
    expect(result).toEqual({
      price: 100,
      finalPrice: 90,
      hasDiscount: true,
    })
  })

  it('should apply multiple discounts sequentially', () => {
    const discounts: Discount[] = [
      { type: 'FIXED_AMOUNT', value: 10 },
      { type: 'PERCENTAGE', value: 0.1 },
    ]
    const result = calculateDiscount(100, discounts)
    expect(result).toEqual({
      price: 100,
      finalPrice: 81,
      hasDiscount: true,
    })
  })

  it('should handle default price of 0', () => {
    const discounts: Discount[] = [{ type: 'FIXED_AMOUNT', value: 10 }]
    const result = calculateDiscount(undefined, discounts)
    expect(result).toEqual({
      price: 0,
      finalPrice: -10,
      hasDiscount: true,
    })
  })
})
