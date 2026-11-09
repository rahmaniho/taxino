/**
 * TAXINO — asset pipeline
 * ---------------------------------------------------------------------------
 * Source of truth (never edited): the official brand files that ship with the
 * product repository (`rahmaniho/taxi`) and the official print brochure that
 * ships with this repository. Everything under `public/assets` is generated
 * from them, so the landing page never distorts or redraws official artwork.
 *
 *   npm run assets
 */
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets-src");
const OUT = path.join(ROOT, "public", "assets");

const BROCHURE = path.join(SRC, "brand", "file_00000000b2d082108b36bdb42ac31361.png");
const MOBILE_SCREEN = path.join(SRC, "brand", "33179d6d-6591-4489-a005-6af826efb425.png");
const HERO = path.join(SRC, "product", "icons_login-hero.jpg");
const LOGO_LIGHT = path.join(SRC, "product", "icons_logo.png");
const LOGO_DARK = path.join(SRC, "product", "icons_logo-dark.png");
const MARK_SVG = path.join(SRC, "product", "brand.svg");

/** Write one raster in every modern format we serve. */
async function emit(pipeline, dir, name, { avif = true, webp = true, jpg = false } = {}) {
  const target = path.join(OUT, dir);
  await mkdir(target, { recursive: true });
  const base = pipeline;
  const tasks = [];
  if (webp) tasks.push(base.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(target, `${name}.webp`)));
  if (avif) tasks.push(base.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(target, `${name}.avif`)));
  if (jpg) tasks.push(base.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(target, `${name}.jpg`)));
  await Promise.all(tasks);
  return pipeline;
}

/** Transparent crop of the official logo artwork. */
async function crop(src, box) {
  const buf = await sharp(src).extract(box).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

async function main() {
  await rm(OUT, { recursive: true, force: true });

  /* ---------------------------------------------------------------- fonts */
  // Self-hosted variable fonts (no third-party CDN at runtime). Only the two
  // subsets the page actually needs: Persian (Vazirmatn) + Latin (Inter).
  await mkdir(path.join(OUT, "fonts"), { recursive: true });
  await copyFile(
    path.join(ROOT, "node_modules/@fontsource-variable/vazirmatn/files/vazirmatn-arabic-wght-normal.woff2"),
    path.join(OUT, "fonts/vazirmatn-arabic.woff2"),
  );
  await copyFile(
    path.join(ROOT, "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
    path.join(OUT, "fonts/inter-latin.woff2"),
  );

  /* ------------------------------------------------------------ favicon */
  await mkdir(path.join(OUT, "brand"), { recursive: true });
  await copyFile(MARK_SVG, path.join(OUT, "brand", "favicon.svg"));

  /* ---------------------------------------------------------------- brand */
  await mkdir(path.join(OUT, "brand"), { recursive: true });

  // Vector mark (the real app icon) — favicon, app icon, small lockups.
  await sharp(MARK_SVG, { density: 384 }).resize(512, 512).png().toFile(path.join(OUT, "brand", "mark-512.png"));
  await sharp(MARK_SVG, { density: 384 }).resize(192, 192).png().toFile(path.join(OUT, "brand", "mark-192.png"));
  await sharp(MARK_SVG, { density: 384 }).resize(180, 180).png().toFile(path.join(OUT, "brand", "apple-touch-icon.png"));
  await sharp(MARK_SVG, { density: 384 }).resize(32, 32).png().toFile(path.join(OUT, "brand", "favicon-32.png"));
  await sharp(MARK_SVG, { density: 384 }).resize(48, 48).png().toFile(path.join(OUT, "brand", "favicon-48.png"));

  // Official horizontal lockups, exactly as published in the product repo.
  await sharp(LOGO_LIGHT).trim({ threshold: 6 }).resize({ width: 920 }).webp({ quality: 90 }).toFile(path.join(OUT, "brand", "logo-light.webp"));
  await sharp(LOGO_LIGHT).trim({ threshold: 6 }).resize({ width: 920 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "brand", "logo-light.png"));
  await sharp(LOGO_DARK).trim({ threshold: 6 }).resize({ width: 920 }).webp({ quality: 90 }).toFile(path.join(OUT, "brand", "logo-dark.webp"));
  await sharp(LOGO_DARK).trim({ threshold: 6 }).resize({ width: 920 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "brand", "logo-dark.png"));

  // Compact header lockup: mark + latin wordmark + Persian wordmark, composed
  // from the official artwork (no redrawing, no distortion).
  const mark = await crop(LOGO_DARK, { left: 12, top: 16, width: 302, height: 319 });
  const latin = await crop(LOGO_DARK, { left: 342, top: 71, width: 566, height: 112 });
  const persian = await crop(LOGO_DARK, { left: 357, top: 203, width: 545, height: 90 });
  const GAP = 22;
  const canvasW = 302 + GAP + 566 + 12; // 12px optical padding on the wordmark side
  const canvasH = 319;
  // Align both wordmark lines on the optical centre of the mark.
  const textTop = Math.round((canvasH - (112 + 21 + 90)) / 2);
  await sharp({ create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark.buf, left: 0, top: 0 },
      { input: latin.buf, left: 302 + GAP, top: textTop },
      { input: persian.buf, left: 302 + GAP + 15, top: textTop + 112 + 21 },
    ])
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(path.join(OUT, "brand", "logo-nav.webp"));
  await sharp(path.join(OUT, "brand", "logo-nav.webp")).png().toFile(path.join(OUT, "brand", "logo-nav.png"));

  // Karen Soft lockup, cropped from the official brochure.
  await emit(
    sharp(BROCHURE).extract({ left: 1140, top: 812, width: 262, height: 66 }).resize(786, null, { kernel: "lanczos3" }).sharpen(),
    "brand",
    "karensoft-lockup",
    { jpg: true },
  );

  /* ------------------------------------------------------------ hero shot */
  const heroMeta = await sharp(HERO).metadata();
  for (const w of [420, 640, heroMeta.width]) {
    await emit(sharp(HERO).resize({ width: w, kernel: "lanczos3" }), "hero", `taxi-night-${w}`, { jpg: true });
  }

  /* --------------------------------------------------------- real product */
  // Screen of the official brochure mock (laptop + phone), gently upscaled.
  await emit(
    sharp(BROCHURE)
      .extract({ left: 505, top: 140, width: 372, height: 222 })
      .resize(744, 444, { kernel: "lanczos3" })
      .sharpen({ sigma: 0.6 }),
    "product",
    "product-in-brochure-744",
    { jpg: true },
  );

  // The real mobile login screen that ships with the app.
  for (const w of [320, 480, 640]) {
    await emit(sharp(MOBILE_SCREEN).resize({ width: w }), "product", `mobile-app-${w}`, { jpg: true });
  }

  // The complete official print brochure (gallery / lightbox).
  await emit(sharp(BROCHURE).resize({ width: 1280 }), "product", "brochure-full-1280", { jpg: true });
  await emit(sharp(BROCHURE).resize({ width: 800 }), "product", "brochure-full-800", { jpg: true });

  /* ------------------------------------------------------------ og cover */
  const ogBg = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { r: 5, g: 15, b: 38, alpha: 1 } },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <radialGradient id="g1" cx="18%" cy="18%" r="70%">
                 <stop offset="0%" stop-color="#1b3a70" stop-opacity="0.85"/>
                 <stop offset="100%" stop-color="#051026" stop-opacity="0"/>
               </radialGradient>
               <radialGradient id="g2" cx="86%" cy="92%" r="60%">
                 <stop offset="0%" stop-color="#f59300" stop-opacity="0.35"/>
                 <stop offset="100%" stop-color="#051026" stop-opacity="0"/>
               </radialGradient>
               <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                 <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
               </pattern>
             </defs>
             <rect width="1200" height="630" fill="url(#g1)"/>
             <rect width="1200" height="630" fill="url(#g2)"/>
             <rect width="1200" height="630" fill="url(#grid)"/>
             <path d="M-40 500 C 220 470 380 330 560 360 S 900 470 1240 300" fill="none" stroke="#ffc60b" stroke-opacity="0.55" stroke-width="3" stroke-dasharray="14 12"/>
           </svg>`,
        ),
        left: 0,
        top: 0,
      },
      {
        input: await sharp(HERO).resize({ height: 630 }).toBuffer(),
        left: 690,
        top: 0,
      },
      {
        input: Buffer.from(
          `<svg width="510" height="630" xmlns="http://www.w3.org/2000/svg">
             <defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="0">
               <stop offset="0%" stop-color="#051026" stop-opacity="1"/>
               <stop offset="55%" stop-color="#051026" stop-opacity="0.92"/>
               <stop offset="100%" stop-color="#051026" stop-opacity="0"/>
             </linearGradient></defs>
             <rect width="510" height="630" fill="url(#f)"/>
           </svg>`,
        ),
        left: 690,
        top: 0,
      },
    ])
    .png()
    .toBuffer();

  const logoForOg = await sharp(LOGO_DARK).trim({ threshold: 6 }).resize({ width: 470 }).toBuffer();

  await mkdir(path.join(OUT, "og"), { recursive: true });
  await sharp(ogBg)
    .composite([
      { input: logoForOg, left: 96, top: 150 },
      {
        input: Buffer.from(
          `<svg width="520" height="220" xmlns="http://www.w3.org/2000/svg">
             <rect x="0" y="0" width="86" height="4" fill="#ffc60b"/>
             <rect x="0" y="34" width="420" height="2" fill="#ffffff" opacity="0.16"/>
             <rect x="0" y="470" width="520" height="1" fill="#ffffff" opacity="0.12"/>
           </svg>`,
        ),
        left: 96,
        top: 380,
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(OUT, "og", "taxino-cover.jpg"));

  console.log("✔ assets built →", path.relative(ROOT, OUT));
}

main().catch((err) => {
  console.error("asset build failed", err);
  process.exit(1);
});
