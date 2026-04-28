"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Briefcase, Building2, Brain, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUDIENCE = [
 { href: "/empresas", label: "Empresas", icon: Building2 },
 { href: "/candidatos", label: "Candidatos", icon: Brain },
];

const SECONDARY = [
 { href: "/jobs", label: "Trabajos", icon: Briefcase },
 { href: "/pricing", label: "Precios", icon: Crown },
];

export function Navbar() {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);

 useEffect(() => {
 const onScroll = () => setScrolled(window.scrollY > 16);
 onScroll();
 window.addEventListener("scroll", onScroll, { passive: true });
 return () => window.removeEventListener("scroll", onScroll);
 }, []);

 return (
 <header className="sticky top-4 z-30 mx-auto px-4">
 <nav
 className={cn(
 "mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-3 py-2 transition-all duration-300",
 scrolled
 ? "bg-white/95 backdrop-blur-xl border border-slate-200 shadow-md"
 : "bg-white/80 backdrop-blur-md border border-slate-200/60",
 )}
 aria-label="Principal"
 >
 <Link href="/" className="group flex items-center gap-2.5 cursor-pointer pl-2">
 <span
 aria-hidden
 className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white transition-transform group-hover:scale-105"
 >
 <Sparkles className="size-5" />
 </span>
 <span className="font-display text-lg font-bold text-slate-900 hidden sm:inline">
 TeContrato
 </span>
 </Link>

 {/* PRIMARY: Audience pill toggle */}
 <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
 {AUDIENCE.map((a) => {
 const active = pathname?.startsWith(a.href);
 const Icon = a.icon;
 return (
 <Link
 key={a.href}
 href={a.href}
 className={cn(
 "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer",
 active
 ? "bg-slate-900 text-white shadow-md"
 : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
 )}
 >
 <Icon className="size-4" aria-hidden />
 <span>{a.label}</span>
 </Link>
 );
 })}
 </div>

 {/* Secondary nav (desktop only) */}
 <ul className="hidden lg:flex items-center gap-0.5">
 {SECONDARY.map((item) => {
 const active = pathname?.startsWith(item.href);
 const Icon = item.icon;
 return (
 <li key={item.href}>
 <Link
 href={item.href}
 className={cn(
 "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer",
 active ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
 )}
 >
 <Icon className="size-4" aria-hidden />
 {item.label}
 </Link>
 </li>
 );
 })}
 </ul>

 <div className="flex items-center gap-2">
 <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
 <Link href="/login">Login</Link>
 </Button>
 <Button variant="primary" size="sm" asChild className="hidden sm:inline-flex">
 <Link href="/onboarding">Empezar gratis</Link>
 </Button>
 <button
 className="lg:hidden rounded-xl p-2 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
 aria-label="Abrir menú"
 onClick={() => setOpen((v) => !v)}
 >
 {open ? <X className="size-6" /> : <Menu className="size-6" />}
 </button>
 </div>
 </nav>

 {open && (
 <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
 <ul className="flex flex-col gap-1">
 {SECONDARY.map((item) => {
 const Icon = item.icon;
 return (
 <li key={item.href}>
 <Link
 href={item.href}
 onClick={() => setOpen(false)}
 className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
 >
 <Icon className="size-5" aria-hidden />
 {item.label}
 </Link>
 </li>
 );
 })}
 <li className="pt-2 border-t border-slate-200 mt-2 grid grid-cols-2 gap-2">
 <Button variant="secondary" size="default" asChild onClick={() => setOpen(false)}>
 <Link href="/login">Login</Link>
 </Button>
 <Button variant="primary" size="default" asChild onClick={() => setOpen(false)}>
 <Link href="/onboarding">Empezar</Link>
 </Button>
 </li>
 </ul>
 </div>
 )}
 </header>
 );
}
