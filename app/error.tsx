'use client'

import { Button, Text } from '@components/ui'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div className="space-y-10 text-center bg-background py-20">
      <Text variant="heading" className="mb-2">
        We hit a little snag
      </Text>
      <p className="text-muted-foreground max-w-sm mx-auto">
        <p>Something unexpected happened.</p>
        <p>Try refreshing the page, or check back in a moment.</p>
      </p>
      {process.env.NEXT_PUBLIC_APP_ENV === 'dev' && (
        <>
          {error.digest && (
            <code className="block bg-muted p-2 rounded text-xs text-red-500">
              System ID: {error.digest}
            </code>
          )}
          <Text>{JSON.stringify(error)}</Text>
        </>
      )}
      <Button onClick={() => reset()} variant="secondary">
        Try again
      </Button>
    </div>
  )
}
