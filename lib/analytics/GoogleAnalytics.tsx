"use client";
import Script from "next/script";
import ReactGA from "react-ga4";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    _analytics_initialized?: boolean;
  }
}
export default function GoogleAnalytics() {
  if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    return null;
  }
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cookie-consent");
    const isConsented = saved ? JSON.parse(saved).analytics : false;
    setConsent(isConsented);

    if (isConsented) {
      if (!window._analytics_initialized) {
        ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "");
        window._analytics_initialized = true;
      }
    }
  }, []);

  if (!consent) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());   
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}  ');
        `}
      </Script>
    </>
  );
}
