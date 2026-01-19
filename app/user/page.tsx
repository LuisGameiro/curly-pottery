import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfileForm from "./profileForm";
import { authOptions } from "@lib/auth/authOptions";
import { prisma } from "prisma/prisma";

export const metadata = {
  title: "User Profile - Curly Pottery",
  description:
    "Manage your personal information and account settings at Curly Pottery. Update your profile to ensure a personalized and secure shopping experience.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return <ProfileForm user={user} />;
}
