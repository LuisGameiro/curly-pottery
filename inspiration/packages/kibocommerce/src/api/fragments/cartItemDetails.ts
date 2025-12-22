import { productDetails } from './productDetails'
export const cartItemDetails = /*GraphQL*/ `
fragment cartItemDetails on CartItem {
  id
  product {
    ...productDetails
  }
  quantity
}
${productDetails}
`
