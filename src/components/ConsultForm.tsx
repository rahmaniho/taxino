import { useEffect, useRef, useState } from "react";
import { consultForm, contact, pricing } from "../data/content";
import { PLAN_EVENT } from "../lib/plan";
import { cn } from "../lib/utils";
import { Icon } from "./ui";

type Status = "idle" | "sending" | "success" | "error";

interface FormState {
  name: string;
  phone: string;
  agency: string;
  city: string;
  drivers: string;
  note: string;
}

const EMPTY: FormState = { name: "", phone: "", agency: "", city: "", drivers: "", note: "" };

const latinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

function normalisePhone(value: string) {
  const digits = latinDigits(value).replace(/[^\d+]/g, "");
  if (digits.startsWith("+98")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  return digits;
}

function validate(state: FormState, consent: boolean) {
  const errors: Record<string, string> = {};
  if (state.name.trim().length < 3) errors.name = "نام و نام خانوادگی را کامل بنویسید.";
  const phone = normalisePhone(state.phone);
  if (!/^09\d{9}$/.test(phone)) errors.phone = "شمارهٔ موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).";
  if (state.agency.trim().length < 2) errors.agency = "نام آژانس را وارد کنید.";
  if (state.city.trim().length < 2) errors.city = "شهر را وارد کنید.";
  if (state.drivers.trim()) {
    const drivers = Number(latinDigits(state.drivers).replace(/[^\d]/g, ""));
    if (!Number.isFinite(drivers) || drivers < 1 || drivers > 5000) {
      errors.drivers = "تعداد رانندگان را بین ۱ تا ۵۰۰۰ وارد کنید.";
    }
  }
  if (!consent) errors.consent = "برای ارسال، تأیید تماس لازم است.";
  return errors;
}

export default function ConsultForm({ id = "consult-form" }: { id?: string }) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [plan, setPlan] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onPlan = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) setPlan(detail);
    };
    window.addEventListener(PLAN_EVENT, onPlan);
    return () => window.removeEventListener(PLAN_EVENT, onPlan);
  }, []);

  const update = (field: keyof FormState, value: string) => {
    setState((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const found = validate(state, consent);
    setErrors(found);
    if (Object.keys(found).length) {
      const firstKey = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          phone: normalisePhone(state.phone),
          drivers: state.drivers ? Number(latinDigits(state.drivers).replace(/[^\d]/g, "")) : null,
          plan: plan || null,
          consent,
          source: "landing",
          website: honeypot.current?.value ?? "",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        errors?: Record<string, string>;
        message?: string;
      };

      if (response.ok && payload.ok) {
        setStatus("success");
        setReference(payload.id ?? "");
        setState(EMPTY);
        setConsent(false);
        setPlan("");
        return;
      }

      if (payload.errors && Object.keys(payload.errors).length) {
        setErrors(payload.errors);
        setStatus("idle");
        return;
      }

      setStatus("error");
      setMessage(
        response.status === 429
          ? "تعداد درخواست‌ها زیاد بود. چند دقیقه بعد دوباره تلاش کنید یا تلفنی تماس بگیرید."
          : consultForm.error,
      );
    } catch {
      setStatus("error");
      setMessage(consultForm.error);
    }
  };

  if (status === "success") {
    return (
      <div
        className="card-light flex flex-col items-center justify-center p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ok/12 text-ok">
          <Icon name="check" size={26} />
        </span>
        <h3 className="mt-4 text-lg font-extrabold text-navy-900">درخواست شما ثبت شد</h3>
        <p className="mt-2 max-w-sm text-[12.5px] leading-[2] text-graphite">{consultForm.success}</p>
        {reference ? (
          <p className="mt-3 rounded-lg bg-cream px-3 py-1.5 text-[11px] text-navy-900">
            {consultForm.successRef} <span className="latin font-semibold">{reference}</span>
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <a href={`tel:+982191090000`} className="btn btn-dark py-2.5! text-[12px]!">
            <Icon name="phone" size={14} />
            {contact.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setReference("");
            }}
            className="btn btn-outline-dark py-2.5! text-[12px]!"
          >
            ارسال درخواست دیگر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      id={id}
      onSubmit={onSubmit}
      noValidate
      className="card-light relative p-5 sm:p-6"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 id={`${id}-title`} className="text-base font-extrabold text-navy-900">
            {consultForm.title}
          </h3>
          <p className="mt-1 text-[11.5px] leading-[1.9] text-graphite">{consultForm.lede}</p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold text-gold-deep sm:inline-flex">
          پاسخ در ساعات کاری
        </span>
      </div>

      {plan ? (
        <p className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-[11px] font-semibold text-navy-900">
          <span className="flex items-center gap-1.5">
            <Icon name="check" size={13} className="text-gold-deep" />
            پلن انتخابی: {plan}
          </span>
          <button
            type="button"
            onClick={() => setPlan("")}
            className="text-[10px] text-navy-900/70 hover:text-navy-900"
            aria-label="حذف پلن انتخابی"
          >
            حذف
          </button>
        </p>
      ) : null}

      <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className="field-label text-navy-900/75!" htmlFor={`${id}-name`}>
            نام و نام خانوادگی <span className="text-danger">*</span>
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            value={state.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            placeholder="مثلاً: حسین رحمانی"
            className={cn(
              "w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none transition-colors placeholder:text-navy-900/65 focus:border-gold focus:ring-2 focus:ring-gold/25",
              errors.name ? "border-danger" : "border-navy-900/15",
            )}
          />
          {errors.name ? (
            <p id={`${id}-name-error`} className="field-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label className="field-label text-navy-900/75!" htmlFor={`${id}-phone`}>
            شمارهٔ تماس <span className="text-danger">*</span>
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            value={state.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
            placeholder="0912 345 6789"
            className={cn(
              "w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none transition-colors placeholder:text-navy-900/65 focus:border-gold focus:ring-2 focus:ring-gold/25",
              errors.phone ? "border-danger" : "border-navy-900/15",
            )}
          />
          {errors.phone ? (
            <p id={`${id}-phone-error`} className="field-error">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label className="field-label text-navy-900/75!" htmlFor={`${id}-agency`}>
            نام آژانس <span className="text-danger">*</span>
          </label>
          <input
            id={`${id}-agency`}
            name="agency"
            type="text"
            autoComplete="organization"
            value={state.agency}
            onChange={(event) => update("agency", event.target.value)}
            aria-invalid={Boolean(errors.agency)}
            aria-describedby={errors.agency ? `${id}-agency-error` : undefined}
            placeholder="آژانس تاکسی …"
            className={cn(
              "w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none transition-colors placeholder:text-navy-900/65 focus:border-gold focus:ring-2 focus:ring-gold/25",
              errors.agency ? "border-danger" : "border-navy-900/15",
            )}
          />
          {errors.agency ? (
            <p id={`${id}-agency-error`} className="field-error">
              {errors.agency}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label text-navy-900/75!" htmlFor={`${id}-city`}>
              شهر <span className="text-danger">*</span>
            </label>
            <input
              id={`${id}-city`}
              name="city"
              type="text"
              autoComplete="address-level2"
              value={state.city}
              onChange={(event) => update("city", event.target.value)}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? `${id}-city-error` : undefined}
              placeholder="قزوین"
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none transition-colors placeholder:text-navy-900/65 focus:border-gold focus:ring-2 focus:ring-gold/25",
                errors.city ? "border-danger" : "border-navy-900/15",
              )}
            />
            {errors.city ? (
              <p id={`${id}-city-error`} className="field-error">
                {errors.city}
              </p>
            ) : null}
          </div>
          <div>
            <label className="field-label text-navy-900/75!" htmlFor={`${id}-drivers`}>
              تعداد راننده
            </label>
            <input
              id={`${id}-drivers`}
              name="drivers"
              type="number"
              inputMode="numeric"
              min={1}
              max={5000}
              value={state.drivers}
              onChange={(event) => update("drivers", event.target.value)}
              aria-invalid={Boolean(errors.drivers)}
              aria-describedby={errors.drivers ? `${id}-drivers-error` : undefined}
              placeholder="۲۵"
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none transition-colors placeholder:text-navy-900/65 focus:border-gold focus:ring-2 focus:ring-gold/25",
                errors.drivers ? "border-danger" : "border-navy-900/15",
              )}
            />
            {errors.drivers ? (
              <p id={`${id}-drivers-error`} className="field-error">
                {errors.drivers}
              </p>
            ) : null}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label text-navy-900/75!" htmlFor={`${id}-note`}>
            توضیحات
          </label>
          <textarea
            id={`${id}-note`}
            name="note"
            rows={3}
            value={state.note}
            onChange={(event) => update("note", event.target.value)}
            placeholder="اگر نیاز خاصی دارید بنویسید…"
            className="w-full resize-y rounded-xl border border-navy-900/15 bg-white px-3 py-2.5 text-[13px] leading-[1.9] text-navy-900 outline-none transition-colors placeholder:text-navy-900/65 focus:border-gold focus:ring-2 focus:ring-gold/25"
          />
        </div>
      </div>

      {/* honeypot — bots fill it, humans never see it */}
      <div aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`${id}-website`}>Website</label>
        <input ref={honeypot} id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-4">
        <label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-[1.9] text-graphite">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              if (errors.consent) setErrors(({ consent: _c, ...rest }) => rest);
            }}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-[#f59300]"
          />
          <span>{consultForm.consent}</span>
        </label>
        {errors.consent ? (
          <p id={`${id}-consent-error`} className="field-error">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-dark mt-4 w-full rounded-xl! bg-navy-900! py-3! text-[13px]! disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Icon name="spinner" size={16} className="animate-spin" />
            {consultForm.sending}
          </>
        ) : (
          <>
            {consultForm.submit}
            <Icon name="arrow" size={16} className="text-gold" />
          </>
        )}
      </button>

      <p aria-live="polite" className="mt-3 min-h-[1.2rem] text-[11px] leading-[1.9] text-danger">
        {status === "error" ? message : ""}
      </p>

      <div className="mt-1 border-t border-navy-900/10 pt-3 text-[10.5px] leading-[1.9] text-graphite">
        <p>
          {consultForm.fallback}{" "}
          <a href="tel:+982191090000" className="font-semibold text-navy-900" dir="ltr">
            {contact.phoneDisplay}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${contact.email}`} className="font-semibold text-navy-900">
            {contact.email}
          </a>
        </p>
        <p className="mt-1">
          اطلاعات این فرم فقط برای بررسی درخواست مشاوره استفاده می‌شود. پلن‌های رسمی:{" "}
          {pricing.plans.map((plan) => plan.title).join("، ")}.
        </p>
      </div>
    </form>
  );
}
