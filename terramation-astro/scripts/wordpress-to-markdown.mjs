import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";

const xmlFile =
  process.argv[2] ||
  "terramationukthehomeofhumancompostingintheuk.WordPress.2026-03-10.xml";

const outputDir = path.resolve(process.cwd(), "src/content/blog");

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripCdata(text) {
  if (!text || typeof text !== "string") return "";
  return text.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function collapseWhitespace(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function escapeFrontmatterString(value) {
  return JSON.stringify(value ?? "");
}

function cleanMarkdownBody(body) {
  const removableBlocks = [
    /## Are you interested in a natural, more sustainable funeral\?[\s\S]*$/i,
    /\[\s*## List your funeral services here[\s\S]*$/i,
  ];

  let cleaned = body || "";

  for (const block of removableBlocks) {
    cleaned = cleaned.replace(block, "");
  }

  const junkRegexes = [
    /Your subscription could not be saved/i,
    /You're in! We'll be in touch\./i,
    /Join the Terramation Movement/i,
    /Subscribe to our newsletter and stay updated/i,
    /I agree to receive your newsletters/i,
    /\bSUBSCRIBE\b/i,
    /@font-face/i,
    /sib-container/i,
    /assets\.brevo\.com/i,
    /^\/images\/.+\.mp4$/i,
    /^#### Join the movement$/i,
    /^#### Thank you!$/i,
    /^Sign up to stay updated$/i,
    /^You have successfully joined our subscriber list\.$/i,
  ];

  return cleaned
    .split("\n")
    .filter((line) => !junkRegexes.some((re) => re.test(line.trim())))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  if (!fs.existsSync(xmlFile)) {
    console.error(`XML file not found: ${xmlFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const xml = fs.readFileSync(xmlFile, "utf-8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "#text",
    trimValues: false,
    parseTagValue: false,
  });

  const parsed = parser.parse(xml);

  const items = ensureArray(parsed?.rss?.channel?.item);

  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  let created = 0;
  let skipped = 0;
  const warnings = [];
  const filenames = [];

  function extractValue(v) {
    if (Array.isArray(v)) v = v[0];
    if (v && typeof v === "object") {
      if ("#text" in v) v = v["#text"];
      else if ("_text" in v) v = v["_text"];
      else v = "";
    }
    return typeof v === "string" ? v : "";
  }

  function getField(obj, names) {
    for (const name of names) {
      if (obj == null) continue;
      if (!(name in obj)) continue;
      const val = extractValue(obj[name]);
      if (val) return val;
    }
    return "";
  }

  for (const item of items) {
    const postType = getField(item, ["wp:post_type", "post_type"]);
    const status = getField(item, ["wp:status", "status"]);

    if (postType !== "post" || status !== "publish") {
      skipped++;
      continue;
    }

    const title = collapseWhitespace(stripCdata(getField(item, ["title"])));
    const slug = collapseWhitespace(getField(item, ["wp:post_name", "post_name"]));
    const wpDate = collapseWhitespace(
      getField(item, ["wp:post_date", "post_date"])
    );
    const pubDate = wpDate ? wpDate.split(" ")[0] : "";

    const modDateRaw = collapseWhitespace(
      getField(item, ["wp:post_modified", "post_modified"])
    );
    const modDate = modDateRaw ? modDateRaw.split(" ")[0] : pubDate;

    const excerpt = stripCdata(getField(item, ["excerpt:encoded", "excerpt"]));
    const contentHtml = stripCdata(getField(item, ["content:encoded", "content"]));

    // Extract categories
    const categories = [];
    const categoryItems = ensureArray(item.category);
    for (const cat of categoryItems) {
      if (cat && cat["@_domain"] === "category") {
        const catText = cat["#text"];
        let catName = "";
        if (Array.isArray(catText) && catText[0] && catText[0]["#text"]) {
          catName = catText[0]["#text"];
        } else if (typeof catText === "string") {
          catName = catText;
        }
        catName = stripCdata(catName);
        if (catName) categories.push(catName);
      }
    }

    if (!title || !slug || !pubDate) {
      warnings.push(`Missing title, slug or date for item with slug "${slug || "(no slug)"}"`);
      continue;
    }

    let description = collapseWhitespace(excerpt);

    if (!description) {
      const plainText = collapseWhitespace(
        turndown
          .turndown(contentHtml || "")
          .replace(/\n+/g, " ")
      );
      description = plainText.slice(0, 160).trim();
    }

    // rewrite image URLs and clean junk before converting
    let rewrittenHtml = contentHtml
      .replace(/https?:\/\/(?:www\.)?[^/]+\/wp-content\/uploads/gi, "/images")
      .replace(/\/wp-content\/uploads/gi, "/images");

    // strip <style> blocks and font-face declarations and sendinblue/brevo embeds
    rewrittenHtml = rewrittenHtml
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/@font-face[\s\S]*?\}/gi, "")
      .replace(/<[^>]*(?:sib-container|brevo|newsletter|subscribe)[^>]*>[\s\S]*?<\/[^>]+>/gi, "");

    // remove any residual script tags or comments from forms
    rewrittenHtml = rewrittenHtml.replace(/<script[\s\S]*?<\/script>/gi, "");
    rewrittenHtml = rewrittenHtml.replace(/<!--([\s\S]*?)-->/g, "");

    let markdownBody = turndown.turndown(rewrittenHtml).trim();

    markdownBody = cleanMarkdownBody(markdownBody);

    const frontmatter = [
      "---",
      `title: ${escapeFrontmatterString(title)}`,
      `description: ${escapeFrontmatterString(description)}`,
      `pubDate: ${pubDate}`,
      modDate !== pubDate ? `modDate: ${modDate}` : null,
      categories.length > 0 ? `categories: ${JSON.stringify(categories)}` : null,
      "---",
      "",
    ].filter(Boolean).join("\n");

    const outputContent = `${frontmatter}\n${markdownBody}\n`;
    const filename = `${slug}.md`;
    const filepath = path.join(outputDir, filename);

    if (fs.existsSync(filepath)) {
      const existing = fs.readFileSync(filepath, "utf-8");
      if (existing === outputContent) {
        continue;
      }
      warnings.push(`File exists and differs, skipping ${filename}`);
      continue;
    }

    fs.writeFileSync(filepath, outputContent, "utf-8");
    created++;
    filenames.push(filename);
  }

  console.log(`Imported ${created} post(s).`);

  if (filenames.length) {
    console.log("Files created:");
    for (const filename of filenames) {
      console.log(`  ${filename}`);
    }
  }

  if (skipped) {
    console.log(`Skipped ${skipped} non-post or non-published item(s).`);
  }

  // after import, run cleanup on every markdown file in outputDir
  function cleanMarkdownContent(md) {
    const parts = md.split("---");
    if (parts.length < 3) return md;
    const front = parts.slice(0, 2).join("---") + "---";
    const body = parts.slice(2).join("---");
    const cleanedBody = cleanMarkdownBody(body);
    return front + "\n" + cleanedBody.trim() + "\n";
  }

  const allFiles = fs.readdirSync(outputDir).filter((f) => f.endsWith(".md"));
  for (const file of allFiles) {
    const fp = path.join(outputDir, file);
    const content = fs.readFileSync(fp, "utf-8");
    const cleaned = cleanMarkdownContent(content);
    if (cleaned !== content) {
      fs.writeFileSync(fp, cleaned, "utf-8");
      if (!filenames.includes(file)) {
        // report if file wasn't just created
        filenames.push(file);
      }
    }
  }

  if (warnings.length) {
    console.warn("Warnings:");
    for (const warning of warnings) {
      console.warn(`  ${warning}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
