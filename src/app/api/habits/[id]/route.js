import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";
import { invalidateHabitsCache } from "@/lib/cache-invalidation";

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, isActive } = await req.json();

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        if (!user) {
            return Response.json({ message: "User not found" }, { status: 404 });
        }

        const updatedHabit = await prisma.habit.update({
            where: { id },
            data: { title, isActive },
        });
        await invalidateHabitsCache(user.id);
        return Response.json({ habit: updatedHabit });
    } catch (error) {
        return Response.json({ message: "Failed to update habit" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        if (!user) {
            return Response.json({ message: "User not found" }, { status: 404 });
        }

        // Soft delete by setting isActive to false
        await prisma.habit.update({
            where: { id },
            data: { isActive: false },
        });
        await invalidateHabitsCache(user.id);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ message: "Failed to delete habit" }, { status: 500 });
    }
}
