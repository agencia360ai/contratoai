import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
 "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
 {
 variants: {
 variant: {
 default: "bg-slate-100 border border-slate-200 text-slate-700",
 secondary: "bg-slate-100 text-slate-700 border border-slate-200",
 success: "bg-emerald-50 border border-emerald-200 text-emerald-700",
 warning: "bg-amber-50 border border-amber-200 text-amber-700",
 gold: "bg-gradient-to-b from-gold-50 to-gold-100 border border-gold-300 text-gold-800",
 ai: "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700",
 cyan: "bg-cyan-50 border border-cyan-200 text-cyan-700",
 destructive: "bg-red-50 border border-red-200 text-red-700",
 outline: "border border-slate-300 text-slate-700",
 },
 },
 defaultVariants: { variant: "default" },
 },
);

export interface BadgeProps
 extends React.HTMLAttributes<HTMLDivElement>,
 VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
 return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
