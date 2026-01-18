import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfileForm from "./profileForm";
import { authOptions } from "@lib/auth/authOptions";
import { prisma } from "prisma/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user) return <div>User not found</div>;

  return <ProfileForm user={user} />;
}
