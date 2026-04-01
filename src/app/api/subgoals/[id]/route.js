import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import prisma from "@/lib/prisma";
import { invalidateGoalsCache } from "@/lib/cache-invalidation";
import { getRateLimitErrorResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function PATCH(req, { params }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { isCompleted } = body;

        // Verify ownership through Goal -> User relation if strict security needed, 
        // but typically checking if the goal belongs to user or just trusting the session context if we had a direct link.
        // Prisma update will fail if record doesn't exist, but we should strictly check ownership ideally.
        // For now, fast implementation:

        const subGoal = await prisma.subGoal.findUnique({
            where: { id },
            include: { goal: true }
        });

        if (!subGoal) {
            return Response.json({ message: "Subgoal not found" }, { status: 404 });
        }

        // Check ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (subGoal.goal.userId !== user.id) {
            return Response.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Check rate limit
        const rateLimitError = getRateLimitErrorResponse(user.id, "subgoalUpdate", RATE_LIMITS.subgoalUpdate);
        if (rateLimitError) return rateLimitError;

        const updatedSubGoal = await prisma.subGoal.update({
            where: { id },
            data: { isCompleted }
        });

        // OPTIONAL: Auto-update parent goal progress?
        // Let's recalculate and update parent goal progress
        const allSubGoals = await prisma.subGoal.findMany({
            where: { goalId: subGoal.goalId }
        });

        const completedCount = allSubGoals.filter(sg => sg.isCompleted).length; // using the one just fetched? 
        // Wait, the one just fetched might not be updated in the separate query if transaction isolation... 
        // Easier:
        // Update the goal progress based on the recently updated state.
        // Actually, we can do it in frontend or a separate trigger. 
        // Let's keep it simple for now and just update the subgoal. 
        // The frontend calculates progress dynamically. 
        // But we DO store `progress` in the Goal model in schema. So we should update it.

        const total = allSubGoals.length;
        // We know we just updated one.
        // Recalculate:
        const completed = allSubGoals.filter(sg => sg.id === id ? isCompleted : sg.isCompleted).length;
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

        await prisma.goal.update({
            where: { id: subGoal.goalId },
            data: { progress: newProgress }
        });

        await invalidateGoalsCache(user.id);
        return Response.json({ subGoal: updatedSubGoal, goalProgress: newProgress });

    } catch (error) {
        console.error("Error updating subgoal:", error);
        return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
