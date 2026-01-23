"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cookie-consent");
      const hasConsent = saved ? JSON.parse(saved).analytics : false;

      if (hasConsent) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
          api_host: "/ingest",
          ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          person_profiles: "always",
        });
      }
    } catch (e) {
      console.warn("Posthog blocked by browser extension", e);
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
