import NextAuth from "next-auth";
import { authOptions } from "@lib/auth/authOptions";

export const auth = NextAuth(authOptions);

export { auth as GET, auth as POST };
