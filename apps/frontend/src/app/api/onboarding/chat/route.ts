import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const anthropic = new Anthropic({
 apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres "Sofi", la asistente IA de TeContrato Panamá. Cálida, panameña, bilingüe ES/EN (default ES).
Una pregunta a la vez. Lenguaje simple, sin jerga.

Output: SOLO JSON sin markdown:
{
 "step": 3,
 "message": "¿En qué ciudad vives?",
 "options": [{"id": "panama", "label": "Ciudad de Panamá"}],
 "input_type": "chips",
 "allow_text": false
}

input_type ∈ "chips" | "text" | "number" | "yes_no" | "multi_select" | "complete"`;

export async function POST(req: Request) {
 try {
 const body = await req.json();
 const messages = body.messages || [];

 const response = await anthropic.messages.create({
 model: process.env.CLAUDE_MODEL_HEAVY || "claude-sonnet-4-5-20250929",
 max_tokens: 1500,
 temperature: 0.4,
 system: [
 {
 type: "text",
 text: SYSTEM_PROMPT,
 cache_control: { type: "ephemeral" },
 },
 ],
 messages,
 });

 const text = (response.content[0] as { text?: string }).text || "{}";
 const start = text.indexOf("{");
 const end = text.lastIndexOf("}");
 let parsed: unknown = {};
 if (start >= 0 && end > start) {
 try {
 parsed = JSON.parse(text.slice(start, end + 1));
 } catch {
 parsed = { message: text, input_type: "text" };
 }
 }

 return NextResponse.json(parsed);
 } catch (e) {
 console.error("onboarding/chat error", e);
 return NextResponse.json(
 { error: "claude_failed", message: e instanceof Error ? e.message : String(e) },
 { status: 500 },
 );
 }
}
