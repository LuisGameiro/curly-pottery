'use client'; 
import { Text } from '@components/ui'

export default function Error({ error, reset }) {
  return (
    <div className="p-10 text-center bg-background">
      <Text variant='heading'>Something went wrong!</Text>
      <button onClick={() => reset()} className="mt-4 bg-red-500 text-white p-2">
        Try again
      </button>
    </div>
  );
}