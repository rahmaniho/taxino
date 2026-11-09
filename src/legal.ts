import "./index.css";

/* Legal pages share the design tokens with the landing page; this script only
   fills the "last updated" date so it never drifts out of date by hand. */
const target = document.querySelector<HTMLElement>("[data-updated]");
if (target) {
  target.textContent = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "long",
  }).format(new Date());
}
