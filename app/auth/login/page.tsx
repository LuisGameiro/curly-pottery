"use client";

import { useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { Container, Text, Button, Input } from "@components/ui";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "app/loading";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading/>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess(true);
      const timer = setTimeout(() => {
        setSuccess(false);
        router.replace("/auth/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const target = e.currentTarget;
    const email = target.email.value;
    const password = target.password.value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/shop");
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/shop" });
  };

  return (
    <Container className="p-10">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
          Registration successful! Please log in.
        </div>
      )}

      <header>
        <div className="justify-center text-center mx-auto mb-4">
          <Text variant="heading">Welcome Back</Text>
          <Text variant="subHeading">Log in to manage your orders</Text>
        </div>
      </header>

      <main className="space-y-5 md:max-w-lg mx-auto">
        <Button variant="ghost" width="100%" onClick={handleGoogleLogin}>
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

        <div className="relative flex justify-center text-xs uppercase">
          <span className=" px-2 text-accent-6">Or email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />

          <Link
            href="/auth/recovery"
            className="text-sm font-bold text-secondary hover:underline flex justify-end"
          >
            Forgot Password?
          </Link>

          <div className="h-8">
            {error && (
              <Text className="text-red-500 text-xs text-center">{error}</Text>
            )}
          </div>

          <Button type="submit" width="100%" loading={loading}>
            Sign In <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text className="text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-secondary hover:underline"
            >
              Sign up
            </Link>
          </Text>
        </div>
      </main>
    </Container>
  );
}
