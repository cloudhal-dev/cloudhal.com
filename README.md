# cloudhal.com

The marketing site for [Cloudhal](https://github.com/cloudhal-dev/cloudhal), the agent-native site platform, **running on Cloudhal itself**.

This repository is what any Cloudhal site's repository looks like: a **theme** and **configuration**. The words, pages, posts and menus are not here. They live in the site's Cloudhal store (D1 on Cloudflare) and change the way they do on every Cloudhal site: in Studio, or through an agent connected over MCP, as snapshots that are previewed, approved, published and can be rolled back.

## What is here

| Path | What |
|---|---|
| `src/blocks.ts` | The theme's block types: `feature-grid`, `steps`, `pricing-table`, `link-cards`, `cta-band`, `testimonial`. Editors and agents fill them; the theme renders them. |
| `src/settings.ts` | The theme's design settings (colour, type, spacing, motion), set per site in Studio's Appearance. |
| `src/theme.ts`, `src/components/` | Section kinds and block types → Astro components. Every component takes its words from the content. |
| `src/strings.ts` | The few words the theme itself prints ("Related posts", "5 min read"), in English, Turkish and Japanese. |
| `src/styles/` | The look, on the site's colour roles, so Appearance and dark mode apply. |
| `src/pages`, `src/layouts` | Routes and layout from the blog starter. |
| `cloudhal.json` | Site id, domain, analytics on, comments off. |
| `wrangler.jsonc` | Worker, D1 and R2 names for Workers Builds (no secrets). |

The theme, `cloudhal-marketing`, grew out of the blog starter. It is an ordinary Cloudhal theme: [theme docs](https://cloudhal.dev/docs).

## How it changes

- **Content:** Studio at the deployment's admin address, or an agent with a key from Studio (`/mcp`). Publishing waits for a person.
- **Theme and Cloudhal version:** a pull request. Every merge to `main` deploys through Cloudflare Workers Builds (`pnpm run deploy`). After the deploy, `scripts/post-deploy-check.mjs` checks that the site and Studio answer, and rolls both Workers back if they do not.
- **New Cloudhal releases:** Dependabot opens one PR for all `@cloudhal/*` packages. [`cloudhal-update.yml`](.github/workflows/cloudhal-update.yml) bundles both Workers without deploying (`cloudhal deploy --dry-run`) and merges patch releases by itself; minor releases wait for a person.

## Work on the theme locally

Needs Node 24 and pnpm.

```bash
pnpm install
pnpm exec cloudhal pull --admin-url <studio-url>   # the live content into a local store (needs a deployment token)
pnpm dev                                           # http://localhost:4321, drafts visible
```

The deployment token comes from a local `cloudhal deploy` (`.cloudhal/deploy/secrets.json`); Workers Builds replaces it on every build, so run a local deploy first if `pull` says the token is wrong. Other commands: `pnpm build` (static HTML), `pnpm mcp` (a local MCP server for an agent), `pnpm exec cloudhal render / --width 1440,390` (screenshots plus contrast and layout checks).

## Domains

`cloudhal.com` serves the site and `studio.cloudhal.com` serves Studio (`domains` in `cloudhal.json`; the deploy adds both as Workers custom domains, which turns the workers.dev addresses off). `www.cloudhal.com` answers with a 301 to `https://cloudhal.com` (path and query kept): `domains.redirects` in `cloudhal.json`, set with `cloudhal domain set cloudhal.com --redirect www.cloudhal.com`, served by the site Worker as a custom domain. Adding a new redirect host needs a deploy with zone permissions (a local `cloudhal deploy`); the Workers Builds token only redeploys existing domains.
