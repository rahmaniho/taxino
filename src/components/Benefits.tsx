import { benefits } from "../data/content";
import { useReveal } from "../lib/anim";
import { faIndex } from "../lib/utils";
import { Icon, Section, SectionHead } from "./ui";

export default function Benefits() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="benefits" tone="dark" aria-labelledby="benefits-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_88%_0%,rgba(28,64,116,0.4),transparent_62%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/20 to-transparent" />
        <div className="grain" />
      </div>

      <div ref={ref} className="shell">
        <SectionHead
          id="benefits-title"
          eyebrow={benefits.eyebrow}
          title={benefits.title}
          lede={benefits.lede}
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item, index) => (
            <li
              key={item.title}
              data-reveal
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-5 transition-colors duration-300 hover:border-gold/30 hover:bg-white/[0.05]"
            >
              <span
                aria-hidden="true"
                className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-gold/6 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0"
              />
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/25 bg-gold/8 text-gold">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="num text-[11px] font-bold tracking-widest text-cream/60">
                  {faIndex(index + 1)}
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-cream">{item.title}</h3>
              <p className="mt-2 text-[12.5px] leading-[2] text-cream/55">{item.text}</p>
            </li>
          ))}
        </ul>

        <div
          data-reveal
          className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-navy-950/60"
        >
          <dl className="grid grid-cols-2 divide-white/8 sm:grid-cols-4 sm:divide-x">
            {benefits.numbers.map((number) => (
              <div key={number.label} className="border-b border-white/8 px-5 py-6 text-center last:border-b-0 sm:border-b-0">
                <dd className="num text-3xl font-extrabold leading-none text-gold">{number.value}</dd>
                <dt className="mt-2 text-[11px] text-cream/60">{number.label}</dt>
              </div>
            ))}
          </dl>
          <p className="border-t border-white/8 px-5 py-3 text-center text-[10.5px] text-cream/55">
            {benefits.numbersNote}
          </p>
        </div>
      </div>
    </Section>
  );
}
