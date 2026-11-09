/**
 * End-to-end tests for POST /api/consult — the only real backend of this page.
 * Runs the same handler that the dev server, the node server and the Vercel
 * function use, against a throw-away lead directory.
 */
import { createServer } from "node:http";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { handleConsult } from "../server/handler.mjs";

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✔" : "✘"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const leadDir = await mkdtemp(path.join(tmpdir(), "taxino-leads-"));
process.env.LEAD_DIR = leadDir;

const server = createServer((request, response) => {
  void handleConsult(request, response);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const endpoint = `http://127.0.0.1:${port}/api/consult`;

const validPayload = {
  name: "حسین رحمانی",
  phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
  agency: "آژانس نمونهٔ قزوین",
  city: "قزوین",
  drivers: 24,
  note: "بررسی دمو برای ۲۴ راننده",
  plan: "یک‌ساله",
  consent: true,
  source: "landing",
  website: "",
};

async function post(body, { headers = {}, ip = "198.51.100.10", raw = null } = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip, ...headers },
    body: raw ?? JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  return { status: response.status, json, headers: response.headers };
}

/* ------------------------------------------------------------------ tests */
const ok = await post(validPayload, { ip: "198.51.100.1" });
check("valid lead is accepted", ok.status === 200 && ok.json.ok === true, ok.json.id ?? "");
check("reference id looks like TX-…", /^TX-[A-Z0-9]{6,}$/.test(ok.json.id ?? ""), ok.json.id ?? "");

const stored = await readFile(path.join(leadDir, "leads.jsonl"), "utf8").catch(() => "");
const parsed = stored.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
check("lead persisted to disk", parsed.length >= 1, `${parsed.length} record(s)`);
check(
  "phone normalised to 09xxxxxxxxx",
  parsed[0]?.phone === "09123456789",
  parsed[0]?.phone ?? "—",
);
check("honeypot value never stored", parsed[0] && !("website" in parsed[0]));

const noConsent = await post({ ...validPayload, consent: false }, { ip: "198.51.100.2" });
check("missing consent rejected", noConsent.status === 400 && Boolean(noConsent.json.errors?.consent));

const badPhone = await post({ ...validPayload, phone: "12345" }, { ip: "198.51.100.3" });
check("invalid phone rejected", badPhone.status === 400 && Boolean(badPhone.json.errors?.phone));

const badPlan = await post({ ...validPayload, plan: "پلن ساختگی" }, { ip: "198.51.100.4" });
check("unknown plan rejected", badPlan.status === 400 && Boolean(badPlan.json.errors?.plan));

const bot = await post({ ...validPayload, website: "https://spam.example" }, { ip: "198.51.100.5" });
check("honeypot submission rejected", bot.status === 400);

const wrongType = await post({}, { ip: "198.51.100.6", headers: { "Content-Type": "text/plain" } });
check("non-JSON content type rejected", wrongType.status === 415, `status ${wrongType.status}`);

// The server drops the socket as soon as the cap is exceeded, so either a 413
// or an aborted connection is a pass — both mean "not stored".
let oversized;
try {
  oversized = await post({}, { ip: "198.51.100.7", raw: "x".repeat(9000) });
} catch {
  oversized = { status: "connection-closed" };
}
check(
  "oversized payload rejected",
  oversized.status === 413 || oversized.status === "connection-closed",
  `status ${oversized.status}`,
);

const getResponse = await fetch(endpoint, { method: "GET" });
check("GET not allowed", getResponse.status === 405);

let limited = 0;
for (let i = 0; i < 6; i += 1) {
  const attempt = await post(validPayload, { ip: "203.0.113.9" });
  if (attempt.status === 429) limited += 1;
}
check("rate limit kicks in after 5 requests", limited === 1, `${limited} blocked`);

/* ---------------------------------------------------------------- summary */
server.close();
const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} API checks passed`);
if (failed.length) {
  console.log("Lead directory:", leadDir);
  process.exitCode = 1;
}
