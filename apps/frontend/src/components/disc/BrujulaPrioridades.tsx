"use client";
import { motion } from "framer-motion";

// 8 ejes basados en el framework Behavior-GPS Brújula de Prioridades
// Sample data: el resultado de Mónica del PDF
const AXES = [
 { id: "accion", label: "Acción", value: 55.56, color: "#F59E0B" },
 { id: "entusiasmo", label: "Entusiasmo", value: 64.29, color: "#EC4899" },
 { id: "colaboracion", label: "Colaboración", value: 83.33, color: "#10B981" },
 { id: "apoyo", label: "Apoyo", value: 42.86, color: "#06B6D4" },
 { id: "equilibrio", label: "Equilibrio", value: 42.86, color: "#6366F1" },
 { id: "precision", label: "Precisión", value: 53.85, color: "#8B5CF6" },
 { id: "desafio", label: "Desafío", value: 25.0, color: "#EF4444" },
 { id: "resultados", label: "Resultados", value: 37.5, color: "#F97316" },
];

const SIZE = 360;
const CENTER = SIZE / 2;
const MAX_R = (SIZE / 2) - 50;

// Polar to cartesian
function pt(angleRad: number, r: number) {
 return [CENTER + Math.cos(angleRad) * r, CENTER + Math.sin(angleRad) * r];
}

export function BrujulaPrioridades() {
 // Build polygon path
 const polygonPoints = AXES.map((a, i) => {
 const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
 const r = (a.value / 100) * MAX_R;
 return pt(angle, r);
 });

 const polygonStr = polygonPoints.map(([x, y]) => `${x},${y}`).join(" ");

 return (
 <div className="relative max-w-md mx-auto">
 <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto">
 {/* Concentric grid */}
 {[0.25, 0.5, 0.75, 1].map((scale) => (
 <polygon
 key={scale}
 points={AXES.map((_, i) => {
 const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
 return pt(angle, MAX_R * scale).join(",");
 }).join(" ")}
 fill="none"
 stroke="rgba(15,23,42,0.08)"
 strokeWidth="1"
 />
 ))}

 {/* Spokes */}
 {AXES.map((_, i) => {
 const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
 const [x, y] = pt(angle, MAX_R);
 return (
 <line
 key={i}
 x1={CENTER}
 y1={CENTER}
 x2={x}
 y2={y}
 stroke="rgba(15,23,42,0.06)"
 strokeWidth="1"
 />
 );
 })}

 {/* Filled polygon (the result) */}
 <motion.polygon
 points={polygonStr}
 fill="url(#gold-gradient)"
 fillOpacity="0.30"
 stroke="#F59E0B"
 strokeWidth="2"
 initial={{ opacity: 0, scale: 0.5 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.8, ease: "easeOut" }}
 style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
 />

 {/* Dots at each axis value */}
 {AXES.map((a, i) => {
 const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
 const r = (a.value / 100) * MAX_R;
 const [x, y] = pt(angle, r);
 return (
 <motion.circle
 key={a.id}
 cx={x}
 cy={y}
 r={4.5}
 fill={a.color}
 stroke="white"
 strokeWidth="2"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
 />
 );
 })}

 {/* Axis labels */}
 {AXES.map((a, i) => {
 const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
 const [lx, ly] = pt(angle, MAX_R + 24);
 return (
 <text
 key={a.id}
 x={lx}
 y={ly}
 textAnchor="middle"
 dominantBaseline="middle"
 fontSize="11"
 fontWeight="600"
 fill="#475569"
 fontFamily="Plus Jakarta Sans"
 >
 {a.label}
 </text>
 );
 })}

 {/* Center dot */}
 <circle cx={CENTER} cy={CENTER} r={3} fill="#0F172A" />

 {/* Defs */}
 <defs>
 <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
 <stop offset="0%" stopColor="#FCD34D" />
 <stop offset="100%" stopColor="#F59E0B" />
 </linearGradient>
 </defs>
 </svg>

 {/* Legend below */}
 <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 text-xs">
 {AXES.map((a) => (
 <div key={a.id} className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <div className="size-2.5 rounded-full" style={{ background: a.color }} />
 <span className="text-slate-700">{a.label}</span>
 </div>
 <span className="font-mono font-bold text-slate-900">{a.value.toFixed(0)}%</span>
 </div>
 ))}
 </div>
 </div>
 );
}
