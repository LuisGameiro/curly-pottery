import constructMetadata from '@components/common/SEO/SEO'
import CheckoutClient from '../../components/checkout/CheckoutClient'

export const metadata = constructMetadata({
  title: 'Checkout',
  description:
    'Complete your purchase at Curly Pottery by providing your shipping information, selecting a shipping method, and making a secure payment. Enjoy a seamless shopping experience with us.',
})

export default function CheckoutPage() {
  return <CheckoutClient />
}
