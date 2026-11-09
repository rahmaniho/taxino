/** Request handler shared by the dev middleware, the node server and Vercel. */
import {
  clientIp,
  createRateLimiter,
  deliverLead,
  readJsonBody,
  validate,
  MAX_BODY_BYTES,
} from "./lead.mjs";

const limit = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

const json = (res, status, body, extraHeaders = {}) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  Object.entries(extraHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
};

/**
 * POST /api/consult
 * 200 { ok:true, id }            lead stored/forwarded
 * 400 { ok:false, errors:{…} }   validation failed
 * 429 { ok:false, message }      too many requests
 * 503 { ok:false, message }      no delivery channel configured/reachable
 */
export async function handleConsult(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Allow", "POST, OPTIONS");
    response.end();
    return;
  }
  if (request.method !== "POST") {
    json(response, 405, { ok: false, message: "روش درخواست پشتیبانی نمی‌شود." }, { Allow: "POST" });
    return;
  }

  const contentType = String(request.headers["content-type"] ?? "");
  if (!contentType.includes("application/json")) {
    json(response, 415, { ok: false, message: "نوع محتوا باید JSON باشد." });
    return;
  }

  const ip = clientIp(request.headers, request.socket?.remoteAddress);
  const verdict = limit(ip);
  if (!verdict.allowed) {
    json(
      response,
      429,
      { ok: false, message: "تعداد درخواست‌ها زیاد است. لطفاً بعداً تلاش کنید." },
      { "Retry-After": String(verdict.retryAfter) },
    );
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(request, MAX_BODY_BYTES);
  } catch (error) {
    if (error?.code === "TOO_LARGE") {
      json(response, 413, { ok: false, message: "حجم درخواست بیش از حد مجاز است." });
      return;
    }
    json(response, 400, { ok: false, errors: { form: "بدنهٔ درخواست معتبر نیست." } });
    return;
  }

  const { lead, errors } = validate(payload);
  if (errors || !lead) {
    json(response, 400, { ok: false, errors: errors ?? { form: "اطلاعات معتبر نیست." } });
    return;
  }

  try {
    const result = await deliverLead(lead);
    if (!result.ok) {
      // A silent failure would be a lie in the UI — say it out loud.
      json(response, 503, {
        ok: false,
        message: "سیستم دریافت درخواست موقتاً در دسترس نیست. لطفاً تلفنی تماس بگیرید.",
      });
      return;
    }
    json(response, 200, { ok: true, id: lead.id });
  } catch {
    json(response, 500, { ok: false, message: "خطای غیرمنتظره در ثبت درخواست." });
  }
}
