import prisma from "@/lib/prisma";

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
        const logs = body.logs || []; // Expecting [{ habitId: "abc", date: "2026-04-07", done: true }, ...]

        if (!Array.isArray(logs) || logs.length === 0) {
            return new Response(JSON.stringify({ message: "No logs provided", success: true }), { status: 200 });
        }

        const results = [];
        for (const log of logs) {
            const { habitId, date, done } = log;
            
            // Validate incoming payload
            if (!habitId || !date || done === undefined) continue;

            const existingLog = await prisma.habitLog.findFirst({
                where: {
                    userId: user.id,
                    habitId: habitId,
                    date: new Date(date)
                }
            });

            if (existingLog) {
                // Update
                await prisma.habitLog.update({
                    where: { id: existingLog.id },
                    data: { done: done }
                });
            } else {
                // Create
                await prisma.habitLog.create({
                    data: {
                        userId: user.id,
                        habitId: habitId,
                        date: new Date(date),
                        done: done
                    }
                });
            }
            results.push({ habitId, date, status: "synced" });
        }

        return new Response(JSON.stringify({ success: true, count: results.length, synced: results }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("[mobile-tick-api]", e);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
