import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** useLayoutEffect on the client, useEffect while rendering on the server. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarsePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/**
 * Scroll-triggered reveal for every `[data-reveal]` child.
 * Elements are only hidden once GSAP is running, so a JS failure never
 * leaves the page blank. `prefers-reduced-motion` skips the whole thing.
 */
export function useReveal<T extends HTMLElement>(options?: {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
  duration?: number;
}) {
  const ref = useRef<T>(null);
  const { selector = "[data-reveal]", y = 34, stagger = 0.075, start = "top 88%", duration = 0.85 } =
    options ?? {};

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>(selector));
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, { autoAlpha: 0, y });
      ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () =>
          gsap.to(targets, {
            autoAlpha: 1,
            y: 0,
            duration,
            stagger,
            ease: "power3.out",
            overwrite: "auto",
            clearProps: "willChange",
          }),
      });
    }, el);

    return () => ctx.revert();
  }, [selector, y, stagger, start, duration]);

  return ref;
}

/** Vertical parallax on scroll (transform only, no layout reads in the loop). */
export function useParallax<T extends HTMLElement>(distance = 60) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isCoarsePointer()) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: distance,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    }, el);
    return () => ctx.revert();
  }, [distance]);
  return ref;
}

/** Draws an SVG stroke while its section scrolls into view. */
export function useDrawPath<T extends SVGPathElement>(options?: { duration?: number; delay?: number }) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const path = ref.current;
    if (!path) return;
    if (prefersReducedMotion()) {
      path.style.strokeDasharray = "none";
      return;
    }
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: options?.duration ?? 2.4,
        delay: options?.delay ?? 0.3,
        ease: "power2.inOut",
        scrollTrigger: { trigger: path.closest("section") ?? path, start: "top 70%", once: true },
      });
    }, path);
    return () => ctx.revert();
  }, [options?.duration, options?.delay]);
  return ref;
}

/**
 * Cinematic hero entrance. Everything is measured once and animated with
 * transforms/opacity only. On coarse pointers we keep the same order but
 * shorten it.
 */
export function useHeroIntro<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
    const media = q("[data-hero-media]");
    const lines = q("[data-hero-line] > span");
    const fade = q("[data-hero-fade]");
    const panels = q("[data-hero-panel]");
    const route = root.querySelector<SVGPathElement>("[data-hero-route]");
    const car = q("[data-hero-car]");

    if (prefersReducedMotion()) {
      gsap.set([...media, ...fade, ...panels, ...lines, ...car], { clearProps: "all" });
      if (route) route.style.strokeDasharray = "none";
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (route) {
        const len = route.getTotalLength();
        gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });
      }

      tl.from(media, { scale: 1.12, autoAlpha: 0, duration: 1.8, ease: "power2.out" }, 0)
        .from(lines, { yPercent: 118, duration: 1.05, stagger: 0.09 }, 0.25)
        .from(fade, { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.5)
        .from(panels, { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.75);

      if (route) {
        tl.to(route, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut" }, 0.6);
      }
      if (car.length) {
        tl.from(car, { autoAlpha: 0, scale: 0.6, duration: 0.6 }, 1.9);
      }
    }, root);

    return () => ctx.revert();
  }, []);
  return ref;
}

/** Subtle pointer parallax for the hero's floating product panels. */
export function usePointerParallax<T extends HTMLElement>(strength = 12) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isCoarsePointer()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    if (!layers.length) return;

    const setters = layers.map((layer) => ({
      x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power2.out" }),
      y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power2.out" }),
      depth: Number(layer.dataset.depth) || 1,
    }));

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        setters.forEach((s) => {
          s.x(-nx * strength * s.depth);
          s.y(-ny * strength * s.depth);
        });
      });
    };
    const onLeave = () => setters.forEach((s) => (s.x(0), s.y(0)));

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);
  return ref;
}
