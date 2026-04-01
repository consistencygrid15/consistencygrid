"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import StreakHeatmap from "@/components/streaks/StreakHeatmap";
import StreakSkeleton from "@/components/skeletons/StreakSkeleton";
import { Flame, Trophy, BarChart3, Zap, Medal, Gem } from "lucide-react";

export default function StreaksPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const renderMilestoneIcon = (days) => {
        if (days >= 365) return <Gem className="w-8 h-8 text-blue-500" />;
        if (days >= 100) return <Medal className="w-8 h-8 text-yellow-500" />;
        if (days >= 30) return <Medal className="w-8 h-8 text-slate-400" />;
        return <Medal className="w-8 h-8 text-amber-700" />;
    };

    useEffect(() => {
        async function loadStreaks() {
            try {
                const res = await fetch("/api/streaks");
                if (res.ok) {
                    const json = await res.json();
                    console.log("Streaks data loaded:", json);
                    setData(json);
                } else {
                    console.error("Failed to fetch streaks:", res.status, res.statusText);
                    setData(null);
                }
            } catch (err) {
                console.error("Failed to load streaks:", err);
                setData(null);
            } finally {
                setLoading(false);
            }
        }
        loadStreaks();
    }, []);

    if (loading) {
        return (
            <DashboardLayout active="Streaks">
                <div className="py-4 sm:py-8">
                    <StreakSkeleton />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout active="Streaks">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Streaks</h1>
                    <p className="text-sm text-gray-500">
                        Track your consistency and build momentum
                    </p>
                </div>

                {/* Streak Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                <Flame className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Streak</p>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {data?.currentStreak || 0}
                                </h2>
                                <p className="text-xs text-gray-400">days</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Best Streak</p>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {data?.bestStreak || 0}
                                </h2>
                                <p className="text-xs text-gray-400">days</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Days</p>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {data?.totalCompletedDays || 0}
                                </h2>
                                <p className="text-xs text-gray-400">kept</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Streak Heatmap */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">Your Streak Heatmap</h2>
                    <p className="text-sm text-gray-500">
                        52 weeks of habit consistency at a glance
                    </p>

                    <div className="mt-6">
                        <StreakHeatmap
                            habits={data?.habits || []}
                            logs={data?.logs || []}
                            timeframeWeeks={52}
                        />
                    </div>
                </Card>

                {/* Milestones */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">Milestones</h2>
                    <p className="text-sm text-gray-500">
                        Unlock achievements as you build consistency
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {data?.milestones?.map((milestone, index) => {
                            const remaining = Math.max(0, milestone.days - (data?.currentStreak || 0));

                            return (
                                <div
                                    key={index}
                                    className={`rounded-xl border p-4 text-center flex flex-col items-center transition-all ${milestone.unlocked
                                        ? "border-orange-200 bg-orange-50 shadow-sm"
                                        : "border-gray-200 bg-gray-50/80" // Removed opacity-50 to make text readable
                                        }`}
                                >
                                    <div className="mb-2">
                                        {renderMilestoneIcon(milestone.days)}
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-gray-700">
                                        {milestone.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {milestone.unlocked ? (
                                            <span className="text-green-600 font-bold">Unlocked! 🎉</span>
                                        ) : (
                                            <span className="text-orange-600 font-bold">
                                                {remaining} days away
                                            </span>
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Motivation */}
                {data && data.currentStreak === 0 && (
                    <Card className="p-6 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Start Your Streak Today!
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Keep all your habits today to start building your streak.
                                    Consistency is the key to success!
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {data && data.currentStreak > 0 && (
                    <Card className="p-6 bg-green-50 border-green-200">
                        <div className="flex items-start gap-3">
                            <Flame className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Keep It Going!
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    You're on a {data.currentStreak}-day streak! Don't break the
                                    chain. Complete your habits today to keep the momentum going.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
