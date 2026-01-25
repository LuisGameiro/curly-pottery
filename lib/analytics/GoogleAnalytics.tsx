'use client'

import Script from 'next/script'

declare global {
  interface Window {
    _analytics_initialized?: boolean
  }
}
export function GoogleAnalytics() {
  // useEffect(() => {
  //   try {
  //     const saved = localStorage.getItem('cookie-consent')
  //     const hasConsent = saved ? JSON.parse(saved).analytics : false

  //     if (hasConsent && !window._analytics_initialized) {
  //       ReactGA.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '')
  //       window._analytics_initialized = true
  //     }
  //   } catch (e) {
  //     console.warn('Analytics blocked by browser extension', e)
  //   }
  // }, [])

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
      />
      <Script id="google-analytics">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());   
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}  ');
        `}
      </Script>
    </>
  )
}
