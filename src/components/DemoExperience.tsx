import { useCallback, useMemo, useState } from "react";
import { demoExperience, links } from "../data/content";
import { useReveal } from "../lib/anim";
import { cn, toFa } from "../lib/utils";
import { Icon, Section, SectionHead } from "./ui";

type TripStatus = "pending" | "assigned" | "done";

interface DemoDriver {
  id: number;
  name: string;
  trips: number;
}

interface DemoTrip {
  id: number;
  from: string;
  to: string;
  minutes: number;
  status: TripStatus;
  driverId: number | null;
}

const DRIVERS: DemoDriver[] = [
  { id: 1, name: "راننده نمونهٔ ۱", trips: 7 },
  { id: 2, name: "راننده نمونهٔ ۲", trips: 9 },
  { id: 3, name: "راننده نمونهٔ ۳", trips: 6 },
] as const;

const MAX_TRIPS = 3;

const statusLabel: Record<TripStatus, string> = {
  pending: demoExperience.statusPending,
  assigned: demoExperience.statusAssigned,
  done: demoExperience.statusDone,
};

export default function DemoExperience() {
  const ref = useReveal<HTMLDivElement>();
  const [trips, setTrips] = useState<DemoTrip[]>([]);
  const [form, setForm] = useState({ from: "", to: "" });
  const [driverTrips, setDriverTrips] = useState<DemoDriver[]>(DRIVERS);
  const reachedLimit = trips.length >= MAX_TRIPS;

  const remaining = MAX_TRIPS - trips.length;

  const onChange = useCallback(
    (key: "from" | "to", value: string) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const addTrip = useCallback(() => {
    if (reachedLimit || !form.from.trim() || !form.to.trim()) return;
    const next: DemoTrip = {
      id: Date.now(),
      from: form.from.trim(),
      to: form.to.trim(),
      minutes: 0,
      status: "pending",
      driverId: null,
    };
    setTrips((current) => [...current, next]);
    setForm({ from: "", to: "" });
  }, [form, reachedLimit]);

  const completeTrip = useCallback((tripId: number) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip || !trip.driverId) return;
    setTrips((current) =>
      current.map((t) =>
        t.id === tripId ? { ...t, status: "done", driverId: null } : t,
      ),
    );
    setDriverTrips((current) =>
      current.map((d) =>
        d.id === trip.driverId ? { ...d, trips: Math.max(0, d.trips - 1) } : d,
      ),
    );
  }, [trips]);

  const reset = useCallback(() => {
    setTrips([]);
    setDriverTrips(DRIVERS);
  }, []);

  const stats = useMemo(
    () => [
      { label: "ثبت‌شده", value: trips.length, tone: "gold" as const },
      { label: "در صف", value: trips.filter((t) => t.status === "pending").length, tone: "cream" as const },
      { label: "در حال انجام", value: trips.filter((t) => t.status === "assigned").length, tone: "info" as const },
      { label: "تکمیل‌شده", value: trips.filter((t) => t.status === "done").length, tone: "ok" as const },
    ],
    [trips],
  );

  return (
    <Section id="demo" tone="deep" aria-labelledby="demo-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_78%_0%,rgba(24,62,116,0.4),transparent_62%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/25 to-transparent" />
        <div className="grain" />
      </div>

      <div ref={ref} className="shell grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <SectionHead
            id="demo-title"
            eyebrow={demoExperience.eyebrow}
            title={demoExperience.title}
            lede={demoExperience.lede}
          />
          <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-[11px] leading-[2] text-cream/58">
            <span className="font-bold text-gold">«{demoExperience.sampleBadge}»</span>
            {demoExperience.limitNotice}
          </p>
          <p className="mt-3 text-[11px] text-cream/70">
            {toFa(remaining)} رکورد تا حدّ نمایشی
          </p>
        </div>

        <div data-reveal className="relative">
          {/* registration form */}
          <div className="card-dark overflow-hidden mb-6">
            <div className="border-b border-white/8 bg-white/[0.03] px-4 py-3">
              <h3 className="text-[11.5px] font-bold text-cream/85">
                {demoExperience.addTrip}
              </h3>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:items-end">
              <div>
                <label htmlFor="demo-from" className="block text-[10px] font-bold text-cream/55 mb-1.5">
                  {demoExperience.fromLabel}
                </label>
                <input
                  id="demo-from"
                  value={form.from}
                  onChange={(e) => onChange("from", e.target.value)}
                  placeholder={demoExperience.fromPlaceholder}
                  className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-[12px] text-cream focus:border-gold focus:ring-1 focus:ring-gold/50"
                  disabled={reachedLimit}
                />
              </div>
              <div>
                <label htmlFor="demo-to" className="block text-[10px] font-bold text-cream/55 mb-1.5">
                  {demoExperience.toLabel}
                </label>
                <input
                  id="demo-to"
                  value={form.to}
                  onChange={(e) => onChange("to", e.target.value)}
                  placeholder={demoExperience.toPlaceholder}
                  className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-[12px] text-cream focus:border-gold focus:ring-1 focus:ring-gold/50"
                  disabled={reachedLimit}
                />
              </div>
              <button
                type="button"
                onClick={addTrip}
                disabled={reachedLimit || !form.from.trim() || !form.to.trim()}
                className="btn btn-gold px-4! py-2! text-[11.5px]! disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none"
              >
                ثبت
              </button>
            </div>
          </div>

          {/* limit reached callout */}
          {reachedLimit && (
            <div className="rounded-xl border border-gold/40 bg-gold/[0.10] p-4 mb-6">
              <h3 className="mb-1 text-[12px] font-bold text-gold">
                {demoExperience.reachedLimit}
              </h3>
              <p className="text-[11px] leading-[1.9] text-cream/70">
                {demoExperience.reachedNote}
              </p>
              <a
                href={links.karenSoft}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-[11.5px] font-bold text-gold transition-colors hover:bg-gold/20"
              >
                {demoExperience.contactCta}
                <Icon name="arrowUpLeft" size={12} />
              </a>
            </div>
          )}

          {/* trips list */}
          <div className="card-dark overflow-hidden">
            <div className="border-b border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[11.5px] font-bold text-cream/85">سفارش‌ها</h3>
                <span className="num text-[10px] font-bold text-gold">
                  {toFa(trips.length)} / {MAX_TRIPS}
                </span>
              </div>
            </div>
            <div className="divide-y divide-white/6 p-4 max-h-64 overflow-y-auto">
              {trips.length === 0 ? (
                <p className="text-[11px] text-cream/55 text-center py-6">
                  هیچ سفارشی ثبت نشده است.
                </p>
              ) : (
                <ul className="space-y-2">
                  {trips.map((trip) => {
                    const driver =
                      driverTrips.find((d) => d.id === trip.driverId) ?? null;
                    return (
                      <li
                        key={trip.id}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 transition-colors",
                          trip.status === "done"
                            ? "border-white/6 bg-white/[0.02] opacity-60"
                            : trip.status === "assigned"
                              ? "border-info/25 bg-info/[0.06]"
                              : "border-white/8 bg-white/[0.03]",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-cream/80">
                            <span className="truncate">{trip.from}</span>
                            <Icon name="arrow" size={12} className="shrink-0 text-gold/70" />
                            <span className="truncate">{trip.to}</span>
                          </p>
                          <span
                            className={cn(
                              "num shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold",
                              trip.status === "pending"
                                ? "bg-white/6 text-cream/60"
                                : trip.status === "assigned"
                                  ? "bg-info/15 text-info"
                                  : "bg-ok/12 text-ok",
                            )}
                          >
                            {statusLabel[trip.status]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-cream/55">
                            {trip.driverId && driver
                              ? `${driver.name} · ${toFa(driver.trips)} سفر`
                              : "در انتظار تخصیص"}
                          </span>
                          {trip.status === "assigned" ? (
                            <button
                              type="button"
                              onClick={() => completeTrip(trip.id)}
                              className="rounded-lg border border-ok/30 bg-ok/10 px-2 py-1 text-[10px] font-bold text-ok transition-colors hover:bg-ok/20"
                            >
                              تکمیل
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="border-t border-white/8 bg-white/[0.02] px-4 py-3 flex items-center gap-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-0.5">
                  <p className="text-[9px] text-cream/55">{stat.label}</p>
                  <p className={`num text-xs font-extrabold ${stat.tone === "gold" && "text-gold"} ${stat.tone === "info" && "text-info"} ${stat.tone === "ok" && "text-ok"} ${stat.tone === "cream" && "text-cream/70"}`}>
                    {toFa(stat.value)}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={reset}
                className="ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] text-cream/58 transition-colors hover:text-cream/80"
              >
                <Icon name="chevron" size={13} className="rotate-180" /> {demoExperience.reset}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
