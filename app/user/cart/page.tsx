import CartClient from '@components/cart/CartClient'
import constructMetadata from '@components/common/SEO/SEO'

export const metadata = constructMetadata({
  title: 'Your Cart',
  description:
    'Review and manage the items in your shopping cart at Curly Pottery. Ensure your handcrafted pottery selections are perfect before proceeding to checkout for a seamless shopping experience.',
})

export default function Cart() {
  return <CartClient />
}
