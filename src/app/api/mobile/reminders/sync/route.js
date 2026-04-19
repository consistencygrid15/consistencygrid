import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateRemindersCache } from "@/lib/cache-invalidation";

export async function POST(request) {
    console.log("[Mobile API] /api/mobile/reminders/sync - Started");
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            console.error("[Mobile API] No token provided");
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // Use publicToken — consistent with all other mobile APIs (habits/tick, goals/sync)
        const user = await prisma.user.findUnique({
            where: { publicToken: token },
            select: { id: true }
        });

        if (!user) {
            console.error(`[Mobile API] User not found for token`);
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const { upserts = [], deletes = [] } = body;

        console.log(`[Mobile API] Sync request - Upserts: ${upserts.length}, Deletes: ${deletes.length}`);

        const upsertedResults = [];

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Process Upserts (creates & updates)
            for (const item of upserts) {
                const { localId, serverId, title, description, startDate, endDate, startTime, endTime, isFullDay, priority, markerColor } = item;

                let dbReminder = null;
                
                if (serverId) {
                    // It's an update to an existing server record
                    try {
                        dbReminder = await tx.reminder.update({
                            where: { id: serverId, userId: user.id },
                            data: {
                                title,
                                description: description || null,
                                startDate: new Date(startDate),
                                endDate: new Date(endDate),
                                startTime: startTime || null,
                                endTime: endTime || null,
                                isFullDay,
                                priority,
                                markerColor: markerColor || "#ff7a00"
                            }
                        });
                        
                        upsertedResults.push({
                            localId: localId,
                            serverId: dbReminder.id,
                            status: "updated"
                        });
                        console.log(`[Mobile API] Updated reminder: ${serverId}`);
                    } catch (e) {
                        console.warn(`[Mobile API] Failed to update reminder ${serverId}, might be deleted?`);
                        // Fallback to create if update fails (e.g. wiped remotely)
                        dbReminder = await tx.reminder.create({
                            data: {
                                userId: user.id,
                                title,
                                description: description || null,
                                startDate: new Date(startDate),
                                endDate: new Date(endDate),
                                startTime: startTime || null,
                                endTime: endTime || null,
                                isFullDay,
                                priority,
                                markerColor: markerColor || "#ff7a00"
                            }
                        });
                        upsertedResults.push({
                            localId: localId,
                            serverId: dbReminder.id,
                            status: "created"
                        });
                    }
                } else {
                    // Complete new local record pushed upstream
                    dbReminder = await tx.reminder.create({
                        data: {
                            userId: user.id,
                            title,
                            description: description || null,
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                            startTime: startTime || null,
                            endTime: endTime || null,
                            isFullDay,
                            priority,
                            markerColor: markerColor || "#ff7a00"
                        }
                    });
                    
                    upsertedResults.push({
                        localId: localId,
                        serverId: dbReminder.id,
                        status: "created"
                    });
                    console.log(`[Mobile API] Created new reminder: ${dbReminder.id}`);
                }
            }

            // 2. Process Deletes
            for (const serverId of deletes) {
                try {
                    await tx.reminder.delete({
                        where: { id: serverId, userId: user.id }
                    });
                    console.log(`[Mobile API] Deleted reminder: ${serverId}`);
                } catch (e) {
                    // Ignore P2025 (Record to delete does not exist)
                    console.warn(`[Mobile API] Delete failed for ${serverId} (likely already deleted)`);
                }
            }
        });

        // Invalidate cache since we heavily modified the dataset
        if (upserts.length > 0 || deletes.length > 0) {
            await invalidateRemindersCache(user.id);
        }

        console.log("[Mobile API] /api/mobile/reminders/sync - Success");
        return NextResponse.json({
            success: true,
            upserted: upsertedResults,
            deletedCount: deletes.length
        });

    } catch (error) {
        console.error("[Mobile API] Sync error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
