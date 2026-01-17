import { Body, Heading, Hr, Html, Text } from "@react-email/components";

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
    <Body style={{ backgroundColor: "#fff", padding: "20px" }}>
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
      <Text>Log in to the dashboard to print the shipping label.</Text>
    </Body>
  </Html>
);
