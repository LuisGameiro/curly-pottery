"use client";

import { ManagedUIContext } from "@components/ui/context";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ManagedUIContext>{children}</ManagedUIContext>
    </SessionProvider>
  );
}
