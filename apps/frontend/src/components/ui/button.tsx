import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:size-5 [&_svg]:shrink-0",
 {
 variants: {
 variant: {
 primary:
 "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.18)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.28)] shine",
 gold:
 "bg-gradient-to-b from-gold-400 to-gold-600 text-slate-900 shadow-[0_4px_12px_rgba(251,191,36,0.30)] hover:shadow-[0_8px_24px_rgba(251,191,36,0.45)] hover:from-gold-300 hover:to-gold-500 shine",
 secondary:
 "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
 outline:
 "border-2 border-slate-900 text-slate-900 bg-transparent hover:bg-slate-900 hover:text-white",
 ghost:
 "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
 success:
 "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.25)]",
 destructive:
 "bg-red-600 text-white hover:bg-red-700",
 link: "text-slate-900 underline-offset-4 hover:underline",
 },
 size: {
 sm: "h-9 px-3 text-sm",
 default: "h-11 px-5 text-base",
 lg: "h-13 px-7 text-base",
 xl: "h-14 px-8 text-lg",
 icon: "h-11 w-11",
 },
 },
 defaultVariants: { variant: "primary", size: "default" },
 },
);

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : "button";
 return (
 <Comp
 className={cn(buttonVariants({ variant, size }), className)}
 ref={ref}
 {...props}
 />
 );
 },
);
Button.displayName = "Button";

export { Button, buttonVariants };
