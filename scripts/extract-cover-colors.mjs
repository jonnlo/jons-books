#!/usr/bin/env node
/**
 * Extract dominant cover colors and stamp each book in books.json with `coverColor`.
 *
 * Method: 64×64 downscale → 16-step quantize → histogram peak (most frequent
 * bucket). This captures the actual dominant hue (e.g. leaf green #70a050)
 * instead of a muddy flat average (#5e844f) that mixes shadows + highlights.
 *
 * - Skips books with no cover or missing file in covers/.
 * - Idempotent: books that already have `coverColor` are skipped unless --force.
 * - Dry run by default; use --write to update books.json (atomic write).
 *
 * Usage:
 *   node scripts/extract-cover-colors.mjs              # dry run — shows colors, writes nothing
 *   node scripts/extract-cover-colors.mjs --write      # actually updates books.json
 *   node scripts/extract-cover-colors.mjs --write --force  # re-extract even if coverColor exists
 *   node scripts/extract-cover-colors.mjs --write books.json  # explicit path
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const FORCE = args.includes('--force');
const booksPath = args.find((a) => !a.startsWith('--') && a.endsWith('.json'))
  ? resolve(args.find((a) => !a.startsWith('--') && a.endsWith('.json')))
  : join(ROOT, 'books.json');
const COVERS_DIR = join(ROOT, 'covers');

// Quantize step — 16 gives 16³ = 4096 buckets, enough to separate hues
// without fragmenting the histogram. Peak bucket hex is returned directly.
const QUANTIZE = 16;
const RESIZE = 64;

async function extractDominantColor(coverPath) {
  const { data } = await sharp(coverPath)
    .resize(RESIZE, RESIZE, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hist = new Map();
  for (let i = 0; i < data.length; i += 3) {
    const r = Math.min(255, Math.round(data[i] / QUANTIZE) * QUANTIZE);
    const g = Math.min(255, Math.round(data[i + 1] / QUANTIZE) * QUANTIZE);
    const b = Math.min(255, Math.round(data[i + 2] / QUANTIZE) * QUANTIZE);
    const key = `${r},${g},${b}`;
    hist.set(key, (hist.get(key) || 0) + 1);
  }

  let peak = null;
  let peakCount = 0;
  for (const [key, count] of hist) {
    if (count > peakCount) {
      peakCount = count;
      peak = key;
    }
  }

  if (!peak) return null;
  const [r, g, b] = peak.split(',').map(Number);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const raw = readFileSync(booksPath, 'utf8');
  const books = JSON.parse(raw);
  if (!Array.isArray(books)) throw new Error('books.json must contain an array');

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const book of books) {
    if (book.coverColor && !FORCE) {
      skipped++;
      continue;
    }

    const cover = (book.cover || '').trim();
    if (!cover || !cover.startsWith('covers/')) {
      missing++;
      continue;
    }

    const coverPath = join(ROOT, cover);
    if (!existsSync(coverPath)) {
      console.warn(`  missing file: ${cover} (id ${book.id})`);
      missing++;
      continue;
    }

    try {
      const hex = await extractDominantColor(coverPath);
      if (!hex) {
        console.warn(`  no peak for ${cover}`);
        missing++;
        continue;
      }
      const prev = book.coverColor || '(none)';
      book.coverColor = hex;
      updated++;
      console.log(`  ${book.id} ${prev} → ${hex}  ${book.title?.slice(0, 48) || ''}`);
    } catch (err) {
      console.warn(`  failed ${cover}: ${err.message}`);
      missing++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (already have coverColor), ${missing} missing/no cover.`);

  if (WRITE && updated > 0) {
    const tmp = booksPath + '.tmp';
    writeFileSync(tmp, JSON.stringify(books, null, 2) + '\n', 'utf8');
    renameSync(tmp, booksPath);
    console.log(`Wrote ${booksPath}`);
  } else if (!WRITE) {
    console.log('(dry run — no files written; use --write to apply)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
