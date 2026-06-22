# UX & Conversion Audit — Terramation UK
**Date:** June 2026  
**Scope:** Full site — pages, global components, key flows  
**Method:** Static code analysis. Items marked *needs visual confirmation* require browser/device testing to verify.

---

## Executive Summary — Top Five Issues by Impact

1. **`/2023-old/` stub page is publicly indexed** — a test page (`<p>This is the first article URL test.</p>`) is served at a URL sharing the title and description of the real "What is Terramation?" blog post. It is fully crawlable, will appear in sitemaps, and creates a direct duplicate-content conflict with the site's most important SEO page. Nothing on that page helps a visitor. Fix: add `noindex` or delete it. [HIGH / SEO]

2. **`btn--earth` and `btn--outline` fail contrast on light backgrounds** — The amber/earth button (`#b8722a` on white) produces a contrast ratio of approximately 3.9:1, below the WCAG AA threshold of 4.5:1. The outline button is defined as white text on a transparent background; it works on dark hero sections but is invisible when rendered on cream or linen surfaces — which happens on at least two pages. [HIGH / Accessibility]

3. **Privacy policy does not mention the register-of-interest list** — The site now collects email, first name, and region via a separate Brevo list (list ID 9). The privacy policy description reads: *"newsletter sign-ups, contact form enquiries, and basic website analytics"* and makes no reference to this additional capture. This is a transparency gap for UK GDPR compliance. [HIGH / Trust & Legal]

4. **Outdated blog content contradicts the homepage** — Several 2023 posts state that human composting "is currently illegal in the UK" or "may soon be legal." The homepage prominently states Scotland legalised alkaline hydrolysis in March 2026. These posts will be read by search visitors who may come away with inaccurate information, which erodes trust. [HIGH / Content & Trust]

5. **The `data-submit-label` fallback is hardcoded wrong** — `NewsletterForm.astro` resets the submit button text after submission using `form.dataset.submitLabel ?? "Sign me up"`, but `data-submit-label` is never set on the form element. In the footer's inline form, the button reads "Subscribe"; after any submission attempt it resets to "Sign me up." The mismatch is small but a noticeable polish failure. [MEDIUM / Forms]

---

## Findings

### 1. Information Architecture and Navigation

---

**Issue: The `/2023-old/` stub page is live, indexable, and has duplicate metadata**  
**Where:** `src/pages/2023-old/03/21/what-is-terramation/index.astro`  
**Why it matters:** The page contains `<h1>What is Terramation?</h1><p>This is the first article URL test.</p>` and has title "What is Terramation? | Terramation UK" — identical to the real blog post at `/2023/03/21/what-is-terramation/`. It carries no `noindex` directive, so search engines will crawl it, index it, and may serve it instead of the real page. It is also included in the auto-generated sitemap.  
**Recommended fix:** Add `noindex={true}` to the BaseLayout call, or delete the file and redirect the URL. If the URL was ever externally linked, a 301 redirect to the real post is safer.  
**Severity: HIGH**

---

**Issue: `/register-interest/` is not in the main navigation**  
**Where:** `src/components/Header.astro` — nav array has no register entry  
**Why it matters:** The register-of-interest page is the second most important conversion target on the site. It is reachable only via the announcement bar (dismissible), the footer link, in-content CTA blocks, and the composting card. A visitor who dismisses the bar, skips the footer, and doesn't visit the Find Sustainable Funerals page may never see it. The brief deliberately excluded it from the nav, but this is worth revisiting once conversion data shows uptake.  
**Recommended fix:** Consider a small "Register" text link in the nav on larger screens, or a persistent indicator that survives bar dismissal. At minimum, track announcement-bar dismissal rate via SA to evaluate urgency.  
**Severity: MEDIUM**

---

**Issue: The Thank You page copy is ambiguous**  
**Where:** `src/pages/thank-you/index.astro`  
**Why it matters:** The page reads: *"If you arrived here from an email confirmation, your sign-up has been completed successfully. If you sent us a message, we will reply as soon as possible."* However, the contact form does not redirect here — it shows success state inline on `/contact/`. This page is reached only via DOI email confirmation links. The "if you sent us a message" clause will never be true in practice, and the conditional framing makes the page feel generic and uncertain.  
**Recommended fix:** Simplify to reflect the actual use case: DOI confirmation only. Or wire the contact form to redirect here on success.  
**Severity: LOW**

---

**Issue: Blog posts have no pagination or post count**  
**Where:** `src/pages/blog/index.astro`  
**Why it matters:** As the post count grows, the blog index renders all posts on one page with no load-more or pagination. This is fine now but will degrade performance and scannability over time.  
**Recommended fix:** Not urgent yet. Note for when post count exceeds ~20.  
**Severity: LOW**

---

### 2. Conversion and the CTA System

---

**Issue: RegisterInterestCTA is placed inside the homepage two-column grid column, creating a premature ask on mobile**  
**Where:** `src/pages/index.astro` lines 75–79  
**Why it matters:** The CTA block ("Be first to know when it's available") sits inside the left column of the "What is human composting?" two-column layout, below the "Learn more" button. On desktop this is reasonable — the visitor has just read the explainer copy. On mobile, when the grid collapses to a single column, the ordering is: explainer text → Learn more button → RegisterInterestCTA block → image. The register ask appears before the visitor has seen the process images, before the "Why it matters" section, and before any legal-status context. This may reduce conversion quality (sign-ups from visitors who don't yet understand what they're registering for).  
**Recommended fix:** Move the RegisterInterestCTA to below the "Why it matters" feature grid instead, where it follows the natural education sequence. *Needs visual confirmation on mobile.*  
**Severity: MEDIUM**

---

**Issue: Footer inline form renders a double label — `h3` wrapper plus inline form label**  
**Where:** `src/components/Footer.astro` — `site-footer__signup-heading` ("Close the Circle") plus `src/components/NewsletterForm.astro` — `newsletter-form__inline-label` ("Sign up for campaign updates")  
**Why it matters:** When `showFooterSignup` is true, the footer renders a heading and subtext in the left panel, then the inline NewsletterForm which also renders its own label paragraph above the row. The result is two headings for the same form: "Close the Circle" and immediately below it "Sign up for campaign updates." Visually redundant and potentially confusing.  
**Recommended fix:** Pass `heading=""` (empty string) to the NewsletterForm when rendered in the footer, or suppress the inline label via a prop, so only the footer's own heading is visible.  
**Severity: MEDIUM**

---

**Issue: The blog post CTA order may create competing hierarchy**  
**Where:** `src/pages/[year]/[month]/[day]/[slug]/index.astro` lines 105–116  
**Why it matters:** Blog posts render `<RegisterInterestCTA>` (a linen-background button block) immediately above a dark `<NewsletterForm>` panel. These are two distinct asks (register intent vs. subscribe to campaign) in close vertical proximity, differentiated only by background colour. For a recently bereaved visitor, encountering two different prompts one after the other could feel cluttered. The governing rule says "one primary CTA per context" — two consecutive blocks is a borderline case.  
**Recommended fix:** Consider a visual separator (more space) between the two, or A/B test whether removing one improves the other's conversion. The ordering (register first, campaign form second) is correct; the spacing is the concern. *Needs visual confirmation.*  
**Severity: LOW**

---

**Issue: The `a-step-closer-to-legalisation` post has a hardcoded absolute URL link to `/contact/`**  
**Where:** `src/content/blog/a-step-closer-to-legalisation-updates-on-the-campaign-for-human-composting-in-the-uk.md` — `[Sign up to find out more](https://terramation.uk/contact/)`  
**Why it matters:** This is an absolute URL, and more importantly it points to `/contact/`, not the register-interest form — the correct destination for high-intent users finishing a campaign post. It also bypasses the blog layout's injected `<RegisterInterestCTA>` by providing an inline alternative with different copy and destination.  
**Recommended fix:** Replace with `/register-interest/` as a relative link and align the copy.  
**Severity: MEDIUM**

---

### 3. Content and Messaging

---

**Issue: Multiple 2023 blog posts are factually outdated**  
**Where:**  
- `src/content/blog/a-step-closer-to-legalisation-updates-on-the-campaign-for-human-composting-in-the-uk.md` — "Human composting is currently illegal in the UK"  
- `src/content/blog/the-church-of-england-is-considering-legalising-human-composting.md` (not read but likely similar, given date range)  
- Likely others in the 2023 cohort  
**Why it matters:** The homepage correctly states Scotland legalised alkaline hydrolysis in March 2026. A visitor who arrives at a 2023 post via Google sees contradictory information. For a topic this sensitive — people researching end-of-life options, potentially for themselves or a loved one — inaccurate legal status is a genuine trust issue.  
**Recommended fix:** Add a short editorial note at the top of each affected post: *"This post was written in [year]. For the current legal status, see our [latest news](/blog/)."* Alternatively, add a `modDate` and update the copy for the highest-traffic posts.  
**Severity: HIGH**

---

**Issue: "A Step Closer to Legalisation" is an unbroken wall of text**  
**Where:** `src/content/blog/a-step-closer-to-legalisation-updates-on-the-campaign-for-human-composting-in-the-uk.md` — the body is a single paragraph running 300+ words  
**Why it matters:** Scannability is zero. The post opens with a blog image inline in the text (`![photo](...) Human composting, also known as...`) with no paragraph breaks. Readers, especially those in a research or grief context, will bounce.  
**Recommended fix:** Break into short paragraphs. Move the inline image to a proper block. Add subheadings.  
**Severity: MEDIUM**

---

**Issue: "What is Terramation?" blog post has process images with alt text set to title text**  
**Where:** `src/content/blog/what-is-terramation.md` — `<img src="..." alt="Preparation of the body for terramation" />` (in the process flow HTML blocks)  
**Why it matters:** The alt text on the step images in the process flow is reasonable and descriptive. However, the featured image in `PostCard.astro` uses `alt={post.data.title}` — see Accessibility section.  
**Recommended fix:** No change needed in the content; the PostCard issue is separate.  
**Severity: N/A** (noted, see below)

---

**Issue: Hero lead copy says "Join thousands who believe" — unverifiable claim**  
**Where:** `src/pages/index.astro` line 43  
**Why it matters:** "Join thousands of supporters" appeared in the removed section as well. Without a visible subscriber count, the word "thousands" is an unverifiable social proof claim. Given that the previous "100,000 signatures" claim was removed for being false, any unverified number claim is a risk.  
**Recommended fix:** Replace with a tone-first line: "Join everyone who believes this choice should be available in the UK." Or remove the quantifier.  
**Severity: MEDIUM**

---

**Issue: Privacy policy description meta is incomplete**  
**Where:** `src/pages/privacy-policy/index.astro` — `description="How Terramation UK handles newsletter sign-ups, contact form enquiries, and basic website analytics."`; and likely the policy body itself  
**Why it matters:** The register-of-interest form (Brevo list 9) collects email, first name, and region — a separate data pipeline from the campaign list. This is not mentioned in the meta description and almost certainly not in the policy body (which predates this feature). UK GDPR requires transparency about all data collection purposes and the lawful basis.  
**Recommended fix:** Update the privacy policy to name the register-of-interest collection, state list 9 is separate from the campaign list, and confirm the region field purpose. Update the meta description accordingly.  
**Severity: HIGH**

---

### 4. Visual Hierarchy and Consistency

---

**Issue: `btn--outline` is designed exclusively for dark backgrounds**  
**Where:** `src/styles/global.css` lines 541–551 — `color: var(--color-white); border-color: rgba(255,255,255,.5)`  
**Why it matters:** This button variant is used in at least three places that may not have dark backgrounds:  
1. `src/pages/find-sustainable-funerals/index.astro` — `<a href="/advertise/" class="btn btn--outline featured-provider__secondary">` inside a `.section--tinted` (linen) card  
2. `src/pages/advertise/index.astro` — `<a href="/find-sustainable-funerals/" class="btn btn--outline advertise-hero__secondary">` — background depends on `advertise-hero__card` styles (not confirmed)  
On a cream or linen background, white text is invisible. *Needs visual confirmation to identify every affected instance.*  
**Recommended fix:** Add a `.btn--outline-dark` variant for dark contexts (keeping white text/border) and change the base `.btn--outline` to `color: var(--color-forest); border-color: var(--color-forest)` for use on light backgrounds.  
**Severity: HIGH**

---

**Issue: `btn--earth` / `btn--amber` fails WCAG AA contrast**  
**Where:** `src/styles/global.css` line 553 — `background-color: var(--color-amber) = #b8722a`, `color: var(--color-white)`  
**Why it matters:** Calculated contrast ratio: approximately 3.9:1 (white on #b8722a). WCAG AA requires 4.5:1 for normal text and 3:1 for large text (≥18pt bold or ≥24pt). Button text at `var(--text-base)` (1rem/16px) and 700 weight — at exactly 18pt bold, this might pass large-text threshold at 3:1 but fails normal text. This button is used on Find Sustainable Funerals provider links and throughout the directory.  
**Recommended fix:** Darken the amber slightly to pass AA: `#9e5e20` achieves approximately 4.6:1 on white. Or change the text to dark (`--color-soil`).  
**Severity: HIGH**

---

**Issue: Both typography tokens reference the same font**  
**Where:** `src/styles/global.css` lines 28–29 — `--font-serif` and `--font-sans` both set to `"Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif`  
**Why it matters:** The variable names imply a serif/sans distinction that doesn't exist. Both headings and body text will render in the same face. On non-Apple devices (Windows, Android), Avenir Next is not available and all text falls back to Arial. This is a design fidelity issue, not a functionality issue.  
**Recommended fix:** Either load a web font (e.g. via Google Fonts) for at least one weight, or rename the variables to `--font-body` and `--font-heading` to reflect their actual usage. Low priority unless the design requires a real type distinction.  
**Severity: LOW**

---

**Issue: Blog post card eyebrow always reads "Terramation UK" regardless of category**  
**Where:** `src/components/PostCard.astro` line 37 — `primaryCategory = "Terramation UK"` as default; blog index never passes `primaryCategory`  
**Why it matters:** Each post has `categories` frontmatter (e.g. "Human Composting"). The card eyebrow could surface these categories as useful content signals, but instead shows the site name — which is redundant given the site logo is at the top of every page.  
**Recommended fix:** Pass `primaryCategory={post.data.categories?.[0]}` from the blog index and blog post template to PostCard.  
**Severity: LOW**

---

### 5. Forms and Feedback

---

**Issue: `data-submit-label` is read but never written — wrong button label after submission in footer form**  
**Where:** `src/components/NewsletterForm.astro` line 188 — `submitBtn.textContent = form.dataset.submitLabel ?? "Sign me up"`  
**Why it matters:** The `data-submit-label` attribute is never set on the `<form>` element, so this always falls back to "Sign me up". In the inline footer variant, the submit button reads "Subscribe". After any submission attempt (successful or failed), it resets to "Sign me up" — a different label from the original. The mismatch is noticeable on repeated error + retry flows.  
**Recommended fix:** Set `data-submit-label` on the form element based on the variant, or derive it from the variant prop: for `inline`, the original button text is "Subscribe"; for `stacked`, "Sign me up". Simplest fix: in the `finally` block, query the button's original `textContent` before setting it to "Sending…" and store it in a variable for restoration.  
**Severity: MEDIUM**

---

**Issue: RegisterInterestForm consent checkbox name is `consent`, subscribe form is `marketingOptIn` — inconsistent field names across two forms**  
**Where:** `src/components/RegisterInterestForm.astro` line (checkbox `name="consent"`) vs `src/components/NewsletterForm.astro` line (checkbox `name="marketingOptIn"`)  
**Why it matters:** The mismatch is not a user-facing problem but creates inconsistency in the data sent to the APIs. If a future shared validation utility or Brevo integration is built, the naming difference will cause bugs. Both work correctly with their respective endpoints now.  
**Recommended fix:** Minor — standardise to `marketingOptIn` or `consent` across both forms in a future cleanup.  
**Severity: LOW**

---

**Issue: Register-interest honeypot `<label>` is visually hidden but not `aria-hidden`**  
**Where:** `src/components/RegisterInterestForm.astro` — the honeypot wrapper uses `aria-hidden="true"` on the outer div, but the `<label>` and `<input>` inside it are still semantically present in the accessibility tree via ARIA inheritance  
**Why it matters:** `aria-hidden="true"` on a container hides all descendants from the accessibility tree, so screen readers won't announce the "Website" label — this is correct. The `tabindex="-1"` prevents keyboard focus. Overall the implementation is sound. No action needed.  
**Recommended fix:** None required.  
**Severity: N/A**

---

**Issue: Subscribe API success message inconsistency — DOI vs single opt-in**  
**Where:** `src/pages/api/subscribe.ts` lines 106–108 — when DOI is not configured, success message reads "You're on the list! We'll keep you updated on terramation in the UK." When DOI is used, it reads "Thanks! We've sent you a confirmation email…"  
**Why it matters:** If `BREVO_DOI_TEMPLATE_ID` is not set (unclear from the code whether it's configured in production), the form silently falls back to single opt-in without the user knowing they need to confirm. The success message changes based on this — but there is no UI indication of which flow fired. Worth confirming in production.  
**Recommended fix:** Verify production env vars. If DOI is not used, consider whether single opt-in meets your campaign's expectations. If DOI is active, no action needed.  
**Severity: MEDIUM** (depends on production config)

---

### 6. Accessibility

---

**Issue: `btn--earth` fails WCAG AA colour contrast**  
*(See Visual Hierarchy section above — duplicated here for accessibility indexing)*  
**Severity: HIGH**

---

**Issue: `btn--outline` is invisible on light backgrounds**  
*(See Visual Hierarchy section above)*  
**Severity: HIGH**

---

**Issue: PostCard image `alt` text duplicates the card heading**  
**Where:** `src/components/PostCard.astro` line — `alt={post.data.title}`  
**Why it matters:** The card renders both `<img alt={post.data.title}>` and `<HeadingTag class="card__title">{post.data.title}</HeadingTag>`. Screen readers will announce the image alt text and then immediately encounter identical heading text — the same information twice. Images that are purely decorative (content already conveyed by adjacent text) should use `alt=""`.  
**Recommended fix:** Change to `alt=""` on the `<img>` element. The heading already identifies the post.  
**Severity: MEDIUM**

---

**Issue: PostCard entire card is a single `<a>` — verbose screen reader link text**  
**Where:** `src/components/PostCard.astro` — `<a href={href} class="card">` wrapping image, category, heading, excerpt, date, and "Read article →"  
**Why it matters:** Screen readers will announce the full card content as link text: "[image] Terramation UK [heading] [excerpt] [date] Read article →". This is legally valid in HTML5 but extremely verbose in a list of multiple cards. Navigating the blog index by link becomes tedious for assistive technology users.  
**Recommended fix:** One of two patterns: (a) Use `aria-label={post.data.title}` on the `<a>` element to override the announced text to just the title; or (b) restructure the card so only the heading is a link and the card has a pseudo-element click overlay. Option (a) is the smallest change.  
**Severity: MEDIUM**

---

**Issue: Announcement bar focus order interrupts skip-link-to-nav path**  
**Where:** `src/layouts/BaseLayout.astro` — DOM order is: skip link → AnnouncementBar (link + close button) → Header (nav)  
**Why it matters:** The skip link is correctly first. But keyboard users who Tab from the skip link reach the AnnouncementBar link, then the close button, before arriving at the nav. This is technically acceptable (the bar is real content) but adds two extra Tab stops on every page load for users who cannot dismiss the bar persistently (e.g. users with cookies disabled). The bar close does use localStorage, so it persists — the interruption only affects the first visit.  
**Recommended fix:** No code change needed. Worth noting as context for future changes.  
**Severity: LOW**

---

**Issue: Hero section `<h1>` contains a `<br>` — screen reader phrasing break**  
**Where:** `src/pages/index.astro` line 40 — `<h1>Return to the Earth.<br />Naturally.</h1>`  
**Why it matters:** Some screen readers will add a pause or announce "line break" at `<br>` inside headings, depending on the user agent. This is cosmetic in most modern readers but the phrasing also reads as two fragments. Using CSS `max-width` on the heading to control line wrapping achieves the same visual result without the markup.  
**Recommended fix:** Remove the `<br>` and control wrapping via CSS if needed.  
**Severity: LOW**

---

**Issue: The `<main>` skip link target is `id="main-content"` on the `<main>` element itself — correct**  
**Where:** `src/layouts/BaseLayout.astro`  
**Why it matters:** Confirmed correct. Skip link href is `#main-content`, `<main id="main-content">` is present. No issue.  
**Severity: N/A**

---

**Issue: Heading hierarchy in blog post layout — `<h3>` used for newsletter form heading inside `<h1>` page**  
**Where:** `src/components/NewsletterForm.astro` line 35 — `<h3 class="newsletter-form__heading">{heading}</h3>`; and `src/components/RegisterInterestCTA.astro` — `<h3 class="ri-cta__heading">`  
**Why it matters:** The blog post page has `<h1>` (post title) and `<h2>` headings within the post body. The `<RegisterInterestCTA>` and `<NewsletterForm>` injected at the foot of the post use `<h3>` — which is correct given the hierarchy (`<h2>` sections → `<h3>` sub-elements). However, if a post body has no `<h2>` headings, the `<h3>` in the footer area creates a heading-level skip (h1 → h3). Worth checking in the rendered outline.  
**Recommended fix:** Consider using `<h2>` for the CTA and form headings, which always comes after an `<h1>` and is robust regardless of post structure. Or accept current structure as acceptable.  
**Severity: LOW**

---

### 7. Responsive and Mobile

---

**Issue: Homepage two-column responsive grid uses an attribute selector targeting inline styles — fragile**  
**Where:** `src/pages/index.astro` bottom `<style>` block — `section .container > div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; }`  
**Why it matters:** This selector targets elements by inspecting their inline `style` attribute string. It will break if the inline style string changes (e.g. whitespace is added: `grid-template-columns: 1fr 1fr`). It is also brittle in any future refactor. The `!important` override is a sign of the fragility.  
**Recommended fix:** Replace inline grid styles with a CSS class (e.g. `.two-col-grid`) defined in the component `<style>` block, with a `@media (max-width: 768px)` override in the same block. This is more maintainable and reliable.  
**Severity: MEDIUM**

---

**Issue: Announcement bar text wrapping on narrow screens**  
**Where:** `src/components/AnnouncementBar.astro` — on mobile ≤480px, padding is `var(--space-2) var(--space-10) var(--space-2) var(--space-4)` (right padding reserves space for the close button)  
**Why it matters:** The text "Change is coming. Register your interest →" is short enough to fit on a single line on most mobile screens. The layout switch at 480px (left-align, extra right padding) is appropriate. *Needs visual confirmation on 320px–375px screens* to confirm no text overflow against the close button.  
**Severity: LOW** *(needs visual confirmation)*

---

**Issue: Footer signup strip layout on medium viewports (769px–900px)**  
**Where:** `src/components/Footer.astro` — `.site-footer__signup-inner` is flex-row with intro (`max-width: 260px`) + form (`flex: 1`). The breakpoint to column is at ≤768px.  
**Why it matters:** At 769px–900px the footer renders the intro and inline form side by side. The intro is 260px wide; the remaining ~500px goes to the form. The inline form's `flex-wrap` row (email input + button) should have enough room, but the consent checkbox text below the row is small. *Needs visual confirmation on a medium tablet viewport.*  
**Severity: LOW** *(needs visual confirmation)*

---

**Issue: Mobile nav requires JavaScript — no-JS users see all nav items stacked always**  
**Where:** `src/components/Header.astro` — the `.js` class is added by an inline script; `.js .nav-toggle { display: block }` and `.js .site-nav { display: none }` hide/show the toggle and nav. Without JS, the nav toggle is hidden and all nav items are visible.  
**Why it matters:** This is a graceful degradation pattern — without JS, navigation still works. However, on mobile without JS the nav stacks vertically above the page content and may overlap the header layout. Acceptable but worth noting.  
**Severity: LOW**

---

### 8. Performance

---

**Issue: Hero background image served as JPEG — no WebP or AVIF offered**  
**Where:** `src/pages/index.astro` line 30 — `/images/2023/03/noah-buscher-x8ZStukS2PM-unsplash-1024x586.jpg`  
**Why it matters:** The hero image is the LCP (Largest Contentful Paint) candidate, loaded with `fetchpriority="high"` (good). Serving as JPEG instead of WebP typically adds 20–30% to file size. Since this is the first paint image on the homepage, it directly affects Core Web Vitals.  
**Recommended fix:** Convert to WebP and update the `src`. Or use `<picture>` with `<source type="image/webp">`. If images are stored in a CDN that handles this automatically (e.g. Cloudinary, Netlify Image CDN), no code change needed.  
**Severity: MEDIUM**

---

**Issue: Provider directory `href` values for real providers are external links without `width`/`height` on logo placeholder SVG**  
**Where:** Not a performance issue but noted: the `featured-provider` slot has a placeholder logo text (`logoText: "Featured logo"`) — no actual logo image. The SVG placeholder in PostCard has no explicit `width`/`height` on the outer element, which could cause layout shift. *Needs visual confirmation.*  
**Severity: LOW**

---

**Issue: Blog post featured images have no explicit `width` and `height` attributes**  
**Where:** `src/components/PostCard.astro` — `<img src={post.data.featuredImage} alt={post.data.title} class="card__image" loading="lazy" />` — no `width` or `height`  
**Why it matters:** Without explicit dimensions, the browser cannot reserve space for the image before it loads, causing Cumulative Layout Shift (CLS) on the blog index and blog pages. The global CSS sets `img { height: auto }` which won't help if no intrinsic dimensions are communicated.  
**Recommended fix:** Either add width/height to the PostCard image (requires knowing dimensions upfront — impractical for CMS content), or set a fixed aspect ratio via CSS: `.card__image { aspect-ratio: 16/9; object-fit: cover; }`. This prevents CLS.  
**Severity: MEDIUM**

---

### 9. SEO and Metadata

---

**Issue: `/2023-old/` stub page creates duplicate content and sitemap pollution**  
*(See Information Architecture above)*  
**Severity: HIGH**

---

**Issue: `/register-interest/` has no structured data**  
**Where:** `src/pages/register-interest/index.astro` — no JSON-LD  
**Why it matters:** Blog posts have rich Article structured data (JSON-LD). The register-interest page has none. For a capture page, structured data won't change rankings significantly, but a `WebPage` or `Organization` schema would add coherence. Low priority.  
**Recommended fix:** Optional. Add minimal `WebPage` schema with title and description.  
**Severity: LOW**

---

**Issue: Blog posts' `modDate` is not updated on edited posts**  
**Where:** `src/content/blog/what-is-terramation.md` — `modDate: 2024-09-05`; `src/content/blog/uk-government-moves-to-legalise-human-composting.md` — edited in this session but modDate not updated  
**Why it matters:** The blog post layout renders `dateModified` in the JSON-LD structured data using `post.data.modDate`. When a post is edited but `modDate` is not updated, the structured data reports a stale modification date, which can affect how Google evaluates content freshness.  
**Recommended fix:** Update `modDate` in frontmatter whenever post body content is edited.  
**Severity: MEDIUM**

---

**Issue: `sitemap.xml` will include `/2023-old/` URL**  
**Where:** `astro.config.mjs` — `@astrojs/sitemap` integration is active; no exclusion rules are set  
**Why it matters:** The auto-generated sitemap will include the stub test page alongside the real content pages, diluting the sitemap with a poor-quality URL and potentially confusing search engines about which version of "What is Terramation?" to index.  
**Recommended fix:** Either add `noindex` to the stub page (which will cause crawlers to drop it from indexing) or configure sitemap exclusions in `astro.config.mjs` via the `filter` option.  
**Severity: HIGH** (linked to the `/2023-old/` issue above)

---

**Issue: Open Graph image for all non-blog pages is the same default**  
**Where:** `src/layouts/BaseLayout.astro` line 16 — `ogImage = "/images/2023/03/terramation_UK_home-of-composting-1024x810.png"`  
**Why it matters:** `/register-interest/`, `/find-sustainable-funerals/`, `/advertise/`, and `/contact/` all share the same OG image when shared on social media. This is acceptable for now but limits the social visual identity of key conversion pages.  
**Recommended fix:** Create page-specific OG images for at least the `/register-interest/` and `/find-sustainable-funerals/` pages. Low priority.  
**Severity: LOW**

---

### 10. Trust and Sensitivity

---

**Issue: Privacy policy does not reference the register-of-interest data collection**  
*(See Content section above)*  
**Severity: HIGH**

---

**Issue: "No obligation" appears only in the page-header subtext on `/register-interest/`, not in the consent checkbox wording**  
**Where:** `src/pages/register-interest/index.astro` — `No obligation.` is in the page header description; `src/components/RegisterInterestForm.astro` — consent checkbox text is accurate and GDPR-compliant  
**Why it matters:** "No obligation" in the header is reassuring but could be moved closer to the form submit button or kept in both places. Currently it may not be visible to users who scroll straight to the form. Low priority.  
**Recommended fix:** No urgent change. Consider adding a small note near the submit button ("We'll only contact you when it's relevant. Unsubscribe any time.").  
**Severity: LOW**

---

**Issue: Bereavement sensitivity — hero copy uses "Join thousands" social proof**  
*(See Content section above)*  
**Severity: MEDIUM**

---

**Issue: "Join our supporters" on `/contact/` form has very thin subtext**  
**Where:** `src/pages/contact/index.astro` — `<NewsletterForm heading="Join our supporters" subtext="Sign up to stay informed and find out how to take action." dark={true} />`  
**Why it matters:** The subtext "Sign up to stay informed and find out how to take action" is generic. A visitor on the contact page who has just submitted a message has a stronger intent signal; they deserve to know what exactly they're signing up for (campaign updates, legislation news, etc.).  
**Recommended fix:** Update subtext to match the homepage campaign section's copy: "Get the latest news on human composting legislation in the UK. Occasional emails only. Unsubscribe any time."  
**Severity: LOW**

---

## Quick Wins

These are the cheapest fixes relative to their impact. In priority order:

1. **Add `noindex` to `/2023-old/03/21/what-is-terramation/index.astro`** — one-line change, stops duplicate content and sitemap pollution immediately. [HIGH / 5 minutes]

2. **Fix `btn--earth` contrast** — change `--color-amber` from `#b8722a` to `#9e5e20` in `global.css`. One token change, fixes the button across all pages. *Verify the new shade visually.* [HIGH / 5 minutes]

3. **Investigate `btn--outline` on light backgrounds** — open `/find-sustainable-funerals/` in a browser, confirm the "View advertising options" button is readable. If not, add a second button variant or change the colour for light-background instances. [HIGH / 30 minutes]

4. **Update `modDate` on edited posts** — update `modDate` in frontmatter for `what-is-terramation.md` and `uk-government-moves-to-legalise-human-composting.md` to reflect recent edits. Helps search freshness signals. [MEDIUM / 5 minutes]

5. **Fix `data-submit-label` in NewsletterForm** — in the submit handler's `finally` block, store the original button text before setting it to "Sending…" and restore from that variable. Remove the `dataset.submitLabel` reference. [MEDIUM / 10 minutes]

6. **Fix PostCard image alt text** — change `alt={post.data.title}` to `alt=""` in `PostCard.astro`. One-line, fixes screen-reader redundancy on every blog card across the site. [MEDIUM / 2 minutes]

7. **Add editorial dateline note to outdated 2023 posts** — prepend a short HTML callout to the top of the body in the three most-visited 2023 posts noting their publication year and linking to `/blog/` for current status. Preserves SEO value while correcting misleading claims. [HIGH / 20 minutes]

8. **Update privacy policy** — add a section covering the register-interest form, Brevo list 9, the region field, and data purpose. Legally required; trust-critical. [HIGH / depends on legal review]

9. **Remove the inline absolute URL from `a-step-closer-to-legalisation.md`** — change `[Sign up to find out more](https://terramation.uk/contact/)` to `[Register your interest](/register-interest/)`. Aligns the post with the CTA system and removes a hardcoded absolute URL. [MEDIUM / 2 minutes]

10. **Add `aspect-ratio` to `.card__image` in global CSS** — prevents CLS on the blog index without needing to know image dimensions. `aspect-ratio: 16/9; object-fit: cover;` in the existing `.card__image` rule. [MEDIUM / 5 minutes]
