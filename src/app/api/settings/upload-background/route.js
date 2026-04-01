import { getUniversalSession } from "@/lib/getAndroidAuth";
import prisma from "@/lib/prisma";
import { invalidateSettingsCache } from "@/lib/cache-invalidation";

// Max 5MB image size
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req) {
    const session = await getUniversalSession();
    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!dbUser) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Premium check — only paid plan users can upload custom backgrounds
    const isPremium = dbUser.plan && dbUser.plan !== 'free';
    if (!isPremium) {
        return Response.json(
            { message: "Custom backgrounds are not available on your current plan." },
            { status: 403 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("image");

        if (!file || typeof file === "string") {
            return Response.json({ message: "No image file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return Response.json({ message: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_SIZE_BYTES) {
            return Response.json({ message: "Image must be under 5MB" }, { status: 400 });
        }

        // Convert to base64 data URL for storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        // Save to DB
        await prisma.wallpaperSettings.upsert({
            where: { userId: dbUser.id },
            update: { customBackgroundUrl: dataUrl },
            create: {
                userId: dbUser.id,
                dob: new Date("2000-01-01"), // Placeholder, user must set real DOB
                customBackgroundUrl: dataUrl,
            },
        });

        await invalidateSettingsCache(dbUser.id);

        return Response.json({ message: "Background uploaded successfully", url: dataUrl }, { status: 200 });
    } catch (err) {
        console.error("[upload-background] Error:", err);
        return Response.json({ message: "Upload failed", error: err.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    const session = await getUniversalSession();
    if (!session?.user?.email) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!dbUser) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.wallpaperSettings.updateMany({
        where: { userId: dbUser.id },
        data: { customBackgroundUrl: null },
    });

    await invalidateSettingsCache(dbUser.id);
    return Response.json({ message: "Background removed" }, { status: 200 });
}
