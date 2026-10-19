import Script from "next/script";

/**
 * GA4 via gtag, with Consent Mode v2 defaulting to denied.
 *
 * The default must be set BEFORE the GA config call, otherwise the first
 * pageview fires with storage already granted and the consent banner is
 * decorative. `beforeInteractive` is deliberate for the same reason.
 *
 * No measurement ID configured = nothing renders. The site works either way.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
try{var c=localStorage.getItem('unikai.consent.v1');if(c==='granted'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}

/** Fire a conversion event. Used by the enquiry forms and the chatbot. */
export function trackLead(type: string) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.("event", "generate_lead", { enquiry_type: type });
}
