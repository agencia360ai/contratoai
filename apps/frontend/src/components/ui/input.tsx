import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
 "flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus-visible:outline-none focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/20 disabled:cursor-not-allowed disabled:opacity-50",
 className,
 )}
 ref={ref}
 {...props}
 />
 );
 },
);
Input.displayName = "Input";

export { Input };
