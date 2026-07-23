import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'
import Image from 'next/image'
import { getGalleryImages } from '@lib/data/gallery'

export const revalidate = 3600

export const metadata = constructMetadata({
  title: 'Gallery',
  description:
    'A collection of past and current work by Curly Pottery. Explore handcrafted ceramic pieces.',
  canonical: '/gallery',
})

export default async function GalleryPage() {
  const response = await getGalleryImages()

  if (!response.success) {
    throw new Error(response.message)
  }

  const images = response.data || []

  return (
    <Container className="px-4 py-6 sm:px-10 sm:py-10 bg-linear-to-r from-background to-accent-2">
      <div className="space-y-12 md:max-w-4xl mx-auto">
        {/* Header */}
        <section className="text-center space-y-4">
          <Text variant="heading">Gallery</Text>
          <Text variant="body" className="max-w-2xl mx-auto">
            A collection of my past and current work. Take a look around and
            come on{' '}
            <a
              href="https://instagram.com/curly_pottery"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline text-secondary"
            >
              Instagram (@curly_pottery)
            </a>{' '}
            to discover more of my journey.
          </Text>
        </section>

        {/* Masonry Image Grid */}
        {images.length > 0 ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid overflow-hidden rounded-lg bg-accent-1 group"
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Text variant="muted">Gallery coming soon. Check back later!</Text>
          </div>
        )}
      </div>
    </Container>
  )
}
