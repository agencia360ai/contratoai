import * as Lucide from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
 name: string;
 description: string;
 icon: string;
 tier: "common" | "rare" | "epic" | "legendary";
 unlocked: boolean;
 unlockedAt?: string;
 xpReward?: number;
}

const TIER_STYLES = {
 common: "bg-slate-100 text-slate-700 ring-slate-200",
 rare: "bg-blue-100 text-blue-700 ring-blue-200",
 epic: "bg-purple-100 text-purple-700 ring-purple-200",
 legendary: "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 ring-amber-300",
};

export function AchievementCard({
 name,
 description,
 icon,
 tier,
 unlocked,
 xpReward,
}: AchievementCardProps) {
 const Icon =
 (Lucide as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
 icon
 ] || Lucide.Trophy;
 return (
 <div
 className={cn(
 "rounded-2xl border p-4 transition-all duration-200",
 unlocked
 ? `bg-white ring-1 ${TIER_STYLES[tier]} shadow-sm`
 : "bg-slate-50 border-slate-200 grayscale opacity-60",
 )}
 >
 <div className="flex items-start gap-3">
 <div
 className={cn(
 "flex size-12 shrink-0 items-center justify-center rounded-xl",
 unlocked ? TIER_STYLES[tier] : "bg-slate-100 text-slate-400",
 )}
 aria-hidden
 >
 <Icon className="size-6" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-slate-900 truncate">{name}</h3>
 <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{description}</p>
 {xpReward && (
 <p className="text-xs text-primary-600 font-semibold mt-1">+{xpReward} XP</p>
 )}
 </div>
 </div>
 </div>
 );
}
