import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  currency: string = "USD",
): string {
  if (!min && !max) return "Salario a convenir";
  const symbol = currency === "PAB" ? "B/." : "$";
  if (min && max && min !== max) {
    return `${symbol}${Number(min).toLocaleString()} – ${symbol}${Number(max).toLocaleString()}`;
  }
  const v = min ?? max ?? 0;
  return `${symbol}${Number(v).toLocaleString()}`;
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("es-PA", { day: "numeric", month: "short" });
}

export function bracketColor(bracket?: string | null): string {
  switch (bracket) {
    case "legend": return "text-fuchsia-400";
    case "diamond": return "text-cyan-300";
    case "platinum": return "text-indigo-300";
    case "gold": return "text-gold-400";
    case "silver": return "text-zinc-400";
    case "bronze":
    default: return "text-amber-700";
  }
}

export function bracketBg(bracket?: string | null): string {
  switch (bracket) {
    case "legend":   return "bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/30 border-fuchsia-500/20";
    case "diamond":  return "bg-cyan-500/10 text-cyan-300 ring-cyan-500/30 border-cyan-500/20";
    case "platinum": return "bg-indigo-500/10 text-indigo-300 ring-indigo-500/30 border-indigo-500/20";
    case "gold":     return "bg-gold-500/10 text-gold-300 ring-gold-500/30 border-gold-500/20";
    case "silver":   return "bg-zinc-500/15 text-zinc-300 ring-zinc-400/30 border-zinc-500/20";
    case "bronze":
    default:         return "bg-orange-700/10 text-orange-300 ring-orange-700/30 border-orange-700/20";
  }
}

export function bracketLabel(bracket?: string | null): string {
  switch (bracket) {
    case "legend":   return "Legend";
    case "diamond":  return "Diamond";
    case "platinum": return "Platinum";
    case "gold":     return "Gold";
    case "silver":   return "Silver";
    case "bronze":
    default:         return "Bronze";
  }
}
