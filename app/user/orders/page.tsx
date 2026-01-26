import constructMetadata from '@components/common/SEO/SEO'
import OrderUserTable from '@components/tables/OrderUserTable'
import { Container, Text } from '@components/ui'
import { authOptions } from '@lib/auth/authOptions'
import { getOrdersById } from 'actions/order.actions'
import Loading from 'app/loading'
import { CarFront } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { Suspense } from 'react'

export const metadata = constructMetadata({
  title: 'Your Orders',
  description:
    'View and manage your past orders at Curly Pottery. Keep track of your handcrafted pottery purchases and order history for a seamless shopping experience.',
})
export default async function Orders() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    throw new Error('User not found')
  }
  const response = await getOrdersById(user.id)

  if (!response.success) {
    throw new Error(response.message)
  }

  const orders = response.data
  if (!orders || orders?.length === 0)
    return (
      <Container className="py-20 flex flex-col items-center justify-center ">
        <CarFront size={64} className="text-muted mb-4" />
        <Text variant="heading">Your Orders are empty</Text>
      </Container>
    )
  return (
    <Suspense fallback={<Loading />}>
      <Container>
        <header>
          <Text variant="heading">Orders</Text>
          <Text variant="subHeading">
            Review your orders and track their status.
          </Text>
        </header>

        <OrderUserTable orders={orders} />
      </Container>
    </Suspense>
  )
}
