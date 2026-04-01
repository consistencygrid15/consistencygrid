import Skeleton from "@/components/ui/Skeleton";
import Card from "@/components/ui/Card";

export function WeeklyStatsSkeleton() {
    return (
        <Card className="p-6 border border-gray-100/50 animate-pulse">
            <div className="flex items-center gap-2 mb-5">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-3 w-8 rounded flex-shrink-0" />
                        <Skeleton className="h-8 flex-1 rounded-lg" />
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded opacity-60" />
                    <Skeleton className="h-8 w-12 rounded" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded opacity-60" />
                    <Skeleton className="h-8 w-12 rounded" />
                </div>
            </div>
        </Card>
    );
}

export function GoalsProgressSkeleton() {
    return (
        <Card className="p-6 border border-gray-100/50 h-full animate-pulse">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-6 w-32 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-lg border border-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-5 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                        <Skeleton className="h-3 w-24 rounded opacity-40" />
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function UpcomingRemindersSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 rounded" />
                            <div className="flex gap-2">
                                <Skeleton className="h-3 w-16 rounded opacity-60" />
                                <Skeleton className="h-3 w-12 rounded opacity-60" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-center">
                <Skeleton className="h-4 w-32 rounded" />
            </div>
        </div>
    );
}
