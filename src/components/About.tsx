import { about, links, site } from "../data/content";
import { useReveal } from "../lib/anim";
import { Icon, Section } from "./ui";
import { asset } from "../lib/asset";

export default function About() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="about" tone="dark" aria-labelledby="about-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_20%_0%,rgba(28,64,116,0.38),transparent_62%)]" />
        <div className="grain" />
      </div>

      <div ref={ref} className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="relative">
          <div
            data-reveal
            className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(160deg,#0d2344,#050d21)] p-7"
          >
            <p className="eyebrow eyebrow--latin">KAREN SOFT</p>
            <a
              href={links.karenSoft}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block"
              aria-label="وب‌سایت رسمی کارن‌سافت"
            >
              <img
                src={asset("/assets/brand/karensoft-lockup.webp")}
                width={786}
                height={198}
                alt="لوگوی کارن‌سافت، توسعه‌دهندهٔ نرم‌افزارهای مدیریتی"
                loading="lazy"
                decoding="async"
                className="h-auto w-52"
              />
            </a>

            <p className="mt-6 text-[1.35rem] font-extrabold leading-[1.7] text-cream">
              «{about.slogan}»
            </p>

            <dl className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] text-cream/55">{about.founder.role}</dt>
                <dd className="mt-1 text-[13px] font-bold text-cream/90">{about.founder.name}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-cream/55">محل فعالیت</dt>
                <dd className="mt-1 text-[13px] font-bold text-cream/90">{about.location}</dd>
              </div>
            </dl>

            <a
              href={links.karenSoft}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11.5px] font-semibold text-cream/85 transition-colors hover:border-gold/50 hover:text-gold"
            >
              {about.cta}
              <Icon name="arrowUpLeft" size={13} />
            </a>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -left-6 select-none text-[7rem] font-black leading-none text-white/[0.03]"
            >
              K
            </span>
          </div>
        </div>

        <div>
          <div className="eyebrow mb-5">
            <span aria-hidden="true" className="h-px w-8 bg-gold/70" />
            <span className="eyebrow--latin">{about.eyebrow}</span>
          </div>
          <h2 id="about-title" className="text-2xl font-extrabold text-cream sm:text-3xl xl:text-[2.3rem]">
            {about.title}
          </h2>
          <p data-reveal className="lede mt-5 max-w-xl">
            {about.body}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {about.areas.map((area) => (
              <li
                key={area}
                data-reveal
                className="rounded-full border border-white/12 bg-white/4 px-3 py-1.5 text-[11px] text-cream/65"
              >
                {area}
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <p className="mb-3 text-[11px] font-semibold text-cream/55">روش کار اعلام‌شده</p>
            <ol className="grid gap-3 sm:grid-cols-2">
              {about.method.map((step) => (
                <li
                  key={step.n}
                  data-reveal
                  className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5"
                >
                  <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold/12 text-[11px] font-extrabold text-gold">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-[12px] font-bold text-cream/90">{step.title}</p>
                    <p className="mt-0.5 text-[10.5px] leading-[1.8] text-cream/58">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 flex items-center gap-2 text-[11px] text-cream/55">
            <Icon name="check" size={13} className="text-gold/70" />
            {site.product} — محصولی از کارن‌سافت
          </p>
        </div>
      </div>
    </Section>
  );
}
