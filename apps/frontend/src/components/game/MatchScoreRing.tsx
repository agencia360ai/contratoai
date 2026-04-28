interface MatchScoreRingProps {
 score: number; // 0-1
 size?: number;
 strokeWidth?: number;
 className?: string;
}

export function MatchScoreRing({
 score,
 size = 64,
 strokeWidth = 6,
 className,
}: MatchScoreRingProps) {
 const radius = (size - strokeWidth) / 2;
 const circumference = 2 * Math.PI * radius;
 const pct = Math.max(0, Math.min(1, score));
 const offset = circumference * (1 - pct);
 const display = Math.round(pct * 100);

 const color = pct >= 0.8 ? "#10B981" : pct >= 0.6 ? "#F59E0B" : "#94A3B8";

 return (
 <div
 className={`relative inline-flex items-center justify-center ${className ?? ""}`}
 style={{ width: size, height: size }}
 role="img"
 aria-label={`Match score ${display} percent`}
 >
 <svg width={size} height={size} className="-rotate-90">
 <circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 stroke="#E2E8F0"
 strokeWidth={strokeWidth}
 fill="none"
 />
 <circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 stroke={color}
 strokeWidth={strokeWidth}
 fill="none"
 strokeDasharray={circumference}
 strokeDashoffset={offset}
 strokeLinecap="round"
 className="transition-all duration-700 ease-out"
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="font-display text-base font-bold leading-none" style={{ color }}>
 {display}%
 </span>
 <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
 match
 </span>
 </div>
 </div>
 );
}
