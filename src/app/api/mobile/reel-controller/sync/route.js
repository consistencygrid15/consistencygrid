import prisma from "@/lib/prisma";

/**
 * POST /api/mobile/reel-controller/sync?token=<JWT>
 *
 * Body:
 * {
 *   isFeatureEnabled:   boolean,
 *   isBlockModeEnabled: boolean,
 *   isHardBlockEnabled: boolean,
 *   apps: [
 *     { pkg: string, reelLimit: number, timeLimit: number, isEnabled: boolean },
 *     ...
 *   ]
 * }
 *
 * Upserts the ReelController global config and all per-app settings.
 * Uses Prisma upsert so first-time sync creates, subsequent syncs update.
 */
export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return Response.json({ success: false, error: "Token required" }, { status: 400 });
        }

        // Resolve user by publicToken
        const user = await prisma.user.findUnique({
            where: { publicToken: token },
            select: { id: true },
        });

        if (!user) {
            return Response.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const {
            isFeatureEnabled   = true,
            isBlockModeEnabled = false,
            isHardBlockEnabled = false,
            apps = [],
        } = body;

        // Upsert the global ReelController row (create on first sync, update on subsequent)
        const reelController = await prisma.reelController.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                isFeatureEnabled,
                isBlockModeEnabled,
                isHardBlockEnabled,
            },
            update: {
                isFeatureEnabled,
                isBlockModeEnabled,
                isHardBlockEnabled,
            },
        });

        // Upsert per-app settings
        // For each app in the payload, upsert its row using the unique (reelControllerId, pkg) key
        const appUpsertResults = [];
        for (const app of apps) {
            const { pkg, reelLimit = 30, timeLimit = 20, isEnabled = true } = app;
            if (!pkg) continue;

            const record = await prisma.reelAppSetting.upsert({
                where: {
                    reelControllerId_pkg: {
                        reelControllerId: reelController.id,
                        pkg,
                    },
                },
                create: {
                    reelControllerId: reelController.id,
                    pkg,
                    reelLimit,
                    timeLimit,
                    isEnabled,
                },
                update: {
                    reelLimit,
                    timeLimit,
                    isEnabled,
                },
            });

            appUpsertResults.push({ pkg: record.pkg, status: "synced" });
        }

        console.log(
            `[reel-controller sync] User ${user.id}: global updated, ${appUpsertResults.length} apps synced`
        );

        return Response.json({
            success: true,
            synced: appUpsertResults.length,
        });

    } catch (e) {
        console.error("[reel-controller sync POST]", e);
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
