import Anthropic from "@anthropic-ai/sdk";
import type { IntakeKind, ParsedJob, ParsedCandidate } from "./utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.CLAUDE_MODEL_HEAVY || "claude-sonnet-4-5-20250929";

const JOB_SYSTEM = `Eres un experto en reclutamiento en Panamá. Recibes inputs desordenados (texto, transcripción de voz, imágenes, PDFs) describiendo una vacante y devuelves UN solo objeto JSON estructurado.

Schema:
{
  "title": string,
  "company_name": string | null,
  "location": string,
  "modality": "onsite" | "remote" | "hybrid" | null,
  "salary_min": number | null,
  "salary_max": number | null,
  "salary_currency": "USD" | "PAB",
  "description": string,         // 2-4 párrafos en ES, profesional pero cálido
  "requirements": string[],      // 4-8 bullets concretos
  "skills": string[],            // tags técnicos: "react", "sql", "agile"
  "benefits": string[],
  "experience_level": "intern" | "junior" | "mid" | "senior" | "lead" | "exec" | null,
  "contract_type": string | null,
  "industry": string | null,
  "suggestions": string[]        // 2-3 mejoras sugeridas si la info es escasa
}

Reglas:
- Si el usuario no dijo el salario, déjalo null. NUNCA inventes salarios.
- Si solo dijeron "Panamá" asume "Ciudad de Panamá".
- Si la modalidad no se aclara, déjala null.
- "description" debe leerse como una vacante real, no como bullets.
- "suggestions" son consejos para el reclutador (ej: "Considera aclarar el rango salarial — vacantes con salario reciben 3x más aplicaciones").

Output: SOLO JSON sin markdown ni texto adicional.`;

const CANDIDATE_SYSTEM = `Eres un experto en talento en Panamá. Recibes inputs desordenados (CV en PDF/imagen, audio transcrito, texto) describiendo a un candidato y devuelves UN solo objeto JSON estructurado.

Schema:
{
  "full_name": string,
  "headline": string,                  // 1 línea: "Frontend Engineer · 4 años"
  "location": string,
  "summary": string,                   // 2-3 párrafos
  "skills": string[],
  "experiences": [
    { "title": string, "company": string, "start": "YYYY-MM"|null, "end": "YYYY-MM"|"present"|null, "description": string }
  ],
  "education": [
    { "degree": string, "institution": string, "year": string|null }
  ],
  "languages": string[],
  "preferences": {
    "desired_role": string|null,
    "salary_min": number|null,
    "modality": "onsite"|"remote"|"hybrid"|null,
    "industries": string[]
  },
  "suggestions": string[]              // 2-3 mejoras al perfil
}

Output: SOLO JSON sin markdown.`;

type RawInput =
  | { type: "text"; content: string }
  | { type: "audio_transcript"; content: string; original_url?: string }
  | { type: "image"; mime: string; base64: string }
  | { type: "pdf"; base64: string };

function buildUserContent(inputs: RawInput[]): Anthropic.MessageParam["content"] {
  const blocks: Anthropic.ContentBlockParam[] = [];
  const texts: string[] = [];
  for (const i of inputs) {
    if (i.type === "text") texts.push(`TEXTO:\n${i.content}`);
    else if (i.type === "audio_transcript")
      texts.push(`TRANSCRIPCIÓN DE VOZ:\n${i.content}`);
    else if (i.type === "image") {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: i.mime as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: i.base64,
        },
      });
    } else if (i.type === "pdf") {
      blocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: i.base64,
        },
      });
    }
  }
  if (texts.length) blocks.push({ type: "text", text: texts.join("\n\n---\n\n") });
  if (!blocks.length) blocks.push({ type: "text", text: "(sin contenido)" });
  return blocks;
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return {};
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return {};
  }
}

export async function parseWithClaude(
  kind: IntakeKind,
  inputs: RawInput[],
): Promise<{ parsed: ParsedJob | ParsedCandidate; suggestions: string[] }> {
  const system = kind === "job" ? JOB_SYSTEM : CANDIDATE_SYSTEM;
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    temperature: 0.3,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserContent(inputs) }],
  });

  const text = response.content
    .map((c) => ("text" in c ? (c as { text: string }).text : ""))
    .join("");
  const parsed = extractJson(text) as Record<string, unknown>;
  const suggestions = Array.isArray(parsed.suggestions)
    ? (parsed.suggestions as string[])
    : [];
  delete parsed.suggestions;
  return {
    parsed: parsed as unknown as ParsedJob | ParsedCandidate,
    suggestions,
  };
}

export type { RawInput };
