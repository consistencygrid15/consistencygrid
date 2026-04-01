"use client";

import Card from "@/components/ui/Card";
import Link from "next/link";
import {
  Smartphone,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  Settings,
} from "lucide-react";

const tips = [
  {
    icon: Smartphone,
    title: "Download the App",
    description:
      "Get our mobile app to automatically update your wallpaper daily for a fresh start.",
    link: "/",
    color: "blue",
  },
  {
    icon: Target,
    title: "Add a Goal Challenge",
    description:
      "Start a 30-day challenge and track progress on your wallpaper.",
    link: "/goals",
    color: "orange",
  },
  {
    icon: TrendingUp,
    title: "Check Your Analytics",
    description: "View detailed statistics and trends of your habits.",
    link: "/analytics",
    color: "green",
  },
  {
    icon: Zap,
    title: "Build Daily Streaks",
    description: "Consistent daily actions create lasting momentum.",
    link: "/streaks",
    color: "yellow",
  },
];

const colorClasses = {
  blue: "bg-blue-50 border-blue-100 text-blue-700",
  orange: "bg-orange-50 border-orange-100 text-orange-700",
  green: "bg-green-50 border-green-100 text-green-700",
  yellow: "bg-amber-50 border-amber-100 text-amber-700",
};

const iconColorClasses = {
  blue: "bg-blue-100 text-blue-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  yellow: "bg-amber-100 text-amber-600",
};

export default function QuickTips() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Quick Tips</h2>
          <p className="text-xs text-gray-500 mt-1">Boost your productivity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tips.map((tip, index) => {
          const TipIcon = tip.icon;
          const bgClass = colorClasses[tip.color];
          const iconClass = iconColorClasses[tip.color];

          return (
            <Link key={index} href={tip.link}>
              <div
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105 ${bgClass}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
                    <TipIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {tip.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
