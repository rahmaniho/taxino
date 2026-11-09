import { useEffect, useRef, useState } from "react";
import { links, nav } from "../data/content";
import { cn } from "../lib/utils";
import { Icon } from "./ui";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* condensed header on scroll */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* scroll-spy: highlight the section currently in view */
  useEffect(() => {
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* mobile sheet: lock scroll, Escape to close, restore focus */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-b border-white/8 bg-navy-950/88 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-4 md:h-[80px]">
        {/* brand */}
        <a
          href="#hero"
          className="flex shrink-0 items-center gap-3 rounded-lg"
          aria-label="تاکسینو — بازگشت به بالای صفحه"
        >
          <img
            src="/assets/brand/logo-nav.webp"
            width={902}
            height={319}
            alt="تاکسینو | Taxino — نرم‌افزار هوشمند مدیریت دفاتر تاکسی تلفنی"
            className="h-8 w-auto md:h-9"
            decoding="async"
          />
        </a>

        {/* desktop nav */}
        <nav aria-label="ناوبری اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={cn(
                    "relative inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300",
                    active === item.id
                      ? "text-gold"
                      : "text-cream/70 hover:text-cream",
                  )}
                >
                  {item.label}
                  {active === item.id ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-l from-transparent via-gold to-transparent"
                    />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* actions */}
        <div className="flex items-center gap-2">
          <a
            href={links.app}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-medium text-cream/70 transition-colors hover:text-gold xl:inline-flex"
          >
            ورود به سامانه
            <Icon name="arrowUpLeft" size={14} className="text-gold/80" />
          </a>
          <a
            href={links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-[12.5px] font-semibold text-cream/85 transition-colors hover:border-gold/50 hover:text-gold md:inline-flex"
          >
            مشاهده دمو
          </a>
          <a href="#consult" className="btn btn-gold hidden px-5! py-2.5! text-[13px]! sm:inline-flex">
            درخواست مشاوره
            <Icon name="arrow" size={15} />
          </a>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold/60 hover:text-gold lg:hidden"
          >
            <Icon name={open ? "close" : "order"} size={18} />
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="lg:hidden"
      >
        <div className="shell max-h-[calc(100svh-68px)] overflow-y-auto pb-8 pt-2">
          <ul className="flex flex-col">
            {nav.map((item, index) => (
              <li key={item.id} className="border-b border-white/6">
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 text-[15px] font-semibold text-cream/90"
                >
                  <span className="flex items-center gap-3">
                    <span className="latin text-[10px] font-medium tracking-[0.2em] text-gold/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </span>
                  <Icon name="arrow" size={16} className="text-gold/60" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            <a href="#consult" onClick={() => setOpen(false)} className="btn btn-gold w-full">
              درخواست مشاوره خرید
            </a>
            <a
              href={links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost w-full"
            >
              مشاهده نسخه نمایشی
              <Icon name="arrowUpLeft" size={15} />
            </a>
            <a
              href={links.app}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-2 text-center text-[13px] text-cream/60"
            >
              ورود به سامانهٔ تاکسینو
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
