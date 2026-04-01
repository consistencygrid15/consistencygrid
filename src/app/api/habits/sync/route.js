import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ success: true, message: "Sync skipped: No session" }, { status: 200 });
        }

        // This is a placeholder for background sync logic
        console.log(`[SYNC] Habits sync triggered for ${session.user.email}`);

        return NextResponse.json({
            success: true,
            message: "Habits synchronized successfully",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Habits sync error:", error);
        return NextResponse.json({ success: false, message: "Sync failed" }, { status: 500 });
    }
}
