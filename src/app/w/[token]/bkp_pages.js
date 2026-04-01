import prisma from "@/lib/prisma";
import PublicWallpaperClient from "./PublicWallpaperClient";

export default async function PublicWallpaperPage({ params }) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { publicToken: token },
    include: { settings: true },
  });

  // ENHANCED ERROR STATE - Better visual feedback and clearer instructions
  if (!user || !user.settings) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          {/* CHANGED: Added icon and better visual hierarchy */}
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold">Wallpaper Not Ready</h1>

          <p className="text-base text-gray-400 leading-relaxed">
            Please open the wallpaper generator and save your settings first to generate your personalized wallpaper.
          </p>

          {/* CHANGED: Added helpful action hint */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-300">
              💡 <b>Next Step:</b> Configure your preferences in the generator to create your custom wallpaper.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const s = user.settings;

  // CHANGED: Calculate additional stats for better preview info
  const birthDate = new Date(s.dob);
  const currentDate = new Date();
  const ageYears = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  const lifeProgress = ((ageYears / s.lifeExpectancyYears) * 100).toFixed(1);

  return (
    <PublicWallpaperClient 
      token={token}
      settings={s}
      ageYears={ageYears}
      lifeProgress={lifeProgress}
    />
  );
}