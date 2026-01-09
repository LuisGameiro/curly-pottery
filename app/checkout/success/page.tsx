import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <CheckCircle size={80} className="text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-accent-6 mb-8 max-w-md">
        Thank you for your purchase. We've sent a confirmation email to your inbox.
        Your order is being processed and will be shipped soon.
      </p>
      <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-full font-bold">
        Continue Shopping
      </Link>
    </div>
  );
}