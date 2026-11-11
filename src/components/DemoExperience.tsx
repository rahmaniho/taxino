import { useCallback, useMemo, useState } from "react";
import { links } from "../data/content";
import { cn, toFa } from "../lib/utils";
import { Icon } from "./ui";

/* ------------------------------------------------------------------ types */
type View = "dashboard" | "trips" | "drivers" | "customers" | "accounting" | "settings";

type TripStatus = "pending" | "assigned" | "done";
type DriverStatus = "available" | "busy" | "rest";

interface DemoDriver {
  id: number;
  name: string;
  status: DriverStatus;
  trips: number;
  commissionShare: number;
}

interface DemoTrip {
  id: number;
  from: string;
  to: string;
  minutes: number;
  fare: number;
  commission: number;
  status: TripStatus;
  driverId: number | null;
  customerId: number | null;
  createdAt: string;
}

interface DemoCustomer {
  id: number;
  name: string;
  phone: string;
  city: string;
  address: string;
  trips: number;
  debt: number;
}

interface RegisterForm {
  from: string;
  to: string;
  fare: string;
}

/* ------------------------------------------------------------------ sample data */
const DRIVERS: DemoDriver[] = [
  { id: 1, name: "رانندهٔ نمونهٔ ۱", status: "available", trips: 7, commissionShare: 20 },
  { id: 2, name: "رانندهٔ نمونهٔ ۲", status: "busy", trips: 9, commissionShare: 18 },
  { id: 3, name: "رانندهٔ نمونهٔ ۳", status: "rest", trips: 6, commissionShare: 22 },
] as const;

const CUSTOMERS: DemoCustomer[] = [
  { id: 1, name: "حسین رحمانی", phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹", city: "قزوین", address: "خیابان سعدی، پلاک ۱۲", trips: 5, debt: 150000 },
  { id: 2, name: "مریم احمدی", phone: "۰۹۱۳ ۰۰۰ ۱۱۱۱", city: "قزوین", address: "بلوار فردوسی، واحد ۵", trips: 3, debt: 0 },
  { id: 3, name: "علی رضایی", phone: "۰۹۱۴ ۲۲۲ ۳۳۳۳", city: "قزوین", address: "میدان امام، پلاک ۸", trips: 2, debt: 40000 },
] as const;

const INITIAL_TRIPS: DemoTrip[] = [
  {
    id: 101, from: "خیابان سعدی", to: "میدان آزادی", minutes: 6, fare: 60000, commission: 12000,
    status: "pending", driverId: null, customerId: 1, createdAt: "۰۹:۱۲",
  },
  {
    id: 102, from: "بلوار فردوسی", to: "بیمارستان ولیعصر", minutes: 12, fare: 120000, commission: 24000,
    status: "assigned", driverId: 2, customerId: 2, createdAt: "۰۹:۲۵",
  },
  {
    id: 103, from: "میدان امام", to: "ترمینال مسافری", minutes: 28, fare: 280000, commission: 56000,
    status: "done", driverId: 1, customerId: 3, createdAt: "۰۹:۴۰",
  },
] as const;

const MAX_TRIPS = 3;

const statusLabel: Record<TripStatus, string> = {
  pending: "در انتظار",
  assigned: "تخصیص یافته",
  done: "تکمیل‌شده",
};

const driverStatusLabel: Record<DriverStatus, string> = {
  available: "آزاد",
  busy: "مشغول",
  rest: "مرخصی",
};

const formatCurrency = (v: number): string => `${toFa(v)} تومان`;
const now = (): string => new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

/* ------------------------------------------------------------------ main component */
export default function DemoExperience() {
  const [view, setView] = useState<View>("dashboard");
  const [trips, setTrips] = useState<DemoTrip[]>(INITIAL_TRIPS);
  const [drivers, setDrivers] = useState<DemoDriver[]>(DRIVERS);
  const [customers, setCustomers] = useState<DemoCustomer[]>(CUSTOMERS);
  const [form, setForm] = useState<RegisterForm>({ from: "", to: "", fare: "" });
  const [tripToComplete, setTripToComplete] = useState<number | null>(null);

  const reachedLimit = trips.length >= MAX_TRIPS;

  const registerTrip = useCallback(() => {
    if (reachedLimit || !form.from.trim() || !form.to.trim() || !form.fare.trim()) return;
    const fare = Number(form.fare);
    if (!Number.isFinite(fare) || fare <= 0) return;
    const next: DemoTrip = {
      id: Date.now(),
      from: form.from.trim(),
      to: form.to.trim(),
      minutes: Math.ceil(fare / 10000),
      fare,
      commission: Math.round(fare * 0.2),
      status: "pending",
      driverId: null,
      customerId: null,
      createdAt: now(),
    };
    setTrips((current) => [...current, next]);
    setForm({ from: "", to: "", fare: "" });
  }, [form, reachedLimit]);

  const assignNext = useCallback(() => {
    const pending = trips.find((t) => t.status === "pending");
    if (!pending) return;
    const free = drivers.find((d) => d.status === "available");
    if (!free) return;
    setTrips((current) =>
      current.map((t) =>
        t.id === pending.id ? { ...t, status: "assigned", driverId: free.id } : t
      )
    );
    setDrivers((current) =>
      current.map((d) => (d.id === free.id ? { ...d, status: "busy" } : d))
    );
  }, [trips, drivers]);

  const completeTrip = useCallback((id: number) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip || !trip.driverId) return;
    setTrips((current) =>
      current.map((t) =>
        t.id === id ? { ...t, status: "done", driverId: null } : t
      )
    );
    setDrivers((current) =>
      current.map((d) =>
        d.id === trip.driverId
          ? { ...d, status: "available", trips: d.trips + 1 }
          : d
      )
    );
    setTripToComplete(null);
  }, [trips, drivers]);

  const reset = useCallback(() => {
    setTrips(INITIAL_TRIPS);
    setDrivers(DRIVERS);
    setCustomers(CUSTOMERS);
  }, []);

  const stats = useMemo(() => {
    const income = trips.reduce((s, t) => s + (t.status === "done" ? t.fare : 0), 0);
    const commission = trips.reduce(
      (s, t) => s + (t.status === "done" ? t.commission : 0),
      0
    );
    return [
      { label: "ثبت‌شده", value: trips.length, tone: "gold" as const },
      { label: "در صف", value: trips.filter((t) => t.status === "pending").length, tone: "cream" as const },
      { label: "در حال انجام", value: trips.filter((t) => t.status === "assigned").length, tone: "info" as const },
      { label: "تکمیل‌شده", value: trips.filter((t) => t.status === "done").length, tone: "ok" as const },
      { label: "درآمد", value: income, tone: "ok" as const },
      { label: "کمisión", value: commission, tone: "gold" as const },
    ];
  }, [trips]);

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "dashboard", label: "داشبورد", icon: "dashboard" },
    { id: "trips", label: "سفرها", icon: "route" },
    { id: "drivers", label: "رانندگان", icon: "drivers" },
    { id: "customers", label: "مشترکین", icon: "customers" },
    { id: "accounting", label: "حسابداری", icon: "accounting" },
    { id: "settings", label: "تنظیمات", icon: "security" },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto bg-navy-950/40 border border-white/8 rounded-2xl shadow-panel overflow-hidden" aria-labelledby="demo-title">
      {/* header */}
      <div className="border-b border-white/8 bg-white/[0.02] px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <Icon name="dashboard" size={16} className="text-gold" />
          </div>
          <div>
            <h2 id="demo-title" className="text-lg font-bold text-cream">تاکسینو — نسخه نمایشی</h2>
            <p className="text-[10px] text-cream/50">دادهٔ نمایشی · هرگونه خرید در این صفحه فرضی است</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded text-[11px] font-bold text-cream/60 hover:text-cream transition-colors"
        >
          بازنشانی نمایش
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            reachedLimit ? "bg-danger/10 text-danger border border-danger/30" : "bg-gold/10 text-gold border border-gold/30"
          }`}>
            {reachedLimit ? "حدّdisplay" : "فعال"}
          </span>
          {reachedLimit && (
            <a
              href={links.karenSoft}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded text-[11px] font-bold text-gold border border-gold/50 hover:bg-gold/5 transition-colors"
            >
              خرید اشتراک
            </a>
          )}
        </div>
      </div>

      {/* navigation */}
      <div className="flex gap-1 px-4 py-3 border-b border-white/6 overflow-x-auto pb-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors",
              view === item.id
                ? "bg-gold/10 text-gold border border-gold/30"
                : "text-cream/60 hover:text-cream hover:bg-white/5"
            )}
          >
            <Icon name={item.icon as any} size={12} />
            {item.label}
          </button>
        ))}
      </div>

      {/* content */}
      <div className="p-4">
        {view === "dashboard" && (
          <DashboardView stats={stats} trips={trips} drivers={drivers} />
        )}
        {view === "trips" && (
          <TripsView
            trips={trips}
            drivers={drivers}
            form={form}
            setForm={setForm}
            registerTrip={registerTrip}
            assignNext={assignNext}
            setTripToComplete={setTripToComplete}
            reachedLimit={reachedLimit}
          />
        )}
        {view === "drivers" && <DriversView drivers={drivers} />}
        {view === "customers" && <CustomersView customers={customers} />}
        {view === "accounting" && (
          <AccountingView trips={trips} drivers={drivers} />
        )}
        {view === "settings" && <SettingsView />}
      </div>

      {/* modal */}
      {tripToComplete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTripToComplete(null)} />
          <div className="bg-navy-900 border border-white/12 rounded-2xl p-6 w-full max-w-md shadow-panel">
            <h3 className="text-lg font-bold text-cream mb-2">تکمیل سفر</h3>
            <p className="text-[12px] text-cream/70 mb-4">آیا این سفر را تکمیل کردیم؟</p>
            <div className="flex gap-2">
              <button
                onClick={() => setTripToComplete(null)}
                className="flex-1 py-2 rounded-lg border border-white/8 text-[11px] text-cream/60 hover:bg-white/5"
              >
                انصراف
              </button>
              <button
                onClick={() => completeTrip(tripToComplete!)}
                className="flex-1 py-2 rounded-lg bg-ok text-[11px] font-bold text-[#1a1404] hover:bg-ok/90"
              >
                تایید تکمیل
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ======================================================================== sub-views */

function DashboardView({
  stats,
  trips,
  drivers,
}: {
  stats: { label: string; value: number; tone: string }[];
  trips: DemoTrip[];
  drivers: DemoDriver[];
}) {
  const recent = trips.slice().reverse().slice(0, 4);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold text-cream/55">{stat.label}</p>
          <p className={`num text-xl font-extrabold mt-1 ${
            stat.tone === "gold" ? "text-gold" : stat.tone === "ok" ? "text-ok" : stat.tone === "info" ? "text-info" : "text-cream/70"
          }`}>{toFa(stat.value)}</p>
        </div>
      ))}
      <div className="lg:col-span-2 rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <h3 className="text-[11px] font-bold text-cream/70 mb-3">سفرهای اخیر</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-white/6">
                <th className="pb-2 text-cream/50">سفر</th>
                <th className="pb-2 text-cream/50">مبدا → مقصد</th>
                <th className="pb-2 text-cream/50">كرایه</th>
                <th className="pb-2 text-cream/50">وضعیت</th>
                <th className="pb-2 text-cream/50">زمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {recent.map((t) => (
                <tr key={t.id} className="hover:bg-white/3">
                  <td className="py-2 text-cream/80 num">#{t.id}</td>
                  <td className="py-2 text-cream/80 truncate max-w-xs">{t.from} → {t.to}</td>
                  <td className="py-2 num text-gold">{formatCurrency(t.fare)}</td>
                  <td className="py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      t.status === "done" ? "bg-ok/12 text-ok" : t.status === "assigned" ? "bg-info/15 text-info" : "bg-white/6 text-cream/60"
                    }`}>{statusLabel[t.status as TripStatus]}</span>
                  </td>
                  <td className="py-2 text-cream/55">{t.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lg:col-span-2 rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <h3 className="text-[11px] font-bold text-cream/70 mb-3">نوبت رانندگان</h3>
        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-white/6 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                  d.status === "available" ? "bg-ok/12 text-ok" : d.status === "busy" ? "bg-gold/12 text-gold" : "bg-info/12 text-info"
                }`}>{driverStatusLabel[d.status as DriverStatus]}</span>
                <span className="text-cream/80">{d.name}</span>
              </div>
              <span className="num text-[10px] text-cream/55">{toFa(d.trips)} سفر</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TripsView({
  trips,
  drivers,
  form,
  setForm,
  registerTrip,
  assignNext,
  setTripToComplete,
  reachedLimit,
}: {
  trips: DemoTrip[];
  drivers: DemoDriver[];
  form: RegisterForm;
  setForm: (f: RegisterForm) => void;
  registerTrip: () => void;
  assignNext: () => void;
  setTripToComplete: (id: number | null) => void;
  reachedLimit: boolean;
}) {
  const pending = trips.filter((t) => t.status === "pending");
  const freeDriver = drivers.find((d) => d.status === "available");

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <h3 className="text-[11px] font-bold text-cream/70 mb-3">ثبت سفر جدید</h3>
          <div className="grid gap-3 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-cream/55 mb-1.5">مبدا</label>
              <input
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                placeholder="خیابان سعدی"
                className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-[12px] text-cream focus:border-gold focus:ring-1 focus:ring-gold/50"
                disabled={reachedLimit}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cream/55 mb-1.5">مقصد</label>
              <input
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                placeholder="میدان آزادی"
                className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-[12px] text-cream focus:border-gold focus:ring-1 focus:ring-gold/50"
                disabled={reachedLimit}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cream/55 mb-1.5">كرایه (تومان)</label>
              <input
                value={form.fare}
                onChange={(e) => setForm({ ...form, fare: e.target.value })}
                placeholder="۶۰۰۰۰"
                className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-[12px] text-cream focus:border-gold focus:ring-1 focus:ring-gold/50"
                disabled={reachedLimit}
              />
            </div>
            <button
              onClick={registerTrip}
              disabled={reachedLimit || !form.from.trim() || !form.to.trim() || !form.fare.trim()}
              className="btn btn-gold px-4! py-2! text-[11.5px]! disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:transform-none"
            >
              ثبت سفر
            </button>
          </div>
          {reachedLimit && (
            <div className="mt-3 rounded-lg border border-danger/30 bg-danger/[0.08] p-3">
              <p className="text-[11px] text-danger/90 font-medium">
                حدّ display: حداکثر ۳ سفر در نسخه نمایشی مجاز است.
              </p>
              <p className="text-[10px] text-cream/55 mt-1">
                برای خرید اشتراک، به صفحه تماس مراجعه کنید.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <h3 className="text-[11px] font-bold text-cream/70 mb-3">صف انتظار</h3>
          <ul className="space-y-2">
            {pending.length === 0 ? (
              <p className="text-[11px] text-cream/55 text-center py-4">
                هیچ سفری در صف نیست.
              </p>
            ) : (
              pending.map((t) => (
                <li key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-white/6 bg-white/[0.02]">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="num shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold bg-white/6 text-cream/60">
                      {toFa(t.minutes)} دقیقه
                    </span>
                    <span className="truncate text-cream/80">{t.from} → {t.to}</span>
                  </div>
                  <button
                    onClick={() => assignNext()}
                    disabled={!freeDriver}
                    className="text-[10px] font-bold text-gold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    تخصیص
                  </button>
                </li>
              ))
            )}
          </ul>
          {!freeDriver && pending.length > 0 && (
            <p className="mt-2 text-[10px] text-danger/90">
              رانندهٔ آزاد برای تخصیص نیست.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <h3 className="text-[11px] font-bold text-cream/70 mb-3">لیست سفرها</h3>
        <div className="overflow-y-auto max-h-[500px]">
          <ul className="space-y-2">
            {trips.length === 0 ? (
              <p className="text-[11px] text-cream/55 text-center py-6">
                هیچ سفری ثبت نشده است.
              </p>
            ) : (
              trips.map((t: DemoTrip) => {
                const driver = drivers.find((d) => d.id === t.driverId);
                return (
                  <li key={t.id} className="p-2.5 rounded-lg border border-white/6 bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="truncate text-[11.5px] text-cream/80">{t.from}</span>
                        <Icon name="arrow" size={11} className="shrink-0 text-gold/70" />
                        <span className="truncate text-[11.5px] text-cream/80">{t.to}</span>
                      </div>
                      <span className={`text-[9px] font-bold ${
                        t.status === "done" ? "text-ok" : t.status === "assigned" ? "text-info" : "text-cream/60"
                      }`}>{statusLabel[t.status]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="num text-[10px] text-cream/55">{formatCurrency(t.fare)}</span>
                      <span className="text-[9px] text-cream/50">{driver?.name ?? "—"}</span>
                    </div>
                    {t.status === "assigned" ? (
                      <button
                        onClick={() => setTripToComplete(t.id)}
                        className="mt-1 rounded-lg border border-ok/30 bg-ok/10 px-2 py-1 text-[10px] font-bold text-ok hover:bg-ok/20"
                      >
                        تکمیل سفر
                      </button>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DriversView({ drivers }: { drivers: DemoDriver[] }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <h3 className="text-[11px] font-bold text-cream/70 mb-3">مدیریت رانندگان</h3>
      <ul className="space-y-2">
        {drivers.map((d) => (
          <li key={d.id} className="flex items-center justify-between p-2.5 rounded-lg border border-white/6 bg-white/[0.02]">
            <div className="flex items-center gap-2 flex-1">
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                d.status === "available" ? "bg-ok/12 text-ok" : d.status === "busy" ? "bg-gold/12 text-gold" : "bg-info/12 text-info"
              }`}>{driverStatusLabel[d.status]}</span>
              <div>
                <span className="block text-cream/80">{d.name}</span>
                <span className="block text-[9px] text-cream/50">
                  کمisión {toFa(d.commissionShare)}٪
                </span>
              </div>
            </div>
            <span className="num text-[10px] text-gold">{toFa(d.trips)} سفر</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CustomersView({ customers }: { customers: DemoCustomer[] }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <h3 className="text-[11px] font-bold text-cream/70 mb-3">لیست مشترکین</h3>
      <div className="overflow-y-auto max-h-[400px]">
        <ul className="space-y-2">
          {customers.map((c) => (
            <li key={c.id} className="p-2.5 rounded-lg border border-white/6 bg-white/[0.02]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="block text-cream/80">{c.name}</span>
                  <span className="block text-[9px] text-cream/50">{c.phone}</span>
                  <span className="block text-[9px] text-cream/50">
                    {c.city}، {c.address}
                  </span>
                </div>
                <div className="text-right">
                  <span className="num text-[10px] text-gold">{toFa(c.trips)} سفر</span>
                  {c.debt > 0 && (
                    <span className="block mt-1 text-[10px] text-danger/90">
                      بدهی: {formatCurrency(c.debt)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AccountingView({ trips, drivers }: { trips: DemoTrip[]; drivers: DemoDriver[] }) {
  const income = trips.reduce((s, t) => s + (t.status === "done" ? t.fare : 0), 0);
  const commission = trips.reduce(
    (s, t) => s + (t.status === "done" ? t.commission : 0),
    0
  );
  const net = income - commission;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <h3 className="text-[11px] font-bold text-cream/70 mb-3">خلاصه مالی</h3>
        <table className="w-full text-left text-[11.5px] divide-y divide-white/6">
          <tbody>
            <tr>
              <td className="py-2 text-cream/55">درآمد کل</td>
              <td className="py-2 num text-ok text-right">{formatCurrency(income)}</td>
            </tr>
            <tr>
              <td className="py-2 text-cream/55">کمisión راننده</td>
              <td className="py-2 num text-gold text-right">{formatCurrency(commission)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 text-cream">درآمد خالص</td>
              <td className="py-2 num text-cream text-right">{formatCurrency(net)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
        <h3 className="text-[11px] font-bold text-cream/70 mb-3">صورتحساب رانندگان</h3>
        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d.id} className="p-2 rounded-lg border border-white/6 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-cream/80">{d.name}</span>
                <span className="num text-gold">{formatCurrency(Math.round((commission / drivers.length) * (d.commissionShare / 20)))}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <h3 className="text-[11px] font-bold text-cream/70 mb-3">تنظیمات نمایشی</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-2 rounded-lg border border-white/6 bg-white/[0.02]">
          <div>
            <span className="block text-cream/80">قفل PIN (۴–۸ رقمی)</span>
            <span className="block text-[9px] text-cream/50">حفاظت از ورود اپراتور</span>
          </div>
          <span className="text-[10px] text-gold">فعال</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border border-white/6 bg-white/[0.02]">
          <div>
            <span className="block text-cream/80">سطح دسترسی اپراتور</span>
            <span className="block text-[9px] text-cream/50">مدیر / حسابدار / اپراتور</span>
          </div>
          <span className="text-[10px] text-gold">۳ نقش</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border border-white/6 bg-white/[0.02]">
          <div>
            <span className="block text-cream/80">پشتیبان خودکار</span>
            <span className="block text-[9px] text-cream/50">هر ۷ روز، رمزگذاری AES-GCM</span>
          </div>
          <span className="text-[10px] text-gold">روشن</span>
        </div>
      </div>
    </div>
  );
}
