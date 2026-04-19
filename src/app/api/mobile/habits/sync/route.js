import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/mobile/habits/sync?token=<publicToken>
 *
 * Syncs the full habits list from Android to the server.
 * This handles:
 *   - Creates (new habits with localId, no serverId)
 *   - Updates (existing habits with serverId)
 *   - Deletes (habits in the "deletes" array by serverId)
 *
 * Body:
 * {
 *   upserts: [{ localId, serverId?, title, scheduledTime?, isActive }],
 *   deletes: ["serverId1", "serverId2"]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   upserted: [{ localId, serverId, status: "created"|"updated" }],
 *   deletedCount: number
 * }
 */
export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ success: false, error: "Token required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { publicToken: token },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const upserts = body.upserts || [];
        const deletes = body.deletes || [];

        const upsertedResults = [];

        // 1. Process Upserts (create or update)
        for (const habit of upserts) {
            const { localId, serverId, title, scheduledTime, isActive } = habit;

            if (!title) continue;

            if (serverId) {
                // Check it belongs to this user
                const existing = await prisma.habit.findFirst({
                    where: { id: serverId, userId: user.id }
                });

                if (existing) {
                    await prisma.habit.update({
                        where: { id: serverId },
                        data: {
                            title,
                            scheduledTime: scheduledTime || null,
                            isActive: isActive !== undefined ? isActive : true
                        }
                    });
                    upsertedResults.push({ localId, serverId, status: "updated" });
                } else {
                    // serverId does not exist for this user — create fresh
                    const newHabit = await prisma.habit.create({
                        data: { userId: user.id, title, scheduledTime: scheduledTime || null, isActive: true }
                    });
                    upsertedResults.push({ localId, serverId: newHabit.id, status: "created" });
                }
            } else {
                // No serverId — brand new habit
                const newHabit = await prisma.habit.create({
                    data: { userId: user.id, title, scheduledTime: scheduledTime || null, isActive: true }
                });
                upsertedResults.push({ localId, serverId: newHabit.id, status: "created" });
            }
        }

        // 2. Process Deletes (soft-delete: set isActive = false so logs are preserved)
        let deletedCount = 0;
        if (deletes.length > 0) {
            const validHabits = await prisma.habit.findMany({
                where: { id: { in: deletes }, userId: user.id },
                select: { id: true }
            });
            const idsToDelete = validHabits.map(h => h.id);
            if (idsToDelete.length > 0) {
                await prisma.habit.updateMany({
                    where: { id: { in: idsToDelete } },
                    data: { isActive: false }
                });
                deletedCount = idsToDelete.length;
            }
        }

        console.log(`[mobile-habits-sync] User ${user.id}: ${upsertedResults.length} upserted, ${deletedCount} deactivated`);

        return NextResponse.json({
            success: true,
            upserted: upsertedResults,
            deletedCount
        });

    } catch (e) {
        console.error("[mobile-habits-sync]", e);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
