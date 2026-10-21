/**
 * This theme's block types (RFC-0015 §6): pure data, read by Studio, agents (`list_block_types`)
 * and the store, and bundled by `cloudhal deploy`. Their components are in `theme.ts` (`blocks`).
 *
 * Names are plain English words shared by every theme (`testimonial`, `pricing-table`), never
 * prefixed with the theme: content written under one theme renders under any other that defines
 * the same name. The built-ins (`callout`, `button`, `embed`, `faq`) are reserved; restyle them
 * through `blocks` in `theme.ts` instead.
 *
 * Keep this file data only, with type imports only: the CLI loads it on its own (Studio, agents,
 * deploy) and checks every type, so it needs nothing from the project at run time.
 */
import type { BlockType } from "@cloudhal/core-ts/blocks";


/** A link-ish item: a title, a short text and where it goes. */
const linkItem = {
  type: "object",
  additionalProperties: false,
  required: ["title", "href"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 80, title: "Title" },
    body: { type: "string", maxLength: 400, title: "Text" },
    href: { type: "string", format: "url", title: "Link" },
    label: { type: "string", maxLength: 40, title: "Link text" },
  },
} as const;

/** One line of the lens hero's activity log; `state` tints the lens while the line is current. */
const lensLogItem = {
  type: "object",
  additionalProperties: false,
  required: ["text", "state"],
  properties: {
    text: { type: "string", minLength: 1, maxLength: 80, title: "Text" },
    state: {
      type: "string",
      enum: ["watching", "working", "waiting", "live"],
      title: "Lens state",
    },
  },
} as const;

/** The home page's opening: the brand lens as a living scene (src/components/marketing/LensHero.astro). */
const lensHero: BlockType = {
  name: "lens-hero",
  title: "Lens hero",
  description:
    "A page's opening scene: the headline beside the brand lens, which follows the pointer, breathes, narrows as the page scrolls and changes colour with a short log of what an agent is doing. One per page, first.",
  icon: "Aperture",
  category: "layout",
  where: ["section"],
  props: {
    type: "object",
    additionalProperties: false,
    required: ["heading", "primaryLabel", "primaryHref", "log", "logLabel", "pauseLabel", "playLabel"],
    properties: {
      eyebrow: { type: "string", maxLength: 60, title: "Eyebrow" },
      heading: { type: "string", minLength: 1, maxLength: 120, title: "Heading" },
      highlight: {
        type: "string",
        maxLength: 60,
        title: "Highlighted words",
        description: "Words of the heading drawn in the brand gradient (they must occur in it).",
      },
      body: { type: "string", maxLength: 400, title: "Text" },
      primaryLabel: { type: "string", minLength: 1, maxLength: 40, title: "Button" },
      primaryHref: { type: "string", format: "url", title: "Button link" },
      secondaryLabel: { type: "string", maxLength: 40, title: "Second button" },
      secondaryHref: { type: "string", format: "url", title: "Second button link" },
      logLabel: { type: "string", minLength: 1, maxLength: 60, title: "Log title" },
      log: { type: "array", minItems: 2, maxItems: 6, title: "Activity log", items: lensLogItem },
      pauseLabel: { type: "string", minLength: 1, maxLength: 30, title: "Pause button" },
      playLabel: { type: "string", minLength: 1, maxLength: 30, title: "Play button" },
    },
  },
  example: {
    props: {
      heading: "Agents build your site. Nothing ships unseen.",
      highlight: "Nothing ships unseen.",
      primaryLabel: "Try the playground",
      primaryHref: "https://try.cloudhal.com",
      logLabel: "On this site",
      log: [
        { text: "Agent drafts a new section", state: "working" },
        { text: "Waiting for your approval", state: "waiting" },
        { text: "Published, rollback ready", state: "live" },
      ],
      pauseLabel: "Pause motion",
      playLabel: "Play motion",
    },
  },
};

/** Marketing blocks of the cloudhal-marketing theme (English only, like the site). */
const marketingTypes: readonly BlockType[] = [
  lensHero,
  {
    name: "feature-grid",
    title: "Feature grid",
    description: "A heading and a grid of short features, each with an optional icon.",
    icon: "SquaresFour",
    category: "layout",
    where: ["section"],
    props: {
      type: "object",
      additionalProperties: false,
      required: ["heading", "items"],
      properties: {
        eyebrow: { type: "string", maxLength: 60, title: "Eyebrow" },
        heading: { type: "string", minLength: 1, maxLength: 160, title: "Heading" },
        intro: { type: "string", maxLength: 600, title: "Intro" },
        items: {
          type: "array",
          minItems: 1,
          maxItems: 12,
          title: "Features",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "body"],
            properties: {
              title: { type: "string", minLength: 1, maxLength: 80, title: "Title" },
              body: { type: "string", minLength: 1, maxLength: 500, title: "Text" },
              icon: { type: "string", format: "icon", title: "Icon" },
            },
          },
        },
      },
    },
    example: {
      props: {
        heading: "Why Cloudhal",
        items: [{ title: "Typed", body: "Sites are typed graphs.", icon: "code" }],
      },
    },
  },
  {
    name: "steps",
    title: "Steps",
    description: "A numbered sequence: how something works, in order.",
    icon: "ListNumbers",
    category: "layout",
    where: ["section"],
    props: {
      type: "object",
      additionalProperties: false,
      required: ["heading", "items"],
      properties: {
        eyebrow: { type: "string", maxLength: 60, title: "Eyebrow" },
        heading: { type: "string", minLength: 1, maxLength: 160, title: "Heading" },
        items: {
          type: "array",
          minItems: 1,
          maxItems: 8,
          title: "Steps",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "body"],
            properties: {
              title: { type: "string", minLength: 1, maxLength: 80, title: "Title" },
              body: { type: "string", minLength: 1, maxLength: 500, title: "Text" },
            },
          },
        },
      },
    },
    example: { props: { heading: "How it works", items: [{ title: "Ask", body: "Describe it." }] } },
  },
  {
    name: "pricing-table",
    title: "Pricing table",
    description: "Plans side by side, each with a price, a summary and a link.",
    icon: "Tag",
    category: "data",
    where: ["section"],
    props: {
      type: "object",
      additionalProperties: false,
      required: ["heading", "plans"],
      properties: {
        heading: { type: "string", minLength: 1, maxLength: 160, title: "Heading" },
        intro: { type: "string", maxLength: 600, title: "Intro" },
        plans: {
          type: "array",
          minItems: 1,
          maxItems: 4,
          title: "Plans",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "price"],
            properties: {
              name: { type: "string", minLength: 1, maxLength: 60, title: "Name" },
              price: { type: "string", minLength: 1, maxLength: 40, title: "Price" },
              note: { type: "string", maxLength: 80, title: "Price note" },
              summary: { type: "string", maxLength: 600, title: "Summary" },
              ctaLabel: { type: "string", maxLength: 40, title: "Button text" },
              ctaHref: { type: "string", format: "url", title: "Button link" },
              highlight: { type: "boolean", title: "Highlight" },
            },
          },
        },
      },
    },
    example: { props: { heading: "Pricing", plans: [{ name: "Self-host", price: "Free" }] } },
  },
  {
    name: "link-cards",
    title: "Link cards",
    description: "A row of cards that each lead somewhere: docs, code, a demo.",
    icon: "Cards",
    category: "layout",
    where: ["section"],
    props: {
      type: "object",
      additionalProperties: false,
      required: ["items"],
      properties: {
        heading: { type: "string", maxLength: 160, title: "Heading" },
        items: { type: "array", minItems: 1, maxItems: 6, title: "Cards", items: linkItem },
      },
    },
    example: { props: { items: [{ title: "Docs", href: "https://cloudhal.dev/docs" }] } },
  },
  {
    name: "cta-band",
    title: "Call to action band",
    description: "A full-width band with a heading, a line of text and up to two buttons.",
    icon: "Megaphone",
    category: "layout",
    where: ["section"],
    props: {
      type: "object",
      additionalProperties: false,
      required: ["heading", "primaryLabel", "primaryHref"],
      properties: {
        heading: { type: "string", minLength: 1, maxLength: 160, title: "Heading" },
        body: { type: "string", maxLength: 400, title: "Text" },
        primaryLabel: { type: "string", minLength: 1, maxLength: 40, title: "Main button text" },
        primaryHref: { type: "string", format: "url", title: "Main button link" },
        secondaryLabel: { type: "string", maxLength: 40, title: "Second button text" },
        secondaryHref: { type: "string", format: "url", title: "Second button link" },
      },
    },
    example: {
      props: { heading: "Try it", primaryLabel: "Open the playground", primaryHref: "https://try.cloudhal.com" },
    },
  },
];

export const blockTypes: readonly BlockType[] = [
  {
    name: "testimonial",
    title: { en: "Testimonial", tr: "Referans" },
    description: {
      en: "A quote from a reader or customer, with who said it.",
      tr: "Bir okurdan ya da müşteriden alıntı ve kimin söylediği.",
    },
    icon: "Quotes",
    category: "text",
    where: ["section", "body"],
    content: "markdown",
    props: {
      type: "object",
      additionalProperties: false,
      required: ["author"],
      properties: {
        author: { type: "string", minLength: 1, maxLength: 120, title: { en: "Name", tr: "Ad" } },
        role: {
          type: "string",
          maxLength: 120,
          title: { en: "Role or company", tr: "Unvan ya da şirket" },
        },
      },
    },
    example: {
      props: { author: "Ada Lovelace", role: "Analyst" },
      markdown: "This changed how we publish.",
    },
  },
  ...marketingTypes,
];
