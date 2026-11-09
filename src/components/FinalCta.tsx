import { contact, finalCta, links } from "../data/content";
import { useReveal } from "../lib/anim";
import { Icon } from "./ui";
import ConsultForm from "./ConsultForm";
import { asset } from "../lib/asset";

export default function FinalCta() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section
      id="consult"
      aria-labelledby="final-cta-title"
      className="relative isolate overflow-hidden bg-abyss py-20 md:py-28"
    >
      {/* cinematic backdrop — the official product artwork, re-cropped */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <picture>
          <source type="image/avif" srcSet={asset("/assets/hero/taxi-night-852.avif")} />
          <source type="image/webp" srcSet={asset("/assets/hero/taxi-night-852.webp")} />
          <img
            src={asset("/assets/hero/taxi-night-852.jpg")}
            alt=""
            width={852}
            height={885}
            loading="lazy"
            decoding="async"
            className="absolute inset-y-0 start-0 h-full w-full max-w-none object-cover object-[50%_45%] opacity-30 md:w-[58%]"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(3,8,20,0.97)_0%,rgba(3,8,20,0.86)_45%,rgba(3,8,20,0.55)_75%,rgba(3,8,20,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_120%,rgba(245,147,0,0.22),transparent_65%)]" />
        <div className="grain" />
      </div>

      <div
        ref={ref}
        className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14"
      >
        <div>
          <div className="eyebrow mb-5">
            <span aria-hidden="true" className="h-px w-8 bg-gold/70" />
            <span className="eyebrow--latin">{finalCta.eyebrow}</span>
          </div>
          <h2
            id="final-cta-title"
            className="max-w-xl text-[1.9rem] font-extrabold leading-[1.35] text-cream sm:text-[2.4rem] xl:text-[2.9rem]"
          >
            {finalCta.title}
          </h2>
          <p data-reveal className="lede mt-5 max-w-lg">
            {finalCta.body}
          </p>

          <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
            <a href={links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
              {finalCta.primaryCta}
              <Icon name="arrowUpLeft" size={15} />
            </a>
            <a href="#consult-form" className="btn btn-ghost">
              {finalCta.secondaryCta}
              <Icon name="arrow" size={15} />
            </a>
          </div>

          <dl className="mt-10 grid gap-3 sm:grid-cols-2">
            <div data-reveal className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="flex items-center gap-2 text-[10.5px] text-cream/55">
                <Icon name="phone" size={13} className="text-gold/70" />
                تماس با دفتر
              </dt>
              <dd className="mt-1.5">
                <a href="tel:+982191090000" className="num block text-[15px] font-bold text-cream" dir="ltr">
                  {contact.phoneDisplay}
                </a>
                <a href="tel:+989020001234" className="num mt-0.5 block text-[12px] text-cream/55" dir="ltr">
                  {contact.mobileDisplay}
                </a>
              </dd>
            </div>
            <div data-reveal className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="flex items-center gap-2 text-[10.5px] text-cream/55">
                <Icon name="mail" size={13} className="text-gold/70" />
                ایمیل و وب‌سایت
              </dt>
              <dd className="mt-1.5">
                <a href={`mailto:${contact.email}`} className="block text-[12.5px] font-bold text-cream">
                  {contact.email}
                </a>
                <a
                  href={links.karenSoft}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="latin mt-0.5 block text-[11.5px] text-cream/55"
                >
                  {contact.site}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div data-reveal className="relative">
          <ConsultForm />
        </div>
      </div>
    </section>
  );
}
