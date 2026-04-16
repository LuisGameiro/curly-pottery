import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export interface NewsletterEmailProduct {
  id: string
  name: string
  href: string
  imageUrl?: string | null
  priceLabel?: string | null
}

interface NewsletterEmailProps {
  previewText?: string | null
  heading: string
  message: string
  products: NewsletterEmailProduct[]
  ctaLabel?: string | null
  ctaHref?: string | null
  unsubscribeUrl: string
  openTrackingUrl?: string | null
}

const NewsletterEmail = ({
  previewText,
  heading,
  message,
  products,
  ctaLabel,
  ctaHref,
  unsubscribeUrl,
  openTrackingUrl,
}: NewsletterEmailProps) => {
  const paragraphs = message
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <Html>
      <Head />
      <Preview>{previewText || heading}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={heroSection}>
            <Text style={brand}>Curly Pottery</Text>
            <Text style={headingText}>{heading}</Text>
          </Section>

          {paragraphs.map((paragraph) => (
            <Text key={paragraph} style={bodyText}>
              {paragraph}
            </Text>
          ))}

          {ctaLabel && ctaHref ? (
            <Section style={ctaSection}>
              <Button href={ctaHref} style={button}>
                {ctaLabel}
              </Button>
            </Section>
          ) : null}

          {products.map((product) => (
            <Section key={product.id} style={productSection}>
              {product.imageUrl ? (
                <Img src={product.imageUrl} alt={product.name} style={image} />
              ) : null}
              <Text style={productTitle}>{product.name}</Text>
              {product.priceLabel ? (
                <Text style={productPrice}>{product.priceLabel}</Text>
              ) : null}
              <Button href={product.href} style={secondaryButton}>
                View Product
              </Button>
            </Section>
          ))}

          <Hr style={divider} />

          <Text style={footerText}>
            You are receiving this email because you subscribed to Curly Pottery
            updates.
          </Text>
          <Text style={footerText}>
            <Link href={unsubscribeUrl} style={link}>
              Unsubscribe from future newsletters
            </Link>
          </Text>

          {openTrackingUrl ? (
            <Img
              src={openTrackingUrl}
              alt=""
              width="1"
              height="1"
              style={trackingPixel}
            />
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

export default NewsletterEmail

const main = {
  backgroundColor: '#f5efe7',
  fontFamily: 'Georgia, serif',
  color: '#2c2118',
}

const container = {
  margin: '0 auto',
  padding: '24px 0 40px',
  width: '580px',
}

const heroSection = {
  padding: '28px 32px',
  backgroundColor: '#fff9f4',
  border: '1px solid #d8c2ab',
  borderRadius: '16px',
  marginBottom: '24px',
}

const brand = {
  fontSize: '14px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: '#8f5b34',
  margin: '0 0 12px',
}

const headingText = {
  fontSize: '30px',
  lineHeight: '1.25',
  fontWeight: 'bold',
  margin: '0',
}

const bodyText = {
  fontSize: '16px',
  lineHeight: '28px',
  color: '#3d3025',
  margin: '0 0 16px',
}

const ctaSection = {
  margin: '28px 0 18px',
}

const button = {
  backgroundColor: '#8f5b34',
  color: '#fffaf4',
  padding: '12px 18px',
  borderRadius: '999px',
  textDecoration: 'none',
}

const secondaryButton = {
  backgroundColor: '#2f4f4f',
  color: '#fffaf4',
  padding: '10px 16px',
  borderRadius: '999px',
  textDecoration: 'none',
}

const productSection = {
  padding: '24px',
  backgroundColor: '#ffffff',
  border: '1px solid #ead9c9',
  borderRadius: '16px',
  marginTop: '18px',
}

const image = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  objectFit: 'cover' as const,
  marginBottom: '16px',
}

const productTitle = {
  fontSize: '20px',
  lineHeight: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const productPrice = {
  fontSize: '15px',
  color: '#6d4a2d',
  margin: '0 0 16px',
}

const divider = {
  borderColor: '#d8c2ab',
  margin: '28px 0 20px',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#6f6258',
  margin: '0 0 8px',
}

const link = {
  color: '#8f5b34',
  textDecoration: 'underline',
}

const trackingPixel = {
  display: 'block',
  width: '1px',
  height: '1px',
  opacity: '0',
}
