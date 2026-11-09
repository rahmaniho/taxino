/**
 * TAXINO — one command for the whole quality gate.
 *   npm run qa
 *
 * Steps: typecheck → production build → SSR snapshot → structural/SEO/a11y
 * audit → API tests. No browser binary is required (see README: Lighthouse and
 * pixel-level visual QA must be run on a machine with Chrome).
 */
import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const steps = [
  { name: "TypeScript", cmd: "npx", args: ["tsc", "--noEmit"] },
  { name: "Production build", cmd: "npx", args: ["vite", "build"] },
  { name: "SSR snapshot", cmd: "npx", args: ["vite", "build", "--config", "qa/vite.ssr.config.ts"] },
  { name: "Static audit (structure · SEO · axe)", cmd: "node", args: ["qa/audit.mjs"] },
  { name: "API contract tests", cmd: "node", args: ["qa/api.mjs"] },
  { name: "Lead layer (static-host fallback)", cmd: "node", args: ["qa/lead.test.mjs"] },
];

const report = [];

for (const step of steps) {
  process.stdout.write(`\n▸ ${step.name}\n`);
  if (step.name === "Static audit (structure · SEO · axe)") {
    const render = spawnSync("node", ["qa/.ssr/render.mjs"], { cwd: ROOT, encoding: "utf8" });
    if (render.status !== 0) {
      report.push({ name: step.name, ok: false });
      continue;
    }
    await mkdir(path.join(ROOT, "qa", ".ssr"), { recursive: true });
    const { writeFile } = await import("node:fs/promises");
    await writeFile(path.join(ROOT, "qa", ".ssr", "landing.html"), render.stdout);
  }

  const result = spawnSync(step.cmd, step.args, { cwd: ROOT, stdio: "inherit" });
  report.push({ name: step.name, ok: result.status === 0 });
}

console.log("\n──────────────── Q/A summary ────────────────");
report.forEach((item) => console.log(`${item.ok ? "✔" : "✘"} ${item.name}`));
const failed = report.filter((item) => !item.ok);
console.log(`\n${report.length - failed.length}/${report.length} stages passed`);
console.log(
  "ℹ Lighthouse / screenshot QA is not part of this run: it needs a Chrome binary,\n  which this environment does not provide. Run `npx lhci autorun` on a machine with Chrome.",
);
if (failed.length) process.exitCode = 1;
