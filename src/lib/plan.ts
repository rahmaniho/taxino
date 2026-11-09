/** Tiny, dependency-free bridge between a pricing card and the consult form. */
export const PLAN_EVENT = "taxino:plan";

export function selectPlan(planTitle: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(PLAN_EVENT, { detail: planTitle }));
  const target = document.getElementById("consult");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      target.querySelector<HTMLInputElement>("input[name='name']")?.focus({ preventScroll: true });
    }, 700);
  }
}
