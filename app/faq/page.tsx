import { Container, Text } from '@components/ui'
import ClientFAQ from './ClientFaq'
import constructMetadata from '@components/common/SEO/SEO'

export const metadata = constructMetadata({
  title: 'FAQ',
  description:
    'Find answers to frequently asked questions about Curly Pottery, including shipping, returns, care instructions, and more. We are here to help you with any inquiries you may have.',
  canonical: '/faq',
})

export default function FAQ() {
  return (
    <Container
      className="px-4 py-6 sm:px-10 sm:py-10 bg-linear-to-r from-background to-accent-2"
      data-testid="faq-page"
    >
      <header className="justify-center text-center mx-auto mb-10">
        <Text variant="heading">Frequently Asked Questions</Text>
        <Text variant="body" className="mx-auto">
          Find answers to common questions about our pottery and services.
        </Text>
      </header>

      <ClientFAQ />
    </Container>
  )
}
