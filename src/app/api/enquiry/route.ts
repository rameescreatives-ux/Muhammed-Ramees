import { NextResponse } from "next/server";
import { saveLead, validateLead } from "@/lib/leads";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`enquiry:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { lead, error } = validateLead(body);
  if (error || !lead) {
    // A tripped honeypot gets a success response — telling a bot it was
    // detected just teaches it to try again differently.
    if (error === "spam") return NextResponse.json({ ok: true });
    return NextResponse.json({ error }, { status: 400 });
  }

  const result = await saveLead(lead);
  return NextResponse.json({ ok: result.ok, persisted: result.persisted });
}
