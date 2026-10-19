import "server-only";
import type { EnquiryType } from "@/content/types";

/**
 * Lead persistence + routing.
 *
 * Writes go to Supabase via the REST endpoint using the service-role key,
 * which never leaves the server. When Supabase is not configured the lead is
 * still accepted and logged, so the site never loses an enquiry because an
 * env var is missing — the current unikai.com silently drops every one of
 * them through a dead Contact Form 7 shortcode, and that failure mode is
 * precisely what this rebuild exists to fix.
 */

export interface Lead {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  enquiryType: EnquiryType;
  products?: string;
  volume?: string;
  message?: string;
  /** Page the enquiry came from. */
  source?: string;
  /** Chat transcript, when the lead came from the assistant. */
  transcript?: { role: string; content: string }[];
  locale?: string;
}

/** Admin-configurable in the dashboard; these are the launch defaults. */
export const ROUTING: Record<EnquiryType, { team: string; email: string }> = {
  export: { team: "Export & Marketing", email: "info@unikai.com" },
  distribution: { team: "Sales & Marketing", email: "info@unikai.com" },
  general: { team: "Customer Service", email: "info@unikai.com" },
  partnership: { team: "Corporate", email: "info@unikai.com" },
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isPersistenceConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

export async function saveLead(
  lead: Lead,
): Promise<{ ok: boolean; persisted: boolean; error?: string }> {
  const route = ROUTING[lead.enquiryType] ?? ROUTING.general;

  const row = {
    name: lead.name,
    company: lead.company ?? null,
    email: lead.email,
    phone: lead.phone ?? null,
    country: lead.country ?? null,
    enquiry_type: lead.enquiryType,
    products: lead.products ?? null,
    volume: lead.volume ?? null,
    message: lead.message ?? null,
    source: lead.source ?? null,
    locale: lead.locale ?? "en",
    transcript: lead.transcript ?? null,
    assigned_team: route.team,
    status: "new",
    created_at: new Date().toISOString(),
  };

  if (!isPersistenceConfigured()) {
    // Visible in Vercel logs; the dashboard reads from Supabase once wired.
    console.info("[lead:unpersisted]", JSON.stringify({ ...row, transcript: undefined }));
    return { ok: true, persisted: false };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY!,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[lead:save-failed]", res.status, detail);
      return { ok: true, persisted: false, error: `supabase_${res.status}` };
    }

    await notify(lead, route);
    return { ok: true, persisted: true };
  } catch (err) {
    console.error("[lead:save-error]", err);
    return { ok: true, persisted: false, error: "network" };
  }
}

/**
 * Email notification to the routed department.
 * No-ops until a transactional provider key is supplied.
 */
async function notify(lead: Lead, route: { team: string; email: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  if (!key || !from) return;

  const lines = [
    `Enquiry type: ${lead.enquiryType}`,
    `Routed to: ${route.team}`,
    `Name: ${lead.name}`,
    lead.company && `Company: ${lead.company}`,
    `Email: ${lead.email}`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.country && `Country: ${lead.country}`,
    lead.products && `Products: ${lead.products}`,
    lead.volume && `Volume: ${lead.volume}`,
    lead.message && `\nMessage:\n${lead.message}`,
    lead.source && `\nSource: ${lead.source}`,
  ].filter(Boolean);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: route.email,
        reply_to: lead.email,
        subject: `[${lead.enquiryType}] Website enquiry — ${lead.company || lead.name}`,
        text: lines.join("\n"),
      }),
    });
  } catch (err) {
    console.error("[lead:notify-failed]", err);
  }
}

// ---------------------------------------------------------------- validation

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(input: unknown): { lead?: Lead; error?: string } {
  if (typeof input !== "object" || input === null) return { error: "invalid_body" };
  const b = input as Record<string, unknown>;

  const str = (v: unknown, max = 2000) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = str(b.name, 160);
  const email = str(b.email, 200);
  const enquiryType = str(b.enquiryType, 40) as EnquiryType;

  if (name.length < 2) return { error: "name_required" };
  if (!EMAIL.test(email)) return { error: "email_invalid" };
  if (!["export", "distribution", "general", "partnership"].includes(enquiryType))
    return { error: "type_invalid" };
  if (b.consent !== true) return { error: "consent_required" };

  // Honeypot: real users never fill a visually hidden field.
  if (str(b.website).length > 0) return { error: "spam" };

  return {
    lead: {
      name,
      email,
      enquiryType,
      company: str(b.company, 160) || undefined,
      phone: str(b.phone, 60) || undefined,
      country: str(b.country, 80) || undefined,
      products: str(b.products, 400) || undefined,
      volume: str(b.volume, 120) || undefined,
      message: str(b.message, 4000) || undefined,
      source: str(b.source, 300) || undefined,
      locale: str(b.locale, 5) || "en",
    },
  };
}
