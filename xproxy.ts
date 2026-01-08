import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
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
  }
);

// IMPORTANT: Ensure you are NOT matching /api/auth paths
export const config = { 
  matcher: [
    "/admin/:path*", 
    "/profile/:path*",
    // Use a negative lookahead to ensure we don't accidentally intercept auth APIs
    // or static files which can cause the "Unexpected Character" error
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)", 
  ] 
};