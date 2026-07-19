import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'

export const metadata = constructMetadata({
  title: 'About',
  description:
    'Meet Violeta, a ceramicist creating small-batch functional ceramics in Highgate, North London. Inspired by nature, travel, and the love of handcrafted pottery.',
  canonical: '/about',
})

export default function About() {
  return (
    <Container className="px-4 py-6 sm:px-10 sm:py-10 bg-linear-to-r from-background to-accent-2">
      <div className="space-y-16 md:max-w-3xl mx-auto">
        {/* Section 1: About the artist */}
        <section className="space-y-6">
          <Text variant="heading" className="text-center">
            About Curly Pottery
          </Text>

          <div className="space-y-4">
            <Text variant="body">
              Hello! I&apos;m Violeta, a ceramicist creating in a community
              studio in Highgate, North London.
            </Text>

            <Text variant="body">
              My pottery journey started in 2021 during a taster class in
              Portugal. The minute I touched clay, time stood still, mind went
              quiet, all the noise just faded away. What followed was a
              long-distance relationship with a charming studio in Coimbra,
              Portugal until I finally brought my practice home to London in
              2024.
            </Text>

            <Text variant="body">
              I create small-batch, functional ceramics designed to add a little
              magic to everyday moments. I love creating functional ceramics
              with a bit of personality, pieces that quietly stand out.
              They&apos;re practical enough for your daily routine but carry a
              unique character that makes them feel special even when
              they&apos;re just resting in your home or on your shelf.
            </Text>

            <Text variant="body">
              Mixing wheel-throwing and handbuilding techniques, I love working
              with natural textures, organic shapes and nature inspired tones.
            </Text>

            <Text variant="body">
              My work is constantly evolving, inspired by nature, travel, and a
              love for trying new ideas. I hope these pieces find a happy spot
              in your home and bring a little extra warmth and comfort to your
              space in the same way they do to me.
            </Text>
          </div>
        </section>

      </div>
    </Container>
  )
}
