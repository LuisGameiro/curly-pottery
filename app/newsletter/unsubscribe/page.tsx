import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'
import Link from 'next/link'
import { unsubscribeNewsletterByToken } from '@lib/newsletter/service'

export const metadata = constructMetadata({
  title: 'Newsletter Unsubscribe',
  description: 'Manage your Curly Pottery newsletter subscription.',
  robots: 'noindex, nofollow',
})

export default async function NewsletterUnsubscribePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ token?: string }>
}>) {
  const { token } = await searchParams

  let heading = 'Missing unsubscribe token'
  let description =
    'The unsubscribe link is incomplete. Open the original email again or contact us if the problem continues.'

  if (token) {
    try {
      const subscriber = await unsubscribeNewsletterByToken(token)
      heading = 'You have been unsubscribed'
      description = subscriber?.email
        ? `${subscriber.email} will no longer receive Curly Pottery newsletters.`
        : 'You will no longer receive Curly Pottery newsletters.'
    } catch (error) {
      heading = 'We could not update your subscription'
      description =
        error instanceof Error
          ? error.message
          : 'Please try the link again later.'
    }
  }

  return (
    <Container className="max-w-2xl py-16 space-y-6">
      <Text variant="heading">{heading}</Text>
      <Text variant="subHeading">{description}</Text>
      <Link
        href="/"
        className="inline-flex rounded-full border border-border px-5 py-3 font-semibold hover:bg-accent-2 transition-colors"
      >
        Return to the shop
      </Link>
    </Container>
  )
}
