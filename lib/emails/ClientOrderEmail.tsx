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
import { emailStyles } from './emailStyles'

interface ClientOrderEmailProps {
  customerName: string
  orderId: string
  totalAmount: string
}

export const ClientOrderEmail = ({
  customerName,
  orderId,
  totalAmount,
}: ClientOrderEmailProps) => {
  const { main, container, h1, text, section, hr, footer } = emailStyles

  return (
    <Html>
      <Head />
      <Preview>We have received your order!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            Thank you for your order, {customerName}!
          </Heading>
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
}

const label = {
  color: '#2d52ab',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
}
const value = { color: '#64748b', fontSize: '14px', fontWeight: 'bold' }
