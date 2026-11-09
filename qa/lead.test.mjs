/**
 * Unit tests for the lead-submission layer (src/lib/lead.ts).
 *
 * The important case is the static-host fallback: on GitHub Pages there is no
 * /api/consult, and the form must hand the message to the mail client instead
 * of reporting a success that never happened.
 */
import { build } from "esbuild";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "✔" : "✘"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const dir = await mkdtemp(path.join(tmpdir(), "taxino-lead-"));
const entry = path.join(process.cwd(), "src/lib/lead.ts");
const outfile = path.join(dir, "lead.mjs");

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  define: { "import.meta.env.VITE_CONSULT_ENDPOINT": '"/api/consult"' },
  logLevel: "silent",
});
await writeFile(path.join(dir, "package.json"), '{"type":"module"}');
const { submitLead, mailtoFor } = await import(pathToFileURL(outfile).href);

const payload = {
  name: "حسین رحمانی",
  phone: "09123456789",
  agency: "آژانس نمونه",
  city: "قزوین",
  drivers: 24,
  note: "بررسی دمو",
  plan: "یک‌ساله",
  consent: true,
  source: "landing",
  website: "",
};

const originalFetch = globalThis.fetch;
const stub = (impl) => {
  globalThis.fetch = impl;
};
const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

/* 1 — static host: POST hits a 404 page, no API behind it */
stub(async () => jsonResponse(404, {}));
let result = await submitLead(payload);
check("static host falls back to e-mail", result.kind === "unavailable");
check(
  "fallback mailto carries the entered data",
  typeof result.mailto === "string" &&
    result.mailto.startsWith("mailto:") &&
    decodeURIComponent(result.mailto).includes("آژانس نمونه") &&
    decodeURIComponent(result.mailto).includes("09123456789"),
);

/* 2 — network failure (offline / blocked) behaves the same way */
stub(async () => {
  throw new TypeError("Failed to fetch");
});
result = await submitLead(payload);
check("network failure falls back to e-mail", result.kind === "unavailable");

/* 3 — happy path */
stub(async () => jsonResponse(200, { ok: true, id: "TX-ABC123456" }));
result = await submitLead(payload);
check("accepted lead returns reference id", result.kind === "ok" && result.id === "TX-ABC123456");

/* 4 — field validation errors are surfaced per field */
stub(async () => jsonResponse(400, { ok: false, errors: { phone: "شمارهٔ موبایل معتبر نیست." } }));
result = await submitLead(payload);
check("validation errors are mapped", result.kind === "invalid" && Boolean(result.errors.phone));

/* 5 — rate limit */
stub(async () => jsonResponse(429, { ok: false }));
result = await submitLead(payload);
check("rate limit is reported", result.kind === "rate-limited");

/* 6 — server-side storage failure must not look like success */
stub(async () => jsonResponse(503, { ok: false, message: "خطای سرور" }));
result = await submitLead(payload);
check("503 is an error, never a success", result.kind === "error");

/* 7 — mailto builder is well formed */
const mailto = mailtoFor(payload);
check("mailto targets the official address", mailto.startsWith("mailto:info@taxino.ir?subject="));
check("mailto body is percent-encoded once", !mailto.includes(" "));

globalThis.fetch = originalFetch;

const failed = results.filter((item) => !item.ok).length;
console.log(`\n${results.length - failed}/${results.length} lead-layer checks passed`);
if (failed) process.exitCode = 1;
