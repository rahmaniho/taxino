import { useCallback, useEffect, useRef, useState } from "react";
import { showcase } from "../data/content";
import { useReveal } from "../lib/anim";
import { cn } from "../lib/utils";
import { Icon, Section, SectionHead } from "./ui";
import { asset, srcSet } from "../lib/asset";

function buildSrcSet(base: string, widths: readonly number[], ext: "avif" | "webp" | "jpg") {
  return srcSet(base, widths, ext);
}

export default function Showcase() {
  const ref = useReveal<HTMLDivElement>();
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    if (index === null && dialog.open) {
      dialog.close();
    }
    return () => {
      if (index === null) document.body.style.overflow = "";
    };
  }, [index]);

  const step = useCallback((direction: 1 | -1) => {
    setIndex((current) => {
      if (current === null) return current;
      return (current + direction + showcase.items.length) % showcase.items.length;
    });
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(1);
      if (event.key === "ArrowRight") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, step]);

  const active = index === null ? null : showcase.items[index];

  return (
    <Section id="showcase" tone="dark" aria-labelledby="showcase-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_-5%,rgba(30,70,128,0.35),transparent_65%)]" />
        <div className="grain" />
      </div>

      <div ref={ref} className="shell">
        <SectionHead
          id="showcase-title"
          eyebrow={showcase.eyebrow}
          title={showcase.title}
          lede={showcase.lede}
          align="center"
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:gap-5">
          {showcase.items.map((item, itemIndex) => {
            const span =
              item.id === "brochure" ? "lg:col-span-12" : item.id === "mobile" ? "lg:col-span-5" : "lg:col-span-7";
            const isDevice = item.fit === "device";
            const isContain = item.fit === "contain";

            return (
              <figure
                key={item.id}
                data-reveal
                className={cn(
                  "group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-navy-950",
                  span,
                )}
              >
                <button
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  className="block w-full text-start"
                  aria-label={`بزرگ‌نمایی: ${item.title}`}
                >
                  <div
                    className={cn(
                      "relative flex w-full items-center justify-center overflow-hidden",
                      item.id === "brochure" && "aspect-[16/10] p-3 sm:aspect-[16/8] sm:p-4",
                      isDevice && "aspect-[3/4] p-4",
                      item.id === "brochure-device" && "aspect-[744/444]",
                      isContain && "bg-[radial-gradient(ellipse_at_center,rgba(19,34,69,0.9),#040b1a)]",
                      isDevice && "bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,198,11,0.14),#040b1a_70%)]",
                    )}
                  >
                    <picture className={cn(isDevice && "block h-full", isContain && "block h-full w-full")}>
                      <source
                        type="image/avif"
                        srcSet={buildSrcSet(item.src, item.widths, "avif")}
                        sizes="(min-width: 1024px) 42vw, 92vw"
                      />
                      <source
                        type="image/webp"
                        srcSet={buildSrcSet(item.src, item.widths, "webp")}
                        sizes="(min-width: 1024px) 42vw, 92vw"
                      />
                      <img
                        src={asset(`${item.src}-${item.widths[item.widths.length - 1]}.jpg`)}
                        alt={item.caption}
                        width={item.width}
                        height={item.height}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          "transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]",
                          isDevice &&
                            "mx-auto h-full w-auto rounded-[1.1rem] border border-white/15 object-contain shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]",
                          isContain && "mx-auto h-full w-full rounded-lg object-contain",
                          !isDevice && !isContain && "h-full w-full object-cover object-center",
                        )}
                      />
                    </picture>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-abyss/95 to-transparent"
                    />
                  </div>

                  <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[10px] font-semibold text-gold/80">
                        <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
                        {item.tag}
                      </p>
                      <p className="mt-1 truncate text-[12.5px] font-bold text-cream/90">{item.title}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] text-cream/75 backdrop-blur-sm">
                      <Icon name="scan" size={12} />
                      بزرگ‌نمایی
                    </span>
                  </figcaption>
                </button>
              </figure>
            );
          })}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-cream/55">
          <Icon name="shield" size={13} className="text-gold/60" />
          {showcase.note}
        </p>
      </div>

      {/* ------------------------------------------------------------ lightbox */}
      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        aria-label={active ? `نمای بزرگ: ${active.title}` : "نمای بزرگ تصویر"}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-abyss/92 backdrop:backdrop-blur-sm"
      >
        {active ? (
          <div className="flex h-[100svh] w-full flex-col bg-abyss/95 px-4 py-4 sm:px-8">
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gold/80">{active.tag}</p>
                <p className="truncate text-[13px] font-bold text-cream/90">{active.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIndex(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-cream transition-colors hover:border-gold hover:text-gold"
                aria-label="بستن نمای بزرگ"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-navy-950/60">
              <img
                src={asset(`${active.src}-${active.widths[active.widths.length - 1]}.jpg`)}
                alt={active.caption}
                width={active.width}
                height={active.height}
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="تصویر بعدی"
                className="absolute end-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-cream/80 backdrop-blur transition-colors hover:border-gold hover:text-gold"
              >
                <Icon name="arrow" size={18} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="تصویر قبلی"
                className="absolute start-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 rotate-180 items-center justify-center rounded-full border border-white/15 bg-black/50 text-cream/80 backdrop-blur transition-colors hover:border-gold hover:text-gold"
              >
                <Icon name="arrow" size={18} />
              </button>
            </div>

            <p className="pt-3 text-center text-[11.5px] leading-[1.9] text-cream/60">{active.caption}</p>
          </div>
        ) : null}
      </dialog>
    </Section>
  );
}
