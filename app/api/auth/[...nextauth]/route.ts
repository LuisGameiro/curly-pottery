
import NextAuth from "next-auth";
import { authOptions } from "@lib/auth/authOptions"; // Move your authOptions to a shared lib file

export const auth = NextAuth(authOptions);

// In App Router, we MUST export GET and POST named handlers
export { auth as GET, auth as POST };