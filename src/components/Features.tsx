import { features, links } from "../data/content";
import { useReveal } from "../lib/anim";
import { Icon, Section, SectionHead } from "./ui";

export default function Features() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="features" tone="light" aria-labelledby="features-title" className="bg-cream!">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_15%_0%,rgba(255,198,11,0.16),transparent_60%)]" />
      </div>

      <div ref={ref} className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHead
            tone="light"
            id="features-title"
            eyebrow={features.eyebrow}
            title={features.title}
            lede={features.lede}
          />
          <a
            data-reveal
            href={links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-dark py-3! text-[13px]!"
          >
            مشاهدهٔ امکانات در دمو
            <Icon name="arrowUpLeft" size={15} />
          </a>
        </div>

        <div className="mt-12 border-t border-navy-900/12">
          {features.groups.map((group) => (
            <article
              key={group.id}
              data-reveal
              className="group grid gap-6 border-b border-navy-900/10 py-8 transition-colors duration-300 hover:bg-white/60 sm:py-9 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-10 lg:px-3"
            >
              <div className="flex items-start gap-4">
                <span className="num mt-1 text-[11px] font-bold tracking-widest text-gold-deep/70">
                  {group.index}
                </span>
                <div>
                  <div className="mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-900/10 bg-white text-navy-900 shadow-sm transition-colors duration-300 group-hover:border-gold/50 group-hover:text-gold-deep">
                    <Icon name={group.icon} size={19} />
                  </div>
                  <h3 className="text-[1.05rem] font-extrabold text-navy-900">{group.title}</h3>
                  <p className="mt-1.5 max-w-sm text-[12.5px] leading-[1.9] text-graphite">
                    {group.summary}
                  </p>
                </div>
              </div>

              <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12.5px] leading-[1.9] text-navy-900/75">
                    <Icon name="check" size={14} className="mt-1.5 shrink-0 text-gold-deep" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p data-reveal className="mt-8 max-w-3xl text-[11.5px] leading-[2] text-graphite">
          قابلیت‌هایی که به سرویس بیرونی وابسته‌اند (مانند ارسال خودکار پیامک از طریق پنل پیامکی) در نسخهٔ
          جاری فعال نیستند و در این فهرست معرفی نشده‌اند. برای بررسی نیازهای سفارشی، با کارشناس تماس بگیرید.
        </p>
      </div>
    </Section>
  );
}
