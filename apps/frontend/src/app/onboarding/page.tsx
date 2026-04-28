import type { Metadata } from "next";
import { ChatOnboarding } from "@/components/onboarding/ChatOnboarding";

export const metadata: Metadata = {
 title: "Empezar — 5 minutos con Moni",
 description: "Una conversación rápida con Moni, la IA panameña, y listo.",
};

export default function OnboardingPage() {
 return (
 <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
 <ChatOnboarding />
 </main>
 );
}
