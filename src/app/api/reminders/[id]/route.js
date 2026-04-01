/**
 * API Route: /api/reminders/[id]
 * 
 * Handles individual reminder operations (GET, PATCH, DELETE)
 */

import { NextResponse } from "next/server";
import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { getCachedUserByEmail } from "@/lib/dashboard-cache";
import { invalidateRemindersCache } from "@/lib/cache-invalidation";
import { getRateLimitErrorResponse, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/reminders/[id]
 * Fetch a specific reminder by ID
 */
export async function GET(request, { params }) {
    try {
        const session = await getUniversalSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getCachedUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { id } = await params;

        const reminder = await prisma.reminder.findUnique({
            where: { id },
        });

        if (!reminder || reminder.userId !== user.id) {
            return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
        }

        return NextResponse.json({ reminder });
    } catch (error) {
        console.error("GET /api/reminders/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reminder" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/reminders/[id]
 * Update a specific reminder
 */
export async function PATCH(request, { params }) {
    try {
        const session = await getUniversalSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getCachedUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check rate limit
        const rateLimitError = getRateLimitErrorResponse(user.id, "reminderUpdate", RATE_LIMITS.reminderUpdate);
        if (rateLimitError) return rateLimitError;

        const { id } = await params;
        const body = await request.json();

        // Verify ownership and existence
        const existing = await prisma.reminder.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
        }

        // Build update data with type safety
        const updateData = {};

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description || null;

        // Handle dates carefully
        if (body.startDate) {
            const startDate = new Date(body.startDate);
            if (!isNaN(startDate.getTime())) {
                updateData.startDate = startDate;
            }
        }

        if (body.endDate) {
            const endDate = new Date(body.endDate);
            if (!isNaN(endDate.getTime())) {
                updateData.endDate = endDate;
            }
        }

        if (body.startTime !== undefined) updateData.startTime = body.startTime || null;
        if (body.endTime !== undefined) updateData.endTime = body.endTime || null;
        if (body.isFullDay !== undefined) updateData.isFullDay = Boolean(body.isFullDay);
        if (body.markerType !== undefined) updateData.markerType = body.markerType;
        if (body.markerColor !== undefined) updateData.markerColor = body.markerColor;
        if (body.markerIcon !== undefined) updateData.markerIcon = body.markerIcon || null;
        if (body.priority !== undefined) updateData.priority = Number(body.priority);
        if (body.isImportant !== undefined) updateData.isImportant = Boolean(body.isImportant);
        if (body.enableNotifications !== undefined) updateData.enableNotifications = Boolean(body.enableNotifications);
        if (body.notifyOnStart !== undefined) updateData.notifyOnStart = Boolean(body.notifyOnStart);
        if (body.notifyDaily !== undefined) updateData.notifyDaily = Boolean(body.notifyDaily);
        if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

        // Update reminder using many-conditional check for safety
        const reminder = await prisma.reminder.update({
            where: { id },
            data: updateData,
        });

        await invalidateRemindersCache(user.id);
        return NextResponse.json({ reminder });
    } catch (error) {
        console.error("PATCH /api/reminders/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update reminder" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/reminders/[id]
 * Delete a specific reminder
 */
export async function DELETE(request, { params }) {
    try {
        const session = await getUniversalSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getCachedUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check rate limit
        const rateLimitError = getRateLimitErrorResponse(user.id, "reminderDelete", RATE_LIMITS.reminderDelete);
        if (rateLimitError) return rateLimitError;

        const { id } = await params;

        // Verify ownership
        const existing = await prisma.reminder.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
        }

        // Delete reminder
        await prisma.reminder.delete({
            where: { id },
        });

        await invalidateRemindersCache(user.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/reminders/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete reminder" },
            { status: 500 }
        );
    }
}
