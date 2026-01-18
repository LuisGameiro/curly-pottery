"use client";

import { Button, Text } from "@components/ui";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      extra: { digest: error.digest }, // Add the Next.js digest as extra metadata
    });
  }, [error]);

  return (
    <div className="space-y-10 text-center bg-background py-20">
      <Text variant="heading">Something went wrong!</Text>
      <p className="text-muted-foreground">
        The application encountered a fatal error and could not recover.
        We have been notified and are looking into it.
      </p>

      {error.digest && (
        <code className="block bg-muted p-2 rounded text-xs text-red-500">
          System ID: {error.digest}
        </code>
      )}

      <Text>{JSON.stringify(error)}</Text>

      <Button onClick={() => reset()} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
