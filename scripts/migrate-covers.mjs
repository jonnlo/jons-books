#!/usr/bin/env node
// Migrate external cover URLs in books.json to local files in covers/<id>.jpg.
//
// Usage: node scripts/migrate-covers.mjs [path/to/books.json] [--force] [--source <pre-migration books.json>]
//
// For each book whose cover is an external URL (not already "covers/..."):
//   1. Fetch the image (server-side, so no CORS restrictions).
//   2. Downscale to max 800px wide (height uncapped), JPEG quality 0.85.
//   3. Write covers/<id>.jpg.
//   4. Rewrite the book's cover to "covers/<id>.jpg".
// On failure the cover is set to "" (the app falls back to the generated
// jacket) and the book is logged to scripts/migrate-cover-failures.txt.
//
// Idempotent: books whose cover already starts with "covers/" are skipped, so
// re-running only processes books that still have external URLs.
//   --force:  also re-download books whose cover is already "covers/<id>.jpg",
//             using the original external URL looked up by id from --source.
//             On failure the existing cover is KEPT (not blanked).
//   --source: a pre-migration books.json that still has the external URLs, e.g.
//             `git show HEAD:books.json > books-original.json` from before the
//             first migration. Only consulted when --force.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const coversDir = join(repoRoot, 'covers');
const logPath = join(dirname(fileURLToPath(import.meta.url)), 'migrate-cover-failures.txt');

// Args: [books.json] [--force] [--source <pre-migration books.json>]
const args = process.argv.slice(2);
let booksPath = join(repoRoot, 'books.json');
let sourcePath = null;
let force = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--force') force = true;
  else if (a === '--source') sourcePath = args[++i];
  else if (!a.startsWith('--')) booksPath = a;
}

const MAX_WIDTH = 800;   // max width in px (height uncapped)
const QUALITY = 85;    // JPEG quality
const TIMEOUT_MS = 20000;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function download(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'image/*,*/*;q=0.8' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error('Empty/too-small response');
    return buf;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  await mkdir(coversDir, { recursive: true });

  const books = JSON.parse(await readFile(booksPath, 'utf8'));
  if (!Array.isArray(books)) throw new Error('books.json must contain an array');

  // When --force, look up original external URLs by book id from a pre-migration
  // books.json (e.g. `git show HEAD:books.json > books-original.json`).
  const sourceUrls = new Map();
  if (sourcePath) {
    const src = JSON.parse(await readFile(sourcePath, 'utf8'));
    if (!Array.isArray(src)) throw new Error('--source file must contain an array');
    for (const b of src) if (b.id != null) sourceUrls.set(String(b.id), (b.cover || '').trim());
  }

  let migrated = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const book of books) {
    const id = String(book.id);
    const cover = (book.cover || '').trim();
    if (!cover) { skipped++; continue; }

    let url = cover;
    const alreadyLocal = cover.startsWith('covers/');
    if (alreadyLocal) {
      if (!force) { skipped++; continue; }
      url = sourceUrls.get(id) || '';
      if (!url.startsWith('http')) {
        console.warn(`SKIP ${id}  ${book.title}  (no source URL to re-download)`);
        skipped++;
        continue;
      }
    }

    const fileName = `${id}.jpg`;
    const outPath = join(coversDir, fileName);
    try {
      const buf = await download(url);
      const out = await sharp(buf)
        .resize({ width: MAX_WIDTH, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: QUALITY })
        .toBuffer();
      await writeFile(outPath, out);
      book.cover = `covers/${fileName}`;
      migrated++;
      console.log(`OK   ${id}  ${book.title}  → covers/${fileName}${alreadyLocal ? ' (re-downloaded)' : ''}`);
    } catch (err) {
      if (!alreadyLocal) book.cover = '';
      failed++;
      failures.push(`${id}\t${book.title}\t${url}\t${err.message}${alreadyLocal ? ' (kept existing cover)' : ''}`);
      console.warn(`FAIL ${id}  ${book.title}  (${err.message})${alreadyLocal ? ' — kept existing cover' : ''}`);
    }
  }

  await writeFile(booksPath, JSON.stringify(books, null, 2));
  if (failures.length) {
    await writeFile(logPath, failures.join('\n') + '\n', 'utf8');
  }

  console.log(`\nDone: ${migrated} migrated, ${skipped} skipped (none/already local), ${failed} failed.`);
  if (failures.length) console.log(`Failures logged to ${logPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
