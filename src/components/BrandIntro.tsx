import { brandIntro, links, site } from "../data/content";
import { useReveal } from "../lib/anim";
import { Section, SectionHead } from "./ui";
import { asset } from "../lib/asset";

export default function BrandIntro() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="product" tone="cream" aria-labelledby="product-title" className="py-20! md:py-28!">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_0%,rgba(255,198,11,0.14),transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-navy-900/15 to-transparent" />
      </div>

      <div ref={ref} className="shell grid items-start gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        {/* copy */}
        <div>
          <SectionHead
            tone="light"
            id="product-title"
            eyebrow={brandIntro.eyebrow}
            title={
              <>
                یک راهکار تخصصی برای
                <span className="relative mx-1.5 inline-block">
                  <span className="relative z-10">مدیریت آژانس‌های تاکسی</span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-1 z-0 h-2.5 rounded-sm bg-gold/35"
                  />
                </span>
              </>
            }
            lede={brandIntro.body}
          />

          <p data-reveal className="lede-light mt-4 max-w-xl">
            {brandIntro.body2}
          </p>

          <figure data-reveal className="mt-8 border-e-2 border-gold/60 pe-5">
            <blockquote className="text-lg font-bold leading-[1.9] text-navy-900">
              «{site.slogan}»
            </blockquote>
            <figcaption className="mt-2 text-[12px] text-graphite">
              شعار رسمی محصول تاکسینو
            </figcaption>
          </figure>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {brandIntro.facts.map((fact) => (
              <div key={fact.label} data-reveal className="border-t border-navy-900/12 pt-3">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="num block text-3xl font-extrabold leading-none text-navy-900">
                    {fact.value}
                  </span>
                  <span className="mt-2 block text-[11.5px] leading-[1.7] text-graphite">
                    {fact.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* brand hierarchy card */}
        <div data-reveal className="relative">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-navy-900/10 bg-paper p-6 shadow-[0_40px_100px_-60px_rgba(8,24,47,0.55)] sm:p-8">
            <span
              aria-hidden="true"
              className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-gold/12 blur-3xl"
            />

            <p className="eyebrow eyebrow--latin text-navy-900/65!">THE PRODUCT</p>
            <div className="mt-4 rounded-xl border border-navy-900/8 bg-white p-4">
              <img
                src={asset("/assets/brand/logo-light.webp")}
                width={920}
                height={460}
                alt="لوگوی رسمی تاکسینو به همراه شعار «همه‌چیز تحت کنترل شما»"
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto w-full max-w-[19rem]"
              />
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-navy-900/10" />
              <span className="relative grid h-9 w-9 place-items-center rounded-full border border-navy-900/12 bg-paper text-[13px] font-bold text-gold-deep">
                ×
              </span>
            </div>

            <p className="eyebrow eyebrow--latin text-navy-900/65!">THE MAKER</p>
            <a
              href={links.karenSoft}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block overflow-hidden rounded-xl border border-navy-900/10 bg-[#0b1a33] p-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <img
                src={asset("/assets/brand/karensoft-lockup.webp")}
                width={786}
                height={198}
                alt="لوگوی کارن‌سافت — توسعه‌دهندهٔ نرم‌افزارهای مدیریتی"
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto w-[13.5rem]"
              />
            </a>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-navy-900/10 pt-4">
              <span className="latin text-[9.5px] font-semibold tracking-[0.22em] text-navy-900/65">
                {brandIntro.hierarchy.statement}
              </span>
              <a
                href={links.aboutPage}
                target="_blank"
                rel="noopener noreferrer"
                className="link-sweep text-[11.5px] font-semibold text-navy-900/70"
              >
                دربارهٔ سازنده
              </a>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] leading-[1.9] text-graphite">
            هویت تاکسینو مستقل است و اعتبار برند مادر، کارن‌سافت، پشت آن ایستاده است.
          </p>
        </div>
      </div>
    </Section>
  );
}
