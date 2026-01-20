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

    // If user is logged in but tries to access /admin without being an ADMIN
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // Logic: If this returns true, the middleware function above runs.
      // If it returns false, the user is redirected to the sign-in page.
      authorized: ({ token }) => !!token,
    },
  },
);

// IMPORTANT: Ensure you are NOT matching /api/auth paths
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    // Use a negative lookahead to ensure we don't accidentally intercept auth APIs
    // or static files which can cause the "Unexpected Character" error
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
