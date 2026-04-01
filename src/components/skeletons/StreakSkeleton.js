import Skeleton from "@/components/ui/Skeleton";

/**
 * StreakSkeleton Component
 * 
 * Provides a high-fidelity skeleton loading state for the 
 * Streaks page, matching the exact layout of stats and heatmap.
 */
export default function StreakSkeleton() {
    return (
        <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-8 w-32 rounded-lg mb-2" />
                <Skeleton className="h-4 w-64 rounded" />
            </div>

            {/* Streak Stats Skeleton */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 rounded" />
                                <Skeleton className="h-8 w-12 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Streak Heatmap Card Skeleton */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <Skeleton className="h-6 w-48 rounded mb-2" />
                <Skeleton className="h-4 w-72 rounded mb-6" />

                {/* View Mode Toggle Simulation */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-8 w-24 rounded" />
                </div>

                {/* Heatmap Grid Simulation */}
                <div className="overflow-hidden">
                    {/* Month Labels */}
                    <div className="ml-12 flex gap-4 mb-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-3 w-12 rounded" />
                        ))}
                    </div>

                    <div className="flex gap-1">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <Skeleton key={i} className="h-10 w-10 rounded" />
                            ))}
                        </div>

                        {/* Heatmap Cells - Grid of squares */}
                        <div className="flex-1 flex gap-1 overflow-hidden">
                            {Array.from({ length: 15 }).map((_, w) => (
                                <div key={w} className="flex flex-col gap-1">
                                    {Array.from({ length: 7 }).map((_, d) => (
                                        <Skeleton key={d} className="h-10 w-10 rounded" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Milestones Card Skeleton */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <Skeleton className="h-6 w-32 rounded mb-2" />
                <Skeleton className="h-4 w-80 rounded mb-8" />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-xl border border-gray-100 p-4 flex flex-col items-center">
                            <Skeleton className="h-12 w-12 rounded-full mb-3" />
                            <Skeleton className="h-3 w-20 rounded mb-2" />
                            <Skeleton className="h-3 w-24 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
