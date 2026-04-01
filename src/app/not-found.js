import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf1] to-white">
      <Navbar rightLinkText="Log in" rightLinkHref="/login" />
      
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-4 text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-all"
            >
              Go Home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
