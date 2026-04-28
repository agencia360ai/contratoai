import type { Metadata, Viewport } from "next";
import "./globals.css";

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
 <html lang="es-PA">
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
