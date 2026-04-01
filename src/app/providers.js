"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AnalyticsProvider } from "./analytics-provider";
import PWAInitializer from "@/components/common/PWAInitializer";
import SessionPersistence from "@/components/auth/SessionPersistence";

export default function Providers({ children }) {
  return (
    <ErrorBoundary>
      <SessionProvider
        refetchInterval={24 * 60 * 60}
        refetchOnWindowFocus={true}
      >
        <SessionPersistence />
        <Suspense fallback={null}>
          <AnalyticsProvider>
            <PWAInitializer />
            {children}
          </AnalyticsProvider>
        </Suspense>
      </SessionProvider>
    </ErrorBoundary>
  );
}
