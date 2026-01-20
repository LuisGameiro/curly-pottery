"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { id } from "zod/v4/locales";
export const getConsent = () => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("cookie-consent");
  return saved ? JSON.parse(saved) : null;
};
export default function GoogleAnalytics() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check consent on mount and whenever the user interacts with the bar
    const check = () => {
      const c = getConsent();
      setConsent(c?.analytics ?? false);
    };

    check();
    // Listen for custom events if the user clicks "Accept" in the FeatureBar
    window.addEventListener("cookie-updated", check);
    return () => window.removeEventListener("cookie-updated", check);
  }, []);

  if (!consent) return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=YOUR_ID"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'YOUR_ID');
        `}
      </Script>
    </>
  );
}
