'use client'

import { useEffect } from 'react'
import { Button, Container, Text } from '@components/ui'

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="py-20 text-center">
      <Text variant="heading" className="mb-4">
        Something went wrong loading the shop
      </Text>
      <Text variant="muted" className="mb-8">
        We couldn&apos;t load our products. Please try again.
      </Text>
      <Button variant="flat" onClick={() => reset()}>
        Try Again
      </Button>
    </Container>
  )
}
