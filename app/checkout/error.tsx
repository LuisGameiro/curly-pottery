'use client'

import { useEffect } from 'react'
import { Button, Container, Text } from '@components/ui'

export default function CheckoutError({
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
        Something went wrong during checkout
      </Text>
      <Text variant="muted" className="mb-8">
        Please try again or contact support if the problem persists.
      </Text>
      <Button variant="flat" onClick={() => reset()}>
        Try Again
      </Button>
    </Container>
  )
}
