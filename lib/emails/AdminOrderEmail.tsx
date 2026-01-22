import { Body, Button, Heading, Hr, Html, Text } from "@react-email/components";

interface AdminOrderEmailProps {
  orderId: string;
  customerEmail: string;
  itemsCount: number;
}

export const AdminOrderEmail = ({
  orderId,
  customerEmail,
  itemsCount,
}: AdminOrderEmailProps) => (
  <Html>
    <Body style={main}>
      <Heading>New Order Received! 🎉</Heading>
      <Text>
        <strong>Order ID:</strong> {orderId}
      </Text>
      <Text>
        <strong>Customer:</strong> {customerEmail}
      </Text>
      <Text>
        <strong>Items:</strong> {itemsCount} items to pack.
      </Text>
      <Hr />
      <Text>Log in to the dashboard to check order.</Text>

      <Button
        href={`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`}
        style={button}
      >
        Visit Store
      </Button>
    </Body>
  </Html>
);

const main = { backgroundColor: "#f1fbff", fontFamily: "sans-serif" };

const button = {
  background: "#fde372",
  color: "#000000",
  padding: "12px 20px",
  borderRadius: "4px",
};
