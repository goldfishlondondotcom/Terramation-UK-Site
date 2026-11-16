// Server-side only — not prerendered
export const prerender = false;

import type { APIRoute } from "astro";

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const LIST_ID = 9; // Register-interest list — never shares with the campaign list
const NOTIFICATION_TO = import.meta.env.CONTACT_NOTIFICATION_TO ?? "info@terramation.uk";
const SENDER_EMAIL = import.meta.env.BREVO_SENDER_EMAIL ?? NOTIFICATION_TO;
const SENDER_NAME = import.meta.env.BREVO_SENDER_NAME ?? "Terramation UK";
const SITE = "https://terramation.uk";

// Tags links so clicks from the welcome email show up in analytics
function trackedLink(path: string): string {
  return `${SITE}${path}?utm_source=brevo&utm_medium=email&utm_campaign=register-interest-welcome`;
}

const STARTER_READS = [
  {
    title: "What is terramation?",
    blurb: "The two-minute explainer, if you want the basics.",
    path: "/2023/03/21/what-is-terramation/",
  },
  {
    title: "The science behind human composting",
    blurb: "How it works, and why it is safe.",
    path: "/2023/07/30/the-science-behind-human-composting-how-does-it-work-and-is-it-safe/",
  },
  {
    title: "What will it cost in the UK?",
    blurb: "Our best estimate of prices once it arrives.",
    path: "/2023/04/18/human-composting-cost-in-the-uk-what-terramation-costs-in-the-uk/",
  },
];

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

function sendEmail(payload: Record<string, unknown>) {
  return fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key":      BREVO_API_KEY,
      "Content-Type": "application/json",
      "Accept":       "application/json",
    },
    body: JSON.stringify({ sender: { email: SENDER_EMAIL, name: SENDER_NAME }, ...payload }),
  });
}

// Lets you know someone new has joined the list
function sendOwnerNotification(input: { email: string; firstName: string; region: string }) {
  const name = input.firstName || "(not given)";
  const region = input.region || "(not given)";

  return sendEmail({
    to: [{ email: NOTIFICATION_TO, name: "Terramation UK" }],
    replyTo: { email: input.email, ...(input.firstName && { name: input.firstName }) },
    subject: `New register-interest sign-up: ${input.firstName || input.email}`,
    htmlContent: `
      <h2>New register-interest sign-up</h2>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>First name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Region:</strong> ${escapeHtml(region)}</p>
      <p>They have been added to Brevo list #${LIST_ID} and sent the welcome email.</p>
    `,
    textContent: [
      "New register-interest sign-up",
      `Email: ${input.email}`,
      `First name: ${name}`,
      `Region: ${region}`,
      "",
      `They have been added to Brevo list #${LIST_ID} and sent the welcome email.`,
    ].join("\n"),
  });
}

// Welcome email for the person who signed up. Built to get a first reply and
// first click, which keeps future emails out of spam and starts the habit of opening them.
function sendWelcomeEmail(input: { email: string; firstName: string; region: string }) {
  const greeting = input.firstName ? `Hi ${escapeHtml(input.firstName)},` : "Hello,";
  const regionLine = input.region
    ? `<p style="margin:0 0 16px">We have noted you are in <strong>${escapeHtml(input.region)}</strong>. When providers start operating, we will tell you about the ones near you first.</p>`
    : "";

  const reads = STARTER_READS.map((r) => `
    <tr><td style="padding:0 0 14px">
      <a href="${trackedLink(r.path)}" style="color:#2d5a27;font-weight:bold;text-decoration:underline">${r.title}</a><br />
      <span style="color:#4a4a44">${r.blurb}</span>
    </td></tr>`).join("");

  const html = `
  <div style="background:#f7f3ed;padding:24px 12px;font-family:Georgia,serif;color:#1c1c1a">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px">
      <tr><td style="background:#1e3d1a;color:#f7f3ed;padding:20px 28px;border-radius:8px 8px 0 0;font-size:20px">Terramation UK</td></tr>
      <tr><td style="padding:28px;font-size:16px;line-height:1.6">
        <p style="margin:0 0 16px">${greeting}</p>
        <p style="margin:0 0 16px">Thank you for registering your interest in human composting. You are now on the list, and you will be among the first to hear when it becomes available in the UK.</p>
        ${regionLine}
        <p style="margin:0 0 8px"><strong>What to expect from us</strong></p>
        <p style="margin:0 0 16px">We only email when something actually happens: progress on the law, new providers, and costs. No more than once or twice a month.</p>

        <div style="background:#ede8de;border-left:4px solid #9e5e20;padding:16px 18px;margin:0 0 24px">
          <p style="margin:0 0 8px"><strong>One quick question</strong></p>
          <p style="margin:0">What made you interested in terramation? Just hit reply, even a line is helpful. Every answer is read by a real person, and it shapes what we write about next.</p>
        </div>

        <p style="margin:0 0 12px"><strong>While you wait, a few good places to start</strong></p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${reads}</table>

        <p style="margin:12px 0 16px"><strong>Know someone who would want this too?</strong> The more people who register, the stronger the case for bringing human composting to the UK. Forward this email, or share this link:<br />
          <a href="${trackedLink("/register-interest/")}" style="color:#2d5a27">terramation.uk/register-interest</a></p>

        <p style="margin:0">Warm regards,<br />The Terramation UK team</p>
      </td></tr>
      <tr><td style="padding:16px 28px 24px;font-size:12px;color:#7a7a72;line-height:1.5">
        You are receiving this because you registered your interest at terramation.uk. Not for you? Reply with "unsubscribe" and we will remove you. <a href="${SITE}/privacy-policy/" style="color:#7a7a72">Privacy policy</a>.
      </td></tr>
    </table>
  </div>`;

  const text = [
    input.firstName ? `Hi ${input.firstName},` : "Hello,",
    "",
    "Thank you for registering your interest in human composting. You are now on the list, and you will be among the first to hear when it becomes available in the UK.",
    ...(input.region ? ["", `We have noted you are in ${input.region}. When providers start operating, we will tell you about the ones near you first.`] : []),
    "",
    "WHAT TO EXPECT FROM US",
    "We only email when something actually happens: progress on the law, new providers, and costs. No more than once or twice a month.",
    "",
    "ONE QUICK QUESTION",
    "What made you interested in terramation? Just hit reply, even a line is helpful.",
    "",
    "A FEW GOOD PLACES TO START",
    ...STARTER_READS.map((r) => `- ${r.title}: ${trackedLink(r.path)}`),
    "",
    "Know someone who would want this too? Share this link:",
    trackedLink("/register-interest/"),
    "",
    "Warm regards,",
    "The Terramation UK team",
    "",
    "You are receiving this because you registered your interest at terramation.uk. Reply with \"unsubscribe\" to be removed.",
  ].join("\n");

  return sendEmail({
    to: [{ email: input.email, ...(input.firstName && { name: input.firstName }) }],
    replyTo: { email: NOTIFICATION_TO, name: SENDER_NAME },
    subject: input.firstName
      ? `${input.firstName}, you're on the list`
      : "You're on the list",
    htmlContent: html,
    textContent: text,
    tags: ["register-interest-welcome"],
  });
}

// Email failures are logged but never stop the sign-up from succeeding
async function sendSignupEmails(input: { email: string; firstName: string; region: string }) {
  const results = await Promise.allSettled([sendWelcomeEmail(input), sendOwnerNotification(input)]);
  for (const [i, result] of results.entries()) {
    const label = i === 0 ? "welcome" : "notification";
    if (result.status === "rejected") {
      console.error(`[register-interest] ${label} email failed:`, result.reason);
    } else if (!result.value.ok) {
      const errorBody = await result.value.json().catch(() => ({}));
      console.error(`[register-interest] ${label} email error:`, result.value.status, errorBody);
    }
  }
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
    // 201 = brand-new contact; 204 = they were already on the list, so don't email again
    if (brevoRes.status === 201) {
      await sendSignupEmails({ email, firstName, region });
    }
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
