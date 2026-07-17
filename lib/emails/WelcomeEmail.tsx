import {
  Html,
  Button,
  Text,
  Body,
  Container,
  Img,
} from '@react-email/components'
import { emailStyles } from './emailStyles'

interface WelcomeEmailProps {
  firstName: string
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  const { main, container, h1, text, button } = emailStyles

  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env.NEXT_PUBLIC_APP_URL || 'https://curlypottery.com'}/logo.png`}
            style={emailStyles.logo}
          />
          <Text style={h1}>Hi {firstName},</Text>
          <Text style={text}>Thank you for reaching out to Curly Pottery!</Text>
          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={button}>
            Visit Store
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
