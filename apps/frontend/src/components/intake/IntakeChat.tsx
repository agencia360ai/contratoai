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
          ? `Hola, soy Moni. Cuéntame de la vacante: nombre del puesto, salario, requisitos. Puedes escribir, hablar (🎤), subir un PDF/imagen del JD, o mezclar todo. Cuando termines, dale a "Listo".`
          : `Hola, soy Moni. Sube tu CV (PDF o imagen) o cuéntame en voz/texto de tu experiencia. Cuando termines, dale a "Listo".`),
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
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        {link.display_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.display_avatar}
            alt=""
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-12 place-items-center rounded-full bg-gold-500/20 text-gold-300">
            <Sparkles className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold leading-tight">
            {link.display_name || "Reclutador"}
          </p>
          {link.display_company && (
            <p className="text-sm text-zinc-400 truncate">{link.display_company}</p>
          )}
        </div>
      </div>

      {link.kind === "both" && stage === "intake" && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => setKind("job")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${kind === "job" ? "bg-gold-500 text-zinc-950" : "text-zinc-300"}`}
          >
            Tengo una vacante
          </button>
          <button
            onClick={() => setKind("candidate")}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${kind === "candidate" ? "bg-gold-500 text-zinc-950" : "text-zinc-300"}`}
          >
            Busco trabajo
          </button>
        </div>
      )}

      {/* CHAT */}
      {stage === "intake" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div
            ref={containerRef}
            className="max-h-[60vh] min-h-[320px] overflow-y-auto px-5 py-6 space-y-3"
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
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.who === "user"
                        ? "bg-gold-500 text-zinc-950"
                        : "bg-white/[0.06] text-zinc-100"
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
            <div className="border-t border-white/10 px-5 py-3 flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <Badge key={i} variant="secondary" className="gap-1.5">
                  {a.type === "audio" ? <AudioLines className="size-3" /> : a.type === "image" ? <ImageIcon className="size-3" /> : <FileText className="size-3" />}
                  {a.filename}
                  <button
                    onClick={() =>
                      setAttachments((arr) => arr.filter((_, j) => j !== i))
                    }
                    className="ml-1 opacity-60 hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* input row */}
          <div className="border-t border-white/10 p-3 flex items-center gap-2">
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
              <Paperclip className="size-4" />
            </Button>
            <Button
              type="button"
              variant={recording ? "destructive" : "ghost"}
              size="icon"
              onClick={recording ? stopRecording : startRecording}
              disabled={busy}
              title={recording ? "Parar grabación" : "Grabar voz"}
            >
              {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
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
            />
            <Button
              type="button"
              size="icon"
              onClick={sendText}
              disabled={!text.trim() || busy}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {stage === "intake" && (pendingTexts.length > 0 || attachments.length > 0) && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onDoneIntake} disabled={parsing} size="lg">
            {parsing ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Procesando…
              </>
            ) : (
              <>
                Listo, estructurar <Sparkles className="size-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* REVIEW */}
      {stage === "review" && parsedResult && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold">
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
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-mono uppercase tracking-wider text-amber-300/80 mb-2 flex items-center gap-1.5">
                <Lightbulb className="size-3.5" /> Sugerencias de Moni
              </p>
              <ul className="text-sm text-amber-100/90 space-y-1.5">
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
              className="w-full rounded-xl bg-zinc-950 border border-white/10 p-3 font-mono text-xs text-zinc-200"
            />
          ) : (
            <ParsedView kind={kind} data={parsedResult.parsed} />
          )}

          <div className="rounded-2xl border border-white/10 p-4 space-y-3">
            <p className="text-sm font-medium">Tus datos para confirmar</p>
            <Input
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Tu correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Tu WhatsApp (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setStage("intake")}>
              Volver
            </Button>
            <Button onClick={onConfirmReview} disabled={busy} size="lg">
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Enviar código a mi correo"}
            </Button>
          </div>
        </div>
      )}

      {/* VERIFY */}
      {stage === "verify" && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4 text-center">
          <h2 className="font-display text-xl font-bold">Revisa tu correo</h2>
          <p className="text-sm text-zinc-400">
            Te enviamos un código de 6 dígitos a <strong>{email}</strong>.
          </p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="text-center text-2xl font-mono tracking-widest"
            maxLength={6}
          />
          <Button onClick={onSubmitCode} disabled={busy} size="lg" className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Confirmar"}
          </Button>
          <button
            onClick={() => setStage("review")}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Editar correo
          </button>
        </div>
      )}

      {/* DONE */}
      {stage === "done" && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-3">
          <CheckCircle2 className="size-12 mx-auto text-emerald-400" />
          <h2 className="font-display text-2xl font-bold">
            {kind === "job" ? "¡Vacante registrada!" : "¡Perfil registrado!"}
          </h2>
          <p className="text-zinc-300">
            {kind === "job"
              ? `Le avisamos a ${link.display_name || "tu reclutador"} y ya empezamos a buscar candidatos.`
              : `Te avisaremos cuando aparezcan vacantes que te encajen.`}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
          <h3 className="text-2xl font-bold leading-tight">{j.title}</h3>
          <p className="text-zinc-400">
            {[j.company_name, j.location, j.modality].filter(Boolean).join(" · ")}
          </p>
          {(j.salary_min || j.salary_max) && (
            <p className="text-gold-300 font-mono mt-1">
              {j.salary_currency || "USD"} {j.salary_min}
              {j.salary_max && j.salary_max !== j.salary_min ? ` – ${j.salary_max}` : ""}
            </p>
          )}
        </div>
        {j.description && (
          <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
            {j.description}
          </p>
        )}
        {j.requirements?.length ? (
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Requisitos
            </p>
            <ul className="text-sm space-y-1">
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
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Beneficios
            </p>
            <ul className="text-sm space-y-1">
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
        <h3 className="text-2xl font-bold leading-tight">{c.full_name}</h3>
        <p className="text-zinc-400">
          {[c.headline, c.location].filter(Boolean).join(" · ")}
        </p>
      </div>
      {c.summary && (
        <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
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
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Experiencia
          </p>
          {c.experiences.map((x, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] p-3">
              <p className="font-semibold">{x.title}</p>
              <p className="text-sm text-zinc-400">
                {[x.company, [x.start, x.end].filter(Boolean).join(" – ")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {x.description && (
                <p className="text-sm text-zinc-300 mt-1.5 whitespace-pre-line">
                  {x.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {c.education?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Educación
          </p>
          {c.education.map((e, i) => (
            <p key={i} className="text-sm">
              <strong>{e.degree}</strong>
              {e.institution ? ` · ${e.institution}` : ""}
              {e.year ? ` · ${e.year}` : ""}
            </p>
          ))}
        </div>
      ) : null}
      {c.languages?.length ? (
        <p className="text-sm text-zinc-300">
          <span className="text-zinc-500">Idiomas:</span> {c.languages.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
