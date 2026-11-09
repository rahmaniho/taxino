import { useState } from "react";
import { challenges } from "../data/content";
import { useReveal } from "../lib/anim";
import { cn, faIndex } from "../lib/utils";
import { Icon, Section, SectionHead } from "./ui";

export default function Challenges() {
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState(0);

  return (
    <Section id="challenges" tone="dark" aria-labelledby="challenges-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_10%_0%,rgba(31,72,133,0.35),transparent_60%)]" />
        <div className="grain" />
      </div>

      <div
        ref={ref}
        className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-16"
      >
        <div className="lg:sticky lg:top-28">
          <SectionHead
            id="challenges-title"
            eyebrow={challenges.eyebrow}
            title={challenges.title}
            lede={challenges.lede}
          />

          <div data-reveal className="mt-10 rounded-2xl border border-gold/20 bg-gold/[0.06] p-5">
            <p className="flex items-center gap-2 text-[12.5px] font-bold text-gold">
              <Icon name="check" size={15} />
              {challenges.bridge.title}
            </p>
            <p className="mt-2.5 text-[12.5px] leading-[2] text-cream/60">
              {challenges.bridge.text}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-white/8 border-y border-white/8">
          {challenges.items.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.title} data-reveal>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    aria-controls={`challenge-panel-${index}`}
                    id={`challenge-trigger-${index}`}
                    className="group flex w-full items-center gap-4 py-5 text-start"
                  >
                    <span
                      className={cn(
                        "num grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-[12px] font-bold transition-colors",
                        isOpen
                          ? "border-gold/50 bg-gold/12 text-gold"
                          : "border-white/12 bg-white/4 text-cream/58 group-hover:border-gold/35 group-hover:text-gold/80",
                      )}
                    >
                      {faIndex(index + 1)}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-[15px] font-bold transition-colors sm:text-base",
                        isOpen ? "text-cream" : "text-cream/80 group-hover:text-cream",
                      )}
                    >
                      {item.title}
                    </span>
                    <Icon
                      name="chevron"
                      size={18}
                      className={cn(
                        "shrink-0 text-cream/55 transition-transform duration-300",
                        isOpen && "-rotate-180 text-gold",
                      )}
                    />
                  </button>
                </h3>

                <div
                  id={`challenge-panel-${index}`}
                  role="region"
                  aria-labelledby={`challenge-trigger-${index}`}
                  hidden={!isOpen}
                  className="pb-6 ps-13 pe-1"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold text-cream/55">
                        <span className="h-1.5 w-1.5 rounded-full bg-danger/70" aria-hidden="true" />
                        پیش از تاکسینو
                      </p>
                      <p className="text-[12.5px] leading-[2] text-cream/55">{item.before}</p>
                    </div>
                    <div className="rounded-xl border border-gold/20 bg-gold/[0.05] p-4">
                      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold text-gold">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                        با تاکسینو
                      </p>
                      <p className="text-[12.5px] leading-[2] text-cream/75">{item.after}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
