import prisma from "@/lib/prisma";

/**
 * Session Recovery API
 * 
 * Takes a publicToken and returns the user's basic info if valid.
 * Used by the WebView to re-establish sessions when cookies are lost.
 */
export async function POST(req) {
    try {
        const { token } = await req.json();

        if (!token) {
            return Response.json({ success: false, error: "Token missing" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { publicToken: token },
            select: {
                id: true,
                email: true,
                name: true,
                onboarded: true
            }
        });

        if (!user) {
            return Response.json({ success: false, error: "Invalid token" }, { status: 404 });
        }

        // Return success - the client will use this to trigger a session re-sync
        return Response.json({
            success: true,
            user: {
                email: user.email,
                name: user.name,
            }
        });

    } catch (error) {
        console.error("Recovery API Error:", error);
        return Response.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
