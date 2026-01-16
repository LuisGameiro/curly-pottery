import Link from "next/link";
import { Text } from "@components/ui";

export default function NotFound() {
  return (
    <div className="space-y-10 text-center bg-background py-20">
      <Text variant="heading">Not Found</Text>
      <Text variant="body">
        The requested page doesn't exist or you don't have access to it.
      </Text>
      <Link href="/" className="text-secondary">
        Return Home
      </Link>
    </div>
  );
}
