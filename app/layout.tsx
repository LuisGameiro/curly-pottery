"use client";

import "../globals.css";
import "@assets/chrome-bug.css";
import "keen-slider/keen-slider.min.css";

import { Layout } from "@components/common";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="loading bg-primary">
        <SessionProvider>
            <Layout>{children}</Layout>
        </SessionProvider>
      </body>
    </html>
  );
}
