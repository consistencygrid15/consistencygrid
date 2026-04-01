import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { invalidateDashboardCache } from "@/lib/cache-invalidation";
import { getRateLimitErrorResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET() {
    const session = await getUniversalSession();

    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    try {
        const milestones = await prisma.milestone.findMany({
            where: { userId: user.id },
            orderBy: { age: 'asc' }
        });

        return Response.json(milestones);
    } catch (error) {
        console.error("Error fetching milestones:", error);
        return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getUniversalSession();

    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Check rate limit
    const rateLimitError = getRateLimitErrorResponse(user.id, "milestoneCreate", RATE_LIMITS.milestoneCreate);
    if (rateLimitError) return rateLimitError;

    try {
        const body = await req.json();
        const { title, age, description, status } = body;

        if (!title || !age) {
            return Response.json({ message: "Title and Age are required" }, { status: 400 });
        }

        const milestone = await prisma.milestone.create({
            data: {
                userId: user.id,
                title,
                age: parseInt(age),
                description,
                status: status || "future"
            }
        });

        await invalidateDashboardCache(user.id);
        return Response.json(milestone);
    } catch (error) {
        console.error("Error creating milestone:", error);
        return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
