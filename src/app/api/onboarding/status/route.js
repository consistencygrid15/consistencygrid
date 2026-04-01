import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      onboarded: true,
      name: true,
      settings: { select: { dob: true, lifeExpectancyYears: true, theme: true } },
    },
  });

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  return Response.json(
    {
      onboarded: user.onboarded,
      name: user.name,
      settings: user.settings,
    },
    { status: 200 }
  );
}

