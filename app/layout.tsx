'use client'
import "../globals.css";
import "@assets/chrome-bug.css";
import "keen-slider/keen-slider.min.css";

import { ManagedUIContext } from "@components/ui/context"; // Ensure this is NOT async
import { Head, Layout } from "@components/common";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* <Head /> note required use metadata? */}
      {/* 1. Metadata and Head are handled by Next.js automatically */}
      <body className="loading bg-primary">
        {/* 2. All Providers must be inside the body */}
        <SessionProvider>
          <ManagedUIContext>
            <Layout pageProps={{
              pages: undefined,
              categories: []
            }}>
              {children}
            </Layout>
          </ManagedUIContext>
        </SessionProvider>
      </body>
    </html>
  );
}