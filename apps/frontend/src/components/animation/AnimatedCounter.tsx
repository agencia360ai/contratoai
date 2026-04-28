"use client";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
 value,
 duration = 1500,
 prefix = "",
 suffix = "",
 className,
}: {
 value: number;
 duration?: number;
 prefix?: string;
 suffix?: string;
 className?: string;
}) {
 const [display, setDisplay] = useState(0);
 const observerRef = useRef<HTMLSpanElement>(null);
 const startedRef = useRef(false);

 useEffect(() => {
 const node = observerRef.current;
 if (!node) return;
 const obs = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting && !startedRef.current) {
 startedRef.current = true;
 const start = performance.now();
 const tick = (now: number) => {
 const t = Math.min(1, (now - start) / duration);
 const eased = 1 - (1 - t) ** 3;
 setDisplay(Math.round(value * eased));
 if (t < 1) requestAnimationFrame(tick);
 };
 requestAnimationFrame(tick);
 obs.disconnect();
 }
 },
 { threshold: 0.4 },
 );
 obs.observe(node);
 return () => obs.disconnect();
 }, [value, duration]);

 return (
 <span ref={observerRef} className={className}>
 {prefix}
 {display.toLocaleString()}
 {suffix}
 </span>
 );
}
