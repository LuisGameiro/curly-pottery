import { Body, Button, Heading, Hr, Html, Text } from '@react-email/components'
import { emailStyles } from './emailStyles'

interface AdminOrderEmailProps {
  orderId: string
  customerEmail: string
  itemsCount: number
}

export const AdminOrderEmail = ({
  orderId,
  customerEmail,
  itemsCount,
}: AdminOrderEmailProps) => {
  const { main, adminButton, hr } = emailStyles

  return (
    <Html>
      <Body style={main}>
        <Heading>New Order Received!</Heading>
        <Text>
          <strong>Order ID:</strong> {orderId}
        </Text>
        <Text>
          <strong>Customer:</strong> {customerEmail}
        </Text>
        <Text>
          <strong>Items:</strong> {itemsCount} items to pack.
        </Text>
        <Hr style={hr} />
        <Text>Log in to the dashboard to check order.</Text>

        <Button
          href={`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`}
          style={adminButton}
        >
          Visit Store
        </Button>
      </Body>
    </Html>
  )
}
