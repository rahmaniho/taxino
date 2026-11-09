/**
 * Server-renders the landing page to static HTML so the QA suite can audit
 * content, links and accessibility without a browser.
 */
import { renderToStaticMarkup } from "react-dom/server";
import App from "../src/App";

const body = renderToStaticMarkup(<App />);
process.stdout.write(
  `<!doctype html><html lang="fa" dir="rtl"><head><title>نرم افزار مدیریت آژانس تاکسی تلفنی | تاکسینو</title></head><body>${body}</body></html>`,
);
