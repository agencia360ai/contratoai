// Marquee of company names — real Panama companies scraped.

const COMPANIES = [
 "Banco General",
 "Banistmo",
 "Copa Airlines",
 "BAC Credomatic",
 "Tigo Panamá",
 "Konecta",
 "Caterpillar",
 "Canal de Panamá",
 "Cervecería Nacional",
 "Cable Onda",
 "Banco La Hipotecaria",
 "Multicredit Bank",
 "Saint Honoré",
 "Heineken",
 "Rootstack",
];

export function ClientLogosMarquee() {
 return (
 <div className="marquee">
 <div className="marquee-track">
 {[...COMPANIES, ...COMPANIES].map((c, i) => (
 <span
 key={`${c}-${i}`}
 className="font-display text-2xl md:text-3xl font-semibold text-slate-300 hover:text-slate-700 transition-colors whitespace-nowrap"
 >
 {c}
 </span>
 ))}
 </div>
 </div>
 );
}
