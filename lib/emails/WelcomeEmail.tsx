import {
  Html,
  Button,
  Text,
  Body,
  Container,
  Img,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => (
  <Html>
    <Body style={{ backgroundColor: "#f6f9fc", padding: "20px" }}>
      <Container
        style={{
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "5px",
        }}
      >
        <Img src={"logo.png"} />
        <Text style={{ fontSize: "16px" }}>Hi {firstName},</Text>
        <Text>Thank you for reaching out to Curly Pottery!</Text>
        <Button
          href="https://curlypottery.com"
          style={{
            background: "#000",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "4px",
          }}
        >
          Visit Store
        </Button>
      </Container>
    </Body>
  </Html>
);
