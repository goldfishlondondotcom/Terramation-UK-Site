# Blog Post Template

Fastest option:

```bash
npm run new:post -- your-post-slug
```

Example:

```bash
npm run new:post -- human-composting-update-march-2026
```

That command creates a new draft file for you automatically in `src/content/blog/`.

Copy this file into `src/content/blog/` and rename it to the URL slug you want.

Example filename:
`human-composting-update-march-2026.md`

Use one or more of these categories exactly:
- `UK News`
- `Human Composting`
- `Uncategorised`

Template:

```md
---
title: "Add your post title here"
description: "Add a short summary here for the blog card and SEO."
featuredImage: "/images/2026/03/your-image.jpg"
pubDate: 2026-03-16
categories: ["Human Composting"]
---

# Add your heading here

Write your opening paragraph here.

## Add a section heading

Write the next section here.

## Add another section heading

You can include images in the article body like this:

![Describe the image](/images/2026/03/your-image.jpg)

Finish the article here.
```

Checklist before publishing:

- Put your image in `public/images/YYYY/MM/`
- Make sure `featuredImage` matches the image path
- Check `pubDate` is correct
- Use only these category names: `UK News`, `Human Composting`, `Uncategorised`
- Save the file inside `src/content/blog/`
- Run `npm run dev -- --host 127.0.0.1 --port 4321`
- Check the post on `/blog/`
