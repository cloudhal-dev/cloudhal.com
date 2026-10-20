/**
 * `pnpm seed`: writes content/site.ts into the local store (.cloudhal/) and publishes it.
 *
 * Idempotent: pages are matched by path, posts by slug, menus by key; existing nodes are updated
 * (CAS on `rev`), missing ones created. On a fresh clone (no .cloudhal/, or a siteId the store does
 * not know) it seeds a new site first, the way `cloudhal init` does, and records its id in
 * cloudhal.json. After that, the store is the source of truth: edit in Studio or through an agent,
 * and re-run this only to reset the marketing pages to what content/site.ts says.
 */
import path from "node:path";
import { readProjectConfig, snapshot, writeProjectConfig } from "@cloudhal/cli";
import type { ContentEntry, Menu, Page, Section, Site } from "@cloudhal/core-contracts";
import { seedStarterSite, withPrimaryDomain } from "@cloudhal/core-ts";
import { createBlockRegistry } from "@cloudhal/core-ts/blocks";
import { openLocalStore } from "@cloudhal/core-ts/local";
import { DOCS, GITHUB, PLAYGROUND, pages, posts, removedPaths, removedPosts, site as content } from "../content/site.ts";
import { blockTypes } from "../src/blocks.ts";
import { themeSettings } from "../src/settings.ts";

const projectDir = path.resolve(import.meta.dirname, "..");
const author = { kind: "system" as const, id: "sys_cloudhalcom" };

const cfg = await readProjectConfig(projectDir).catch(() => undefined);
const dataDir = cfg?.dataDir ?? ".cloudhal";
const local = await openLocalStore(path.join(projectDir, dataDir), {
  blocks: createBlockRegistry(blockTypes),
  themeSettings,
});
const { store } = local;

try {
  let site: Site | undefined = cfg?.siteId ? await store.getSite(cfg.siteId) : undefined;
  if (!site) {
    site = await seedStarterSite(store, {
      name: content.name,
      slug: content.slug,
      locale: content.locale,
      theme: content.theme,
    });
    await writeProjectConfig(projectDir, {
      ...(cfg ?? { analytics: { enabled: true }, comments: { available: false }, domains: { site: content.domain } }),
      siteId: site.id,
      dataDir,
    });
    console.log(`seeded a new site ${site.id}`);
  }

  site = await store.updateSite({
    ...site,
    name: content.name,
    // The primary domain gives canonical URLs, feeds and the sitemap their origin. cloudhal.json's
    // `domains.site` only routes the deployed Worker; it does not reach the site node.
    domains: withPrimaryDomain(site.domains, content.domain),
    theme: { ...site.theme, name: content.theme, config: { ...content.themeConfig } },
  });

  // Pages, by path.
  const existing = new Map((await store.listPages(site.id)).map((p) => [p.path, p]));
  for (const p of pages) {
    const fields = {
      title: p.title,
      status: "published" as const,
      sections: p.sections as unknown as Section[],
      seo: { title: p.path === "/" ? p.title : `${p.title} · Cloudhal`, description: p.description },
    };
    const page = existing.get(p.path);
    if (page) await store.updatePage({ ...page, ...fields });
    else ({ site } = await store.createPage(site, { siteId: site.id, path: p.path, locale: content.locale, ...fields }));
  }
  for (const gone of removedPaths) {
    const page = existing.get(gone);
    if (page) site = await store.deletePage((await store.getSite(site.id)) ?? site, page);
  }
  site = (await store.getSite(site.id)) ?? site;

  // Posts, by slug, filed under the "news" category `cloudhal init` creates.
  const news = await store.getTermBySlug(site.id, "category", "news");
  // The collection is `blog`, so posts live at /blog/<slug> next to the /blog page; entries
  // from `cloudhal init` (collection `posts`) move over and leave a redirect.
  const entries = new Map(
    (await store.listContentEntries(site.id)).filter((e) => ["posts", "blog"].includes(e.collection)).map((e) => [e.slug, e] as const),
  );
  for (const post of posts) {
    const fields = {
      title: post.title,
      summary: post.summary,
      collection: "blog",
      status: "published" as const,
      body: { format: "markdown" as const, value: post.body },
      publishedAt: post.publishedAt,
    };
    const entry = entries.get(post.slug);
    if (entry) await store.updateContentEntry({ ...entry, ...fields });
    else
      await store.createContentEntry({
        siteId: site.id,
        slug: post.slug,
        locale: content.locale,
        fields: {},
        tags: [],
        terms: news ? { category: { ids: [news.id], primary: news.id } } : {},
        author,
        ...fields,
      } as Omit<ContentEntry, "id" | "rev" | "createdAt" | "updatedAt" | "schemaVersion">);
  }
  for (const slug of removedPosts) {
    const entry = entries.get(slug);
    if (entry) await store.deleteContentEntry(entry);
  }

  // Menus: the header and the footer.
  const byPath = new Map((await store.listPages(site.id)).map((p) => [p.path, p.id]));
  const pageItem = (id: string, p: string) => ({ id, kind: "page" as const, pageId: byPath.get(p) as string });
  const url = (id: string, label: string, href: string) => ({ id, kind: "url" as const, href, labels: { en: label } });
  const menus: Record<string, Menu["items"]> = {
    primary: [
      pageItem("item_features01", "/features"),
      pageItem("item_pricing001", "/pricing"),
      pageItem("item_blog000001", "/blog"),
      url("item_docs000001", "Docs", DOCS),
      url("item_github0001", "GitHub", GITHUB),
    ],
    footer: [
      url("item_fdocs00001", "Docs", DOCS),
      url("item_fgithub001", "GitHub", GITHUB),
      url("item_fplay00001", "Playground", PLAYGROUND),
      pageItem("item_fblog00001", "/blog"),
    ],
  };
  for (const [key, items] of Object.entries(menus)) {
    const menu = await store.getMenuByKey(site.id, key);
    if (menu) await store.updateMenu({ ...menu, items });
    else await store.createMenu({ siteId: site.id, key, maxDepth: 2, items } as Parameters<typeof store.createMenu>[0]);
  }
} finally {
  await local.close();
}

const published = await snapshot({ projectDir, label: "pnpm seed", publish: true });
console.log(`published snapshot ${published.id}`);
