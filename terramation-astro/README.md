# Terramation UK Astro Site

Astro/Netlify replacement for the Terramation UK WordPress site.

## Blog posts

Use the template at [docs/blog-post-template.md](/Users/joekenyon/Terramation-UK-Site/terramation-astro/docs/blog-post-template.md) when adding a new article.

Fastest way to create a new draft:

```bash
npm run new:post -- your-post-slug
```

Add real posts to:

- [src/content/blog/](/Users/joekenyon/Terramation-UK-Site/terramation-astro/src/content/blog)

Use only these categories exactly:

- `UK News`
- `Human Composting`
- `Uncategorised`

Put images in:

- [public/images/](/Users/joekenyon/Terramation-UK-Site/terramation-astro/public/images)

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server                          |
| `npm run build`           | Builds the production site to `./dist/`         |
| `git push origin main`    | Pushes changes and triggers Netlify deploy       |
