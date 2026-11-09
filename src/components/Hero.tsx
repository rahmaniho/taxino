import { hero, links, site } from "../data/content";
import { toFa } from "../lib/utils";
import { useHeroIntro, usePointerParallax } from "../lib/anim";
import { Icon, SampleBadge } from "./ui";
import { asset, srcSet } from "../lib/asset";

function Panel({
  title,
  badge,
  children,
  className,
  depth,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  depth: string;
}) {
  return (
    <div
      data-hero-panel
      data-depth={depth}
      className={`pointer-events-none w-[15.5rem] rounded-2xl border border-white/12 bg-navy-950/80 p-3.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md ${className ?? ""}`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-cream/85">{title}</span>
        {badge ? (
          <span className="num text-[10px] font-semibold text-gold">{badge}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function Hero() {
  const introRef = useHeroIntro<HTMLElement>();
  const parallaxRef = usePointerParallax<HTMLDivElement>(16);

  return (
    <section
      id="hero"
      ref={introRef}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-ink pb-0 pt-[68px] md:pt-[80px]"
    >
      {/* atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_22%_-8%,#132f5c_0%,transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_88%_105%,rgba(245,147,0,0.16)_0%,transparent_70%)]" />
        <div className="grid-lines" />
        <div className="grain" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="shell relative grid items-center gap-10 pb-12 pt-8 md:gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-10 lg:pb-20 lg:pt-14 xl:gap-16">
        {/* ------------------------------------------------------------ copy */}
        <div className="relative z-10 max-w-xl">
          <div data-hero-fade className="mb-6 flex flex-wrap items-center gap-3">
            <span className="chip border-gold/25! bg-gold/8! text-gold!">
              <span className="pulse-dot h-1.5! w-1.5!" aria-hidden="true" />
              نسخهٔ {toFa(site.version)}
              <span aria-hidden="true" className="text-gold/40">|</span>
              محصول کارن‌سافت
            </span>
            <span className="eyebrow eyebrow--latin hidden sm:inline-flex">{hero.eyebrowLatin}</span>
          </div>

          <h1
            id="hero-title"
            className="text-[2.35rem] font-extrabold leading-[1.22] tracking-tight text-cream sm:text-[3.1rem] lg:text-[3.45rem] xl:text-[3.9rem] xl:leading-[1.18]"
          >
            <span data-hero-line className="block overflow-hidden pb-[0.06em]">
              <span className="block">{hero.titleTop}</span>
            </span>
            <span data-hero-line className="block overflow-hidden pb-[0.06em]">
              <span className="block">
                <span className="gold-text">{hero.titleAccent}</span> {hero.titleBottom}
              </span>
            </span>
          </h1>

          <p data-hero-fade className="lede mt-6 max-w-lg">
            {hero.sub}
          </p>
          <p data-hero-fade className="mt-3 max-w-lg text-[0.9rem] leading-[2] text-cream/55">
            {hero.subExtra}
          </p>

          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              {hero.primaryCta}
              <Icon name="arrowUpLeft" size={16} />
            </a>
            <a href="#consult" className="btn btn-ghost">
              {hero.secondaryCta}
              <Icon name="arrow" size={16} />
            </a>
          </div>

          <ul data-hero-fade className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/8 pt-5">
            {hero.proof.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[12.5px] text-cream/65">
                <Icon name={item.icon} size={16} className="text-gold/85" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------------------------------------------------- visual */}
        <div ref={parallaxRef} className="relative z-0 lg:-mb-6">
          <div className="relative mx-auto max-w-[34rem] lg:max-w-none">
            {/* frame */}
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-navy-950 shadow-[0_50px_120px_-60px_rgba(0,0,0,0.95)] sm:rounded-[2rem]">
              <picture>
                <source type="image/avif" srcSet={asset("/assets/hero/taxi-night-852.avif")} />
                <source type="image/webp" srcSet={asset("/assets/hero/taxi-night-852.webp")} />
                <img
                  data-hero-media
                  src={asset("/assets/hero/taxi-night-852.jpg")}
                  srcSet={srcSet("/assets/hero/taxi-night", [420, 640, 852], "jpg")}
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  width={852}
                  height={885}
                  alt="تاکسی زردرنگ در شب، روی خیابان خیس با انعکاس نور، در برابر خط آسمان شهر و برج میلاد"
                  fetchPriority="high"
                  decoding="async"
                  className="h-[19rem] w-full object-cover object-center sm:h-[24rem] lg:h-[30rem] xl:h-[34rem]"
                />
              </picture>

              {/* scrims */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,9,22,0.92)_0%,rgba(3,9,22,0.35)_38%,rgba(3,9,22,0.05)_65%,rgba(3,9,22,0.35)_100%)]"
              />

              {/* animated route across the frame */}
              <svg
                aria-hidden="true"
                viewBox="0 0 560 620"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="hero-route" x1="1" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#FFC60B" stopOpacity="0" />
                    <stop offset="35%" stopColor="#FFC60B" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#FFE08A" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <path
                  data-hero-route
                  d="M540 540 C 430 500 420 400 330 372 C 246 346 196 300 150 214 C 120 156 96 140 40 128"
                  fill="none"
                  stroke="url(#hero-route)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="7 9"
                />
                <circle data-hero-car cx="40" cy="128" r="5.5" fill="#FFC60B" />
                <circle cx="40" cy="128" r="12" fill="none" stroke="#FFC60B" strokeOpacity="0.4" />
              </svg>

              {/* caption row */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img
                    src={asset("/assets/brand/mark-192.png")}
                    width={192}
                    height={192}
                    alt="آیکون اپلیکیشن تاکسینو"
                    loading="lazy"
                    decoding="async"
                    className="h-9 w-9 shrink-0 rounded-[0.6rem] ring-1 ring-white/25"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-cream/90">تاکسینو · Taxino</p>
                    <p className="latin mt-0.5 truncate text-[9px] tracking-[0.16em] text-cream/55">
                      POWERED BY KAREN SOFT
                    </p>
                  </div>
                </div>
                <SampleBadge label={hero.panels.sampleBadge} />
              </div>
            </div>

            {/* floating panels — desktop only, kept out of the reading path */}
            <div className="hidden xl:block">
              <Panel
                title={hero.panels.queueTitle}
                badge={hero.panels.queueCount}
                depth="1.5"
                className="absolute -right-6 top-8 w-[17rem]!"
              >
                <ul className="space-y-1.5">
                  {hero.panels.queueRows.map((row) => (
                    <li
                      key={row.route}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/6 bg-white/4 px-2.5 py-1.5"
                    >
                      <span className="truncate text-[10px] text-cream/75">{row.route}</span>
                      <span
                        className={`num shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                          row.tone === "warn"
                            ? "bg-danger/15 text-danger"
                            : "bg-ok/12 text-ok"
                        }`}
                      >
                        {row.wait}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel
                title={hero.panels.driversTitle}
                badge={hero.panels.driversCount}
                depth="0.85"
                className="absolute -left-8 bottom-24 w-[13.5rem]!"
              >
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-6 w-6 rounded-md border text-[9px] leading-6 text-center font-bold ${
                        n === 4
                          ? "border-white/10 bg-white/5 text-cream/55"
                          : "border-ok/25 bg-ok/10 text-ok"
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                  <span className="num ms-auto text-[9px] text-cream/58">۱۲ راننده</span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[9.5px] text-cream/60">
                  <Icon name="clock" size={11} className="text-gold/70" />
                  {hero.panels.driversHint}
                </p>
              </Panel>

              <Panel
                title={hero.panels.reportTitle}
                depth="2"
                className="absolute -right-2 bottom-1 w-[12.5rem]!"
              >
                <p className="num text-lg font-extrabold leading-none text-gold">
                  {hero.panels.reportValue}
                </p>
                <p className="mt-1.5 text-[9.5px] text-cream/60">{hero.panels.reportHint}</p>
              </Panel>
            </div>
          </div>
        </div>
      </div>

      {/* capability ticker */}
      <div className="relative border-y border-white/8 bg-navy-950/50">
        <div className="overflow-hidden py-3.5">
          <div className="marquee gap-0" aria-hidden="true">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {hero.marquee.map((word) => (
                  <li
                    key={`${copy}-${word}`}
                    className="flex shrink-0 items-center gap-6 px-6 text-[11.5px] font-medium text-cream/58"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/60" />
                    {word}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="scroll-hint flex flex-col items-center gap-1.5 text-[10px] text-cream/55">
          <span className="block h-8 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent" />
          اسکرول کنید
        </span>
      </div>
    </section>
  );
}
