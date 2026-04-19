import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/mobile/reel-controller?token=<JWT>
 *
 * Returns the user's saved reel controller config:
 *  - Global toggles (isFeatureEnabled, isBlockModeEnabled, isHardBlockEnabled)
 *  - Per-app limits (reelLimit, timeLimit, isEnabled) for each tracked package
 *
 * If the user has never saved a config, returns success=false so the Android
 * app knows to keep its existing local defaults.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return Response.json({ success: false, error: "Token required" }, { status: 400 });
        }

        // Resolve user by publicToken (same auth pattern as wallpaper-data)
        const user = await prisma.user.findUnique({
            where: { publicToken: token },
            select: { id: true },
        });

        if (!user) {
            return Response.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // Fetch the reel controller config including per-app settings
        const reelController = await prisma.reelController.findUnique({
            where: { userId: user.id },
            include: {
                appSettings: {
                    select: {
                        pkg: true,
                        reelLimit: true,
                        timeLimit: true,
                        isEnabled: true,
                    },
                },
            },
        });

        if (!reelController) {
            // User has no saved config yet — Android will use its local defaults
            return Response.json({ success: false, reason: "no_config" }, { status: 200 });
        }

        return Response.json({
            success: true,
            data: {
                isFeatureEnabled:   reelController.isFeatureEnabled,
                isBlockModeEnabled: reelController.isBlockModeEnabled,
                isHardBlockEnabled: reelController.isHardBlockEnabled,
                apps: reelController.appSettings,
            },
        });

    } catch (e) {
        console.error("[reel-controller GET]", e);
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
