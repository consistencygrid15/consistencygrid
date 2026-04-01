// Analytics Provider for tracking page views
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/analytics";

function AnalyticsTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = `${pathname}?${searchParams}`;
        pageview(url);
    }, [pathname, searchParams]);

    return null;
}

export function AnalyticsProvider({ children }) {
    return (
        <>
            <AnalyticsTracking />
            {children}
        </>
    );
}
