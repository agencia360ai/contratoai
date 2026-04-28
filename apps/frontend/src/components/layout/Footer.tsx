import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
 return (
 <footer className="mt-32 border-t border-slate-200 bg-slate-50/50">
 <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
 <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
 <div className="lg:col-span-2">
 <Link href="/" className="flex items-center gap-2.5">
 <span
 aria-hidden
 className="grid size-8 place-items-center rounded-lg bg-slate-900 text-white"
 >
 <Sparkles className="size-4" />
 </span>
 <span className="font-display text-lg font-bold text-slate-900">
 TeContrato
 </span>
 </Link>
 <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-sm">
 IA que filtra 300 CVs en horas. Entrevistas con voz natural.
 Shortlist en 72h. Sin BS.
 </p>
 <p className="mt-3 text-xs text-slate-500 font-mono">
 Hecho en Panamá · 🇵🇦
 </p>
 </div>

 <div>
 <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
 Producto
 </h4>
 <ul className="space-y-2.5 text-sm text-slate-600">
 <li><Link href="/jobs" className="hover:text-slate-900 cursor-pointer transition-colors">Trabajos</Link></li>
 <li><Link href="/for-companies" className="hover:text-slate-900 cursor-pointer transition-colors">Para empresas</Link></li>
 <li><Link href="/pricing" className="hover:text-slate-900 cursor-pointer transition-colors">Precios</Link></li>
 <li><Link href="/interview" className="hover:text-slate-900 cursor-pointer transition-colors">AI Interview</Link></li>
 <li><Link href="/disc" className="hover:text-slate-900 cursor-pointer transition-colors">Test DISC</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
 Recursos
 </h4>
 <ul className="space-y-2.5 text-sm text-slate-600">
 <li><Link href="/blog" className="hover:text-slate-900 cursor-pointer transition-colors">Blog</Link></li>
 <li><Link href="/about" className="hover:text-slate-900 cursor-pointer transition-colors">Quiénes somos</Link></li>
 <li><Link href="/contacto" className="hover:text-slate-900 cursor-pointer transition-colors">Contacto</Link></li>
 </ul>
 </div>

 <div>
 <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
 Legal
 </h4>
 <ul className="space-y-2.5 text-sm text-slate-600">
 <li><Link href="/privacidad" className="hover:text-slate-900 cursor-pointer transition-colors">Privacidad</Link></li>
 <li><Link href="/terminos" className="hover:text-slate-900 cursor-pointer transition-colors">Términos</Link></li>
 <li><Link href="/cookies" className="hover:text-slate-900 cursor-pointer transition-colors">Cookies</Link></li>
 </ul>
 </div>
 </div>

 <div className="mt-12 pt-6 border-t border-slate-200 text-sm text-slate-500 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
 <p>© {new Date().getFullYear()} TeContrato Panamá.</p>
 <p className="font-mono text-xs">
 Tus datos protegidos por la Ley 81 de Panamá.
 </p>
 </div>
 </div>
 </footer>
 );
}
