/**
 * Public-asset URL resolver.
 *
 * Vite injects `BASE_URL` ("/" for an own domain, "/taxino/" for a GitHub
 * Pages project site). Every hard-coded "/assets/…" path in the app must go
 * through this helper, otherwise the images 404 when the site is served from
 * a sub-path.
 */
const BASE = import.meta.env.BASE_URL || "/";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE.replace(/\/+$/, "")}${path}`;
}

/** Builds a `srcset` string for the generated `-<width>.<format>` variants. */
export function srcSet(base: string, widths: readonly number[], format: string): string {
  return widths.map((width) => `${asset(`${base}-${width}.${format}`)} ${width}w`).join(", ");
}
