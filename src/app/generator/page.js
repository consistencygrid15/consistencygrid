"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { sendWallpaperToAndroid } from "@/utils/sendWallpaperToAndroid";

import DashboardLayout from "@/components/layout/DashboardLayout";
import GeneratorForm from "@/components/generator/GeneratorForm";
import GeneratorPreview from "@/components/generator/GeneratorPreview";
import GeneratorSkeleton from "@/components/skeletons/GeneratorSkeleton";

// Metadata for SEO (Note: In Next.js App Router, client components can't export metadata directly)
// This is handled via the layout.js file

export default function GeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [publicToken, setPublicToken] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // Bumped to force preview reload

  const [form, setForm] = useState({
    dob: "",
    lifeExpectancyYears: 80,
    theme: "dark-minimal",
    width: 1080,
    height: 2340,

    yearGridMode: "weeks",
    wallpaperType: "lockscreen",

    showLifeGrid: true,
    showYearGrid: true,
    showAgeStats: true,

    showMissedDays: false,
    showHabitLayer: true,
    showLegend: false,

    showQuote: true,
    quote: "Make every week count.",

    goalEnabled: false,
    goalTitle: "",
    goalStartDate: "",
    goalDurationDays: 30,
    goalUnit: "day",

    customBackgroundUrl: "",
  });

  // Load settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/me");
      const data = await res.json();

      if (data?.user) {
        setPublicToken(data.user.publicToken || "");
        setIsPremium(data.user.isPremium === true);

        // Android Bridge: Save token for background workers
        if (window.Android && window.Android.saveToken) {
          window.Android.saveToken(data.user.publicToken);
        }
      }

      if (data?.settings) {
        const s = data.settings;
        setForm((prev) => ({
          ...prev,
          dob: s.dob ? s.dob.split("T")[0] : "",
          lifeExpectancyYears: s.lifeExpectancyYears ?? 80,
          theme: s.theme ?? "dark-minimal",
          width: s.width ?? 1080,
          height: s.height ?? 2340,

          yearGridMode: s.yearGridMode ?? "weeks",
          wallpaperType: s.wallpaperType ?? "lockscreen",

          showLifeGrid: s.showLifeGrid ?? true,
          showYearGrid: s.showYearGrid ?? true,
          showAgeStats: s.showAgeStats ?? true,

          showMissedDays: s.showMissedDays ?? false,
          showHabitLayer: s.showHabitLayer ?? true,
          showLegend: s.showLegend ?? false,

          showQuote: s.showQuote ?? false,
          quote: s.quote ?? "",

          goalEnabled: s.goalEnabled ?? false,
          goalTitle: s.goalTitle ?? "",
          goalStartDate: s.goalStartDate
            ? s.goalStartDate.split("T")[0]
            : "",
          goalDurationDays: s.goalDurationDays ?? 30,
          goalUnit: s.goalUnit ?? "day",

          customBackgroundUrl: s.customBackgroundUrl ?? "",
        }));
      }
    } catch (err) {
      // console.log("Load settings error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    if (!form.dob) {
      toast.error("Please select your Date of Birth");
      return;
    }

    try {
      const res = await fetch("/api/settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to save");
      }

      toast.success("Settings saved! Wallpaper updated.");

      // Android Bridge: Send new wallpaper URL to native app
      if (publicToken) {
        const wallpaperUrl = `${window.location.origin}/w/${publicToken}/image.png`;
        sendWallpaperToAndroid(wallpaperUrl);
      }

      // Reload token if it was just created (edge case)
      if (!publicToken) {
        fetchSettings();
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    }
  }

  if (loading) {
    return (
      <DashboardLayout active="Generator">
        <div className="py-4 sm:py-8">
          <GeneratorSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Generator">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Wallpaper Generator</h1>
          </div>
          <p className="text-gray-500 text-sm ml-8">Customize and generate your life calendar wallpaper</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Form (7 cols) */}
          <div className="lg:col-span-7">
            <GeneratorForm
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onBgUploaded={() => setPreviewKey(k => k + 1)}
              isPremium={isPremium}
            />
          </div>

          {/* Right: Preview (5 cols) */}
          <div className="lg:col-span-5">
            <GeneratorPreview
              publicToken={publicToken}
              loading={loading}
              form={form}
              onReset={fetchSettings}
              previewKey={previewKey}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}




