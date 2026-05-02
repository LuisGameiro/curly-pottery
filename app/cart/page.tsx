import constructMetadata from '@components/common/SEO/SEO'
import CartClient from '../../components/cart/CartClient'

export const metadata = constructMetadata({
  title: 'Cart',
  description:
    'Review the items in your Curly Pottery shopping cart before proceeding to checkout. Enjoy a seamless shopping experience with us.',
})

export default function CartPage() {
  return (
    <div className="py-10 md:px-10 bg-linear-to-r from-background to-accent-2">
      <CartClient />
    </div>
  )
}
