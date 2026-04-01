import Skeleton from "@/components/ui/Skeleton";

/**
 * HabitSkeleton Component
 * 
 * High-fidelity skeleton for habit items.
 * Can be used in HabitCard or as a list in other components.
 */
export default function HabitSkeleton({ count = 3 }) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                >
                    {/* Header Skeleton */}
                    <div className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Checkbox circle */}
                            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0" />

                            {/* Title & Subtitle */}
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-[60%] rounded" />
                                <Skeleton className="h-3 w-[30%] rounded" />
                            </div>

                            {/* Status Badge */}
                            <div className="hidden xs:block">
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>

                        {/* Week View Grid */}
                        <div className="flex gap-1.5 mt-3 sm:mt-4 overflow-hidden">
                            {Array.from({ length: 7 }).map((_, j) => (
                                <Skeleton key={j} className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex-shrink-0" />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
