// middleware.ts
import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export function proxy() {
  // 1. Generate a random nonce
  // const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  // const isDev = process.env.NODE_ENV === "development";
  // // 2. Define the CSP policy
  // // We include 'unsafe-inline' as a fallback for older browsers
  // const cspHeader = `
  //   default-src 'self';
  //   script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""};
  //   style-src 'self' 'unsafe-inline';
  //   img-src 'self' blob: data:;
  //   font-src 'self';
  //   object-src 'none';
  //   base-uri 'self';
  //   form-action 'self';
  //   frame-ancestors 'none';
  //   upgrade-insecure-requests;
  // `;
}

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/((?!api|_next/static|_next/image|ingest|favicon.ico).*)",
  ],
};
