/** Mounts the real consultation endpoint inside the Vite dev/preview server. */
import { handleConsult } from "./handler.mjs";

function middleware(request, response, next) {
  const pathname = (request.url ?? "").split("?")[0];
  if (pathname !== "/api/consult") return next();
  handleConsult(request, response).catch(() => {
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    response.end(JSON.stringify({ ok: false, message: "خطای سرور" }));
  });
}

export function consultApiPlugin() {
  return {
    name: "taxino-consult-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
