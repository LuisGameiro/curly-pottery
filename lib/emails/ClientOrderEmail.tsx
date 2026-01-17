import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ClientOrderEmailProps {
  customerName: string;
  orderId: string;
  totalAmount: string;
}

export const ClientOrderEmail = ({
  customerName,
  orderId,
  totalAmount,
}: ClientOrderEmailProps) => (
  <Html>
    <Head />
    <Preview>We&aposve received your order! - Curly Pottery</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank you for your order, {customerName}!</Heading>
        <Text style={text}>
          Your pottery is being prepared for shipment. We will notify you once
          it’s on the way.
        </Text>
        <Section style={section}>
          <Text style={label}>
            Order ID: <span style={value}>{orderId}</span>
          </Text>
          <Text style={label}>
            Total Amount: <span style={value}>{totalAmount}</span>
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you have any questions, just reply to this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: "#fdfbf7", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const h1 = {
  color: "#44352a",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
};
const text = { color: "#525f7f", fontSize: "16px", lineHeight: "24px" };
const section = {
  padding: "24px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #e6e6e6",
};
const label = {
  color: "#8898aa",
  fontSize: "12px",
  textTransform: "uppercase" as const,
};
const value = { color: "#44352a", fontSize: "14px", fontWeight: "bold" };
const hr = { borderColor: "#e6e6e6", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px" };
