"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/recruiter";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const sb = createClient();
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          disabled={pending}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={pending || !email || !password}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Entrando…
          </>
        ) : (
          <>
            <LogIn className="size-4" /> Entrar
          </>
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          ← Volver al inicio
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Inicia sesión
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Accede a tu dashboard de reclutador
            </p>
          </div>

          <Suspense fallback={<div className="text-sm text-slate-500">Cargando…</div>}>
            <LoginForm />
          </Suspense>

          <p className="text-xs text-slate-500 mt-6 text-center">
            ¿Aún no tienes cuenta?{" "}
            <Link
              href="/onboarding"
              className="text-primary-600 font-medium hover:underline"
            >
              Empezar gratis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
