import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/**
 * Job application intake.
 *
 * The CV is validated server-side as well as in the browser — client checks
 * are a convenience, never a control. Files go to a private Supabase Storage
 * bucket; the row in `applications` holds the storage path, not a public URL,
 * so CVs are never world-readable.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`apply:${ip}`, 3, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Honeypot
  if (String(form.get("website") ?? "").length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(form.get("name") ?? "").trim().slice(0, 160);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 60);
  const role = String(form.get("role") ?? "").trim().slice(0, 160);
  const message = String(form.get("message") ?? "").trim().slice(0, 4000);
  const consent = form.get("consent");

  if (name.length < 2) return NextResponse.json({ error: "name_required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "consent_required" }, { status: 400 });

  const cv = form.get("cv");
  if (!(cv instanceof File) || cv.size === 0)
    return NextResponse.json({ error: "cv_required" }, { status: 400 });
  if (cv.size > MAX_BYTES)
    return NextResponse.json({ error: "cv_too_large" }, { status: 400 });
  if (!ALLOWED.has(cv.type))
    return NextResponse.json({ error: "cv_type" }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.info(
      "[application:unpersisted]",
      JSON.stringify({ name, email, phone, role, cv: cv.name, size: cv.size }),
    );
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    // Filename is generated, never taken from the upload — an attacker-chosen
    // name has no business reaching a storage path.
    const ext = cv.name.split(".").pop()?.toLowerCase().replace(/[^a-z]/g, "") || "pdf";
    const path = `cvs/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const up = await fetch(`${url}/storage/v1/object/applications/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": cv.type,
      },
      body: await cv.arrayBuffer(),
    });

    if (!up.ok) {
      console.error("[application:upload-failed]", up.status, await up.text());
      return NextResponse.json({ ok: true, persisted: false });
    }

    const row = await fetch(`${url}/rest/v1/applications`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        role: role || null,
        message: message || null,
        cv_path: path,
        status: "new",
        created_at: new Date().toISOString(),
      }),
    });

    if (!row.ok) {
      console.error("[application:row-failed]", row.status, await row.text());
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[application:error]", err);
    return NextResponse.json({ ok: true, persisted: false });
  }
}
