type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(p: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL || "TeContrato <noreply@tecontrato.pa>";
  const replyTo = p.replyTo || process.env.RESEND_REPLY_TO;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY missing — skipping send", {
      to: p.to,
      subject: p.subject,
    });
    return { ok: false, error: "resend_not_configured" };
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(p.to) ? p.to : [p.to],
        subject: p.subject,
        html: p.html,
        reply_to: replyTo,
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return { ok: false, error: `resend_${r.status}: ${txt.slice(0, 300)}` };
    }
    const json = (await r.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function verificationEmailHtml(opts: {
  code: string;
  recruiterName?: string;
  kind: "job" | "candidate";
}) {
  const subject = opts.kind === "job"
    ? "Confirma tu vacante en TeContrato Panamá"
    : "Confirma tu perfil en TeContrato Panamá";
  return `
<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:22px">${subject}</h1>
    <p style="color:#a3a3a3;margin:0 0 24px">Tu código de verificación es:</p>
    <div style="font-family:ui-monospace,monospace;font-size:32px;font-weight:700;letter-spacing:6px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;text-align:center">${opts.code}</div>
    <p style="color:#737373;font-size:13px;margin:24px 0 0">Expira en 15 minutos. Si no fuiste tú, ignora este correo.</p>
    ${opts.recruiterName ? `<p style="color:#737373;font-size:13px;margin:8px 0 0">Enviado por ${opts.recruiterName}</p>` : ""}
  </div>
</body></html>
  `;
}

export function jobPublishedRecruiterHtml(opts: {
  jobTitle: string;
  companyName?: string;
  submitterEmail: string;
  submitterName?: string;
  jobUrl?: string;
}) {
  return `
<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px">Nueva vacante recibida</h1>
    <p style="color:#a3a3a3;margin:0 0 16px">Te llegó una vacante por tu link público.</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px">
      <p style="margin:0 0 4px;font-size:18px;font-weight:600">${opts.jobTitle}</p>
      ${opts.companyName ? `<p style="margin:0;color:#a3a3a3">${opts.companyName}</p>` : ""}
      <hr style="border:0;border-top:1px solid #2a2a2a;margin:14px 0" />
      <p style="margin:0;color:#a3a3a3;font-size:14px">De: <strong>${opts.submitterName || opts.submitterEmail}</strong> · ${opts.submitterEmail}</p>
    </div>
    ${opts.jobUrl ? `<p style="margin:24px 0 0"><a href="${opts.jobUrl}" style="background:#facc15;color:#0a0a0a;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600">Ver vacante</a></p>` : ""}
  </div>
</body></html>
  `;
}

export function jobPublishedSubmitterHtml(opts: {
  jobTitle: string;
  recruiterName?: string;
  jobUrl?: string;
}) {
  return `
<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px">Tu vacante quedó registrada</h1>
    <p style="color:#a3a3a3;margin:0 0 16px">Listo. Compartimos los detalles con ${opts.recruiterName || "el reclutador"} y ya empezamos a buscar candidatos.</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px">
      <p style="margin:0;font-size:18px;font-weight:600">${opts.jobTitle}</p>
    </div>
    ${opts.jobUrl ? `<p style="margin:24px 0 0"><a href="${opts.jobUrl}" style="background:#facc15;color:#0a0a0a;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600">Ver tu vacante pública</a></p>` : ""}
    <p style="color:#737373;font-size:13px;margin:24px 0 0">Si necesitas editarla, responde este correo.</p>
  </div>
</body></html>
  `;
}

export function candidateAddedRecruiterHtml(opts: {
  candidateName: string;
  candidateEmail: string;
  headline?: string;
}) {
  return `
<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px">Nuevo candidato en tu pipeline</h1>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;margin-top:16px">
      <p style="margin:0 0 4px;font-size:18px;font-weight:600">${opts.candidateName}</p>
      ${opts.headline ? `<p style="margin:0;color:#a3a3a3">${opts.headline}</p>` : ""}
      <p style="margin:8px 0 0;color:#a3a3a3;font-size:14px">${opts.candidateEmail}</p>
    </div>
  </div>
</body></html>
  `;
}

export function candidateAddedSubmitterHtml(opts: {
  candidateName: string;
  recruiterName?: string;
}) {
  return `
<!doctype html>
<html><body style="font-family:system-ui,-apple-system,Segoe UI,Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px">¡Listo, ${opts.candidateName}!</h1>
    <p style="color:#a3a3a3;margin:0 0 16px">Tu perfil quedó registrado${opts.recruiterName ? ` con ${opts.recruiterName}` : ""}. Te avisaremos cuando aparezcan vacantes que encajen contigo.</p>
  </div>
</body></html>
  `;
}
