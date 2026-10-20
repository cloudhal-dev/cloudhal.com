/** Block links were checked against `format: "url"`; this keeps the check where they render. */
import { isBlockUrl } from "@cloudhal/core-ts/blocks";

export function href(value: unknown): string | undefined {
  return typeof value === "string" && isBlockUrl(value) && !value.startsWith("asset:")
    ? value
    : undefined;
}

/** Links that leave the site open in place but tell the reader where they go. */
export function external(link: string): boolean {
  return /^https?:\/\//i.test(link);
}
