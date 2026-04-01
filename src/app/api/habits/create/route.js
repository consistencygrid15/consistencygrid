import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();

  if (!title || title.trim().length < 2) {
    return Response.json(
      { message: "Habit title required" },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const habit = await prisma.habit.create({
    data: {
      title: title.trim(),
      userId: dbUser.id,
    },
  });

  return Response.json({ habit }, { status: 200 });
}
