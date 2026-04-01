import { getUniversalSession } from "@/lib/getAndroidAuth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

import { generateMetadata, structuredData as globalStructuredData } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "ConsistencyGrid - Your Life in Weeks as Your Wallpaper",
  description: "Generate a personalized calendar wallpaper showing your life progress. Auto-updates daily so every morning reminds you to make today count.",
  url: "https://consistencygrid.com"
});

/**
 * Landing Page (Server Side)
 * 
 * Handles authentication redirection before rendering the landing page content.
 * If the user is logged in and onboarded, they are instantly redirected to the dashboard.
 * Works for both web users (NextAuth) and Android app users (publicToken).
 */
export default async function Home() {
  const session = await getUniversalSession();

  if (session?.user?.onboarded) {
    redirect("/dashboard");
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ConsistencyGrid",
    "description": "Generate a personalized calendar wallpaper showing your life progress. Auto-updates daily so every morning reminds you to make today count.",
    "url": "https://consistencygrid.com",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
