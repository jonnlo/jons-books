#!/usr/bin/env node
// Generate the social share card (og-card.jpg, 1200×630) shown when the site
// link is shared (iMessage, WhatsApp, X, Facebook, Slack, Google).
//
// Usage (from the repo root):
//   node scripts/make-og-card.mjs            # writes og-card.jpg at the root
//   node scripts/make-og-card.mjs --dry-run  # log only, no writes
//
// Layout: the 10 most recently created books (by the `created` field, array
// order as fallback) with existing cover files, laid out 5×2. Each cover
// keeps its ORIGINAL aspect ratio, contain-fit and centered inside an
// equal-size invisible cell (like the site's book-card grid) — no site
// title, no description, no gradient overlay: just the covers spaced on a
// flat background. Color mirrors the site's LIGHT --img-bg token.
// Idempotent: the same data produces byte-identical output.
// Settings → Link preview can overwrite this file with a custom upload;
// re-run this script to go back to the auto layout. Commit + push to publish.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'og-card.jpg');
const DRY_RUN = process.argv.includes('--dry-run');

const W = 1200, H = 630;
const COLS = 5, ROWS = 2;
const COUNT = COLS * ROWS; // 10

// Layout geometry (tune here). Pure cover grid — no text anywhere.
const ROW_H = H / ROWS;      // 315 — each cover row fills half the card
const SIDE = 40;             // side margin around the grid
const CELL_W = (W - SIDE * 2) / COLS; // 224
const COVER_PAD_X = 20;      // breathing room inside each invisible cell
const COVER_PAD_Y = 12;

// Background = the site's LIGHT --img-bg token (oklch(0.9731 0 89.9) → sRGB).
const BG = '#f6f6f6';

function die(msg) {
  console.error(`make-og-card: ${msg}`);
  process.exit(1);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const books = readJson('books.json', null);
  if (!Array.isArray(books)) die('books.json is missing or not an array');

  // Most recently created first; books without `created` keep array order,
  // after all dated ones (Date.parse returns NaN → 0 → sorts last).
  const ordered = [...books].sort((a, b) => (Date.parse(b.created || '') || 0) - (Date.parse(a.created || '') || 0));

  // Keep only books whose cover file actually exists on disk.
  const picks = [];
  for (const b of ordered) {
    if (picks.length >= COUNT) break;
    if (!b || !b.cover || b.cover.startsWith('data:')) continue;
    const p = path.join(ROOT, b.cover);
    try {
      if (!fs.statSync(p).isFile()) continue;
    } catch { continue; }
    picks.push({ id: b.id || '(no id)', title: b.title || b.author || p, path: p });
  }
  if (!picks.length) die('no usable covers found in books.json');

  // Compose: flat --img-bg base + contain-fit covers in invisible cells.
  const composites = [];
  for (let i = 0; i < picks.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cellX = Math.round(SIDE + col * CELL_W);
    const cellY = Math.round(row * ROW_H);
    const boxW = Math.round(CELL_W - COVER_PAD_X * 2);
    const boxH = Math.round(ROW_H - COVER_PAD_Y * 2);
    // Original aspect ratio: scale to CONTAIN the box, never crop.
    const meta = await sharp(picks[i].path).metadata();
    const scale = Math.min(boxW / meta.width, boxH / meta.height);
    const cw = Math.max(1, Math.round(meta.width * scale));
    const ch = Math.max(1, Math.round(meta.height * scale));
    const cell = await sharp(picks[i].path).resize(cw, ch).toBuffer();
    composites.push({
      input: cell,
      left: Math.round(cellX + (CELL_W - cw) / 2),
      top: Math.round(cellY + (ROW_H - ch) / 2)
    });
  }

  const encode = (q) => sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite(composites)
    .jpeg({ quality: q, mozjpeg: true })
    .toBuffer();

  let buf = await encode(82);
  if (buf.length > 300 * 1024) {
    buf = await encode(70); // keep the card WhatsApp-friendly (<300KB)
  }

  console.log(`make-og-card: ${picks.length} covers (5×2)`);
  for (const p of picks) console.log(`  - ${p.title}`);
  console.log(`make-og-card: og-card.jpg ${(buf.length / 1024).toFixed(0)} KB`);

  if (DRY_RUN) {
    console.log('make-og-card: dry run — nothing written');
    return;
  }

  // Atomic write (tmp + rename) so a failed run never leaves a partial card.
  const tmp = OUT_FILE + '.tmp';
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, OUT_FILE);
  console.log('make-og-card: wrote og-card.jpg — commit & push to publish');
}

main().catch((err) => die(err && err.stack ? err.stack : String(err)));
