# cloudhal.com

The marketing site for [Cloudhal](https://github.com/cloudhal-dev/cloudhal), the agent-native site platform on Cloudflare — **built with Cloudhal itself**.

It was created with `cloudhal init`, runs with `cloudhal dev`, and every word on it is Cloudhal content (pages made of sections, posts in a collection, menus), not hard-coded markup. The theme, `cloudhal-marketing`, follows RFC-0018's theme boundary.

## Why it is built on Cloudhal

- **Dogfooding.** Every rough edge a new user hits, we hit first. They are written down in [docs/dogfooding-notes.md](docs/dogfooding-notes.md) and fixed upstream.
- **The safety story, shown.** Changes to this site go through the same snapshots, previews, approvals and rollbacks we describe on it.
- **Releases, not main.** The site deploys only from stable Cloudhal release tags, so it never runs ahead of what users can install.

## Run it

Needs Node 24 and pnpm 12. Until `@cloudhal/*` is on npm, the packages are linked from a sibling checkout of the monorepo:

```
~/Desktop/
  cloudhal-dev/   # github.com/cloudhal-dev/cloudhal, with `pnpm install` done
  cloudhal.com/   # this repo
```

```bash
pnpm install
pnpm seed        # content/site.ts → the local store (.cloudhal/), then publish a snapshot
pnpm dev         # cloudhal dev → http://localhost:4321
```

Other commands: `pnpm build` (`cloudhal build`, static HTML from the published snapshot into `dist/`), `pnpm studio` (Studio for this project), `pnpm mcp` (MCP server for agents), `pnpm exec cloudhal render / --width 1440,390` (screenshots plus contrast and layout checks).

## Layout

| Path | What |
|---|---|
| `content/site.ts` | The site's words: pages, sections, posts, design settings. `pnpm seed` writes them into the store. |
| `scripts/seed.ts` | Idempotent seed: pages by path, posts by slug, menus by key; creates the site on a fresh clone. |
| `src/blocks.ts` | Block types: `feature-grid`, `steps`, `pricing-table`, `link-cards`, `cta-band` (+ the starter's `testimonial`). |
| `src/theme.ts` | Section kinds and block types → components (`src/components/marketing/`). |
| `src/styles/features/marketing.css` | The marketing look, on the site's color roles (so Studio's Appearance and dark mode apply). |
| `src/pages`, `src/layouts` | The starter's routes and layout, unchanged. |
| `cloudhal.json` | Site id, domain `cloudhal.com`, analytics on, comments off. |

The local store (`.cloudhal/`) is not committed. After `pnpm seed`, the store is the source of truth: edit in Studio or through an agent. Re-running `pnpm seed` resets the marketing pages to `content/site.ts`. On a fresh clone the seed creates a new site and writes its id into `cloudhal.json`.

## Domains

`cloudhal.com` serves this site (ADR-0037). Docs live at `cloudhal.dev/docs` (`cloudhal.com/docs` should redirect there), the playground at `try.cloudhal.com`.

**www:** `www.cloudhal.com` should 301 to `https://cloudhal.com`. `cloudhal domain` takes one hostname per target and has no redirect, so this is a Cloudflare Redirect Rule on the zone for now (see the dogfooding notes).

## Deploy (later)

Not deployed yet. When it is:

1. Check out a stable Cloudhal release tag in `../cloudhal-dev` (or, once published, pin `@cloudhal/*` to that version in `package.json`).
2. `pnpm install && pnpm seed` (or `cloudhal pull` from the existing deployment).
3. `cloudhal deploy` (wrangler login; the `cloudhal.com` zone must be in the same Cloudflare account), then `cloudhal push` for content changes made locally.

Never deploy from the monorepo's `main`.
