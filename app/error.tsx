'use client';

import { Button, Text } from '@components/ui'

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="space-y-10 text-center bg-background py-20">
      <Text variant='heading'>Something went wrong!</Text>
      <Text>{JSON.stringify(error)}</Text>

      <Button onClick={() => reset()} variant='secondary' >
        Try again
      </Button>
    </div>
  );
}