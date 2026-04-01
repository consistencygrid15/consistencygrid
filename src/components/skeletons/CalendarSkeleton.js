import Skeleton from "@/components/ui/Skeleton";

/**
 * CalendarSkeleton Component
 * 
 * High-fidelity skeleton for the Calendar page.
 */
export default function CalendarSkeleton() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-9 w-48 rounded-lg mb-2" />
                <Skeleton className="h-4 w-64 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Calendar Column */}
                <div className="lg:col-span-2">
                    {/* Month Navigation Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2 text-center">
                                <Skeleton className="h-7 w-32 rounded mx-auto" />
                                <Skeleton className="h-4 w-12 rounded mx-auto" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-lg" />
                        </div>
                    </div>

                    {/* Calendar Grid Simulation */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm overflow-hidden">
                        {/* Days of week header */}
                        <div className="grid grid-cols-7 gap-px border-b border-gray-100">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="py-2 flex justify-center">
                                    <Skeleton className="h-3 w-8 rounded opacity-40" />
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-px">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="h-24 sm:h-32 border border-gray-50/50 p-2">
                                    <Skeleton className="h-4 w-4 rounded mb-2" />
                                    {/* Random reminder placeholder */}
                                    {i % 7 === 2 && <Skeleton className="h-4 w-[80%] rounded-sm mt-2 opacity-30" />}
                                    {i % 7 === 5 && <Skeleton className="h-4 w-[60%] rounded-sm mt-2 opacity-30" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Quick Add Skeleton */}
                    <div className="rounded-2xl bg-orange-500/10 border border-orange-100 p-6 h-44">
                        <Skeleton className="h-6 w-24 rounded mb-2 bg-orange-200" />
                        <Skeleton className="h-3 w-40 rounded mb-6 opacity-60" />
                        <Skeleton className="h-12 w-full rounded-lg bg-orange-100" />
                    </div>

                    {/* Upcoming Reminders Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <Skeleton className="h-6 w-32 rounded mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-[70%] rounded" />
                                        <Skeleton className="h-3 w-[40%] rounded opacity-60" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Card Skeleton */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <Skeleton className="h-6 w-32 rounded mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-3 w-24 rounded opacity-60" />
                                    <Skeleton className="h-5 w-8 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
