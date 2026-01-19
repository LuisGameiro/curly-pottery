

import {  Suspense } from "react";
import Loading from "app/loading";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login - Curly Pottery",
  description:
    "Log in to your Curly Pottery account to manage your orders, track shipments, and access exclusive member benefits. Enjoy a seamless shopping experience with us.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}

