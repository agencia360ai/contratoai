"use client";
import { useState } from "react";

const QUADRANTS = [
 { id: "D", name: "Dominante", color: "#EF4444", angle: -45, dot: { x: 70, y: 30 } },
 { id: "I", name: "Influyente", color: "#FBBF24", angle: 45, dot: { x: 30, y: 30 } },
 { id: "S", name: "Estable", color: "#10B981", angle: 135, dot: { x: 30, y: 70 } },
 { id: "C", name: "Concienzudo", color: "#06B6D4", angle: -135, dot: { x: 70, y: 70 } },
];

export function DiscWheel() {
 const [active, setActive] = useState<string | null>("D");

 return (
 <div className="relative aspect-square max-w-md mx-auto">
 {/* Outer glow */}
 <div className="absolute inset-0 bg-radial-gold blur-3xl opacity-30" aria-hidden />

 {/* SVG wheel */}
 <svg viewBox="0 0 100 100" className="relative">
 <defs>
 {QUADRANTS.map((q) => (
 <radialGradient key={q.id} id={`grad-${q.id}`} cx="50%" cy="50%" r="50%">
 <stop offset="0%" stopColor={q.color} stopOpacity="0.4" />
 <stop offset="100%" stopColor={q.color} stopOpacity="0.1" />
 </radialGradient>
 ))}
 </defs>

 {/* 4 quadrants */}
 <g>
 <path d="M50,50 L100,50 L100,0 L50,0 Z" fill="url(#grad-D)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
 <path d="M50,50 L0,50 L0,0 L50,0 Z" fill="url(#grad-I)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
 <path d="M50,50 L0,50 L0,100 L50,100 Z" fill="url(#grad-S)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
 <path d="M50,50 L100,50 L100,100 L50,100 Z" fill="url(#grad-C)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
 </g>

 {/* Letters */}
 {QUADRANTS.map((q) => (
 <g
 key={q.id}
 className="cursor-pointer"
 onMouseEnter={() => setActive(q.id)}
 onClick={() => setActive(q.id)}
 >
 <circle
 cx={q.dot.x}
 cy={q.dot.y}
 r={active === q.id ? 14 : 12}
 fill={q.color}
 fillOpacity={active === q.id ? 0.20 : 0.10}
 stroke={q.color}
 strokeOpacity={active === q.id ? 0.8 : 0.4}
 strokeWidth="0.3"
 style={{ transition: "all 200ms" }}
 />
 <text
 x={q.dot.x}
 y={q.dot.y + 1.5}
 textAnchor="middle"
 fontSize="6"
 fontWeight="800"
 fill={q.color}
 fontFamily="Plus Jakarta Sans"
 style={{ filter: active === q.id ? `drop-shadow(0 0 4px ${q.color})` : "none" }}
 >
 {q.id}
 </text>
 </g>
 ))}

 {/* Crosshair */}
 <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.10)" strokeWidth="0.2" />
 <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.10)" strokeWidth="0.2" />
 <circle cx="50" cy="50" r="1.5" fill="white" fillOpacity="0.6" />
 </svg>

 {/* Active label */}
 <div className="absolute inset-x-0 bottom-0 text-center">
 <p className="font-display text-2xl font-bold text-zinc-100">
 {QUADRANTS.find((q) => q.id === active)?.name || "DISC"}
 </p>
 <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
 Pasa el mouse sobre cada cuadrante
 </p>
 </div>
 </div>
 );
}
