import { Discount } from "./types/types";
import { CurrencyCode } from "./types/types";

// export function calculatePrice(
//   price: number = 0,
//   currency: CurrencyCode = "GBP",
//   discounts: Discount[] | null = null,
//   locale: CurrencyCode = "GBP",
// ) {
//   const symbolConvert: Record<CurrencyCode, string> = {
//     USD: "$",
//     GBP: "£",
//     EUR: "€",
//   };

//   const conversionRate: Record<CurrencyCode, number> = {
//     USD: 1.33,
//     GBP: 1.0,
//     EUR: 1.4,
//   };

//   // 1. Convert the base price to the locale currency
//   const priceCalculated = price * conversionRate[locale];
//   let finalPrice = priceCalculated;

//   // 2. Apply all discounts in the array
//   if (discounts && discounts.length > 0) {
//     discounts.forEach((discount) => {
//       if (discount.type === "FIXED_AMOUNT") {
//         // Subtract fixed amount (e.g., £5 off)
//         finalPrice -= discount.value;
//       } else if (discount.type === "PERCENTAGE") {
//         // Subtract percentage (e.g., 0.10 for 10% off)
//         finalPrice -= finalPrice * discount.value;
//       }
//     });
//   }

//   // Ensure price doesn't go below zero
//   finalPrice = Math.max(0, finalPrice);

//   return {
//     priceCalculated: priceCalculated.toFixed(2) + symbolConvert[locale],
//     priceDiscount: finalPrice.toFixed(2) + symbolConvert[locale],
//     hasDiscount: finalPrice < priceCalculated,
//   };
// }

export function calculateDiscount(
  price: number = 0,
  discounts: Discount[] | null = null,
) {
  let finalPrice = price;

  if (discounts && discounts.length > 0) {
    discounts.forEach((discount) => {
      if (discount.type === "FIXED_AMOUNT") {
        finalPrice -= discount.value;
      } else if (discount.type === "PERCENTAGE") {
        finalPrice -= finalPrice * discount.value;
      }
    });
  }

  return {
    price: price,
    finalPrice: finalPrice,
    hasDiscount: finalPrice < price,
  };
}

export const showCurrency: Record<CurrencyCode, string> = {
  GBP: "£",
  EUR: "$",
  USD: "$",
};
