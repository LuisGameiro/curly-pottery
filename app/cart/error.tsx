'use client'

import { useEffect } from 'react'
import { Button, Container, Text } from '@components/ui'

export default function CartError({
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
        Could not load your cart
      </Text>
      <Text variant="muted" className="mb-8">
        There was a problem loading your shopping cart. Please try again.
      </Text>
      <Button variant="flat" onClick={() => reset()}>
        Try Again
      </Button>
    </Container>
  )
}
