import { useCallback, useMemo, useState } from "react";
import { dispatch, links } from "../data/content";
import { useReveal } from "../lib/anim";
import { cn, toFa } from "../lib/utils";
import { Icon, SampleBadge, Section, SectionHead } from "./ui";

type TripStatus = "pending" | "assigned" | "done";
type DriverStatus = "available" | "busy" | "rest";

interface DemoTrip {
  id: number;
  from: string;
  to: string;
  minutes: number;
  priority: boolean;
  status: TripStatus;
  driverId: number | null;
}

interface DemoDriver {
  id: number;
  name: string;
  status: DriverStatus;
  trips: number;
}

interface LogEntry {
  id: number;
  text: string;
}

const driverStatusLabel: Record<DriverStatus, string> = {
  available: "آزاد",
  busy: "مشغول",
  rest: "مرخصی",
};

const initialTrips: DemoTrip[] = dispatch.sampleData.map((trip) => ({
  ...trip,
  status: "pending",
  driverId: null,
}));

const initialDrivers: DemoDriver[] = dispatch.sampleDrivers.map((driver) => ({
  ...driver,
  status: driver.status as DriverStatus,
}));

export default function DispatchDemo() {
  const ref = useReveal<HTMLDivElement>();
  const [trips, setTrips] = useState<DemoTrip[]>(initialTrips);
  const [drivers, setDrivers] = useState<DemoDriver[]>(initialDrivers);
  const [log, setLog] = useState<LogEntry[]>([
    { id: 0, text: "صف انتظار با ۳ سفر نمونه بارگذاری شد." },
  ]);

  const freeDrivers = drivers.filter((driver) => driver.status === "available");
  const pending = trips.filter((trip) => trip.status === "pending");
  const active = trips.filter((trip) => trip.status === "assigned");
  const stale = pending.filter((trip) => trip.minutes >= dispatch.staleLimit);
  const nextDriver = freeDrivers[0];

  const push = useCallback((text: string) => {
    setLog((current) => [{ id: Date.now() + Math.random(), text }, ...current].slice(0, 4));
  }, []);

  const assignNext = () => {
    if (!pending.length || !nextDriver) return;
    // The product's queue rule: urgent first, then the trip that has waited longest.
    const target = [...pending].sort((a, b) => Number(b.priority) - Number(a.priority) || b.minutes - a.minutes)[0];

    setDrivers((current) =>
      current.map((driver) => (driver.id === nextDriver.id ? { ...driver, status: "busy" } : driver)),
    );
    setTrips((current) =>
      current.map((trip) => {
        if (trip.id === target.id) {
          return { ...trip, status: "assigned", driverId: nextDriver.id, minutes: 0 };
        }
        // Simulated clock: every dispatch step ages the remaining queue.
        return trip.status === "pending" ? { ...trip, minutes: trip.minutes + 4 } : trip;
      }),
    );
    push(`سفر ${toFa(target.from)} ← ${toFa(target.to)} به ${nextDriver.name} تخصیص یافت.`);
  };

  const completeTrip = (tripId: number) => {
    const trip = trips.find((item) => item.id === tripId);
    if (!trip || !trip.driverId) return;
    const driver = drivers.find((item) => item.id === trip.driverId);
    setTrips((current) =>
      current.map((item) => (item.id === tripId ? { ...item, status: "done", driverId: null } : item)),
    );
    setDrivers((current) =>
      current.map((item) =>
        item.id === trip.driverId
          ? { ...item, status: "available", trips: item.trips + 1 }
          : item,
      ),
    );
    push(`سفر ${trip.from} توسط ${driver?.name ?? "راننده"} تکمیل شد؛ کرایه و کمیسیون ثبت شد.`);
  };

  const reset = () => {
    setTrips(initialTrips);
    setDrivers(initialDrivers);
    setLog([{ id: Date.now(), text: "نمایش به حالت اولیه بازگشت." }]);
  };

  const stats = useMemo(
    () => [
      { label: "در صف", value: pending.length, tone: "gold" },
      { label: "در حال انجام", value: active.length, tone: "ok" },
      { label: "رانندهٔ آزاد", value: freeDrivers.length, tone: "info" },
      { label: "تکمیل‌شده", value: trips.filter((t) => t.status === "done").length, tone: "muted" },
    ],
    [pending.length, active.length, freeDrivers.length, trips],
  );

  return (
    <Section id="dispatch" tone="deep" aria-labelledby="dispatch-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_78%_0%,rgba(24,62,116,0.4),transparent_62%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/25 to-transparent" />
        <div className="grain" />
      </div>

      <div ref={ref} className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <SectionHead
            id="dispatch-title"
            eyebrow={dispatch.eyebrow}
            title={dispatch.title}
            lede={dispatch.lede}
          />

          <ul className="mt-8 space-y-3">
            {dispatch.points.map((point) => (
              <li key={point} data-reveal className="flex items-start gap-2.5 text-[13px] text-cream/70">
                <Icon name="check" size={15} className="mt-1.5 shrink-0 text-gold" />
                <span className="leading-[1.9]">{point}</span>
              </li>
            ))}
          </ul>

          <p data-reveal className="mt-6 flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-[11px] leading-[2] text-cream/58">
            <Icon name="shield" size={14} className="mt-1.5 shrink-0 text-gold/60" />
            {dispatch.note}
          </p>

          <a
            data-reveal
            href={links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-semibold text-gold"
          >
            همین گردش‌کار را در نسخهٔ نمایشی ببینید
            <Icon name="arrowUpLeft" size={14} />
          </a>
        </div>

        {/* -------------------------------------------------------- the panel */}
        <div data-reveal className="relative">
          <div className="card-dark overflow-hidden">
            {/* title bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="pulse-dot" aria-hidden="true" />
                <span className="text-[12px] font-bold text-cream/85">پنل دیسپچ — شبیه‌سازی تعاملی</span>
              </div>
              <SampleBadge />
            </div>

            {/* stats */}
            <div className="grid grid-cols-2 divide-x divide-white/6 border-b border-white/8 sm:grid-cols-4 [&>*]:border-white/6">
              {stats.map((stat) => (
                <div key={stat.label} className="px-3.5 py-3">
                  <p className="text-[10px] text-cream/55">{stat.label}</p>
                  <p
                    className={cn(
                      "num mt-1 text-xl font-extrabold leading-none",
                      stat.tone === "gold" && "text-gold",
                      stat.tone === "ok" && "text-ok",
                      stat.tone === "info" && "text-info",
                      stat.tone === "muted" && "text-cream/70",
                    )}
                  >
                    {toFa(stat.value)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              {/* queue */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="text-[11.5px] font-bold text-cream/70">صف انتظار</h3>
                  <span className="text-[10px] text-cream/55">اولویت فوری، سپس بیشترین انتظار</span>
                </div>
                <ul className="space-y-2">
                  {trips.map((trip) => {
                    const driver = drivers.find((item) => item.id === trip.driverId);
                    const overdue = trip.status === "pending" && trip.minutes >= dispatch.staleLimit;
                    return (
                      <li
                        key={trip.id}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 transition-colors",
                          trip.status === "done"
                            ? "border-white/6 bg-white/[0.02] opacity-60"
                            : trip.status === "assigned"
                              ? "border-info/25 bg-info/[0.06]"
                              : overdue
                                ? "border-danger/30 bg-danger/[0.06]"
                                : "border-white/8 bg-white/[0.03]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-cream/80">
                            <span className="truncate">{trip.from}</span>
                            <Icon name="arrow" size={12} className="shrink-0 text-gold/70" />
                            <span className="truncate">{trip.to}</span>
                          </p>
                          {trip.status === "pending" ? (
                            <span
                              className={cn(
                                "num shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold",
                                overdue ? "bg-danger/15 text-danger" : "bg-white/6 text-cream/60",
                              )}
                            >
                              {toFa(trip.minutes)} دقیقه در صف
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[10px]">
                            {trip.priority ? (
                              <span className="rounded bg-gold/15 px-1.5 py-0.5 font-bold text-gold">فوری</span>
                            ) : null}
                            <span
                              className={cn(
                                "text-cream/58",
                                trip.status === "assigned" && "text-info",
                                trip.status === "done" && "text-ok",
                              )}
                            >
                              {trip.status === "pending" && "در انتظار تخصیص"}
                              {trip.status === "assigned" && `در حال انجام · ${driver?.name ?? ""}`}
                              {trip.status === "done" && "تکمیل‌شده"}
                            </span>
                          </span>

                          {trip.status === "assigned" ? (
                            <button
                              type="button"
                              onClick={() => completeTrip(trip.id)}
                              className="rounded-lg border border-ok/30 bg-ok/10 px-2 py-1 text-[10px] font-bold text-ok transition-colors hover:bg-ok/20"
                            >
                              تکمیل سفر
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* alerts */}
                <div aria-live="polite" className="mt-2.5 space-y-2">
                  {stale.length ? (
                    <p className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/[0.07] p-2.5 text-[10.5px] leading-[1.9] text-danger/90">
                      <Icon name="bell" size={13} className="mt-1 shrink-0" />
                      {toFa(stale.length)} سفر بیش از {toFa(dispatch.staleLimit)} دقیقه در صف مانده است؛ اولویت تخصیص را بررسی کنید.
                    </p>
                  ) : null}
                  {pending.length && !freeDrivers.length ? (
                    <p className="flex items-start gap-2 rounded-lg border border-gold/25 bg-gold/[0.07] p-2.5 text-[10.5px] leading-[1.9] text-gold/90">
                      <Icon name="bell" size={13} className="mt-1 shrink-0" />
                      رانندهٔ آزادی برای تخصیص نیست (همه مشغول یا در مرخصی‌اند).
                    </p>
                  ) : null}
                </div>
              </div>

              {/* drivers + log */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-[11.5px] font-bold text-cream/70">نوبت رانندگان</h3>
                    <span className="text-[10px] text-cream/55">چرخشی</span>
                  </div>
                  <ul className="space-y-1.5">
                    {drivers.map((driver, index) => {
                      const isNext = driver.status === "available" && driver.id === nextDriver?.id;
                      return (
                        <li
                          key={driver.id}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-2.5 py-1.5",
                            isNext
                              ? "border-gold/40 bg-gold/[0.08]"
                              : "border-white/7 bg-white/[0.025]",
                            driver.status === "rest" && "border-dashed opacity-70",
                          )}
                        >
                          <span className="num grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/6 text-[9px] font-bold text-gold">
                            {toFa(index + 1)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[10.5px] font-semibold text-cream/80">
                              {driver.name}
                            </span>
                            <span className="block text-[9px] text-cream/55">
                              {toFa(driver.trips)} سفر امروز
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold",
                              driver.status === "available" && "bg-ok/12 text-ok",
                              driver.status === "busy" && "bg-gold/12 text-gold",
                              driver.status === "rest" && "bg-info/12 text-info",
                            )}
                          >
                            {driverStatusLabel[driver.status]}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-[11.5px] font-bold text-cream/70">گزارش فعالیت</h3>
                  <ul aria-live="polite" className="space-y-1.5">
                    {log.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-start gap-1.5 text-[9.5px] leading-[1.8] text-cream/58"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold/60" aria-hidden="true" />
                        {entry.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/8 bg-white/[0.02] px-4 py-3">
              <button
                type="button"
                onClick={assignNext}
                disabled={!pending.length || !nextDriver}
                className="btn btn-gold px-4! py-2! text-[11.5px]! disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none"
              >
                <Icon name="route" size={14} />
                تخصیص نفر بعدی
              </button>
              {active.length ? (
                <button
                  type="button"
                  onClick={() => completeTrip(active[0].id)}
                  className="btn btn-ghost px-4! py-2! text-[11.5px]!"
                >
                  <Icon name="check" size={14} />
                  تکمیل سفر جاری
                </button>
              ) : null}
              <button
                type="button"
                onClick={reset}
                className="ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] text-cream/58 transition-colors hover:text-cream/80"
              >
                بازنشانی نمایش
              </button>
            </div>
          </div>

          {/* map strip — address coordinates, not live GPS */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/8 bg-navy-950">
            <div className="relative h-36 sm:h-40">
              <svg
                viewBox="0 0 640 200"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="map-glow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0b1f3d" />
                    <stop offset="100%" stopColor="#040b1a" />
                  </linearGradient>
                </defs>
                <rect width="640" height="200" fill="url(#map-glow)" />
                <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1">
                  {Array.from({ length: 17 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />
                  ))}
                </g>
                <g stroke="#f59300" strokeOpacity="0.28" strokeWidth="2" fill="none">
                  <path d="M-10 138 L 190 132 L 250 96 L 430 92 L 560 52 L 660 48" />
                  <path d="M120 -10 L 150 70 L 132 130 L 190 200" />
                  <path d="M400 -10 L 402 80 L 470 132 L 470 200" />
                </g>
                <path
                  d="M96 150 C 180 140 210 104 300 104 C 370 104 400 78 470 62"
                  fill="none"
                  stroke="#FFC60B"
                  strokeWidth="2"
                  strokeDasharray="6 7"
                  strokeLinecap="round"
                />
                <g fill="#FFC60B">
                  <circle cx="96" cy="150" r="4" />
                  <circle cx="470" cy="62" r="4" />
                </g>
                <circle cx="300" cy="104" r="5" fill="#7F9DFF" />
              </svg>
              <span className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-navy-950 to-transparent p-2.5 text-[9.5px] text-cream/55">
                <span className="flex items-center gap-1.5">
                  <Icon name="pin" size={11} className="text-gold/70" />
                  مختصات آدرس‌ها و برآورد فاصلهٔ آفلاین
                </span>
                <SampleBadge label="نمای نمایشی" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
