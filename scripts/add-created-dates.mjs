#!/usr/bin/env node
/**
 * ONE-TIME migration: stamp each book in books.json with a `created` field
 * (ISO datetime) taken from the macOS creation date (birth time) of its
 * matching .epub file in the iCloud "books from jon" folder.
 *
 * - Only TOP-LEVEL .epub files are considered (subfolders are ignored).
 * - Matching is by normalized title vs. the epub filename stem
 *   (subtitle/author suffixes in filenames are tolerated).
 * - Books with no confident match are left untouched and reported.
 * - Idempotent: books that already have `created` keep their existing value.
 *
 * Usage:
 *   node scripts/add-created-dates.mjs            # dry run — shows matches, writes nothing
 *   node scripts/add-created-dates.mjs --write    # actually updates books.json (atomic write)
 */

import { readFileSync, readdirSync, statSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const BOOKS_JSON = join(ROOT, 'books.json');
// Optional CLI override: node scripts/add-created-dates.mjs [--write] [/path/to/epub/dir]
const EPUB_DIR =
  process.argv.slice(2).find((a) => a.startsWith('/') && !a.startsWith('--')) ||
  '/Users/jonathan/Library/Mobile Documents/com~apple~CloudDocs/books from jon';
const WRITE = process.argv.includes('--write');

// Manual overrides for books whose epub filename differs too much from the
// title for fuzzy matching (verified by hand against the folder listing).
const OVERRIDES = {
  // Szymborska's "View with a Grain of Sand" (JSON title says "from")
  '1786993606180': 'View with a grain of sand',
  // subtitle variant ("Updated and Expanded" inserted mid-title)
  '1785755389555wwnui': 'The First 90 Days',
  // "our brain" vs "Your Brain" wording difference
  '1785755389555yutmp': 'secret life of the mind',
  // filename drops "The", carries long Anna's Archive suffix
  '1785755389555z0x8l': 'Art of Loving',
  // published as "Arrival" (film tie-in)
  '1785755389555k3be6': 'Arrival - Stories of Your Life',
  // short title vs long subtitle
  '17857553895559v293': 'Bullshit Jobs',
  // filenames have the "*" stripped ("Fck" vs "F*ck")
  '1785755389555e8sm5': 'Everything Is Fcked',
  '1785755389555c2rc6': 'Subtle Art of Not Giving a Fck',
};

// Normalize for comparison: lowercase, strip apostrophes, collapse all
// non-alphanumerics to single spaces. CJK chars are preserved so Chinese
// titles compare directly.
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ')
    .trim();

const tokens = (s) => norm(s).split(' ').filter(Boolean);

// ---- Load epub files (top level only, no subfolders) -----------------------
const epubs = readdirSync(EPUB_DIR, { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.epub'))
  .map((d) => {
    const full = join(EPUB_DIR, d.name);
    const st = statSync(full);
    const stem = d.name.replace(/\.epub$/i, '');
    return {
      file: d.name,
      stem,
      ns: norm(stem),
      ts: new Set(tokens(stem)),
      created: st.birthtime, // macOS creation date
    };
  });

console.log(`Found ${epubs.length} top-level .epub files in:\n  ${EPUB_DIR}\n`);

// ---- Score one book title against one epub stem ----------------------------
function scoreMatch(bookTitle, epub) {
  const t = norm(bookTitle);
  if (t.length === 0 || epub.ns.length === 0) return 0;
  if (epub.ns === t) return 4; // exact normalized match
  if (epub.ns.startsWith(t) || t.startsWith(epub.ns)) return 3; // subtitle/author appended
  if (epub.ns.includes(t) || t.includes(epub.ns)) return 2; // containment
  // token-overlap fallback (e.g. "Arrival - Stories of Your Life" vs
  // "Stories of Your Life and Others")
  const tt = tokens(bookTitle);
  let shared = 0;
  for (const tok of tt) if (epub.ts.has(tok)) shared++;
  const ratio = shared / Math.min(tt.length, epub.ts.size);
  return ratio >= 0.6 ? 1 : 0;
}

// ---- Match every book -------------------------------------------------------
const books = JSON.parse(readFileSync(BOOKS_JSON, 'utf8'));
let matched = 0;
let keptExisting = 0;
const unmatchedBooks = [];
const usedEpubs = new Set();
const lines = [];

for (const book of books) {
  if (book.created) {
    keptExisting++;
    continue;
  }
  let best = null;
  let bestScore = 0;
  let ties = 0;
  const overrideNeedle = OVERRIDES[book.id];
  for (const epub of epubs) {
    const s = overrideNeedle
      ? epub.file.toLowerCase().includes(overrideNeedle.toLowerCase())
        ? 5
        : 0
      : scoreMatch(book.title, epub);
    if (s > bestScore) {
      bestScore = s;
      best = epub;
      ties = 1;
    } else if (s === bestScore && s > 0) {
      ties++;
    }
  }
  if (best && bestScore >= 2 && ties === 1) {
    book.created = best.created.toISOString();
    usedEpubs.add(best.file);
    matched++;
    lines.push(`  [${best.created.toISOString().slice(0, 10)}]  "${book.title}"  <-  ${best.file}`);
  } else {
    unmatchedBooks.push(
      `"${book.title}" / ${book.author}` +
        (ties > 1 ? `  (ambiguous: ${ties} candidates at score ${bestScore})` : '')
    );
  }
}

console.log(lines.sort().join('\n'));
console.log(
  `\nSummary: ${matched} newly stamped, ${keptExisting} already had created, ` +
    `${unmatchedBooks.length} unmatched, ${epubs.length - usedEpubs.size} epubs unused.\n`
);

if (unmatchedBooks.length > 0) {
  console.log('Books WITHOUT an epub match (left untouched):');
  console.log(unmatchedBooks.map((l) => '  - ' + l).join('\n'));
  console.log('');
}

if (WRITE) {
  const tmp = BOOKS_JSON + '.tmp';
  writeFileSync(tmp, JSON.stringify(books, null, 2) + '\n', 'utf8');
  renameSync(tmp, BOOKS_JSON);
  console.log(`Wrote ${matched} created dates to ${BOOKS_JSON}`);
} else {
  console.log('DRY RUN — no changes written. Re-run with --write to update books.json.');
}
