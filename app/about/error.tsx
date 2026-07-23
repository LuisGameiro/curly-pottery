'use client'

import { useEffect } from 'react'
import { Button } from '@components/ui'

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-header">Something went wrong!</h2>
      <p className="text-muted">An error occurred while loading this page.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
