import { pricing } from "../data/content";
import { useReveal } from "../lib/anim";
import { cn, faNumber } from "../lib/utils";
import { selectPlan } from "../lib/plan";
import { Icon, Section, SectionHead } from "./ui";

export default function Pricing() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <Section id="pricing" tone="deep" aria-labelledby="pricing-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_-5%,rgba(245,147,0,0.16),transparent_62%)]" />
        <div className="grid-lines opacity-60" />
        <div className="grain" />
      </div>

      <div ref={ref} className="shell">
        <SectionHead
          id="pricing-title"
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          lede={pricing.lede}
          align="center"
        />

        <ul className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pricing.plans.map((plan) => (
            <li
              key={plan.id}
              data-reveal
              className={cn(
                "relative flex flex-col rounded-2xl border p-5 transition-transform duration-300 hover:-translate-y-1",
                plan.featured
                  ? "border-gold/50 bg-gradient-to-b from-gold/14 to-transparent shadow-[0_30px_80px_-40px_rgba(245,147,0,0.6)] xl:-my-2 xl:py-7"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              {plan.badge ? (
                <span
                  className={cn(
                    "absolute -top-3 start-4 rounded-full px-2.5 py-1 text-[10px] font-bold",
                    plan.featured
                      ? "bg-gradient-to-l from-gold-deep to-gold text-[#1b1404]"
                      : "border border-gold/30 bg-navy-950 text-gold",
                  )}
                >
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="mt-1.5 text-[13.5px] font-bold text-cream/85">{plan.title}</h3>

              <p className="mt-3 flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "num text-[1.6rem] font-extrabold leading-none",
                    plan.featured ? "text-gold" : "text-cream",
                  )}
                >
                  {faNumber(plan.price)}
                </span>
                <span className="text-[10.5px] text-cream/58">تومان</span>
              </p>

              <div className="mt-2 min-h-[3.1rem]">
                {plan.monthly ? (
                  <p className="num text-[10.5px] text-cream/58">
                    معادل {faNumber(plan.monthly)} تومان در ماه
                  </p>
                ) : (
                  <p className="text-[10.5px] text-cream/58">پرداخت یک‌باره · بدون تمدید دوره‌ای</p>
                )}
                {"saving" in plan && plan.saving ? (
                  <p className="num mt-1 inline-flex items-center gap-1 rounded bg-ok/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-ok">
                    <Icon name="check" size={10} />
                    {faNumber(plan.saving)} تومان صرفه‌جویی
                  </p>
                ) : null}
              </div>

              <p className="mt-2 border-t border-white/8 pt-2.5 text-[10.5px] leading-[1.8] text-cream/55">
                {plan.hint}
              </p>

              <button
                type="button"
                onClick={() => selectPlan(plan.title)}
                className={cn(
                  "mt-4 w-full rounded-full px-3 py-2.5 text-[11.5px] font-bold transition-colors",
                  plan.featured
                    ? "bg-gradient-to-l from-gold-deep to-gold text-[#1b1404] hover:brightness-105"
                    : "border border-white/15 text-cream/85 hover:border-gold/50 hover:text-gold",
                )}
              >
                انتخاب این پلن
              </button>
            </li>
          ))}
        </ul>

        <div
          data-reveal
          className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-center"
        >
          <p className="text-[12px] leading-[2] text-cream/55">{pricing.note}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => selectPlan("")} className="btn btn-gold py-2.5! text-[12.5px]!">
              {pricing.primaryCta}
              <Icon name="arrow" size={15} />
            </button>
            <a href="tel:+982191090000" className="btn btn-ghost py-2.5! text-[12.5px]!">
              <Icon name="phone" size={15} />
              {pricing.secondaryCta}
            </a>
          </div>
          <p className="mt-4 text-[10.5px] leading-[1.9] text-cream/55">{pricing.fine}</p>
        </div>
      </div>
    </Section>
  );
}
