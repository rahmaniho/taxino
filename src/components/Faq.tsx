import { useState } from "react";
import { contact, faq, links } from "../data/content";
import { useReveal } from "../lib/anim";
import { cn } from "../lib/utils";
import { Icon, Section, SectionHead } from "./ui";

export default function Faq() {
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone="light" aria-labelledby="faq-title" className="bg-cream!">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_90%_0%,rgba(19,34,69,0.06),transparent_60%)]" />
      </div>

      <div ref={ref} className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <SectionHead tone="light" id="faq-title" eyebrow={faq.eyebrow} title={faq.title} lede={faq.lede} />

          <div data-reveal className="mt-8 rounded-2xl border border-navy-900/10 bg-paper p-5">
            <p className="text-[12.5px] font-bold text-navy-900">پاسخ سؤال‌تان را پیدا نکردید؟</p>
            <p className="mt-1.5 text-[11.5px] leading-[1.95] text-graphite">
              فرم مشاوره را پر کنید یا مستقیم تماس بگیرید؛ در ساعات کاری پاسخ می‌دهیم.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href="#consult" className="btn btn-outline-dark py-2.5! text-[12px]!">
                درخواست مشاوره
                <Icon name="arrow" size={14} />
              </a>
              <a
                href={`tel:+982191090000`}
                className="flex items-center justify-between rounded-xl border border-navy-900/10 px-3 py-2 text-[11.5px] text-navy-900 transition-colors hover:border-gold/50"
              >
                <span className="flex items-center gap-2">
                  <Icon name="phone" size={14} className="text-gold-deep" />
                  {contact.phoneDisplay}
                </span>
                <span className="text-[10px] text-graphite">دفتر</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center justify-between rounded-xl border border-navy-900/10 px-3 py-2 text-[11.5px] text-navy-900 transition-colors hover:border-gold/50"
              >
                <span className="flex items-center gap-2">
                  <Icon name="mail" size={14} className="text-gold-deep" />
                  {contact.email}
                </span>
                <span className="text-[10px] text-graphite">ایمیل</span>
              </a>
            </div>
          </div>
        </div>

        <ul className="divide-y divide-navy-900/10 border-y border-navy-900/10">
          {faq.items.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.q} data-reveal>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-trigger-${index}`}
                    className="group flex w-full items-start gap-3 py-4 text-start"
                  >
                    <Icon
                      name="plus"
                      size={16}
                      className={cn(
                        "mt-1.5 shrink-0 text-gold-deep transition-transform duration-300",
                        isOpen && "rotate-45",
                      )}
                    />
                    <span
                      className={cn(
                        "flex-1 text-[13.5px] font-bold leading-[1.8] transition-colors",
                        isOpen ? "text-navy-900" : "text-navy-900/75 group-hover:text-navy-900",
                      )}
                    >
                      {item.q}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  hidden={!isOpen}
                  className="pb-5 pe-2 ps-7"
                >
                  <p className="max-w-2xl text-[12.5px] leading-[2.1] text-graphite">{item.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="shell mt-10 text-center text-[11px] text-graphite">
        اطلاعات کامل محصول در{" "}
        <a
          href={links.productPage}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-navy-900 underline decoration-gold/60 decoration-2 underline-offset-4"
        >
          صفحهٔ رسمی محصول
        </a>{" "}
        در وب‌سایت کارن‌سافت در دسترس است.
      </p>
    </Section>
  );
}
