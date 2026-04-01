/**
 * Navbar Component
 * 
 * Reusable navigation bar for public pages (landing, login, signup).
 * Displays the ConsistencyGrid logo and a configurable action button.
 * 
 * Features:
 * - Responsive layout with logo and action button
 * - Customizable right-side button (login/signup toggle)
 * - Consistent branding with orange accent color
 * - Mobile-optimized spacing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.rightLinkText="Log in"] - Text for the action button
 * @param {string} [props.rightLinkHref="/login"] - URL for the action button
 * 
 * @example
 * // On landing page (show login button)
 * <Navbar rightLinkText="Log in" rightLinkHref="/login" />
 * 
 * @example
 * // On login page (show signup button)
 * <Navbar rightLinkText="Sign up" rightLinkHref="/signup" />
 */

import Link from "next/link";

export default function Navbar({
  rightLinkText = "Log in",
  rightLinkHref = "/login",
}) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
      {/* 
        Logo / Brand
        Links to homepage, includes icon and text
        Responsive: hides text on very small screens if needed
      */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {/* Logo Icon */}
        <img 
          src="/images/logo.png" 
          alt="ConsistencyGrid Logo" 
          className="h-7 w-7 sm:h-8 sm:w-8"
        />

        {/* Brand Name */}
        <span className="text-sm sm:text-base font-semibold text-gray-900">
          ConsistencyGrid
        </span>
      </Link>

      {/* 
        Navigation Links
        Right-aligned links for login/signup
      */}
      <div className="flex flex-row items-center gap-3">
        <Link
          href={rightLinkHref}
          className="rounded-lg bg-orange-500 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
        >
          {rightLinkText}
        </Link>
      </div>
    </header>
  );
}
