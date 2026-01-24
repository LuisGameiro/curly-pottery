import {
  Html,
  Button,
  Text,
  Body,
  Container,
  Img,
} from '@react-email/components'

interface WelcomeEmailProps {
  firstName: string
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => (
  <Html>
    <Body style={main}>
      <Container style={container}>
        <Img src={'logo.png'} />
        <Text style={h1}>Hi {firstName},</Text>
        <Text style={text}>Thank you for reaching out to Curly Pottery!</Text>
        <Button href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={button}>
          Visit Store
        </Button>
      </Container>
    </Body>
  </Html>
)

const main = { backgroundColor: '#f1fbff', fontFamily: 'sans-serif' }
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' }

const button = {
  background: '#3b67d4',
  color: '#000000',
  padding: '12px 20px',
  borderRadius: '4px',
}

const h1 = {
  color: '#fde372',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
}
const text = { color: '#000000', fontSize: '16px', lineHeight: '24px' }
