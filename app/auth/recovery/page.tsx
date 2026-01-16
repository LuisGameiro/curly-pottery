"use client";

import { Button, Text, Input } from "@components/ui";
import { Container, Link, Mail } from "lucide-react";
import { useState } from "react";

export default function RecoveryPage() {
  const [sent, setSent] = useState(true);

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Container>
      <div className="mx-auto ">
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <Text variant="heading">Recover Password</Text>
              <Text className="text-muted-foreground">
                We'll send a reset link to your email
              </Text>
            </div>
            <form onSubmit={handleRecovery} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
              />
              <Button type="submit" width="100%">
                Send Reset Link
              </Button>
              <Link
                href="/auth/login"
                className="block text-center text-sm text-slate-500 hover:text-primary"
              >
                Back to Login
              </Link>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Mail size={32} />
            </div>
            <Text variant="subHeading">Check your email</Text>
            <Text>
              We have sent password recovery instructions to your email address.
            </Text>
            <Button variant="ghost" width="100%" onClick={() => setSent(false)}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}
