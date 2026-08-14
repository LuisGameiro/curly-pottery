import constructMetadata from '@components/common/SEO'
import { Container, Text } from '@components/ui'
import Link from 'next/link'

export const metadata = constructMetadata({
  title: 'Forbidden',
  description: 'You do not have permission to access this page.',
})

export default function ForbiddenPage() {
  return (
    <Container
      className="px-4 py-20 text-center space-y-4"
      data-testid="forbidden-page"
    >
      <Text variant="heading">403 — Access Denied</Text>
      <Text variant="subHeading">
        You do not have permission to view this page.
      </Text>
      <Link
        href="/"
        className="inline-flex mt-6 rounded-full border border-border px-5 py-3 font-semibold hover:bg-accent-2 transition-colors"
      >
        Back to Home
      </Link>
    </Container>
  )
}
