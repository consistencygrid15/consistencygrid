import Skeleton from "@/components/ui/Skeleton";

/**
 * GoalSkeleton Component
 * 
 * High-fidelity skeleton for the Goals page.
 */
export default function GoalSkeleton() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-80 rounded" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
            </div>

            {/* Main Momentum Card Skeleton */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Circular Progress Placeholder */}
                    <div className="h-32 w-32 rounded-full border-[12px] border-gray-50 flex items-center justify-center">
                        <Skeleton className="h-12 w-12 rounded" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-48 rounded" />
                        <Skeleton className="h-4 w-[90%] rounded" />

                        <div className="flex gap-3 pt-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    </div>

                    <Skeleton className="h-11 w-44 rounded-lg" />
                </div>
            </div>

            {/* Analytics Cards Grid (4 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <Skeleton className="h-3 w-20 rounded mb-3" />
                        <Skeleton className="h-8 w-12 rounded mb-2" />
                        <Skeleton className="h-3 w-32 rounded" />
                    </div>
                ))}
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Active Goals Column */}
                <div className="lg:col-span-8 space-y-6">
                    <Skeleton className="h-6 w-32 rounded" />

                    {/* Goal Cards simulation */}
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex justify-between mb-4">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-48 rounded" />
                                        <Skeleton className="h-3 w-72 rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-2 w-12 rounded" />
                                        <Skeleton className="h-2 w-8 rounded" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            </div>
                        ))}

                        {/* Add placeholder */}
                        <div className="h-32 w-full border-2 border-dashed border-gray-50 rounded-2xl flex flex-col items-center justify-center">
                            <Skeleton className="h-10 w-10 rounded-full mb-3" />
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                    </div>
                </div>

                {/* Milestones Column */}
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-6 w-40 rounded" />

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32 rounded" />
                                    <Skeleton className="h-3 w-48 rounded opacity-60" />
                                </div>
                            </div>
                        ))}
                        <Skeleton className="h-9 w-full rounded-lg mt-4" />
                    </div>

                    {/* Velocity Card */}
                    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-16 rounded" />
                            <Skeleton className="h-3 w-32 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
