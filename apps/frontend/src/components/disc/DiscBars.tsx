"use client";
import { motion } from "framer-motion";

const DISC = [
 { letter: "D", name: "Dominante", value: 25.0, color: "from-blue-400 to-blue-600", text: "text-blue-600" },
 { letter: "I", name: "Influyente", value: 28.6, color: "from-red-400 to-red-600", text: "text-red-600" },
 { letter: "S", name: "Estable", value: 25.0, color: "from-amber-400 to-amber-600", text: "text-amber-600" },
 { letter: "C", name: "Concienzudo", value: 21.4, color: "from-emerald-400 to-emerald-600", text: "text-emerald-600" },
];

export function DiscBars() {
 return (
 <div className="space-y-4 max-w-md mx-auto">
 {DISC.map((d, i) => (
 <motion.div
 key={d.letter}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.4, delay: i * 0.1 }}
 className="flex items-center gap-3"
 >
 <div className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${d.color} text-white font-display font-bold text-xl shadow-md`}>
 {d.letter}
 </div>
 <div className="flex-1">
 <div className="flex items-baseline justify-between mb-1.5">
 <span className="font-semibold text-slate-900 text-sm">{d.name}</span>
 <span className={`font-mono font-bold text-sm ${d.text}`}>
 {d.value.toFixed(1)}%
 </span>
 </div>
 <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
 <motion.div
 initial={{ width: "0%" }}
 animate={{ width: `${d.value}%` }}
 transition={{ duration: 1.2, delay: i * 0.1 + 0.2, ease: "easeOut" }}
 className={`h-full rounded-full bg-gradient-to-r ${d.color}`}
 />
 </div>
 </div>
 </motion.div>
 ))}

 {/* Caption */}
 <p className="text-xs text-slate-500 text-center mt-4 font-mono">
 Sample: Mónica Díaz · Promotor Colaborativo (alta I + alta D)
 </p>
 </div>
 );
}
