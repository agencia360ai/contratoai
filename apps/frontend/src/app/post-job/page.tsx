import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostJobWizard } from "@/components/post-job/PostJobWizard";

export const metadata: Metadata = {
 title: "Publicar vacante — 3 pasos · 90 segundos",
 description: "Sube tu vacante. La IA escribe descripción, sugiere skills, y empieza a filtrar candidatos.",
};

export default function PostJobPage() {
 return (
 <>
 <Navbar />
 <main id="main" className="relative pt-12 pb-24 min-h-screen">
 <div className="absolute inset-0 bg-grid-light" aria-hidden />
 <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-br from-gold-100/40 to-transparent blur-3xl opacity-30" aria-hidden />
 <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
 <PostJobWizard />
 </div>
 </main>
 <Footer />
 </>
 );
}
