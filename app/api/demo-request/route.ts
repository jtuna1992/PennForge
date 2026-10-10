import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/demo-request
 * ----------------------
 * Receives demo-request form submissions.
 *
 * CURRENT STATE: development mode — no email/CRM provider is connected.
 * The route validates the payload (so the UI behaves exactly as it will
 * in production) but does NOT forward the data anywhere. It returns
 * `mode: "development"` so the form can say so honestly.
 *
 * TO GO LIVE:
 *   1. Add your provider SDK / API key as a server-side env var
 *      (e.g. RESEND_API_KEY) — never expose keys to the client.
 *   2. In the handler below, replace the development-mode return with a
 *      call to your provider (Resend, Postmark, HubSpot, etc.).
 *   3. Consider adding rate limiting (e.g. Upstash) and CAPTCHA/Turnstile
 *      for production hardening. A honeypot field is already checked.
 *
 * PRIVACY: never log the request body — it contains PII (name, email,
 * phone). Log only aggregate, non-identifying events.
 */

type DemoRequestBody = {
  fullName?: unknown;
  businessName?: unknown;
  email?: unknown;
  phone?: unknown;
  industry?: unknown;
  callVolume?: unknown;
  message?: unknown;
  company_website?: unknown; // honeypot
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body: DemoRequestBody): string[] {
  const errors: string[] = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (!str(body.fullName)) errors.push("Full name is required.");
  if (!str(body.businessName)) errors.push("Business name is required.");
  if (!EMAIL_RE.test(str(body.email))) errors.push("A valid email is required.");
  if (str(body.phone).replace(/\D/g, "").length < 7)
    errors.push("A valid phone number is required.");
  if (!str(body.industry)) errors.push("Industry is required.");
  if (str(body.message).length > 2000) errors.push("Message is too long.");
  return errors;
}

export async function POST(req: NextRequest) {
  let body: DemoRequestBody;
  try {
    body = (await req.json()) as DemoRequestBody;
  } catch {
    return NextResponse.json({ ok: false, errors: ["Invalid request body."] }, { status: 400 });
  }

  // Honeypot: bots fill this hidden field — silently accept and discard.
  if (typeof body.company_website === "string" && body.company_website.trim() !== "") {
    return NextResponse.json({ ok: true, mode: "development" });
  }

  const errors = validate(body);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // ---- DEVELOPMENT MODE: no provider connected yet ----
  // Replace this block with your provider call to go live.
  return NextResponse.json({
    ok: true,
    mode: "development",
    note: "No email or CRM provider is connected yet, so this request was validated but not forwarded anywhere. Connect a provider in app/api/demo-request/route.ts to go live.",
  });
}
