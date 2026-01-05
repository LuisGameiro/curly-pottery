import "../globals.css";
import "@assets/chrome-bug.css";
import "keen-slider/keen-slider.min.css";

import { FC, ReactNode, useEffect } from "react";
import type { AppProps } from "next/app";
import { Head } from "@components/common";
import { ManagedUIContext } from "@components/ui/context";
import { SessionProvider } from "next-auth/react";

const Noop: FC<{ children?: ReactNode }> = ({ children }) => <>{children}</>;

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop;

  useEffect(() => {
    document.body.classList?.remove("loading");
  }, []);

  return (
    <>
      <SessionProvider>
        <Head />
        <ManagedUIContext>
          <Layout pageProps={pageProps}>
            <Component {...pageProps} />
          </Layout>
        </ManagedUIContext>
      </SessionProvider>
    </>
  );
}
