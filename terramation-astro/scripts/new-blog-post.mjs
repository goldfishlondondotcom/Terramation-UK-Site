import fs from "node:fs/promises";
import path from "node:path";

const [, , rawArg] = process.argv;

function showUsage() {
  console.log("Usage: npm run new:post -- your-post-slug");
  console.log("Example: npm run new:post -- human-composting-update-march-2026");
}

if (!rawArg || rawArg === "--help" || rawArg === "-h") {
  showUsage();
  process.exit(rawArg ? 0 : 1);
}

const slug = rawArg.trim().replace(/\.md$/i, "");

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    "Slug must use lowercase letters, numbers, and hyphens only. Example: human-composting-update-march-2026",
  );
  process.exit(1);
}

const now = new Date();
const year = String(now.getFullYear());
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const pubDate = `${year}-${month}-${day}`;

const title = slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, "src", "content", "blog", `${slug}.md`);
const relativeOutputPath = path.relative(projectRoot, outputPath);

try {
  await fs.access(outputPath);
  console.error(`A post already exists at ${relativeOutputPath}`);
  process.exit(1);
} catch {
  // File does not exist yet — continue.
}

const template = `---
title: "${title}"
description: "Add a short summary here for the blog card and SEO."
featuredImage: "/images/${year}/${month}/your-image.jpg"
pubDate: ${pubDate}
categories: ["Human Composting"]
---

# ${title}

Write your opening paragraph here.

## Add a section heading

Write the next section here.

## Add another section heading

You can include images in the article body like this:

![Describe the image](/images/${year}/${month}/your-image.jpg)

Finish the article here.
`;

await fs.writeFile(outputPath, template, "utf8");

console.log(`Created ${relativeOutputPath}`);
console.log("");
console.log("Next steps:");
console.log(`1. Open ${relativeOutputPath}`);
console.log("2. Replace the placeholder description");
console.log(`3. Put your image in public/images/${year}/${month}/`);
console.log("4. Update featuredImage if needed");
console.log("5. Set categories to UK News, Human Composting, or Uncategorised");
