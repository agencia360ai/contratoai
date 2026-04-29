"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Mic,
  Square,
  Paperclip,
  FileText,
  ImageIcon,
  AudioLines,
  CheckCircle2,
  Loader2,
  X,
  Pencil,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type IntakeKind = "job" | "candidate";

type LinkInfo = {
  slug: string;
  kind: "job" | "candidate" | "both";
  display_name?: string | null;
  display_company?: string | null;
  display_avatar?: string | null;
  welcome_message?: string | null;
};

type UploadedAttachment = {
  type: "audio" | "image" | "pdf";
  mime?: string;
  path: string;
  filename: string;
  size: number;
  transcript?: string;
};

type ChatMessage =
  | { who: "ai"; text: string }
  | { who: "user"; text: string; attachments?: UploadedAttachment[] };

type ParsedResult = {
  parsed: Record<string, unknown>;
  suggestions: string[];
};

type Stage = "intake" | "review" | "verify" | "done";

export function IntakeChat({
  link,
  initialKind,
}: {
  link: LinkInfo;
  initialKind: IntakeKind;
}) {
  const [kind, setKind] = useState<IntakeKind>(initialKind);
  const [stage, setStage] = useState<Stage>("intake");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      who: "ai",
      text:
        link.welcome_message?.trim() ||
        (kind === "job"
          ? `Hola, soy Sofi. Cuéntame de la vacante: nombre del puesto, salario, requisitos. Puedes escribir, hablar (🎤), subir un PDF/imagen del JD, o mezclar todo. Cuando termines, dale a "Listo".`
          : `Hola, soy Sofi. Sube tu CV (PDF o imagen) o cuéntame en voz/texto de tu experiencia. Cuando termines, dale a "Listo".`),
    },
  ]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [pendingTexts, setPendingTexts] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedJson, setEditedJson] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, stage]);

  // ---- Upload helpers -------------------------------------------------------

  async function uploadFile(file: File): Promise<UploadedAttachment | null> {
    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    try {
      const r = await fetch(`/api/intake/${link.slug}/upload`, {
        method: "POST",
        body: fd,
      });
      const json = await r.json();
      if (!r.ok) {
        setError(json.error || "upload_failed");
        return null;
      }
      return json as UploadedAttachment;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const att = await uploadFile(file);
    if (!att) return;
    setAttachments((a) => [...a, att]);
    setMessages((m) => [
      ...m,
      {
        who: "user",
        text: `Adjunté ${att.type === "pdf" ? "un PDF" : att.type === "image" ? "una imagen" : "un audio"}: ${file.name}${att.transcript ? ` · "${att.transcript.slice(0, 80)}…"` : ""}`,
        attachments: [att],
      },
    ]);
  }

  // ---- Voice recording ------------------------------------------------------

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voz-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        const att = await uploadFile(file);
        if (!att) return;
        setAttachments((a) => [...a, att]);
        setMessages((m) => [
          ...m,
          {
            who: "user",
            text: att.transcript ? `🎤 "${att.transcript}"` : "🎤 Audio enviado",
            attachments: [att],
          },
        ]);
      };
      rec.start();
      mediaRecRef.current = rec;
      setRecording(true);
    } catch (e) {
      setError(`No pude acceder al micrófono: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop();
    mediaRecRef.current = null;
    setRecording(false);
  }

  // ---- Send text message ----------------------------------------------------

  function sendText() {
    const t = text.trim();
    if (!t) return;
    setPendingTexts((p) => [...p, t]);
    setMessages((m) => [...m, { who: "user", text: t }]);
    setText("");
    setMessages((m) => [
      ...m,
      {
        who: "ai",
        text: "Anotado. ¿Algo más? (puedes seguir agregando o darle a 'Listo' cuando termines)",
      },
    ]);
  }

  // ---- Parse with Claude ----------------------------------------------------

  async function onDoneIntake() {
    if (!pendingTexts.length && !attachments.length) {
      setError("Necesito al menos un mensaje, audio o archivo.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const inputs = [
        ...pendingTexts.map((t) => ({ type: "text" as const, content: t })),
        ...attachments.map((a) => {
          if (a.type === "audio")
            return { type: "audio" as const, transcript: a.transcript || "", path: a.path };
          if (a.type === "image")
            return { type: "image" as const, path: a.path, mime: a.mime || "image/jpeg" };
          return { type: "pdf" as const, path: a.path };
        }),
      ];
      const r = await fetch(`/api/intake/${link.slug}/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, inputs }),
      });
      const json = await r.json();
      if (!r.ok) {
        setError(json.error || "parse_failed");
        return;
      }
      setParsedResult(json as ParsedResult);
      setEditedJson(JSON.stringify(json.parsed, null, 2));
      setStage("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setParsing(false);
    }
  }

  // ---- Send verification code -----------------------------------------------

  async function onConfirmReview() {
    if (!email.trim()) {
      setError("Necesito tu correo para confirmar.");
      return;
    }
    let parsedToSend = parsedResult?.parsed || {};
    if (editing) {
      try {
        parsedToSend = JSON.parse(editedJson);
      } catch {
        setError("El JSON editado no es válido.");
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/intake/${link.slug}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          email,
          name,
          phone,
          raw_inputs: [
            ...pendingTexts.map((t) => ({ type: "text", content: t })),
            ...attachments.map((a) => ({
              type: a.type,
              path: a.path,
              transcript: a.transcript,
            })),
          ],
          parsed_data: parsedToSend,
          ai_suggestions: parsedResult?.suggestions || [],
        }),
      });
      const json = await r.json();
      if (!r.ok) {
        setError(json.error || "verify_failed");
        return;
      }
      setSubmissionId(json.submission_id);
      setStage("verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitCode() {
    if (!submissionId || !code.trim()) {
      setError("Ingresa el código que te llegó.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/intake/${link.slug}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submissionId, code }),
      });
      const json = await r.json();
      if (!r.ok) {
        setError(json.error || "confirm_failed");
        return;
      }
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // ---- Render ---------------------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {link.display_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.display_avatar}
            alt=""
            className="size-14 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-gold-100 to-gold-200 text-gold-700 ring-2 ring-white shadow-sm">
            <Sparkles className="size-6" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-lg font-bold text-slate-900 leading-tight">
            {link.display_name || "Reclutador"}
          </p>
          {link.display_company && (
            <p className="text-sm text-slate-500 truncate">{link.display_company}</p>
          )}
        </div>
      </div>

      {link.kind === "both" && stage === "intake" && (
        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            onClick={() => setKind("job")}
            className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
              kind === "job"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Tengo una vacante
          </button>
          <button
            onClick={() => setKind("candidate")}
            className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
              kind === "candidate"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Busco trabajo
          </button>
        </div>
      )}

      {/* CHAT */}
      {stage === "intake" && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div
            ref={containerRef}
            className="max-h-[60vh] min-h-[420px] overflow-y-auto px-6 py-8 space-y-4"
          >
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 text-base leading-relaxed shadow-sm ${
                      m.who === "user"
                        ? "rounded-br-sm bg-slate-900 text-white"
                        : "rounded-bl-sm bg-slate-100 text-slate-900"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* attachments preview */}
          {attachments.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-3 flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <Badge key={i} variant="secondary" className="gap-1.5 bg-white border border-slate-200 text-slate-700">
                  {a.type === "audio" ? <AudioLines className="size-3.5" /> : a.type === "image" ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
                  <span className="max-w-[180px] truncate">{a.filename}</span>
                  <button
                    onClick={() =>
                      setAttachments((arr) => arr.filter((_, j) => j !== i))
                    }
                    className="ml-1 text-slate-400 hover:text-slate-700"
                    aria-label="Quitar adjunto"
                  >
                    <X className="size-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* input row */}
          <div className="border-t border-slate-200 bg-white p-3 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*,application/pdf,audio/*"
              onChange={onFileSelected}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              title="Adjuntar PDF, imagen o audio"
            >
              <Paperclip className="size-5" />
            </Button>
            <Button
              type="button"
              variant={recording ? "destructive" : "ghost"}
              size="icon"
              onClick={recording ? stopRecording : startRecording}
              disabled={busy}
              title={recording ? "Parar grabación" : "Grabar voz"}
            >
              {recording ? <Square className="size-5" /> : <Mic className="size-5" />}
            </Button>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              placeholder={recording ? "Grabando…" : "Escribe o adjunta…"}
              disabled={busy || recording}
              className="h-12 text-base"
            />
            <Button
              type="button"
              variant="gold"
              size="icon"
              onClick={sendText}
              disabled={!text.trim() || busy}
              title="Enviar"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      )}

      {stage === "intake" && (pendingTexts.length > 0 || attachments.length > 0) && (
        <div className="mt-5 flex justify-end">
          <Button onClick={onDoneIntake} disabled={parsing} size="lg" variant="gold">
            {parsing ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Procesando…
              </>
            ) : (
              <>
                Listo, estructurar <Sparkles className="size-5" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* REVIEW */}
      {stage === "review" && parsedResult && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 space-y-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {kind === "job" ? "Esta es la vacante" : "Este es tu perfil"}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing((e) => !e)}
            >
              <Pencil className="size-3.5" /> {editing ? "Vista" : "Editar"}
            </Button>
          </div>

          {parsedResult.suggestions.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-mono uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <Lightbulb className="size-3.5" /> Sugerencias de Sofi
              </p>
              <ul className="text-sm text-amber-900 space-y-1.5">
                {parsedResult.suggestions.map((s, i) => (
                  <li key={i}>· {s}</li>
                ))}
              </ul>
            </div>
          )}

          {editing ? (
            <textarea
              value={editedJson}
              onChange={(e) => setEditedJson(e.target.value)}
              rows={18}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          ) : (
            <ParsedView kind={kind} data={parsedResult.parsed} />
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
            <p className="text-base font-semibold text-slate-900">Tus datos para confirmar</p>
            <Input
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
            />
            <Input
              placeholder="Tu correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
            />
            <Input
              placeholder="Tu WhatsApp (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setStage("intake")}>
              Volver
            </Button>
            <Button onClick={onConfirmReview} disabled={busy} size="lg" variant="gold">
              {busy ? <Loader2 className="size-5 animate-spin" /> : "Enviar código a mi correo"}
            </Button>
          </div>
        </div>
      )}

      {/* VERIFY */}
      {stage === "verify" && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 space-y-5 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900">Revisa tu correo</h2>
          <p className="text-base text-slate-600">
            Te enviamos un código de 6 dígitos a <strong className="text-slate-900">{email}</strong>.
          </p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="h-14 text-center text-3xl font-mono tracking-[0.4em]"
            maxLength={6}
          />
          <Button onClick={onSubmitCode} disabled={busy} size="lg" variant="gold" className="w-full">
            {busy ? <Loader2 className="size-5 animate-spin" /> : "Confirmar"}
          </Button>
          <button
            onClick={() => setStage("review")}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Editar correo
          </button>
        </div>
      )}

      {/* DONE */}
      {stage === "done" && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center space-y-4 shadow-sm">
          <CheckCircle2 className="size-14 mx-auto text-emerald-600" />
          <h2 className="font-display text-3xl font-bold text-slate-900">
            {kind === "job" ? "¡Vacante registrada!" : "¡Perfil registrado!"}
          </h2>
          <p className="text-base text-slate-700 max-w-md mx-auto leading-relaxed">
            {kind === "job"
              ? `Le avisamos a ${link.display_name || "tu reclutador"} y ya empezamos a buscar candidatos.`
              : `Te avisaremos cuando aparezcan vacantes que te encajen.`}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}

function ParsedView({
  kind,
  data,
}: {
  kind: IntakeKind;
  data: Record<string, unknown>;
}) {
  if (kind === "job") {
    const j = data as {
      title?: string;
      company_name?: string;
      location?: string;
      modality?: string;
      salary_min?: number;
      salary_max?: number;
      salary_currency?: string;
      description?: string;
      requirements?: string[];
      skills?: string[];
      benefits?: string[];
      experience_level?: string;
    };
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight">{j.title}</h3>
          <p className="text-slate-600">
            {[j.company_name, j.location, j.modality].filter(Boolean).join(" · ")}
          </p>
          {(j.salary_min || j.salary_max) && (
            <p className="text-gold-700 font-mono font-semibold mt-1">
              {j.salary_currency || "USD"} {j.salary_min}
              {j.salary_max && j.salary_max !== j.salary_min ? ` – ${j.salary_max}` : ""}
            </p>
          )}
        </div>
        {j.description && (
          <p className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
            {j.description}
          </p>
        )}
        {j.requirements?.length ? (
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
              Requisitos
            </p>
            <ul className="text-sm text-slate-800 space-y-1">
              {j.requirements.map((r, i) => (
                <li key={i}>· {r}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {j.skills?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {j.skills.map((s, i) => (
              <Badge key={i} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        ) : null}
        {j.benefits?.length ? (
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
              Beneficios
            </p>
            <ul className="text-sm text-slate-800 space-y-1">
              {j.benefits.map((b, i) => (
                <li key={i}>· {b}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  const c = data as {
    full_name?: string;
    headline?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experiences?: Array<{ title: string; company: string; start?: string; end?: string; description?: string }>;
    education?: Array<{ degree: string; institution: string; year?: string }>;
    languages?: string[];
  };
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 leading-tight">{c.full_name}</h3>
        <p className="text-slate-600">
          {[c.headline, c.location].filter(Boolean).join(" · ")}
        </p>
      </div>
      {c.summary && (
        <p className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
          {c.summary}
        </p>
      )}
      {c.skills?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {c.skills.map((s, i) => (
            <Badge key={i} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>
      ) : null}
      {c.experiences?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Experiencia
          </p>
          {c.experiences.map((x, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{x.title}</p>
              <p className="text-sm text-slate-600">
                {[x.company, [x.start, x.end].filter(Boolean).join(" – ")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {x.description && (
                <p className="text-sm text-slate-700 mt-1.5 whitespace-pre-line">
                  {x.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {c.education?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
            Educación
          </p>
          {c.education.map((e, i) => (
            <p key={i} className="text-sm text-slate-800">
              <strong className="text-slate-900">{e.degree}</strong>
              {e.institution ? ` · ${e.institution}` : ""}
              {e.year ? ` · ${e.year}` : ""}
            </p>
          ))}
        </div>
      ) : null}
      {c.languages?.length ? (
        <p className="text-sm text-slate-700">
          <span className="text-slate-500">Idiomas:</span> {c.languages.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
