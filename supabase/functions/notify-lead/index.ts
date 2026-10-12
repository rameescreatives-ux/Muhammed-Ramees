/* ============================================================================
   SHADOWX STUDIOS — "notify-lead" Supabase Edge Function
   ----------------------------------------------------------------------------
   Emails you every time someone submits the form or finishes the chatbot.

   THIS IS OPTIONAL. The site works without it — leads are still saved to the
   database and still open WhatsApp. Deploy this only when you want email too.

   TO DEPLOY
     1. Create a free account at https://resend.com and verify an email address.
        (Free tier: 3,000 emails/month — far more than you will need.)
     2. Copy your Resend API key.
     3. In the Supabase dashboard:
          Edge Functions -> Secrets -> add
            RESEND_API_KEY = re_xxxxxxxx
            NOTIFY_TO      = shadowxgcc@gmail.com
            NOTIFY_FROM    = onboarding@resend.dev     (or your own verified domain)
     4. Deploy:  supabase functions deploy notify-lead --no-verify-jwt
   ============================================================================ */

Deno.serve(async (req: Request) => {
  // CORS — the browser calls this directly from the website
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors });
  }

  const KEY  = Deno.env.get('RESEND_API_KEY');
  const TO   = Deno.env.get('NOTIFY_TO')   ?? 'shadowxgcc@gmail.com';
  const FROM = Deno.env.get('NOTIFY_FROM') ?? 'onboarding@resend.dev';

  // Not configured yet? Succeed quietly so the website never shows an error.
  if (!KEY) {
    return new Response(JSON.stringify({ emailed: false, reason: 'RESEND_API_KEY not set' }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  let lead: Record<string, string> = {};
  try { lead = await req.json(); } catch { /* empty body */ }

  const row = (k: string, v?: string) =>
    v ? `<tr><td style="padding:6px 14px 6px 0;color:#888;font:13px sans-serif">${k}</td>
             <td style="padding:6px 0;font:14px sans-serif;color:#111">${escapeHtml(v)}</td></tr>`
      : '';

  const html = `
    <div style="font-family:sans-serif;max-width:560px">
      <p style="font:600 12px sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#f26b26;margin:0 0 6px">
        New enquiry · ${escapeHtml(lead.source ?? 'website')}
      </p>
      <h2 style="margin:0 0 18px;font-size:21px;color:#111">
        ${escapeHtml(lead.name ?? 'Someone')}${lead.company ? ' — ' + escapeHtml(lead.company) : ''}
      </h2>
      <table style="border-collapse:collapse;width:100%">
        ${row('Email', lead.email)}
        ${row('Phone', lead.phone)}
        ${row('Needs', lead.service)}
        ${row('Package', lead.budget)}
        ${row('Timeline', lead.timeline)}
        ${row('Language', lead.locale)}
        ${row('Page', lead.page)}
      </table>
      ${lead.message
        ? `<div style="margin-top:18px;padding:14px 16px;background:#f6f5f2;border-left:3px solid #f26b26">
             <p style="margin:0;font:14px/1.6 sans-serif;color:#333;white-space:pre-wrap">${escapeHtml(lead.message)}</p>
           </div>`
        : ''}
      ${lead.phone
        ? `<p style="margin-top:22px">
             <a href="https://wa.me/${lead.phone.replace(/\D/g, '')}"
                style="background:#f26b26;color:#140c06;font:600 14px sans-serif;
                       padding:12px 22px;border-radius:3px;text-decoration:none;display:inline-block">
               Reply on WhatsApp
             </a>
           </p>`
        : ''}
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `ShadowX Website <${FROM}>`,
      to: [TO],
      reply_to: lead.email || undefined,
      subject: `New enquiry — ${lead.name ?? 'website'}${lead.budget ? ' · ' + lead.budget : ''}`,
      html,
    }),
  });

  return new Response(JSON.stringify({ emailed: res.ok }), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
