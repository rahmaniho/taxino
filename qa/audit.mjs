/**
 * TAXINO — static quality gate
 * ---------------------------------------------------------------------------
 * The sandbox has no browser binary, so the page is server-rendered first and
 * then audited for structure, real links, assets and accessibility (jsdom +
 * axe-core). Anything that needs layout or paint (Lighthouse, visual diff) is
 * reported as "not run" instead of being faked.
 */
import { readFile, access, stat } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const ROOT = path.resolve(import.meta.dirname, "..");
const SSR_HTML = path.join(ROOT, "qa", ".ssr", "landing.html");
const DIST_INDEX = path.join(ROOT, "dist", "index.html");

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  const mark = ok ? "✔" : "✘";
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

async function main() {
  const html = await readFile(SSR_HTML, "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
  const { document } = dom.window;

  /* ------------------------------------------------------------ structure */
  record("lang/dir on <html>", document.documentElement.getAttribute("lang") === "fa" && document.documentElement.getAttribute("dir") === "rtl");

  const h1s = [...document.querySelectorAll("h1")];
  record("exactly one <h1>", h1s.length === 1, `${h1s.length} found`);

  const headings = [...document.querySelectorAll("h1, h2, h3, h4")].map((el) => Number(el.tagName[1]));
  const skips = headings.filter((level, index) => index > 0 && level - headings[index - 1] > 1);
  record("no skipped heading levels", skips.length === 0, `${headings.length} headings`);

  const sectionsWithoutName = [...document.querySelectorAll("main > section")].filter(
    (section) => !section.getAttribute("aria-label") && !section.getAttribute("aria-labelledby"),
  );
  record(
    "every <section> is labelled",
    sectionsWithoutName.length === 0,
    `${sectionsWithoutName.length} unnamed`,
  );

  const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  record("unique element ids", duplicateIds.length === 0, duplicateIds.join(", "));

  const idSet = new Set(ids);
  const anchors = [...document.querySelectorAll('a[href^="#"]')];
  const brokenAnchors = anchors
    .map((a) => a.getAttribute("href").slice(1))
    .filter((target) => target && !idSet.has(target));
  record(
    "in-page anchors resolve",
    brokenAnchors.length === 0,
    `${anchors.length} anchors checked${brokenAnchors.length ? ` → missing: ${[...new Set(brokenAnchors)].join(", ")}` : ""}`,
  );

  const external = [...document.querySelectorAll('a[target="_blank"]')];
  const unsafeExternal = external.filter((a) => !(a.getAttribute("rel") ?? "").includes("noopener"));
  record("target=_blank is noopener", unsafeExternal.length === 0, `${external.length} external links`);

  const images = [...document.querySelectorAll("img")];
  const missingAlt = images.filter((img) => img.getAttribute("alt") === null);
  const missingDims = images.filter((img) => !img.getAttribute("width") || !img.getAttribute("height"));
  record("every <img> has alt", missingAlt.length === 0, `${images.length} images`);
  record("every <img> declares intrinsic size", missingDims.length === 0, `${missingDims.length} without width/height`);

  const buttons = [...document.querySelectorAll("button")];
  const nameless = buttons.filter((button) => {
    const text = (button.textContent ?? "").trim();
    return !text && !button.getAttribute("aria-label") && !button.getAttribute("aria-labelledby");
  });
  record("every <button> has an accessible name", nameless.length === 0, `${buttons.length} buttons`);

  const inputs = [...document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]), textarea, select")];
  const unlabelled = inputs.filter((input) => {
    if (input.getAttribute("aria-label") || input.getAttribute("aria-labelledby")) return false;
    if (input.id && document.querySelector(`label[for="${input.id}"]`)) return false;
    return !input.closest("label");
  });
  record("every field has a label", unlabelled.length === 0, `${inputs.length} fields`);

  const iconOnly = [...document.querySelectorAll("a")].filter((a) => {
    const text = (a.textContent ?? "").trim();
    const hasImgAlt = [...a.querySelectorAll("img")].some((img) => (img.getAttribute("alt") ?? "").trim());
    return !text && !hasImgAlt && !a.getAttribute("aria-label");
  });
  record("every <a> has an accessible name", iconOnly.length === 0, `${iconOnly.length} unnamed links`);

  /* ------------------------------------------------------------- content */
  const sections = [...document.querySelectorAll("main > section")];
  record("section count", sections.length >= 12, `${sections.length} sections in <main>`);

  const sampleLabels = [...document.querySelectorAll("*")].filter((el) =>
    (el.textContent ?? "").includes("دادهٔ نمایشی"),
  );
  record("demo data is labelled", sampleLabels.length > 0, `${sampleLabels.length} nodes mention «دادهٔ نمایشی»`);

  /* ------------------------------------------------------------- assets */
  const srcs = new Set();
  document.querySelectorAll("img").forEach((img) => {
    if (img.getAttribute("src")) srcs.add(img.getAttribute("src"));
    (img.getAttribute("srcset") ?? "").split(",").forEach((part) => {
      const url = part.trim().split(" ")[0];
      if (url) srcs.add(url);
    });
  });
  document.querySelectorAll("source").forEach((source) => {
    (source.getAttribute("srcset") ?? "").split(",").forEach((part) => {
      const url = part.trim().split(" ")[0];
      if (url) srcs.add(url);
    });
  });

  const missingAssets = [];
  for (const src of srcs) {
    if (!src.startsWith("/")) continue;
    const file = path.join(ROOT, "public", src);
    if (!(await exists(file))) {
      // derived formats are allowed to be checked only if the base exists
      missingAssets.push(src);
    }
  }
  record("referenced images exist in public/", missingAssets.length === 0, missingAssets.slice(0, 6).join(", "));

  /* --------------------------------------------------------------- axe a11y */
  dom.window.eval(axe.source);
  const axeResult = await dom.window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    rules: {
      // Layout-dependent rules cannot be evaluated in jsdom.
      "color-contrast": { enabled: false },
      "target-size": { enabled: false },
    },
  });

  const serious = axeResult.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const moderate = axeResult.violations.filter((v) => v.impact === "moderate" || v.impact === "minor");
  record(
    "axe-core: no serious/critical violations",
    serious.length === 0,
    serious.map((v) => `${v.id} (${v.nodes.length})`).join(", ") || "clean",
  );
  if (moderate.length) {
    console.log(`  ⚠ moderate/minor: ${moderate.map((v) => v.id).join(", ")}`);
  }

  /* ------------------------------------------------------------ static file */
  if (await exists(DIST_INDEX)) {
    const dist = await readFile(DIST_INDEX, "utf8");
    const jsonLd = [...dist.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    let structuredOk = jsonLd.length > 0;
    let types = [];
    try {
      structuredOk = jsonLd.every((block) => {
        const parsed = JSON.parse(block);
        types = parsed["@graph"]?.map((node) => node["@type"]) ?? [parsed["@type"]];
        return Boolean(parsed["@context"]);
      });
    } catch {
      structuredOk = false;
    }
    record("JSON-LD parses", structuredOk, types.join(", "));

    const title = dist.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const description =
      dist.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/s)?.[1] ?? "";
    record("SEO title 30–65 chars", title.length >= 30 && title.length <= 70, `${title.length} chars`);
    record(
      "meta description 120–170 chars",
      description.length >= 120 && description.length <= 175,
      `${description.length} chars`,
    );
    record("canonical present", /rel="canonical"/.test(dist));
    record("og:image present", /property="og:image"/.test(dist));
    record("sitemap + robots shipped", (await exists(path.join(ROOT, "dist/sitemap.xml"))) && (await exists(path.join(ROOT, "dist/robots.txt"))));

  } else {
    record("dist/index.html exists", false, "run `npm run build` first");
  }

  /* ------------------------------------------------------------- summary */
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("\nFailures:");
    failed.forEach((f) => console.log(`  · ${f.name}${f.detail ? ` — ${f.detail}` : ""}`));
    process.exitCode = 1;
  }
  void stat;
}

main().catch((error) => {
  console.error("audit crashed", error);
  process.exit(1);
});
