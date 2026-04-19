import prisma from "@/lib/prisma";
import { invalidateGoalsCache } from "@/lib/cache-invalidation";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return new Response(JSON.stringify({ error: "Token required" }), { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { publicToken: token },
            select: { id: true }
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
        }

        const body = await request.json();
        const upserts = body.upserts || []; // Goals to create/update
        const deletes = body.deletes || []; // Server IDs to delete

        const results = {
            deleted: 0,
            upserted: [],
        };

        // 1. Process Deletions
        if (deletes.length > 0) {
            const validGoalsToDelete = await prisma.goal.findMany({
                where: {
                    id: { in: deletes },
                    userId: user.id
                },
                select: { id: true }
            });
            const idsToDelete = validGoalsToDelete.map(g => g.id);

            if (idsToDelete.length > 0) {
                // Delete subgoals first due to foreign key
                await prisma.subGoal.deleteMany({
                    where: { goalId: { in: idsToDelete } }
                });
                
                await prisma.goal.deleteMany({
                    where: { id: { in: idsToDelete } }
                });
                results.deleted = idsToDelete.length;
            }
        }

        // 2. Process Upserts (Creates / Updates)
        for (const goal of upserts) {
            const { localId, serverId, title, category, targetDeadline, description, age, subGoals } = goal;
            
            if (!title) continue;

            const existingGoal = serverId ? await prisma.goal.findUnique({
                where: { id: serverId }
            }) : null;

            // Recalculate progress safely
            const safeSubGoals = subGoals || [];
            const completedSubs = safeSubGoals.filter(sg => sg.isCompleted).length;
            const progress = safeSubGoals.length > 0 ? Math.round((completedSubs / safeSubGoals.length) * 100) : 0;

            if (existingGoal && existingGoal.userId === user.id) {
                // UPDATE EXISTING
                await prisma.goal.update({
                    where: { id: serverId },
                    data: {
                        title: title,
                        category: category || "General",
                        description: description || "",
                        progress: progress,
                        targetDeadline: targetDeadline ? new Date(targetDeadline) : null,
                        age: age || null,
                        isCompleted: progress === 100, // Derived
                    }
                });

                // Handle Subgoals
                // Since this is offline sync, we treat the incoming subgoals array as the exact list 
                // of desired subgoals for this goal. We delete old subgoals and create new ones.
                const newTitlesCompleted = safeSubGoals.map(sg => ({ 
                    title: sg.title, 
                    isCompleted: sg.isCompleted,
                    goalId: serverId
                }));

                await prisma.subGoal.deleteMany({
                    where: { goalId: serverId }
                });

                if (newTitlesCompleted.length > 0) {
                    await prisma.subGoal.createMany({
                        data: newTitlesCompleted
                    });
                }

                results.upserted.push({ localId, serverId, status: "updated" });

            } else {
                // CREATE NEW
                const newGoal = await prisma.goal.create({
                    data: {
                        userId: user.id,
                        title: title,
                        category: category || "General",
                        description: description || "",
                        progress: progress,
                        targetDeadline: targetDeadline ? new Date(targetDeadline) : null,
                        age: age || null,
                        isCompleted: progress === 100, // Derived
                        subGoals: {
                            create: safeSubGoals.map(sg => ({
                                title: sg.title,
                                isCompleted: sg.isCompleted
                            }))
                        }
                    }
                });

                results.upserted.push({ localId, serverId: newGoal.id, status: "created" });
            }
        }

        if (upserts.length > 0 || deletes.length > 0) {
            await invalidateGoalsCache(user.id);
        }

        return new Response(JSON.stringify({ success: true, ...results }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("[mobile-goals-sync-api]", e);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
