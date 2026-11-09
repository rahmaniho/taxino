/**
 * TAXINO — consultation-lead core
 * ---------------------------------------------------------------------------
 * One implementation shared by the Vite dev server, the standalone production
 * server and the optional Vercel function. No dependencies.
 *
 * Security notes:
 *  · The client is never trusted: the same rules run again here.
 *  · Bodies are capped (8 KB) and must be JSON.
 *  · A honeypot field + per-IP rate limiting stop the naive floods.
 *  · Leads are appended to a file with 0600 permissions, or forwarded to a
 *    webhook when LEAD_WEBHOOK_URL is configured. PII is never logged to stdout.
 */
import { appendFile, mkdir, writeFile, access } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

export const MAX_BODY_BYTES = 8 * 1024;
export const PLAN_TITLES = ["یک‌ماهه", "سه‌ماهه", "شش‌ماهه", "یک‌ساله", "مادام‌العمر"];

const FA_TO_EN = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9" };

const latinize = (value) =>
  String(value ?? "").replace(/[۰-۹]/g, (d) => FA_TO_EN[d] ?? d).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export function normalisePhone(value) {
  const digits = latinize(value).replace(/[^\d+]/g, "");
  if (digits.startsWith("+98")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  return digits;
}

const text = (value, min, max) => {
  const clean = String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (clean.length < min) return null;
  return clean.slice(0, max);
};

/** Server-side validation. Returns `{ errors }` or `{ lead }`. */
export function validate(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { errors: { form: "دادهٔ ارسالی معتبر نیست." } };
  }

  if (String(payload.website ?? "").trim() !== "") {
    return { errors: { form: "درخواست رد شد." } };
  }

  const errors = {};
  const name = text(payload.name, 3, 80);
  if (!name) errors.name = "نام و نام خانوادگی را کامل بنویسید.";

  const phone = normalisePhone(payload.phone);
  if (!/^09\d{9}$/.test(phone)) errors.phone = "شمارهٔ موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).";

  const agency = text(payload.agency, 2, 80);
  if (!agency) errors.agency = "نام آژانس را وارد کنید.";

  const city = text(payload.city, 2, 60);
  if (!city) errors.city = "شهر را وارد کنید.";

  let drivers = null;
  if (payload.drivers !== null && payload.drivers !== undefined && String(payload.drivers).trim() !== "") {
    const parsed = Number(latinize(payload.drivers).replace(/[^\d]/g, ""));
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5000) {
      errors.drivers = "تعداد رانندگان را بین ۱ تا ۵۰۰۰ وارد کنید.";
    } else {
      drivers = parsed;
    }
  }

  const note = payload.note ? text(payload.note, 0, 1200) : null;
  const plan = payload.plan ? String(payload.plan).slice(0, 40) : null;
  if (plan && !PLAN_TITLES.includes(plan)) errors.plan = "پلن انتخابی معتبر نیست.";

  if (payload.consent !== true) errors.consent = "برای ارسال، تأیید تماس لازم است.";

  if (Object.keys(errors).length) return { errors };

  return {
    lead: {
      id: `TX-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`,
      receivedAt: new Date().toISOString(),
      name,
      phone,
      agency,
      city,
      drivers,
      note,
      plan,
      source: String(payload.source ?? "landing").slice(0, 24),
    },
  };
}

/** Append-only lead store (JSONL, 0600). */
export async function storeLead(lead, options = {}) {
  const dir = options.dir ?? process.env.LEAD_DIR ?? path.join(process.cwd(), "var", "leads");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, "leads.jsonl");
  try {
    await access(file);
  } catch {
    await writeFile(file, "", { mode: 0o600 });
  }
  await appendFile(file, `${JSON.stringify(lead)}\n`, { encoding: "utf8", mode: 0o600 });
  return file;
}

async function postWebhook(lead, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "taxino.consult", lead }),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Delivers a validated lead. Succeeds only if at least one channel worked —
 * the form must never report a fake success.
 */
export async function deliverLead(lead) {
  const channels = [];
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    const ok = await postWebhook(lead, webhook);
    channels.push({ channel: "webhook", ok });
  }
  try {
    await storeLead(lead);
    channels.push({ channel: "file", ok: true });
  } catch (error) {
    channels.push({ channel: "file", ok: false, reason: error?.code ?? "write-failed" });
  }
  return { ok: channels.some((c) => c.ok), channels };
}

/** Simple in-memory sliding-window limiter (per process). */
export function createRateLimiter({ windowMs = 10 * 60 * 1000, max = 5 } = {}) {
  const hits = new Map();
  return function limit(key) {
    const now = Date.now();
    const bucket = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (bucket.length >= max) {
      hits.set(key, bucket);
      return { allowed: false, retryAfter: Math.ceil((windowMs - (now - bucket[0])) / 1000) };
    }
    bucket.push(now);
    hits.set(key, bucket);
    if (hits.size > 5000) {
      for (const [mapKey, times] of hits) {
        if (!times.length || now - times[times.length - 1] > windowMs) hits.delete(mapKey);
      }
    }
    return { allowed: true };
  };
}

export function clientIp(headers, fallback) {
  const forwarded = headers["x-forwarded-for"] || headers["X-Forwarded-For"];
  if (typeof forwarded === "string" && forwarded.length) return forwarded.split(",")[0].trim();
  const real = headers["x-real-ip"];
  if (typeof real === "string" && real.length) return real;
  return fallback ?? "unknown";
}

/** Reads a JSON body with a hard byte cap. */
export function readJsonBody(request, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("payload-too-large"), { code: "TOO_LARGE" }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("invalid-json"), { code: "BAD_JSON" }));
      }
    });
    request.on("error", reject);
  });
}
