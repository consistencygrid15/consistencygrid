/**
 * Sidebar Navigation Component
 * 
 * Primary navigation sidebar for authenticated users. Displays menu items,
 * user profile, and secondary actions (settings, help, logout).
 * 
 * Features:
 * - Active page highlighting
 * - User profile with avatar
 * - Settings and help links
 * - Logout functionality
 * - Responsive layout
 * - Smooth hover states
 * - Professional Lucide icons
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.active="Dashboard"] - Currently active page
 * @param {Function} [props.onNavigate] - Callback when navigation item is clicked (for mobile)
 */

"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Wand2,
  ListChecks,
  Target,
  Flame,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  RefreshCw
} from "lucide-react";
import { sendWallpaperToAndroid } from "@/utils/sendWallpaperToAndroid";

/**
 * Main navigation menu items
 * Ordered by priority and common usage patterns
 * Each item includes a Lucide icon component
 */
const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Generator", href: "/generator", icon: Wand2 },
  { label: "Habits", href: "/habits", icon: ListChecks },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Streaks", href: "/streaks", icon: Flame },
  { label: "Reminders", href: "/reminders", icon: Bell },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar({ active = "Dashboard", onNavigate }) {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Load user profile data on component mount
   * Fetches current user's name and email from API
   */
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/settings/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }
    loadUser();
  }, []);

  /**
   * Handle user logout
   * Signs out of NextAuth session and redirects to homepage
   */
  async function handleLogout() {
    // 1. Clear all auth-related localStorage items
    if (typeof window !== "undefined") {
      localStorage.removeItem('cg_auth_token');
      localStorage.removeItem('cg_session_active');
      localStorage.removeItem('cg_last_recovery_attempt');
      localStorage.removeItem('cg_last_user');

      // 2. Sync logout with Native Android App (if applicable)
      if (window.Android && window.Android.clearToken) {
        console.log("📱 Syncing logout with Android Native...");
        window.Android.clearToken();
      }
    }

    // 3. Sign out of NextAuth session
    await signOut({ callbackUrl: "/" });
  }

  /**
   * Handle navigation click (for mobile sidebar close)
   * Calls onNavigate callback if provided
   */
  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  /**
   * Handle manual wallpaper sync
   */
  const handleSyncWallpaper = async () => {
    if (!user?.publicToken) return;

    setIsSyncing(true);
    try {
      const wallpaperUrl = `${window.location.origin}/w/${user.publicToken}/image.png`;
      sendWallpaperToAndroid(wallpaperUrl);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      // Small timeout for visual feedback
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-[#fffaf1] sticky top-0">
      {/* 
        Logo / Brand Section
        Displays app logo and name
      */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-200/50">
        <img
          src="/images/logo.png"
          alt="ConsistencyGrid Logo"
          className="h-8 w-8"
        />
        <span className="text-sm font-bold text-gray-900">ConsistencyGrid</span>
      </div>

      {/* 
        Main Navigation Menu
        Scrollable list of navigation items
      */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Menu
        </p>

        <div className="space-y-0.5">
          {menu.map((item) => {
            const isActive = item.label === active;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-colors
                  ${isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-white/70 hover:text-gray-900"
                  }
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 
        Bottom Section
        Contains settings, help, logout, and user profile
      */}
      <div className="border-t border-gray-200 px-3 py-4">
        {/* Settings Link */}
        <Link
          href="/settings"
          onClick={handleNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white/70 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>

        {/* Sync Wallpaper (Android Only) */}
        {typeof window !== "undefined" && window.Android && (
          <button
            onClick={handleSyncWallpaper}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Wallpaper
          </button>
        )}

        {/* Help Link */}
        <Link
          href="/help"
          onClick={handleNavClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white/70 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          Help
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        {/* 
          User Profile Card
          Shows avatar, name, and email
        */}
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
          {/* Avatar with first initial */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
