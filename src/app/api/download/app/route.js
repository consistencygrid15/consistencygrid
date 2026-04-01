import fs from 'fs';
import path from 'path';

/**
 * GET /api/download/app
 *
 * Serves the Android APK file for direct download.
 * The APK must be placed at: /public/ConsistencyGrid.apk
 * This works on any server (local, Netlify, Vercel, VPS).
 */
export async function GET() {
  try {
    // Resolve path relative to project root → public/ConsistencyGrid.apk
    const apkPath = path.join(process.cwd(), 'public', 'ConsistencyGrid.apk');

    if (!fs.existsSync(apkPath)) {
      console.error('[Download API] APK not found at:', apkPath);
      return Response.json(
        { error: 'App installer not available yet. Please check back soon.' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(apkPath);
    const stat = fs.statSync(apkPath);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="ConsistencyGrid.apk"',
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'no-store', // always serve the latest APK
      },
    });
  } catch (error) {
    console.error('[Download API] Error serving APK:', error);
    return Response.json({ error: 'Internal Server Error during download.' }, { status: 500 });
  }
}
