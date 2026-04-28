export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
  mime: string,
): Promise<{ ok: boolean; text?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, error: "openai_not_configured" };

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: mime }),
    filename,
  );
  form.append("model", "whisper-1");
  form.append("language", "es");
  form.append("response_format", "json");

  try {
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!r.ok) {
      const txt = await r.text();
      return { ok: false, error: `whisper_${r.status}: ${txt.slice(0, 300)}` };
    }
    const json = (await r.json()) as { text?: string };
    return { ok: true, text: json.text || "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
