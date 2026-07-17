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
import { newsletterStyles } from './emailStyles'

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
  const {
    main,
    container,
    heroSection,
    brand,
    heading: headingText,
    body: bodyText,
    ctaSection,
    button,
    secondaryButton,
    productSection,
    image,
    productTitle,
    productPrice,
    divider,
    footerText,
    link,
    trackingPixel,
  } = newsletterStyles

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

          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={bodyText}>
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
