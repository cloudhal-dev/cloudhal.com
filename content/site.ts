/**
 * The words of cloudhal.com, as Cloudhal content. `pnpm seed` (scripts/seed.ts) writes them into
 * the local store as pages, posts and menus; from then on the store is the source of truth and
 * Studio, agents (`cloudhal mcp`) and `cloudhal push` work on it like on any other site.
 *
 * Sections are the contract's section kinds; `component` sections use the block types the
 * cloudhal-marketing theme declares in `src/blocks.ts`. English only (ADR: default language en).
 */

export const DOCS = "https://cloudhal.dev/docs";
export const GITHUB = "https://github.com/cloudhal-dev/cloudhal";
export const PLAYGROUND = "https://try.cloudhal.com";

export const site = {
  name: "Cloudhal",
  slug: "cloudhal-com",
  locale: "en",
  domain: "cloudhal.com",
  theme: "cloudhal-marketing",
  /** Design settings (src/settings.ts, RFC-0017/0023). */
  themeConfig: {
    seed: "#f6821f",
    scheme: "tonal",
    mode: "auto",
    typePairing: "modern",
    typeScale: "dramatic",
    radius: "medium",
    motion: "subtle",
  },
} as const;

type Json = Record<string, unknown>;

export interface PageContent {
  readonly key: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly sections: readonly Json[];
}

const home: PageContent = {
  key: "home",
  path: "/",
  title: "Cloudhal",
  description:
    "Cloudhal is the agent-native site platform on Cloudflare: agents build and change your site, a policy engine and human approvals keep them in bounds, and every change can be rolled back.",
  sections: [
    {
      id: "sec_homehero01",
      kind: "hero",
      heading: "The agent-native site platform on Cloudflare",
      subheading:
        "Describe the site you want. Agents build it, change it and keep it current, inside the rules you set. Every change is a snapshot you can preview, approve and roll back. It runs in your own Cloudflare account.",
      cta: { label: "Try it in the playground", href: PLAYGROUND, external: true },
    },
    {
      id: "sec_homehow001",
      kind: "component",
      type: "steps",
      props: {
        eyebrow: "How it works",
        heading: "From a sentence to a published site",
        items: [
          {
            title: "Start a project",
            body: "cloudhal init creates a site with a theme and a local store. cloudhal dev shows it live, drafts included.",
          },
          {
            title: "Ask an agent",
            body: "Agents work through Cloudhal's MCP server: they add pages, write posts and rework sections as typed data, never as raw code.",
          },
          {
            title: "Review the change",
            body: "Each change becomes a snapshot with a diff and a preview. You approve what goes live; the policy decides what needs you.",
          },
          {
            title: "Publish on Cloudflare",
            body: "cloudhal deploy installs the site Worker, Studio, D1 and R2 in your own account. Publishing never needs a rebuild.",
          },
        ],
      },
    },
    {
      id: "sec_homesafe01",
      kind: "component",
      type: "feature-grid",
      props: {
        eyebrow: "Safe by design",
        heading: "Agents do the work. You keep control.",
        intro:
          "Letting an agent touch a live site is only sensible when every step is bounded, visible and reversible. Cloudhal is built around that.",
        items: [
          {
            icon: "shield",
            title: "Policy engine",
            body: "Every MCP tool call passes a policy: modes from plan-only to auto, scopes per tool, budgets and taint rules for scheduled runs.",
          },
          {
            icon: "check-circle",
            title: "Human approvals",
            body: "Changes the policy marks as sensitive wait for a person. Approvers see the diff and the preview before anything goes live.",
          },
          {
            icon: "refresh",
            title: "Snapshots and rollback",
            body: "Publishing is a snapshot of the whole site graph. Diff any two, preview any one, roll back to an earlier one in a single step.",
          },
          {
            icon: "file",
            title: "Audit trail",
            body: "Who changed what, through which tool, under which policy: every agent action is recorded next to the content it touched.",
          },
        ],
      },
    },
    {
      id: "sec_homenext01",
      kind: "component",
      type: "link-cards",
      props: {
        heading: "Go further",
        items: [
          {
            title: "Read the docs",
            body: "Guides, the CLI, the MCP tools and the content model.",
            href: DOCS,
            label: "cloudhal.dev/docs",
          },
          {
            title: "Browse the code",
            body: "Open source, TypeScript first, with the contracts mirrored in Rust.",
            href: GITHUB,
            label: "GitHub",
          },
          {
            title: "Try the playground",
            body: "A throwaway site per visitor, no sign-up, gone after an hour.",
            href: PLAYGROUND,
            label: "try.cloudhal.com",
          },
        ],
      },
    },
    {
      id: "sec_homeposts1",
      kind: "contentList",
      collection: "blog",
      limit: 3,
      sort: "newest",
    },
    {
      id: "sec_homecta001",
      kind: "component",
      type: "cta-band",
      props: {
        heading: "Your site, your account, your rules",
        body: "Self-host Cloudhal for free on Cloudflare. This site is built with it.",
        primaryLabel: "Get started",
        primaryHref: DOCS,
        secondaryLabel: "Star on GitHub",
        secondaryHref: GITHUB,
      },
    },
  ],
};

const features: PageContent = {
  key: "features",
  path: "/features",
  title: "Features",
  description:
    "What Cloudhal gives you: typed site graphs, an MCP server for agents, policy and approvals, snapshots, Studio, search, schedules and multi-site installs on Cloudflare.",
  sections: [
    {
      id: "sec_feathero01",
      kind: "hero",
      heading: "Everything a site needs, shaped for agents",
      subheading:
        "A content model agents can reason about, tools they can call safely, and a runtime on Cloudflare's edge.",
    },
    {
      id: "sec_featmodel1",
      kind: "component",
      type: "feature-grid",
      props: {
        eyebrow: "Content model",
        heading: "Sites are typed graphs",
        items: [
          {
            icon: "code",
            title: "Site, pages, sections",
            body: "Every node follows a JSON Schema contract with a revision, so writes are compare-and-swap and conflicts are caught.",
          },
          {
            icon: "article",
            title: "Posts, terms and menus",
            body: "Collections, categories, tags and authors, with menus that point at ids so renames never break a link.",
          },
          {
            icon: "sparkle",
            title: "Generative UI",
            body: "Agents compose pages from a theme's catalog of blocks and surfaces, as data the store checks before it is saved.",
          },
        ],
      },
    },
    {
      id: "sec_featagent1",
      kind: "component",
      type: "feature-grid",
      props: {
        eyebrow: "For agents",
        heading: "An MCP server with guard rails",
        items: [
          {
            icon: "chat",
            title: "Build chat",
            body: "Describe a page in Studio and watch it stream in, then iterate on the render the agent itself looks at.",
          },
          {
            icon: "lock",
            title: "Scoped tools",
            body: "Each tool declares the scopes it needs; keys and modes decide which an agent may call.",
          },
          {
            icon: "clock",
            title: "Schedules and releases",
            body: "Publish at a time, embargo a page, or run an automation every morning, all within budgets.",
          },
        ],
      },
    },
    {
      id: "sec_featrun001",
      kind: "component",
      type: "feature-grid",
      props: {
        eyebrow: "Runtime",
        heading: "Built on Cloudflare, installed in your account",
        items: [
          {
            icon: "lightning",
            title: "Workers, D1 and R2",
            body: "Pages render on demand at the edge from the published snapshot, with cache purges per change.",
          },
          {
            icon: "search",
            title: "Search and feeds",
            body: "Full-text site search, RSS per category and tag, sitemaps and llms.txt out of the box.",
          },
          {
            icon: "globe",
            title: "Many sites, many languages",
            body: "One installation holds many isolated sites, with language editions and translation tracking.",
          },
          {
            icon: "chart",
            title: "Privacy-first analytics",
            body: "Cookie-less, first-party page analytics and Web Vitals, with no third-party scripts.",
          },
        ],
      },
    },
    {
      id: "sec_featcta001",
      kind: "component",
      type: "cta-band",
      props: {
        heading: "See it for yourself",
        primaryLabel: "Open the playground",
        primaryHref: PLAYGROUND,
        secondaryLabel: "Read the docs",
        secondaryHref: DOCS,
      },
    },
  ],
};

const pricing: PageContent = {
  key: "pricing",
  path: "/pricing",
  title: "Pricing",
  description:
    "Cloudhal is open source: self-host it free in your own Cloudflare account. A hosted control plane is coming.",
  sections: [
    {
      id: "sec_pricehero1",
      kind: "hero",
      heading: "Open source. Free to self-host.",
      subheading:
        "You pay Cloudflare for what your site uses, often nothing on the Workers free plan. Cloudhal itself costs nothing.",
    },
    {
      id: "sec_pricetable",
      kind: "component",
      type: "pricing-table",
      props: {
        heading: "Plans",
        plans: [
          {
            name: "Self-host",
            price: "Free",
            note: "open source",
            summary:
              "The whole platform: CLI, Studio, MCP server, themes. Deploy with cloudhal deploy into your own Cloudflare account.",
            ctaLabel: "Get started",
            ctaHref: DOCS,
            highlight: true,
          },
          {
            name: "Hosted control plane",
            price: "Coming",
            note: "later",
            summary:
              "Install, update and manage Cloudhal in your Cloudflare account from one place, without the CLI. Your sites and data stay in your account.",
            ctaLabel: "Follow on GitHub",
            ctaHref: GITHUB,
          },
        ],
      },
    },
    {
      id: "sec_pricefaq01",
      kind: "richText",
      format: "markdown",
      body: "## Questions\n\n**What do I pay Cloudflare?** Workers, D1 and R2 usage at Cloudflare's prices. Small sites usually fit the free plan.\n\n**Where does my content live?** In your own D1 database and R2 bucket. Cloudhal never hosts customer sites on its own domains.\n\n**Can I leave?** Yes. `cloudhal pull` brings the whole site back to a local project, and static builds work on any host.",
    },
  ],
};

const blog: PageContent = {
  key: "blog",
  path: "/blog",
  title: "Blog",
  description: "News and notes from the Cloudhal project.",
  sections: [
    {
      id: "sec_bloghero01",
      kind: "hero",
      heading: "Blog",
      subheading: "Releases, design notes and what we learn building Cloudhal with Cloudhal.",
    },
    { id: "sec_blogposts1", kind: "contentList", collection: "blog", limit: 20, sort: "newest" },
  ],
};

export const pages: readonly PageContent[] = [home, features, pricing, blog];

/** Pages from cloudhal init this site does not use. */
export const removedPaths: readonly string[] = ["/about"];
/** Posts from cloudhal init this site does not use. */
export const removedPosts: readonly string[] = ["hello-world"];

export interface PostContent {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly body: string;
}

export const posts: readonly PostContent[] = [
  {
    slug: "introducing-cloudhal",
    title: "Introducing Cloudhal",
    summary: "An agent-native site platform on Cloudflare, where every change is bounded, visible and reversible.",
    publishedAt: "2026-10-20T09:00:00.000Z",
    body: `Most site builders were designed for people clicking through forms. Agents are now good enough to do much of that work, but handing one the keys to a live site is risky.

Cloudhal starts from the other end. A site is a typed graph of pages, sections and entries. Agents change it through an MCP server, and every call passes a policy engine that decides what an agent may do alone and what needs a person's approval.

Every change is a snapshot. You can diff it, preview it, publish it and roll it back. Nothing an agent does is hidden or permanent.

It runs in your own Cloudflare account: a site Worker, Studio, D1 and R2, installed with \`cloudhal deploy\`. Read the [docs](${DOCS}), browse the [code](${GITHUB}) or try the [playground](${PLAYGROUND}).`,
  },
  {
    slug: "built-with-cloudhal",
    title: "cloudhal.com is built with Cloudhal",
    summary: "Why our own marketing site runs on the platform it describes, and what that teaches us.",
    publishedAt: "2026-10-20T10:00:00.000Z",
    body: `This site is a Cloudhal project. It was created with \`cloudhal init\`, uses its own theme (cloudhal-marketing), and every word you read here is Cloudhal content: pages made of sections, posts in a collection, menus pointing at ids.

We do this for two reasons. First, it keeps us honest: every rough edge a new user would hit, we hit first, and we write it down. Second, the safety story is easier to show than to explain. Changes to this site go through the same snapshots, previews and approvals as yours.

The site deploys only from stable releases, so it never runs ahead of what you can install.`,
  },
];
