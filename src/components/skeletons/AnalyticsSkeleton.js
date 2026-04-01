import Skeleton from "@/components/ui/Skeleton";

/**
 * AnalyticsSkeleton Component
 * 
 * High-fidelity skeleton for the Analytics page.
 * Mimics the charts, stats cards, and heatmap layout.
 */
export default function AnalyticsSkeleton() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 rounded" />
                    <Skeleton className="h-3 w-32 rounded mt-2" />
                </div>
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>

            {/* Stat Cards Skeleton (3 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                                <Skeleton className="h-3 w-32 rounded" />
                                <Skeleton className="h-10 w-20 rounded" />
                                <Skeleton className="h-3 w-40 rounded" />
                            </div>
                            <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Consistency Over Time Chart Card Skeleton */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <Skeleton className="h-6 w-48 rounded mb-2" />
                <Skeleton className="h-4 w-72 rounded mb-8" />

                {/* Chart Area Simulation */}
                <div className="h-[300px] w-full flex items-end gap-2 pb-6 border-b border-l border-gray-100">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="flex-1 bg-gray-50 flex items-end justify-center rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }}>
                            <div className="w-[40%] bg-gray-100/50 rounded-t-sm" style={{ height: '100%' }} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4">
                    <Skeleton className="h-2 w-8 rounded" />
                    <Skeleton className="h-2 w-8 rounded" />
                    <Skeleton className="h-2 w-8 rounded" />
                </div>
            </div>

            {/* Heatmap and Category Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Habit Heatmap (2 columns) */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm h-full">
                        <Skeleton className="h-6 w-32 rounded mb-8" />

                        {/* Heatmap Grid Simulation */}
                        <div className="space-y-1">
                            {Array.from({ length: 12 }).map((_, r) => (
                                <div key={r} className="flex gap-1">
                                    {Array.from({ length: 7 }).map((_, c) => (
                                        <Skeleton key={c} className="h-5 w-5 rounded-sm opacity-[0.4]" />
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <Skeleton className="h-2 w-8 rounded" />
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-3 w-3 rounded-sm" />)}
                            </div>
                            <Skeleton className="h-2 w-8 rounded" />
                        </div>
                    </div>
                </div>

                {/* Category Distribution (1 column) */}
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                    <Skeleton className="h-6 w-48 rounded mb-8" />

                    {/* Donut Chart Simulation */}
                    <div className="relative flex items-center justify-center mb-8">
                        <div className="h-40 w-40 rounded-full border-[12px] border-gray-50 flex items-center justify-center">
                            <div className="h-20 w-20 rounded-full border-[10px] border-gray-100/30" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-3 rounded-full" />
                                    <Skeleton className="h-3 w-20 rounded" />
                                </div>
                                <Skeleton className="h-3 w-8 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
