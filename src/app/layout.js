import "./globals.css";
import Providers from "./providers";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "ConsistencyGrid - Your Life in Weeks as Your Wallpaper",
    template: "%s | ConsistencyGrid",
  },
  description: "Generate a personalized calendar wallpaper showing your life progress. Auto-updates daily so every morning reminds you to make today count.",
  keywords: ["life calendar", "wallpaper generator", "habit tracker", "productivity", "life visualization", "weekly calendar", "motivation"],
  authors: [{ name: "ConsistencyGrid" }],
  creator: "ConsistencyGrid",
  publisher: "ConsistencyGrid",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://consistencygrid.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "ConsistencyGrid",
    title: "ConsistencyGrid - Your Life in Weeks as Your Wallpaper",
    description: "Generate a personalized calendar wallpaper showing your life progress. Auto-updates daily so every morning reminds you to make today count.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ConsistencyGrid - Life Calendar Wallpaper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConsistencyGrid - Your Life in Weeks as Your Wallpaper",
    description: "Generate a personalized calendar wallpaper showing your life progress. Auto-updates daily.",
    images: ["/og-image.png"],
    creator: "@consistencygrid",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Consistency Grid',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-BM20YDN1N9";

  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        />
        
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `,
          }}
        />
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vvlxjruzh6");
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
