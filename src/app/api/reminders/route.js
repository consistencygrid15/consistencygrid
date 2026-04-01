/**
 * API Route: /api/reminders
 * 
 * Handles CRUD operations for the intelligent reminder system.
 * Supports flexible duration, visual markers, and grid integration.
 */

import { NextResponse } from "next/server";
import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { getCachedUserByEmail } from "@/lib/dashboard-cache";
import { invalidateRemindersCache } from "@/lib/cache-invalidation";
import { getRateLimitErrorResponse, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * GET /api/reminders
 * Fetch all reminders for the authenticated user
 * Optional query params:
 * - startDate: Filter reminders starting from this date
 * - endDate: Filter reminders ending before this date
 * - active: Filter by active status (true/false)
 */
export async function GET(request) {
    try {
        const session = await getUniversalSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user
        const user = await getCachedUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const active = searchParams.get("active");

        // Build filter
        const where = {
            userId: user.id,
        };

        if (active !== null && active !== undefined) {
            where.isActive = active === "true";
        }

        if (startDate) {
            where.startDate = {
                gte: new Date(startDate),
            };
        }

        if (endDate) {
            where.endDate = {
                lte: new Date(endDate),
            };
        }

        // Fetch reminders
        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: [
                { startDate: "asc" },
                { priority: "desc" },
            ],
        });

        return NextResponse.json({ reminders });
    } catch (error) {
        console.error("GET /api/reminders error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reminders
 * Create a new reminder
 */
export async function POST(request) {
    try {
        const session = await getUniversalSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cached user lookup — avoids an uncached DB hit on every create
        const user = await getCachedUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check rate limit
        const rateLimitError = getRateLimitErrorResponse(user.id, "reminderCreate", RATE_LIMITS.reminderCreate);
        if (rateLimitError) return rateLimitError;

        const body = await request.json();

        // Validate required fields
        if (!body.title || !body.startDate) {
            return NextResponse.json(
                { error: "Title and start date are required" },
                { status: 400 }
            );
        }

        // Create reminder
        const reminder = await prisma.reminder.create({
            data: {
                userId: user.id,
                title: body.title,
                description: body.description || null,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
                startTime: body.startTime || null,
                endTime: body.endTime || null,
                isFullDay: body.isFullDay !== undefined ? body.isFullDay : true,
                markerType: body.markerType || "dot",
                markerColor: body.markerColor || "#ff7a00",
                markerIcon: body.markerIcon || null,
                priority: body.priority || 1,
                isImportant: body.isImportant || false,
                enableNotifications: body.enableNotifications !== undefined ? body.enableNotifications : true,
                notifyOnStart: body.notifyOnStart !== undefined ? body.notifyOnStart : true,
                notifyDaily: body.notifyDaily || false,
                isRecurring: body.isRecurring || false,
                recurrenceRule: body.recurrenceRule || null,
            },
        });

        await invalidateRemindersCache(user.id);
        return NextResponse.json({ reminder }, { status: 201 });
    } catch (error) {
        console.error("POST /api/reminders error:", error);
        return NextResponse.json(
            { error: "Failed to create reminder" },
            { status: 500 }
        );
    }
}
