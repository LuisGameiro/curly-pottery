"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }
  useEffect(() => {
    const saved = localStorage.getItem("cookie-consent");
    const hasConsent = saved ? JSON.parse(saved).analytics : false;

    if (hasConsent) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST,
        person_profiles: "always",
      });
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
