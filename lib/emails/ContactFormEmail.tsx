import { Body, Heading, Html, Section, Text } from "@react-email/components";

interface ContactProps {
  name: string;
  email: string;
  message: string;
}

export const ContactFormEmail = ({ name, email, message }: ContactProps) => (
  <Html>
    <Body style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <Heading style={{ fontSize: "20px" }}>New Inquiry from {name}</Heading>
      <Section
        style={{ background: "#f9f9f9", padding: "15px", borderRadius: "5px" }}
      >
        <Text>
          <strong>From:</strong> {name} ({email})
        </Text>
        <Text>
          <strong>Message:</strong>
        </Text>
        <Text style={{ fontStyle: "italic" }}>&quot{message}&quot</Text>
      </Section>
    </Body>
  </Html>
);
