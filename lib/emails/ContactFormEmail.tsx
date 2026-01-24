import { Body, Heading, Html, Section, Text } from '@react-email/components'

interface ContactProps {
  name: string
  email: string
  message: string
}

export const ContactFormEmail = ({ name, email, message }: ContactProps) => (
  <Html>
    <Body style={main}>
      <Heading style={h1}>New Inquiry from {name}</Heading>
      <Section style={container}>
        <Text>
          <strong>From:</strong> {name} ({email})
        </Text>
        <Text>
          <strong>Message:</strong>
        </Text>
        <Text style={text}>{message}</Text>
      </Section>
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
