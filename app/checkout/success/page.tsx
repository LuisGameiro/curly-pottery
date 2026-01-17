import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Text } from "@components/ui";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <CheckCircle size={80} className="text-green-500 mb-6" />
      <Text variant="sectionHeading" className="mb-2">
        Order Confirmed!
      </Text>
      <Text className="text-accent-6 mb-8 max-w-md">
        Thank you for your purchase. We've sent a confirmation email to your
        inbox. Your order is being processed and will be shipped soon.
      </Text>
      <Link
        href="/shop"
        className="text-secondary px-8 py-3 rounded-full font-bold"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
