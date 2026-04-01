/**
 * API Route: /api/reminders/range
 * 
 * Fetch reminders within a specific date range
 * Optimized for grid views (month/year/life)
 */

import { NextResponse } from "next/server";
import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { getCachedUserByEmail } from "@/lib/dashboard-cache";

/**
 * GET /api/reminders/range
 * Query params:
 * - start: Start date (YYYY-MM-DD)
 * - end: End date (YYYY-MM-DD)
 * 
 * Returns all reminders that overlap with the given date range
 */
export async function GET(request) {
    try {
        const session = await getUniversalSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getCachedUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            return NextResponse.json(
                { error: "Start and end dates are required" },
                { status: 400 }
            );
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Find reminders that overlap with the date range
        // A reminder overlaps if:
        // - It starts before or during the range AND
        // - It ends during or after the range
        const reminders = await prisma.reminder.findMany({
            where: {
                userId: user.id,
                isActive: true,
                AND: [
                    {
                        startDate: {
                            lte: endDate, // Starts before or during the range
                        },
                    },
                    {
                        endDate: {
                            gte: startDate, // Ends during or after the range
                        },
                    },
                ],
            },
            orderBy: [
                { startDate: "asc" },
                { priority: "desc" },
            ],
        });

        // Group reminders by date for easier grid rendering
        const remindersByDate = {};

        reminders.forEach((reminder) => {
            const start = new Date(reminder.startDate);
            const end = new Date(reminder.endDate);

            // Generate all dates in the reminder's range
            const current = new Date(start);
            while (current <= end) {
                const dateKey = current.toISOString().split("T")[0];

                if (!remindersByDate[dateKey]) {
                    remindersByDate[dateKey] = [];
                }

                remindersByDate[dateKey].push({
                    id: reminder.id,
                    title: reminder.title,
                    description: reminder.description,
                    startTime: reminder.startTime,
                    endTime: reminder.endTime,
                    isFullDay: reminder.isFullDay,
                    markerType: reminder.markerType,
                    markerColor: reminder.markerColor,
                    markerIcon: reminder.markerIcon,
                    priority: reminder.priority,
                    isImportant: reminder.isImportant,
                });

                current.setDate(current.getDate() + 1);
            }
        });

        return NextResponse.json(
            {
                reminders,
                remindersByDate,
                count: reminders.length,
            },
            {
                headers: {
                    // Reminders don't change frequently — cache for 2 minutes
                    "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
                },
            }
        );
    } catch (error) {
        console.error("GET /api/reminders/range error:", error);
        return NextResponse.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
        );
    }
}
