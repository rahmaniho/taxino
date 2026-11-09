import { trust } from "../data/content";
import { useReveal } from "../lib/anim";
import { Icon, Section, SectionHead } from "./ui";

export default function Trust() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="trust" tone="light" aria-labelledby="trust-title" className="bg-paper!">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_10%_100%,rgba(255,198,11,0.15),transparent_62%)]" />
      </div>

      <div ref={ref} className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          <SectionHead
            tone="light"
            id="trust-title"
            eyebrow={trust.eyebrow}
            title={trust.title}
            lede={trust.lede}
          />

          <ul className="mt-10 space-y-3">
            {trust.items.map((item) => (
              <li
                key={item.title}
                data-reveal
                className="group flex items-start gap-4 rounded-2xl border border-navy-900/10 bg-white/60 p-4 transition-colors duration-300 hover:border-gold/45 hover:bg-white"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-navy-900/10 bg-cream text-navy-900 transition-colors duration-300 group-hover:border-gold/50 group-hover:text-gold-deep">
                  <Icon name={item.icon} size={18} />
                </span>
                <div>
                  <h3 className="text-[13.5px] font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-[12px] leading-[1.95] text-graphite">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(165deg,#0b1f3d,#040b1a)] p-6 shadow-[0_50px_120px_-70px_rgba(8,24,47,0.9)] sm:p-7">
            <p className="eyebrow eyebrow--latin">ENGINEERING</p>
            <h3 className="mt-3 text-lg font-extrabold text-cream">{trust.engineering.title}</h3>
            <ul className="mt-5 space-y-3">
              {trust.engineering.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[12px] leading-[1.95] text-cream/65">
                  <Icon name="check" size={14} className="mt-1.5 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-[10.5px] text-cream/55">پشتیبان رمزنگاری‌شده · لاگ ممیزی · تست خودکار</span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5">
                <Icon name="shield" size={16} className="text-gold/80" />
              </span>
            </div>
          </div>

          <p className="mt-4 rounded-xl border border-gold/30 bg-gold/8 p-3.5 text-[11px] leading-[1.95] text-graphite">
            <strong className="font-bold text-navy-900">مهم:</strong> شرایط تحویل، پشتیبانی و مالکیت پیش از
            شروع قرارداد به‌صورت مکتوب مشخص می‌شود؛ هیچ شرط پنهانی وجود ندارد.
          </p>
        </div>
      </div>
    </Section>
  );
}
