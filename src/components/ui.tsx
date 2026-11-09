import type { ReactNode } from "react";
import { cn } from "../lib/utils";

/* ------------------------------------------------------------------ icons */
/* A small, dependency-free icon set (24px grid, 1.6 stroke) so the page
   ships no icon library. */
const paths: Record<string, ReactNode> = {
  route: (
    <>
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <path d="M8.4 18h5.1a3 3 0 0 0 0-6h-3a3 3 0 0 1 0-6h5.1" />
    </>
  ),
  drivers: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20c0-3.3 3.1-5.4 7-5.4s7 2.1 7 5.4" />
    </>
  ),
  customers: (
    <>
      <path d="M4 5.5h16v13H4z" />
      <path d="M4 10h16M8.5 14.5h4" />
    </>
  ),
  fare: (
    <>
      <path d="M4 8.5h16v10H4z" />
      <path d="M4 8.5 16 4l1.5 4.5" />
      <circle cx="12" cy="13.5" r="2" />
    </>
  ),
  accounting: (
    <>
      <path d="M5 20V9M12 20V4M19 20v-7" />
      <path d="M3 20h18" />
    </>
  ),
  security: (
    <>
      <path d="M12 3.5 19 6v6c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  offline: (
    <>
      <path d="M4 7.5c5-3 11-3 16 0M7 11c3.3-1.8 6.7-1.8 10 0" />
      <circle cx="12" cy="17" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6z" />
      <path d="M12 9v3.5M12 15.5v.5" />
    </>
  ),
  support: (
    <>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zM20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z" />
    </>
  ),
  code: (
    <>
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
    </>
  ),
  ownership: (
    <>
      <path d="M12 3.5 15 7l-3 3-3-3z" />
      <path d="M12 10v10M8 20h8" />
    </>
  ),
  training: (
    <>
      <path d="M3 8.5 12 4l9 4.5-9 4.5z" />
      <path d="M7 11v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5" />
    </>
  ),
  contract: (
    <>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 13h6M9 16.5h4" />
    </>
  ),
  order: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  control: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  finance: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M14.5 10c-.6-.7-1.5-1-2.5-1-1.6 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.7 2.5 2-1 2-2.5 2c-1 0-1.9-.3-2.5-1" />
    </>
  ),
  report: (
    <>
      <path d="M6 3.5h9l3 3v14H6z" />
      <path d="M10 16.5v-3M13 16.5V11M16 16.5v-5" />
    </>
  ),
  phone: (
    <>
      <path d="M7.5 3.5h-2a2 2 0 0 0-2 2.2c.5 6.9 5.9 12.3 12.8 12.8a2 2 0 0 0 2.2-2v-2l-4-1.2-1.6 2a13 13 0 0 1-4.9-4.9l2-1.6z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-6.1 6.5-11a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.7" />
    </>
  ),
  arrow: (
    <>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </>
  ),
  arrowUpLeft: (
    <>
      <path d="M17 17 7 7M7 15V7h8" />
    </>
  ),
  check: (
    <>
      <path d="m4.5 12.5 5 5 10-11" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  chevron: (
    <>
      <path d="m6 9 6 6 6-6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  spinner: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2zM9 4v14M15 6v14" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M4 12h16" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
  size = 24,
}: {
  name: IconName | string;
  className?: string;
  size?: number;
}) {
  const content = paths[name] ?? paths.route;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {content}
    </svg>
  );
}

/* ---------------------------------------------------------------- section */
type Tone = "dark" | "deep" | "light" | "cream";

const toneClass: Record<Tone, string> = {
  dark: "bg-ink text-cream",
  deep: "bg-abyss text-cream",
  light: "bg-paper text-navy-900",
  cream: "bg-cream text-navy-900",
};

export function Section({
  id,
  tone = "dark",
  className,
  children,
  ariaLabel,
  labelledBy,
  "aria-labelledby": ariaLabelledBy,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  labelledBy?: string;
  "aria-labelledby"?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? labelledBy}
      // No `overflow-hidden` here on purpose: it would turn the section into a
      // scroll container and silently break the `sticky` side columns.
      className={cn("relative isolate py-20 md:py-28 xl:py-32", toneClass[tone], className)}
    >
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  tone = "dark",
  id,
  align = "start",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  tone?: "dark" | "light";
  id?: string;
  align?: "start" | "center";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <div className={cn("eyebrow mb-5", align === "center" && "justify-center")}>
        <span className="h-px w-8 bg-gold/70" aria-hidden="true" />
        <span className="eyebrow--latin">{eyebrow}</span>
      </div>
      <h2
        id={id}
        className={cn(
          "text-[1.75rem] leading-[1.3] font-extrabold sm:text-4xl xl:text-[2.6rem]",
          dark ? "text-cream" : "text-navy-900",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className={cn("mt-5 leading-[2.1]", dark ? "lede" : "lede-light")}>{lede}</p>
      ) : null}
    </div>
  );
}

export function SampleBadge({ className, label = "دادهٔ نمایشی" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold text-gold",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      {label}
    </span>
  );
}

export function GoldCorner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      className={cn("h-10 w-10 text-gold", className)}
    >
      <path d="M1 12V1h11" strokeWidth="1.4" />
      <path d="M1 20V9h11" strokeWidth="1.4" opacity="0.25" />
    </svg>
  );
}
