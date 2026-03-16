export const prerender = false;

import type { APIRoute } from "astro";

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const CONTACT_BREVO_LIST_ID = Number(import.meta.env.BREVO_CONTACT_LIST_ID ?? 6);
const CONTACT_NOTIFICATION_TO = import.meta.env.CONTACT_NOTIFICATION_TO ?? "info@terramation.uk";
const BREVO_SENDER_EMAIL = import.meta.env.BREVO_SENDER_EMAIL ?? CONTACT_NOTIFICATION_TO;
const BREVO_SENDER_NAME = import.meta.env.BREVO_SENDER_NAME ?? "Terramation UK";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const safeName = escapeHtml(input.name);
  const safeEmail = escapeHtml(input.email);
  const safeSubject = escapeHtml(input.subject || "General enquiry");
  const safeMessage = escapeHtml(input.message).replace(/\n/g, "<br />");

  return fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: BREVO_SENDER_EMAIL,
        name: BREVO_SENDER_NAME,
      },
      to: [
        {
          email: CONTACT_NOTIFICATION_TO,
          name: "Terramation UK",
        },
      ],
      replyTo: {
        email: input.email,
        name: input.name,
      },
      subject: `Terramation UK contact form: ${input.subject || "General enquiry"}`,
      htmlContent: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong><br />${safeMessage}</p>
      `,
      textContent: [
        "New contact form submission",
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Subject: ${input.subject || "General enquiry"}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });
}

async function addToBrevoList(input: {
  name: string;
  email: string;
}) {
  const [firstName, ...rest] = input.name.split(/\s+/).filter(Boolean);
  const lastName = rest.join(" ");

  return fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      attributes: {
        ...(firstName && { FIRSTNAME: firstName }),
        ...(lastName && { LASTNAME: lastName }),
      },
      listIds: [CONTACT_BREVO_LIST_ID],
      updateEnabled: true,
    }),
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;

  try {
    body = Object.fromEntries((await request.formData()).entries());
  } catch {
    body = await request.json().catch(() => ({}));
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  const marketingOptIn =
    body.marketingOptIn === "on" || body.marketingOptIn === "true" || body.marketingOptIn === true;
  const honeypot = String(body["bot-field"] ?? "").trim();

  if (honeypot) {
    return new Response(
      JSON.stringify({ success: true, message: "Thanks for your message." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!name) {
    return new Response(
      JSON.stringify({ success: false, message: "Please enter your name." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!email || !isValidEmail(email)) {
    return new Response(
      JSON.stringify({ success: false, message: "Please enter a valid email address." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!message) {
    return new Response(
      JSON.stringify({ success: false, message: "Please enter a message so we know how to help." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!BREVO_API_KEY) {
    console.error("[contact] BREVO_API_KEY is not set.");
    return new Response(
      JSON.stringify({ success: false, message: "Server configuration error. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let notificationRes: Response;

  try {
    notificationRes = await sendContactNotification({ name, email, subject, message });
  } catch (error) {
    console.error("[contact] Notification send failed:", error);
    return new Response(
      JSON.stringify({ success: false, message: "We couldn't send your message just now. Please try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!notificationRes.ok) {
    const errorBody = await notificationRes.json().catch(() => ({}));
    console.error("[contact] Brevo notification error:", notificationRes.status, errorBody);
    return new Response(
      JSON.stringify({ success: false, message: "We couldn't send your message just now. Please try again." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!marketingOptIn) {
    return new Response(
      JSON.stringify({
        success: true,
        message: "Thanks for getting in touch. Your message has been sent.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const subscribeRes = await addToBrevoList({ name, email });

    if (subscribeRes.ok || subscribeRes.status === 204) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Thanks for getting in touch. Your message has been sent and you've been added to our updates list.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const subscribeError = await subscribeRes.json().catch(() => ({})) as { code?: string };
    if (subscribeError.code === "duplicate_parameter") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Thanks for getting in touch. Your message has been sent, and you're already on our updates list.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    console.error("[contact] Brevo list add error:", subscribeRes.status, subscribeError);
  } catch (error) {
    console.error("[contact] Contact list add failed:", error);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Thanks for getting in touch. Your message has been sent, but we couldn't add you to email updates this time.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
