import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Health Check API
 * Used by monitoring services to ensure app and DB are running
 */
export async function GET() {
    const stats = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: process.env.NODE_ENV,
        database: "unknown",
    };

    try {
        // Basic database connectivity check
        await prisma.$queryRaw`SELECT 1`;
        stats.database = "connected";
    } catch (error) {
        console.error("[HEALTH] Database connection failed:", error);
        stats.status = "degraded";
        stats.database = "disconnected";
        stats.error = error.message;

        return NextResponse.json(stats, { status: 503 });
    }

    return NextResponse.json(stats);
}
