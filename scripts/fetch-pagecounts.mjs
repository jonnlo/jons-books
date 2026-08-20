#!/usr/bin/env node
/**
 * scripts/fetch-pagecounts.mjs
 *
 * Fetch page counts from Open Library by ISBN and optionally backfill
 * them into books.json (the optional `pages` field).
 *
 * Usage:
 *   node fetch-pagecounts.mjs <isbn>
 *   node fetch-pagecounts.mjs --backfill
 *   node fetch-pagecounts.mjs --backfill --force   # re-fetch even if pages exists
 *   node fetch-pagecounts.mjs --backfill --dry-run # report only, no write
 *
 * No token needed. Throttles to ~1 req/sec. Atomically writes via .tmp + rename.
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const THROTTLE_MS = 1100;
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKS_PATH = path.join(REPO_ROOT, 'books.json');
const MISSES_PATH = path.join(REPO_ROOT, 'scripts', 'pagecount-misses.txt');

const args = process.argv.slice(2);
const isBackfill = args.includes('--backfill');
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const isbnArg = args.find(a => !a.startsWith('--'));

async function fetchPageCount(isbn) {
  const clean = isbn.replace(/[^0-9Xx]/g, '');
  if (!clean) return null;
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${clean}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data.number_of_pages) return parseInt(data.number_of_pages, 10);
    }
  } catch {}
  // Fallback: Google Books
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`, { headers: { 'User-Agent': 'jons-books/1.0' } });
    if (res.ok) {
      const data = await res.json();
      const info = data.items?.[0]?.volumeInfo;
      if (info?.pageCount) return parseInt(info.pageCount, 10);
    }
  } catch {}
  return null;
}

if (isbnArg && !isBackfill) {
  const pages = await fetchPageCount(isbnArg);
  console.log(pages != null ? pages : 'miss');
  process.exit(0);
}

if (!isBackfill) {
  console.log('Usage: node fetch-pagecounts.mjs <isbn> | --backfill [--force] [--dry-run]');
  process.exit(1);
}

const raw = readFileSync(BOOKS_PATH, 'utf8');
const books = JSON.parse(raw);

let fetched = 0, skipped = 0, misses = [];
for (const book of books) {
  if (book.pages != null && !isForce) { skipped++; continue; }
  if (!book.isbn) { misses.push(`${book.id}\t(no ISBN)\t${book.title}`); continue; }
  const pages = await fetchPageCount(book.isbn);
  if (pages != null) {
    book.pages = pages;
    fetched++;
    console.log(`ok  ${book.isbn} -> ${pages}  ${book.title.slice(0, 50)}`);
  } else {
    misses.push(`${book.id}\t${book.isbn}\t${book.title}`);
    console.log(`miss ${book.isbn}  ${book.title.slice(0, 50)}`);
  }
  await new Promise(r => setTimeout(r, THROTTLE_MS));
}

if (!isDryRun && fetched > 0) {
  const tmp = BOOKS_PATH + '.tmp';
  writeFileSync(tmp, JSON.stringify(books, null, 1) + '\n', 'utf8');
  renameSync(tmp, BOOKS_PATH);
  console.log(`\nWrote ${fetched} page counts to books.json`);
} else {
  console.log(`\nDry run: ${fetched} would be written, ${skipped} skipped, ${misses.length} misses`);
}

writeFileSync(MISSES_PATH, misses.join('\n') + '\n', 'utf8');
console.log(`Misses logged to ${MISSES_PATH}`);
