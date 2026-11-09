import { contact, footer, links, site } from "../data/content";
import { Icon } from "./ui";
import { asset } from "../lib/asset";

const year = new Intl.DateTimeFormat("fa-IR-u-nu-arab", { year: "numeric" }).format(new Date());

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/8 bg-navy-950 pt-16 pb-28 sm:pb-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_20%_0%,rgba(20,52,98,0.35),transparent_65%)]" />
      </div>

      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.62fr)_minmax(0,0.62fr)_minmax(0,0.61fr)]">
          {/* brand + contact */}
          <div>
            <a href="#hero" aria-label="تاکسینو — بازگشت به بالای صفحه" className="inline-block">
              <img
                src={asset("/assets/brand/logo-dark.webp")}
                width={920}
                height={460}
                alt="لوگوی تاکسینو | Taxino"
                loading="lazy"
                decoding="async"
                className="h-auto w-40"
              />
            </a>
            <p className="mt-4 max-w-xs text-[12px] leading-[2] text-cream/58">
              {site.product} — {site.slogan}
            </p>

            <ul className="mt-5 space-y-2 text-[12px]">
              <li>
                <a href="tel:+982191090000" className="flex items-center gap-2 text-cream/65 transition-colors hover:text-gold">
                  <Icon name="phone" size={14} className="text-gold/70" />
                  <span className="num" dir="ltr">{contact.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-cream/65 transition-colors hover:text-gold">
                  <Icon name="mail" size={14} className="text-gold/70" />
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-cream/58">
                <Icon name="pin" size={14} className="text-gold/70" />
                {contact.city}
              </li>
            </ul>
          </div>

          {/* product links */}
          <nav aria-label="لینک‌های محصول">
            <p className="mb-4 text-[11px] font-bold text-cream/80">محصول</p>
            <ul className="space-y-2.5">
              {footer.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="link-sweep text-[12px] text-cream/58 transition-colors hover:text-cream">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-sweep inline-flex items-center gap-1 text-[12px] text-gold/85"
                >
                  دموی آنلاین
                  <Icon name="arrowUpLeft" size={11} />
                </a>
              </li>
            </ul>
          </nav>

          {/* company links */}
          <nav aria-label="لینک‌های کارن‌سافت">
            <p className="mb-4 text-[11px] font-bold text-cream/80">کارن‌سافت</p>
            <ul className="space-y-2.5">
              {footer.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="link-sweep inline-flex items-center gap-1 text-[12px] text-cream/58 transition-colors hover:text-cream"
                  >
                    {link.label}
                    {"external" in link && link.external ? (
                      <Icon name="arrowUpLeft" size={10} className="text-cream/55" />
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* legal + trust */}
          <div>
            <p className="mb-4 text-[11px] font-bold text-cream/80">قانونی</p>
            <ul className="space-y-2.5">
              {footer.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="link-sweep text-[12px] text-cream/58 transition-colors hover:text-cream">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.03] p-3">
              <p className="text-[10px] leading-[1.9] text-cream/55">
                نسخهٔ {site.version} · پشتیبان رمزنگاری‌شده · کارکرد آفلاین
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-center text-[10.5px] leading-[1.9] text-cream/55 sm:text-start">
            © {year} — {footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <span className="latin text-[9.5px] font-semibold tracking-[0.2em] text-cream/55">
              POWERED BY KAREN SOFT
            </span>
            <a
              href="#hero"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-cream/60 transition-colors hover:border-gold/60 hover:text-gold"
              aria-label="بازگشت به بالای صفحه"
            >
              <Icon name="chevron" size={14} className="rotate-180" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
