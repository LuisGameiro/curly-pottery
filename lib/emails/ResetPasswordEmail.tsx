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
import { emailStyles } from './emailStyles'

interface ResetPasswordEmailProps {
  userFirstName?: string
  resetPasswordLink?: string
}

export const ResetPasswordEmail = ({
  userFirstName = 'Customer',
  resetPasswordLink = 'https://yourstore.com/auth/reset-password?token=123',
}: ResetPasswordEmailProps) => {
  const { main, container, h1, text, section, hr, footer, button, link } =
    emailStyles

  return (
    <Html>
      <Head />
      <Preview>Reset your password for Your Store</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Img src={'logo.png'} style={emailStyles.logo} />

            <Text style={h1}>
              <strong>Curly Pottery</strong>
            </Text>
          </Section>
          <Text style={text}>Hello {userFirstName},</Text>
          <Text style={text}>
            Someone requested a password reset for your account. If this was
            you, click the button below to set a new password. This link will
            expire in 1 hour.
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
