import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const habits = await prisma.habit.findMany({
    where: { userId: dbUser.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ habits }, { status: 200 });
}
