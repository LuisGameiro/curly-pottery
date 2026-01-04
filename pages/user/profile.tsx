import { getServerSession } from "next-auth";
// import { prisma } from "prisma/prisma";
import { redirect } from "next/navigation";
import { Container } from "@components/ui";
import ProfileForm from "./profileForm";
import { authOptions } from "pages/api/auth/[...nextauth]";
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
    <Container className="py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        {/* Pass the server data to the client form */}
        <ProfileForm user={null} />
      </div>
    </Container>
  );
}