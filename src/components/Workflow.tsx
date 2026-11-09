import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useReveal } from "../lib/anim";
import { workflow } from "../data/content";
import { Icon, Section, SectionHead } from "./ui";

export default function Workflow() {
  const ref = useReveal<HTMLDivElement>();
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 65%", scrub: 0.4 },
        },
      );
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <Section id="how" tone="light" aria-labelledby="how-title" className="bg-paper!">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_80%_10%,rgba(19,34,69,0.06),transparent_60%)]" />
      </div>

      <div
        ref={ref}
        className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
      >
        <div className="lg:sticky lg:top-28">
          <SectionHead
            tone="light"
            id="how-title"
            eyebrow={workflow.eyebrow}
            title={workflow.title}
            lede={workflow.lede}
          />

          <div data-reveal className="mt-8 rounded-2xl border border-navy-900/10 bg-cream p-5">
            <p className="flex items-center gap-2 text-[12px] font-bold text-navy-900">
              <Icon name="clock" size={15} className="text-gold-deep" />
              هر گام یک رکورد باقی می‌گذارد
            </p>
            <p className="mt-2 text-[12px] leading-[2] text-graphite">
              وضعیت هر سفر از صف تا گزارش قابل بازبینی است؛ همین موضوع اختلاف‌های پایان روز را کم می‌کند.
            </p>
          </div>
        </div>

        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute inset-y-3 start-[1.125rem] hidden w-px bg-navy-900/12 sm:block"
          />
          <span
            ref={lineRef}
            aria-hidden="true"
            className="absolute inset-y-3 start-[1.125rem] hidden w-px origin-top bg-gradient-to-b from-gold via-gold to-gold-deep sm:block"
          />

          <ol ref={listRef} className="space-y-8">
            {workflow.steps.map((step) => (
              <li
                key={step.n}
                data-reveal
                className="group relative grid gap-3 sm:grid-cols-[2.25rem_1fr] sm:gap-5"
              >
                <span className="num z-10 grid h-9 w-9 place-items-center rounded-full border border-navy-900/12 bg-paper text-[11px] font-extrabold text-gold-deep shadow-sm transition-colors duration-300 group-hover:border-gold group-hover:bg-navy-900 group-hover:text-gold">
                  {step.n}
                </span>
                <div className="pb-1">
                  <h3 className="text-[15px] font-bold text-navy-900">{step.title}</h3>
                  <p className="mt-1 max-w-md text-[12.5px] leading-[2] text-graphite">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
