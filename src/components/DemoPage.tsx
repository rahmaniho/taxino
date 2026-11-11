import { links } from "../data/content";
import { Icon } from "./ui";
import DemoExperience from "./DemoExperience";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-white/8 bg-navy-950/80 backdrop-blur sticky top-0 z-50">
        <div className="shell flex items-center justify-between gap-4 px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/assets/brand/logo-nav.webp"
              width={902}
              height={319}
              alt="تاکسینو | Taxino"
              className="h-8 w-auto"
            />
          </a>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-gold/10 text-[10px] font-bold text-gold">
              نسخه نمایشی
            </span>
            <span className="text-[11px] text-cream/55">دیمو تعاملی دیسپچ تاکسینو</span>
          </div>
        </div>
      </header>

      <main className="shell pt-8 pb-24">
        <DemoExperience />
      </main>

      <footer className="border-t border-white/8 bg-navy-950 pt-12 pb-8">
        <div className="shell">
          <div className="rounded-xl border border-gold/40 bg-gold/[0.08] p-6 text-center">
            <h3 className="text-lg font-bold text-gold mb-2">
              نسخه نمایشی به پایان رسید؟
            </h3>
            <p className="text-[12px] text-cream/70 mb-4">
              برای استفاده کامل و دسترسی به تمام امکانات (حسابداری، گزارش، بک‌اند و …) اشتراک برنامه را بخرید.
            </p>
            <a
              href={links.karenSoft}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/10 px-4 py-2 text-[12px] font-bold text-gold transition-colors hover:bg-gold/20"
            >
              تماس و خرید از کارن‌سافت
              <Icon name="arrowUpLeft" size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
