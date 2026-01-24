import Link from 'next/link'
import { Text } from '@components/ui'

export default function NotFound() {
  return (
    <div className="space-y-10 text-center bg-background py-20">
      <Text variant="heading">Oops! This page is missing.</Text>
      <Text variant="body">
        We could not find the page you are looking for. It might have moved, or
        the link could be slightly broken.
      </Text>
      <Link href="/" className="text-secondary">
        Return Home
      </Link>
    </div>
  )
}
