// Server-side only — not prerendered
export const prerender = false;

import type { APIRoute } from "astro";

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const LIST_ID = 9; // Register-interest list — never shares with the campaign list

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") ?? "";

  let body: Record<string, unknown>;
  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    const form = await request.formData();
    body = Object.fromEntries(form.entries());
  }

  // Honeypot — bots fill this; real users never see it
  if (String(body.website ?? "").trim() !== "") {
    return new Response(
      JSON.stringify({ success: true, message: "Thank you. You are on the list, and we will be in touch the moment human composting becomes available in the UK." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const email     = String(body.email     ?? "").trim().toLowerCase();
  const firstName = String(body.firstName ?? "").trim();
  const region    = String(body.region    ?? "").trim();
  const optIn     = body.consent === "on" || body.consent === "true" || body.consent === true;

  if (!email || !isValidEmail(email)) {
    return new Response(
      JSON.stringify({ success: false, message: "Please enter a valid email address." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!optIn) {
    return new Response(
      JSON.stringify({ success: false, message: "Please tick the consent box to continue." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!BREVO_API_KEY) {
    console.error("[register-interest] BREVO_API_KEY is not set.");
    return new Response(
      JSON.stringify({ success: false, message: "Server configuration error. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const contactPayload: Record<string, unknown> = {
    email,
    attributes: {
      ...(firstName && { FIRSTNAME: firstName }),
      ...(region    && { REGION:    region    }),
    },
    listIds: [LIST_ID],
    updateEnabled: true,
  };

  let brevoRes: Response;
  try {
    brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key":      BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify(contactPayload),
    });
  } catch (err) {
    console.error("[register-interest] Brevo fetch failed:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Could not reach the mailing service. Please try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  if (brevoRes.status === 201 || brevoRes.status === 204 || brevoRes.status === 200) {
    return new Response(
      JSON.stringify({ success: true, message: "Thank you. You are on the list, and we will be in touch the moment human composting becomes available in the UK." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const errorBody = await brevoRes.json().catch(() => ({})) as { code?: string; message?: string };
  console.error("[register-interest] Brevo error:", brevoRes.status, errorBody);

  if (errorBody.code === "duplicate_parameter") {
    return new Response(
      JSON.stringify({ success: true, message: "Thank you. You are on the list, and we will be in touch the moment human composting becomes available in the UK." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: "Something went wrong. Please try again or email info@terramation.uk." }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
};
