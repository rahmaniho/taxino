import { contact } from "../data/content";

export interface LeadPayload {
  name: string;
  phone: string;
  agency: string;
  city: string;
  drivers: number | null;
  note: string;
  plan: string | null;
  consent: boolean;
  source: string;
  website: string;
}

export type LeadResult =
  | { kind: "ok"; id?: string }
  | { kind: "invalid"; errors: Record<string, string> }
  | { kind: "rate-limited" }
  | { kind: "unavailable"; mailto: string }
  | { kind: "error"; message?: string };

/**
 * Where the form posts. On the Node server / Vercel the default same-origin
 * endpoint exists; on a purely static host (GitHub Pages) it does not, and the
 * user is handed a pre-filled e-mail instead of a fake success message.
 */
const ENDPOINT =
  (import.meta.env.VITE_CONSULT_ENDPOINT as string | undefined)?.trim() || "/api/consult";

/** Statuses that mean "there is no API here", not "the request was wrong". */
const NO_API = new Set([404, 405, 501]);

export function mailtoFor(payload: LeadPayload): string {
  const lines = [
    "درخواست مشاورهٔ تاکسینو",
    "─────────────",
    `نام: ${payload.name}`,
    `موبایل: ${payload.phone}`,
    `آژانس: ${payload.agency}`,
    `شهر: ${payload.city}`,
    `تعداد رانندگان: ${payload.drivers ?? "—"}`,
    `پلن مورد نظر: ${payload.plan ?? "—"}`,
    `توضیحات: ${payload.note || "—"}`,
    "",
    `منبع: ${payload.source}`,
  ];
  const subject = `درخواست مشاورهٔ تاکسینو — ${payload.agency}`;
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join("\n"),
  )}`;
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (NO_API.has(response.status)) {
      return { kind: "unavailable", mailto: mailtoFor(payload) };
    }

    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      errors?: Record<string, string>;
      message?: string;
    };

    if (response.ok && data.ok) return { kind: "ok", id: data.id };
    if (data.errors && Object.keys(data.errors).length) {
      return { kind: "invalid", errors: data.errors };
    }
    if (response.status === 429) return { kind: "rate-limited" };
    return { kind: "error", message: data.message };
  } catch {
    // Network error / static host without the endpoint.
    return { kind: "unavailable", mailto: mailtoFor(payload) };
  }
}
