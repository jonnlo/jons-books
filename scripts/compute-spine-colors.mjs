#!/usr/bin/env node
// Compute a dominant-cover color for every book and store it as `spineColor`
// in books.json. The 3D book hover effect uses this as the spine color, so the
// value is precomputed (and stored) instead of read at runtime — that keeps the
// effect working even when the app is opened via file:// (where canvas pixel
// reads are blocked) and costs nothing on render.
//
// Usage: node scripts/compute-spine-colors.mjs [path/to/books.json] [--force]
//   --force  recompute even for books that already have a spineColor.
//
// Idempotent: books whose cover is empty, or that already have a spineColor
// (unless --force), are skipped. Books without a readable cover keep whatever
// spineColor they have (usually none).

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const coversDir = join(repoRoot, 'covers');

const args = process.argv.slice(2);
let booksPath = join(repoRoot, 'books.json');
let force = false;
for (const a of args) {
  if (a === '--force') force = true;
  else if (!a.startsWith('--')) booksPath = a;
}

// Quantize each channel to 4 bits (16 levels) and bucket; skip near-white /
// near-black so a white border or black background doesn't dominate.
// `raw` is the buffer from sharp's .raw() (interleaved, `channels` bytes/pixel).
function dominantColor(raw, channels) {
  const px = Math.floor(raw.length / channels);
  const buckets = new Map();
  for (let i = 0; i < px; i++) {
    const o = i * channels;
    const r = raw[o], g = raw[o + 1], b = raw[o + 2];
    const sum = r + g + b;
    if (sum > 740 || sum < 30) continue; // near-white / near-black
    const key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
    let bk = buckets.get(key);
    if (!bk) { bk = { r: 0, g: 0, b: 0, n: 0 }; buckets.set(key, bk); }
    bk.r += r; bk.g += g; bk.b += b; bk.n++;
  }
  let best = null;
  for (const bk of buckets.values()) {
    if (!best || bk.n > best.n) best = bk;
  }
  if (!best) return null;
  const r = Math.round(best.r / best.n);
  const g = Math.round(best.g / best.n);
  const b = Math.round(best.b / best.n);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const books = JSON.parse(await readFile(booksPath, 'utf8'));
  if (!Array.isArray(books)) throw new Error('books.json must contain an array');

  let computed = 0, skipped = 0, failed = 0;
  for (const book of books) {
    const id = String(book.id);
    const cover = (book.cover || '').trim();
    if (!cover) { skipped++; continue; }
    if (book.spineColor && !force) { skipped++; continue; }

    const coverPath = cover.startsWith('covers/')
      ? join(repoRoot, cover)
      : join(coversDir, `${id}.jpg`);

    try {
      const img = sharp(coverPath);
      const { data, info } = await img.resize({ width: 50, fit: 'inside' }).raw().toBuffer({ resolveWithObject: true });
      const color = dominantColor(data, info.channels);
      if (color) {
        book.spineColor = color;
        computed++;
        console.log(`OK   ${id}  ${book.title}  → ${color}`);
      } else {
        skipped++;
        console.log(`SKIP ${id}  ${book.title}  (no dominant color found)`);
      }
    } catch (err) {
      failed++;
      console.warn(`FAIL ${id}  ${book.title}  (${err.message})`);
    }
  }

  await writeFile(booksPath, JSON.stringify(books, null, 2));
  console.log(`\nDone: ${computed} computed, ${skipped} skipped, ${failed} failed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
