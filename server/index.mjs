/**
 * Minimal production server: static `dist/` + POST /api/consult.
 *   npm run build && npm start          (PORT=4173 by default)
 * For managed hosting you can also deploy `dist/` to any static host and run
 * the same handler as a serverless function (see `api/consult.mjs`).
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleConsult } from "./handler.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "..", "dist");
const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

async function serveFile(response, filePath) {
  const info = await stat(filePath);
  if (!info.isFile()) throw Object.assign(new Error("not-a-file"), { code: "ENOENT" });
  const ext = path.extname(filePath).toLowerCase();
  const immutable = filePath.includes(`${path.sep}assets${path.sep}`);
  response.writeHead(200, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": immutable
      ? "public, max-age=31536000, immutable"
      : ext === ".html"
        ? "public, max-age=0, must-revalidate"
        : "public, max-age=3600",
    ...securityHeaders,
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/api/consult") {
    await handleConsult(request, response);
    return;
  }

  if (url.pathname === "/api/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  const normalised = path
    .normalize(decodeURIComponent(url.pathname))
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const candidate = path.join(DIST, normalised);

  try {
    await serveFile(response, candidate);
    return;
  } catch {
    /* fall through to index.html */
  }

  try {
    await serveFile(response, path.join(DIST, "index.html"));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...securityHeaders });
    response.end("build not found — run `npm run build` first");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`TAXINO preview → http://localhost:${PORT}`);
});

// keep a reference for ESM linting tools
void readFile;
