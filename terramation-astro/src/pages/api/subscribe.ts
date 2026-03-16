// Server-side only — not prerendered
export const prerender = false;

import type { APIRoute } from "astro";

// ── Brevo config (from environment variables) ─────────────────────────────
const BREVO_API_KEY       = import.meta.env.BREVO_API_KEY;
const LIST_ID             = Number(import.meta.env.BREVO_LIST_ID ?? 0);
const DOI_TEMPLATE_ID     = Number(import.meta.env.BREVO_DOI_TEMPLATE_ID ?? 0);
const DOI_REDIRECT_URL    = import.meta.env.BREVO_DOI_REDIRECT_URL ?? "";

// Basic email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    const form = await request.formData();
    body = Object.fromEntries(form.entries());
  }

  const email      = String(body.email      ?? "").trim().toLowerCase();
  const firstName  = String(body.firstName  ?? "").trim();
  const lastName   = String(body.lastName   ?? "").trim();
  const optIn      = body.marketingOptIn === "on" || body.marketingOptIn === "true" || body.marketingOptIn === true;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!email || !isValidEmail(email)) {
    return new Response(
      JSON.stringify({ success: false, message: "Please enter a valid email address." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!optIn) {
    return new Response(
      JSON.stringify({ success: false, message: "Please tick the marketing consent box to subscribe." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!BREVO_API_KEY) {
    console.error("[subscribe] BREVO_API_KEY is not set.");
    return new Response(
      JSON.stringify({ success: false, message: "Server configuration error. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Brevo: create / update contact ────────────────────────────────────────
  // Use double opt-in if a DOI template is configured, otherwise single opt-in.
  const useDoubleOptIn = DOI_TEMPLATE_ID > 0 && DOI_REDIRECT_URL.length > 0;

  const contactPayload: Record<string, unknown> = {
    email,
    attributes: {
      ...(firstName && { FIRSTNAME: firstName }),
      ...(lastName  && { LASTNAME:  lastName  }),
    },
    listIds: [LIST_ID],
    updateEnabled: true,         // update existing contacts rather than error
  };

  if (useDoubleOptIn) {
    // POST to Brevo's double opt-in endpoint
    contactPayload.includeListIds    = [LIST_ID];
    contactPayload.templateId        = DOI_TEMPLATE_ID;
    contactPayload.redirectionUrl    = DOI_REDIRECT_URL;
  }

  const brevoUrl = useDoubleOptIn
    ? "https://api.brevo.com/v3/contacts/doubleOptinConfirmation"
    : "https://api.brevo.com/v3/contacts";

  let brevoRes: Response;

  try {
    brevoRes = await fetch(brevoUrl, {
      method: "POST",
      headers: {
        "api-key":      BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify(contactPayload),
    });
  } catch (err) {
    console.error("[subscribe] Brevo fetch failed:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Could not reach the mailing service. Please try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  // Brevo returns 201 Created for new contacts, 204 No Content for updates,
  // and 200 for double opt-in confirmations.
  if (brevoRes.status === 201 || brevoRes.status === 204 || brevoRes.status === 200) {
    const message = useDoubleOptIn
      ? "Thanks! We've sent you a confirmation email — please check your inbox to complete your sign-up."
      : "You're on the list! We'll keep you updated on terramation in the UK.";

    return new Response(
      JSON.stringify({ success: true, message }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Handle known Brevo error codes
  const errorBody = await brevoRes.json().catch(() => ({})) as { code?: string; message?: string };
  console.error("[subscribe] Brevo error:", brevoRes.status, errorBody);

  // Contact already subscribed — treat as success
  if (errorBody.code === "duplicate_parameter") {
    return new Response(
      JSON.stringify({ success: true, message: "You're already signed up — we'll keep you posted!" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: "Something went wrong. Please try again or email info@terramationuk.com." }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
};
