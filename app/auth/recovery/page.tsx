"use client";

import { useState } from "react";
import { Container, Text, Button, Input } from "@components/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { sendResetEmail } from "actions/email.actions";
import zod from "zod";

// export const metadata = constructMetadata({
//   title: "Recovery Account",
//   description:
//     "Recover your password for your Curly Pottery account to manage your orders, track shipments, and access exclusive member benefits. Enjoy a seamless shopping experience with us.",
// });

export default function RecoveryForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    if (
      zod.email().safeParse(email).success === false &&
      typeof email === null
    ) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    try {
      await sendResetEmail(email as string);

      console.log("Recovery email sent to:", email);
      setSubmitted(true);
      toast.success("Reset link sent to your email");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="p-10">
      <header className="text-center mb-8 justify-center">
        <Text variant="heading">Reset Password</Text>
        <Text variant="subHeading">
          Enter your email and we will send you a link to get back into your
          account.
        </Text>
      </header>

      <main className="md:max-w-lg mx-auto">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Button
              className="mt-12"
              type="submit"
              width="100%"
              loading={loading}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center p-6 border rounded-xl bg-accent-1">
            <Text className="mb-4">
              If an account exists for that email, you will receive a reset link
              shortly.
            </Text>
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Try a different email
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-secondary hover:underline inline-flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>
        </div>
      </main>
    </Container>
  );
}
