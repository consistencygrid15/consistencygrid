import Skeleton from "@/components/ui/Skeleton";

/**
 * GeneratorSkeleton Component
 * 
 * Provides a highly accurate skeleton loading state for the 
 * Wallpaper Generator page to improve perceived performance.
 * 
 * Includes:
 * - Header skeleton
 * - Form skeleton (Basic Info + Theme)
 * - Preview skeleton (Phone mockup)
 */
export default function GeneratorSkeleton() {
    return (
        <div className="mx-auto max-w-6xl">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-8 w-64 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-80 rounded ml-8" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left: Form Skeleton (7 cols) */}
                <div className="lg:col-span-7 space-y-4">

                    {/* Section 1: Basic Information */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-5 w-32 rounded" />
                        </div>

                        <div className="space-y-4">
                            {/* DOB Input */}
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 rounded" />
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>

                            {/* Life Expectancy Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-3 w-28 rounded" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-2 w-12 rounded" />
                                    <Skeleton className="h-2 w-12 rounded" />
                                </div>
                            </div>

                            {/* Life Progress Bar */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-24 rounded" />
                                    <Skeleton className="h-6 w-12 rounded" />
                                </div>
                                <Skeleton className="h-3 w-full rounded-full" />
                            </div>

                            {/* Life Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                                        <Skeleton className="h-6 w-12 mx-auto rounded mb-1" />
                                        <Skeleton className="h-2 w-16 mx-auto rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Theme Selection - Updated to match 2-column grid */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-5 w-32 rounded" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 sm:p-4">
                                    <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-[70%] rounded" />
                                        <Skeleton className="h-2 w-[50%] rounded" />
                                    </div>
                                    <div className="flex -space-x-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Advanced Settings Toggle */}
                    <div className="py-2">
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    {/* Action Buttons Placeholder */}
                    <div className="mt-8 flex gap-3">
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                    </div>
                </div>

                {/* Right: Preview Skeleton (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Action Buttons Bar */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end mb-4">
                        <Skeleton className="h-8 w-20 rounded-xl" />
                        <Skeleton className="h-8 w-24 rounded-xl" />
                        <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>

                    {/* Phone Mockup Skeleton */}
                    <div className="relative mx-auto h-[580px] sm:h-[600px] w-[290px] sm:w-[300px] overflow-hidden rounded-[38px] sm:rounded-[40px] border-8 border-gray-100 bg-white shadow-xl">
                        {/* Notch Area */}
                        <div className="absolute top-0 left-1/2 h-6 sm:h-7 w-32 sm:w-40 -translate-x-1/2 rounded-b-3xl bg-gray-50" />

                        {/* Clock Area Simulation */}
                        <div className="absolute top-[12%] left-0 right-0 flex flex-col items-center">
                            <Skeleton className="h-12 w-32 rounded-lg mb-2" />
                            <Skeleton className="h-4 w-40 rounded" />
                        </div>

                        {/* Main Preview Placeholder */}
                        <div className="h-full w-full flex items-center justify-center p-6 sm:p-8">
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-[85%] mx-auto rounded" />
                                <Skeleton className="h-4 w-[65%] mx-auto rounded" />
                                <div className="grid grid-cols-10 gap-1 sm:gap-1.5 pt-6">
                                    {Array.from({ length: 120 }).map((_, i) => (
                                        <Skeleton key={i} className="h-1.5 w-1.5 rounded-sm opacity-[0.3]" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
