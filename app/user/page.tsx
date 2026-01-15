import { getServerSession } from "next-auth";
// import { prisma } from "prisma/prisma";
import { redirect } from "next/navigation";
import { Container } from "@components/ui";
import ProfileForm from "./profileForm";
import { authOptions } from "pagesx/api/auth/[...nextauth]";
import { PrismaClient } from "prisma/generated/prisma/client";

// const prisma = new PrismaClient();
export default async function ProfilePage() {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect("/auth/login");
  // }

  // const user = await prisma.user.findUnique({
  //   where: { email: session.user.email as string },
  // });

  // if (!user) return <div>User not found</div>;

  return (
    <ProfileForm user={null} />

  );
}