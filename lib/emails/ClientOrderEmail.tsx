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
} from '@react-email/components'

interface ClientOrderEmailProps {
  customerName: string
  orderId: string
  totalAmount: string
}

export const ClientOrderEmail = ({
  customerName,
  orderId,
  totalAmount,
}: ClientOrderEmailProps) => (
  <Html>
    <Head />
    <Preview>We have received your order!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thank you for your order, {customerName}!</Heading>
        <Text style={text}>
          Your pottery is being prepared for shipment. We will notify you once
          it is on the way.
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
)

const main = { backgroundColor: '#f1fbff', fontFamily: 'sans-serif' }
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' }
const h1 = {
  color: '#fde372',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
}
const text = { color: '#000000', fontSize: '16px', lineHeight: '24px' }
const section = {
  padding: '24px',
  backgroundColor: '#f1fbff',
  borderRadius: '8px',
  border: '1px solid #d1e5f0',
}
const label = {
  color: '#2d52ab',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
}
const value = { color: '#64748b', fontSize: '14px', fontWeight: 'bold' }
const hr = { borderColor: '#d1e5f0', margin: '20px 0' }
const footer = { color: '#fde372', fontSize: '12px' }
