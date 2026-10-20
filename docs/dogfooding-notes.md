# Dogfooding notes

Friction found while building cloudhal.com with Cloudhal, as a new user would. Each item names what happened, what we did here, and what would fix it upstream (in `cloudhal-dev/cloudhal`). Newest session first.

## 2026-10-20 — first scaffold (monorepo `main` at 446ab40e)

### Getting started

1. **No getting-started guide.** `docs/guides/` has feature guides (multi-site, search, schedules…) but nothing for "create a site and run it". `cloudhal --help` and `starters/blog/README.md` were enough, but a newcomer has to know to look there. *Upstream:* `docs/guides/getting-started.md`.
2. **`cloudhal init` outside the monorepo writes dependencies that do not exist.** It turns `workspace:*` into `^0.0.1`, which is not on npm, so the `pnpm install` it suggests fails. There is no option to link a local checkout. *Here:* hand-edited `package.json` to `link:../cloudhal-dev/packages/<name>` with a TODO. *Upstream:* `cloudhal init --link <monorepo>` (or detect an unpublished version and write `link:` with a note).
3. **The "next steps" say `cloudhal dev`,** but `cloudhal` is not on PATH after a local install. *Upstream:* print `pnpm dev`.
4. **pnpm 12 refuses the install** (`ERR_PNPM_IGNORED_BUILDS` for esbuild and workerd, exit code 1). The monorepo approves them in its `pnpm-workspace.yaml`; the starter ships nothing. *Here:* added `pnpm-workspace.yaml` with `allowBuilds` (esbuild, better-sqlite3, workerd). *Upstream:* the starter ships that file.
5. **Two copies of Astro.** The starter asks for `astro: ^7.3.6`, which resolved to 7.4.0, while the linked `@cloudhal/astro-renderer` resolves its peer from the monorepo (7.3.6). *Here:* pinned `astro` 7.3.6 and `wrangler` 4.148.0 to the monorepo's catalog. *Upstream:* goes away once the packages are published; until then `init` should write exact catalog versions.

### Content

6. **No way to put content in without a deployment.** `cloudhal push` needs `cloudhal deploy` first; there is no local `cloudhal import <bundle>` or content-as-files format, and the `.cloudhal/` store is git-ignored. So a site's content cannot be versioned with the site. *Here:* `content/site.ts` (data) + `scripts/seed.ts` (idempotent upserts through `SiteGraphStore`, then `snapshot --publish`). *Upstream:* `cloudhal import/export` of a `SiteBundle` to a local file (the bundle code exists for push/pull).
7. **Helpers a seed script needs are not exported.** `loadBlockRegistry` / `loadThemeSettings` live in `@cloudhal/cli/src/blocks.ts` but not in its index. *Here:* `createBlockRegistry(blockTypes)` from `@cloudhal/core-ts/blocks` and the theme's `themeSettings` directly.
8. **`seedStarterSite` cannot take a site id,** so a fresh clone always gets a new `siteId` and rewrites `cloudhal.json`. *Upstream:* accept an `id` (or let `init` reuse one from `cloudhal.json`).
9. **A collection's URL prefix is its name.** Posts live at `/<collection>/<slug>`, so the starter's `posts` collection puts articles at `/posts/…` while the blog index here is `/blog`. `collectionIndex` only affects menu links. *Here:* the collection is `blog`; the seed moves init's entries over (the store leaves 301s from `/posts/…`, which is nice). *Upstream:* a per-collection base path, or say this in the starter README.
10. **Menu item ids must start with `item_`.** The contract's `Id` accepts any prefix; the store rejects others. The error is clear. *Upstream:* document the prefix in `menu.schema.json`.
11. **Block examples must use the curated icon set** (`graph` is not in it). Clear error, good — the list lives in `core-ts/src/icon-names.ts` and is hard to find from a theme.
12. **Every `snapshot --publish` makes a new snapshot,** even when nothing changed (re-running the seed). *Upstream:* skip or say "nothing changed".

### Domains and config

13. **`cloudhal.json`'s `domains.site` does not reach the site.** It only routes the deployed Worker; `Site.domains` stays empty, so `cloudhal build` writes `http://localhost:4321` into canonical links, the sitemap and feeds. *Here:* the seed sets the primary domain with `withPrimaryDomain`. *Upstream:* `cloudhal domain set` should also set the site's primary domain (or `build` should read `cloudhal.json`).
14. **No www redirect.** `cloudhal domain` takes one hostname per target. *Here:* noted in the README; a Cloudflare Redirect Rule on the zone. *Upstream:* `cloudhal domain set cloudhal.com --redirect www.cloudhal.com`.
15. **The starter git-ignores `cloudhal.json`,** while `cloudhal domain` says the setting is "kept in cloudhal.json so the setting travels with the project". *Here:* committed. *Upstream:* decide; if it is ignored for the `siteId`, split the per-machine part out.
16. **Stale contract text:** `site.schema.json` → `domains` says "the *.cloudhal.app subdomain is always present in Cloud", which ADR-0037 rules out (customer sites never run on Cloudhal's domains).

### Theme

17. **No marketing starter and no theme name option.** `init` only knows `blog` and names the theme `blog`. *Here:* grew `cloudhal-marketing` from the blog starter (five block types, a hero override, one stylesheet) and renamed `Site.theme.name` in the seed. The boundary held up well: routes and layout are untouched.
18. **`safeHref` is not exported** from `@cloudhal/astro-renderer`, so theme blocks re-check links themselves. *Here:* `src/components/marketing/href.ts` on top of `isBlockUrl`.
19. **The starter's article column fails its own render check:** `cloudhal render /blog/built-with-cloudhal` reports `long-line` (~91 characters) at 1440 px.
20. **`cloudhal render` is great** — it caught a 3.1:1 contrast on our eyebrow text at once. Two nits: the Astro dev toolbar shows up in its screenshots, and it printed paths relative to the project (`../../../../private/tmp/…`).
21. **Dev noise:** every `cloudhal dev` start warns "getStaticPaths() ignored in dynamic page" and Astro's "new version available".

### Content decisions (not friction)

- Pricing says "Hosted control plane — coming" with no product name: ADR-0037's amendment removed product names pending a trademark check.
- Comments are off (`comments.available: false`); analytics stay on (cookie-less).
