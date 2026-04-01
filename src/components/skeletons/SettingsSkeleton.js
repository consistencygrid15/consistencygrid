import Skeleton from "@/components/ui/Skeleton";

/**
 * SettingsSkeleton Component
 * 
 * High-fidelity skeleton for the Settings page.
 */
export default function SettingsSkeleton() {
    return (
        <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-8 w-32 rounded-lg mb-2" />
                <Skeleton className="h-4 w-64 rounded" />
            </div>

            {/* Tabs Skeleton */}
            <div className="border-b border-gray-100">
                <div className="flex space-x-4">
                    <div className="pb-3 border-b-2 border-orange-200">
                        <Skeleton className="h-4 w-16 rounded" />
                    </div>
                    <div className="pb-3">
                        <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <div className="pb-3">
                        <Skeleton className="h-4 w-20 rounded" />
                    </div>
                    <div className="pb-3">
                        <Skeleton className="h-4 w-24 rounded" />
                    </div>
                </div>
            </div>

            {/* Main Content Area (Mimicking Profile Tab) */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-24 rounded" />
                        <Skeleton className="h-3 w-40 rounded opacity-60" />
                    </div>

                    <div className="space-y-4 pt-4">
                        {/* Form fields */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-3 w-16 rounded opacity-40" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                {i === 2 || i === 3 ? <Skeleton className="h-2 w-48 rounded opacity-30 mt-1" /> : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Actions Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 rounded" />
                        <Skeleton className="h-3 w-48 rounded opacity-60" />
                    </div>

                    <div className="space-y-3 pt-2">
                        <Skeleton className="h-20 w-full rounded-2xl border border-gray-50 bg-gray-50/30" />
                        <Skeleton className="h-20 w-full rounded-2xl border border-gray-50 bg-red-50/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
