import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from '@react-email/components'
import * as React from 'react'

interface ResetPasswordEmailProps {
  userFirstname?: string
  resetPasswordLink?: string
}

export const ResetPasswordEmail = ({
  userFirstname = 'Customer',
  resetPasswordLink = 'https://yourstore.com/auth/reset-password?token=123',
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for Your Store</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Img src={'logo.png'} />

            <Text style={h1}>
              <strong>Curly Pottery</strong>
            </Text>
          </Section>
          <Text style={text}>Hello {userFirstname},</Text>
          <Text style={text}>
            Someone requested a password reset for your account. If this was
            you, click the button below to set a new password. **This link will
            expire in 1 hour.**
          </Text>
          <Section style={section}>
            <Button style={button} href={resetPasswordLink}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            or copy and paste this URL into your browser:{' '}
            <Link href={resetPasswordLink} style={link}>
              {resetPasswordLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you did not request this, please ignore this email. Your password
            will remain unchanged.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ResetPasswordEmail

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
  border: '1px solid #e6e6e6',
}

const hr = { borderColor: '#e6e6e6', margin: '20px 0' }
const footer = { color: '#fde372', fontSize: '12px' }

const button = {
  background: '#3b67d4',
  color: '#000000',
  padding: '12px 20px',
  borderRadius: '4px',
}
const link = { color: '#0000EE', stTextDecoration: 'underline' as const }
