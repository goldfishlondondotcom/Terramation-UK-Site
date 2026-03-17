# Edit Directory Placements

The sustainable funerals directory is now driven from one file:

- `src/data/provider-directory.ts`

## To update the featured slot

Edit:

- `featuredProvider.name`
- `featuredProvider.category`
- `featuredProvider.summary`
- `featuredProvider.highlights`
- `featuredProvider.href`
- `featuredProvider.cta`

Optional:

- `featuredProvider.logoText`
- `featuredProvider.logoImage`

If you add a real logo image:

1. Put it in `public/images/...`
2. Set `featuredProvider.logoImage` to that path
3. The page will use the image instead of the placeholder text box

## To update standard listings

Edit the `providerCategories` array.

Each provider entry supports:

- `name`
- `href`
- `note`
- `sponsored`

Set `sponsored: true` if you want the listing to show the sponsored badge.
