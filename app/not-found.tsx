// app/not-found.js
import Link from 'next/link';
import { Text } from '@components/ui'

export default function NotFound() {
  return (
    <div className="max-w-2xl min-h-full  mx-8 sm:mx-auto py-30 flex flex-col items-center justify-center bg-background">
      <Text variant="heading">Not Found</Text>
      <Text variant="body">
        The requested page doesn't exist or you don't have access to it.
      </Text>
      <Link href="/" className="text-blue-500">Return Home</Link>
    </div>
  );
}