import constructMetadata from '@components/common/SEO/SEO'
import { Container, Text } from '@components/ui'

export const metadata = constructMetadata({
  title: 'Terms of Service',
  description:
    'Read the legal agreement between you and Curly Pottery. Understand the terms governing your use of our handcrafted pottery products and services.',
})

export default function TermsOfService() {
  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-10">
        <Text variant="heading">Terms of Service</Text>
        <Text variant="body" className="mx-auto">
          The legal agreement between you and Curly Pottery
        </Text>
      </header>

      <section className="space-y-5 md:max-w-2xl mx-auto">
        <Text variant="sectionHeading">1. Handcrafted Nature</Text>
        <Text variant="body" className="text-justify">
          At Curly Pottery, every item is handmade. Please note that slight
          variations in color, shape, and size are part of the artisanal charm
          and do not constitute defects.
        </Text>

        <Text variant="sectionHeading">2. Orders and Shipping</Text>
        <Text variant="body">
          By placing an order, you agree to provide current and accurate
          purchase information. Shipping times for handcrafted pieces may vary
          depending on kiln cycles and stock availability.
        </Text>

        <Text variant="sectionHeading">3. Intellectual Property</Text>
        <Text variant="body">
          All designs, photographs, and content on this website are the
          intellectual property of Curly Pottery. You may not reproduce or use
          our designs without written permission.
        </Text>

        <Text variant="sectionHeading">4. Limitation of Liability</Text>
        <Text variant="body">
          We are not liable for any damages arising from the misuse of our
          ceramic products. Our pottery is food-safe unless specifically labeled
          otherwise.
        </Text>

        <Text variant="sectionHeading">5. Governing Law</Text>
        <Text variant="body">
          These terms are governed by the laws of your jurisdiction. Any
          disputes will be resolved in the courts nearest to our primary studio
          location.
        </Text>
      </section>
    </Container>
  )
}
