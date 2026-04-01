import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { Flame, CheckCircle2, Target } from "lucide-react";

const iconMap = {
  "Current Streak": { Icon: Flame, color: "text-orange-500" },
  "Best Streak": { Icon: Flame, color: "text-orange-500" },
  "Today's Habits": { Icon: CheckCircle2, color: "text-emerald-500" },
  "Active Goals": { Icon: Target, color: "text-orange-500" },
};

export default function StatCard({ title, value, sub, loading = false }) {
  const iconConfig = iconMap[title] || {};
  const Icon = iconConfig.Icon;
  const iconColor = iconConfig.color;

  return (
    <Card className="p-6 border border-gray-200/50 hover:border-gray-300 transition-all">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton variant="text" className="w-20" />
              <Skeleton variant="title" className="w-16" />
              <Skeleton variant="text" className="w-16" />
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {title}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {value}
              </h3>
              {sub && (
                <div className="text-xs text-gray-500 mt-2">
                  {sub}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
