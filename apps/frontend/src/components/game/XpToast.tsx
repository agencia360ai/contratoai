"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";

interface XpToastProps {
 xp: number;
 message?: string;
 duration?: number;
 showConfetti?: boolean;
 onClose?: () => void;
}

export function XpToast({
 xp,
 message = "¡Subiste de nivel!",
 duration = 3000,
 showConfetti = false,
 onClose,
}: XpToastProps) {
 const [open, setOpen] = useState(true);

 useEffect(() => {
 if (showConfetti && typeof window !== "undefined") {
 const m = window.matchMedia("(prefers-reduced-motion: reduce)");
 if (!m.matches) {
 confetti({
 particleCount: 60,
 spread: 70,
 origin: { y: 0.4 },
 colors: ["#4F46E5", "#F97316", "#10B981", "#F59E0B"],
 });
 }
 }
 const t = setTimeout(() => {
 setOpen(false);
 onClose?.();
 }, duration);
 return () => clearTimeout(t);
 }, [duration, onClose, showConfetti]);

 return (
 <AnimatePresence>
 {open && (
 <motion.div
 initial={{ y: -50, opacity: 0, scale: 0.9 }}
 animate={{ y: 0, opacity: 1, scale: 1 }}
 exit={{ y: -50, opacity: 0 }}
 className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
 role="status"
 aria-live="polite"
 >
 <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary-600 to-violet-600 px-5 py-3 text-white shadow-lg">
 <Sparkles className="size-6" aria-hidden />
 <div>
 <p className="font-bold leading-tight">+{xp} XP</p>
 <p className="text-xs opacity-90">{message}</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
