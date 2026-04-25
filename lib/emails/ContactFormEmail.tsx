import { Body, Heading, Html, Section, Text } from '@react-email/components'
import { emailStyles } from './emailStyles'

interface ContactProps {
  name: string
  email: string
  message: string
}

export const ContactFormEmail = ({ name, email, message }: ContactProps) => {
  const { main, h1, container, text, section } = emailStyles

  return (
    <Html>
      <Body style={main}>
        <Heading style={h1}>New Inquiry from {name}</Heading>
        <Section style={section}>
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
}
