import Skeleton from "@/components/ui/Skeleton";

/**
 * ReminderSkeleton Component
 * 
 * High-fidelity skeleton for the Reminders page.
 */
export default function ReminderSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-80 rounded" />
                    </div>
                    <Skeleton className="h-12 w-44 rounded-xl" />
                </div>

                {/* Stats Cards (3 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl p-4 flex justify-between items-center h-24 bg-gray-50 border border-gray-100">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16 rounded opacity-40" />
                                <Skeleton className="h-8 w-10 rounded" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-lg opacity-20" />
                        </div>
                    ))}
                </div>

                {/* Filter Tabs simulation */}
                <div className="flex gap-4 border-b border-gray-100 mb-6">
                    <div className="pb-2 border-b-2 border-orange-200">
                        <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <div className="pb-2">
                        <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <div className="pb-2">
                        <Skeleton className="h-4 w-16 rounded" />
                    </div>
                </div>
            </div>

            {/* Reminder List Container Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-50">
                            {/* Icon Circle */}
                            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-[40%] rounded" />
                                    <Skeleton className="h-3 w-20 rounded" />
                                </div>
                                <Skeleton className="h-3 w-[25%] rounded" />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Card Simulation */}
            <div className="mt-8 bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-48 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-[80%] rounded" />
                    <Skeleton className="h-4 w-32 rounded mt-2" />
                </div>
            </div>
        </div>
    );
}
