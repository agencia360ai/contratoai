import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
 subsets: ["latin"],
 variable: "--font-jakarta",
 weight: ["400", "500", "600", "700", "800"],
 display: "swap",
});

const mono = JetBrains_Mono({
 subsets: ["latin"],
 variable: "--font-mono",
 weight: ["400", "500", "600", "700"],
 display: "swap",
});

export const metadata: Metadata = {
 title: {
 default: "TeContrato — Contrata talento en 3 días, no en 45.",
 template: "%s · TeContrato",
 },
 description:
 "Plataforma de reclutamiento con IA para Panamá. Pre-filtramos candidatos, hacemos entrevistas con IA y entregamos shortlists en 72 horas. Para empresas que dejaron de creer en los procesos lentos.",
 metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
 openGraph: {
 type: "website",
 locale: "es_PA",
 siteName: "TeContrato Panamá",
 },
 icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
 width: "device-width",
 initialScale: 1,
 maximumScale: 5,
 themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="es-PA" className={`${jakarta.variable} ${mono.variable}`}>
 <body className="min-h-screen bg-background text-foreground font-sans antialiased">
 <a
 href="#main"
 className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gold-500 focus:px-3 focus:py-2 focus:text-slate-900"
 >
 Saltar al contenido
 </a>
 {children}
 </body>
 </html>
 );
}
