"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function TopHeader() {
  const { data, isLoading } = useSWR("/api/settings/me", fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: false,
    dedupingInterval: 60 * 1000,
  });

  const loading = isLoading;
  const user = data?.user;
  const wallpaperUrl = user?.publicToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/w/${user.publicToken}/image.png`
    : "";


  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center md:justify-between animate-fade-in">
      {/* Left */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {loading ? (
            <span className="inline-block h-6 w-48 animate-pulse rounded bg-gray-200" />
          ) : (
            `Welcome back, ${user?.name || "User"}!`
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your life calendar and habits
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/generator">
          <Button variant="secondary">Open Generator</Button>
        </Link>

        {wallpaperUrl && (
          <>
            <a href={wallpaperUrl} download="consistencygrid-wallpaper.png">
              <Button variant="primary">Download</Button>
            </a>

            <CopyButton text={wallpaperUrl} label="Copy URL" />
          </>
        )}
      </div>
    </header>
  );
}

