import { useEffect, useRef, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import BrandIntro from "./components/BrandIntro";
import Challenges from "./components/Challenges";
import DispatchDemo from "./components/DispatchDemo";
import DemoExperience from "./components/DemoExperience";
import Features from "./components/Features";
import Showcase from "./components/Showcase";
import Workflow from "./components/Workflow";
import Benefits from "./components/Benefits";
import Pricing from "./components/Pricing";
import Trust from "./components/Trust";
import About from "./components/About";
import Faq from "./components/Faq";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import { links } from "./data/content";
import { Icon } from "./components/ui";

/** Thin golden route that fills as the visitor moves down the page. */
function RouteProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-right bg-gradient-to-l from-gold-deep via-gold to-gold/40"
      style={{ transform: "scaleX(0)" }}
    />
  );
}

/** Mobile-only action bar: stays out of the way until the hero is passed. */
function MobileDock() {
  const [visible, setVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const form = document.getElementById("consult");
    let observer: IntersectionObserver | undefined;
    if (form) {
      observer = new IntersectionObserver(
        ([entry]) => setFormVisible(entry.isIntersecting),
        { rootMargin: "-10% 0px -10% 0px" },
      );
      observer.observe(form);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  const shown = visible && !formVisible;

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-950/95 px-3 py-2.5 backdrop-blur-lg transition-transform duration-300 sm:hidden ${
        shown ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2">
        <a href="#consult" className="btn btn-gold flex-1 rounded-xl! px-3! py-2.5! text-[12.5px]!">
          درخواست مشاوره
        </a>
        <a
          href={links.demo}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost flex-1 rounded-xl! px-3! py-2.5! text-[12.5px]!"
        >
          مشاهده دمو
        </a>
        <a
          href="tel:+982191090000"
          aria-label="تماس با دفتر تاکسینو"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/40 bg-gold/10 text-gold"
        >
          <Icon name="phone" size={17} />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-ink text-cream">
      <a
        href="#main"
        className="sr-only-focusable focus:absolute focus:top-3 focus:z-[80] focus:m-3 focus:rounded-xl focus:bg-gold focus:px-5 focus:py-3 focus:text-[13px] focus:font-bold focus:text-[#1b1404]"
      >
        پرش به محتوای اصلی
      </a>

      <RouteProgress />
      <Nav />

      <main id="main">
        <Hero />
        <BrandIntro />
        <Challenges />
        <DispatchDemo />
        <DemoExperience />
        <Features />
        <Showcase />
        <Workflow />
        <Benefits />
        <Pricing />
        <Trust />
        <About />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
      <MobileDock />
    </div>
  );
}
