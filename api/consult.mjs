/**
 * Vercel serverless entry point (Node runtime).
 * Deploy with `LEAD_WEBHOOK_URL` (recommended) or `LEAD_DIR=/tmp/leads`.
 * The same handler powers `npm run dev` and `npm start`.
 */
import { handleConsult } from "../server/handler.mjs";

export default async function handler(request, response) {
  await handleConsult(request, response);
}
