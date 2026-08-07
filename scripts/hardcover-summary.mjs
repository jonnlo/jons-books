#!/usr/bin/env node
/**
 * scripts/hardcover-summary.mjs
 *
 * Fetch book summaries (descriptions) from the Hardcover GraphQL API and
 * optionally backfill them into books.json.
 *
 * Usage:
 *   HARDCOVER_TOKEN=... node hardcover-summary.mjs <isbn>                 # single lookup
 *   HARDCOVER_TOKEN=... node hardcover-summary.mjs --backfill             # fill missing summaries in books.json
 *   HARDCOVER_TOKEN=... node hardcover-summary.mjs --backfill --dry-run   # report only, no write
 *
 * The token comes from the HARDCOVER_TOKEN env var — it is never read from
 * or written to a file, and must never be committed.
 *
 * Hardcover beta API docs: https://docs.hardcover.app/api/getting-started
 * Rate limit: 60 requests/min → we throttle to ~1 request/sec.
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API = 'https://api.hardcover.app/v1/graphql';
const THROTTLE_MS = 1100; // ~54 req/min, safely under the 60/min limit
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKS_PATH = path.join(REPO_ROOT, 'books.json');
const MISSES_PATH = path.join(REPO_ROOT, 'scripts', 'hardcover-summary-misses.txt');

const args = process.argv.slice(2);
const isBackfill = args.includes('--backfill');
const isDryRun = args.includes('--dry-run');
const isbnArg = args.find((a) => !a.startsWith('--'));

// Token resolution: HARDCOVER_TOKEN env first, else a gitignored local file
// (<repo>/.hardcover-token) so long runs survive terminal env resets. Never commit it.
function resolveToken() {
  if (process.env.HARDCOVER_TOKEN) return process.env.HARDCOVER_TOKEN;
  const file = path.join(REPO_ROOT, '.hardcover-token');
  try {
    if (existsSync(file)) {
      const t = readFileSync(file, 'utf8').trim();
      if (t) return t;
    }
  } catch {}
  return null;
}

const TOKEN = resolveToken();
if (!TOKEN) {
  console.error(
    'No token found. Either set HARDCOVER_TOKEN (export HARDCOVER_TOKEN=...) or\n' +
      `write it to ${path.join(REPO_ROOT, '.hardcover-token')} (gitignored).`
  );
  process.exit(1);
}

// NOTE: search.results is a jsonb SCALAR on the Hardcover schema — it takes no
// subselection. The returned JSON array's items carry the book fields documented
// at https://docs.hardcover.app/api/guides/searching (title, author_names,
// description, isbns, ...).
const SEARCH_QUERY = `query($q: String!) {
  search(query: $q, query_type: "Book", per_page: 5) {
    results
  }
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postWithRetry(query, variables, auth) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: auth,
        'user-agent': 'personal-library-summary-helper/1.0',
      },
      body: JSON.stringify({ query, variables }),
    });
    if (res.status === 401) throw new Error('401 — invalid token');
    if (res.status === 429) {
      if (attempt === 3) throw new Error('429 — still throttled after retries');
      await sleep(4000 * attempt);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const { data, errors } = await res.json();
    if (errors) throw new Error('API errors: ' + JSON.stringify(errors));
    return data;
  }
  throw new Error('Exhausted retries');
}

// Tries the raw token, then the Bearer form (the docs don't specify, so be lenient).
async function fetchGraphQL(query, variables) {
  let lastErr;
  for (const auth of [TOKEN, `Bearer ${TOKEN}`]) {
    try {
      return await postWithRetry(query, variables, auth);
    } catch (e) {
      lastErr = e;
      if (!/401/.test(String(e.message))) throw e; // only fall through to Bearer on 401
    }
  }
  throw lastErr;
}

function asList(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
}

// search.results is a jsonb object shaped { found, hits: [{ document: {...} }] }.
// Extract the flat list of book documents for pickHit/clean.
function resultsOf(data) {
  const raw = data?.search?.results;
  const parsed = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
  const hits = parsed?.hits;
  return Array.isArray(hits) ? hits.map((h) => h?.document).filter(Boolean) : [];
}

// Prefer a hit whose isbns actually include the queried ISBN (search is fuzzy).
function pickHit(results, query) {
  const q = String(query).toLowerCase();
  const exact = asList(results).find((r) =>
    asList(r.isbns).some((i) => String(i).toLowerCase() === q)
  );
  return exact || asList(results)[0] || null;
}

function clean(desc) {
  if (!desc) return '';
  return String(desc).replace(/\s+/g, ' ').trim();
}

async function lookupByIsbn(isbn) {
  const data = await fetchGraphQL(SEARCH_QUERY, { q: isbn });
  return pickHit(resultsOf(data), isbn);
}

// Normalize for a forgiving title comparison (keeps CJK, drops punctuation).
function normTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Title (book-name) search. Prefer a hit whose title matches the queried
// title (handles subtitles/colons) instead of blindly taking results[0];
// returns null when nothing matches so the caller can fall back to ISBN.
async function lookupByTitle(title) {
  const data = await fetchGraphQL(SEARCH_QUERY, { q: title });
  const results = resultsOf(data);
  if (!results.length) return null;
  const target = normTitle(title);
  const match = results.find((r) => {
    const t = normTitle(r.title);
    if (!t) return false;
    // Exact, or the hit title starts with the query (query had a subtitle), or
    // the query contains the hit's full main title. Never accept a hit whose
    // title merely CONTAINS the query mid-title — that would match e.g.
    // "Hold Me Closer, Necromancer" for a book titled "Necromancer".
    return t === target || t.startsWith(target) || (target.includes(t) && t.length >= 5);
  });
  return match || null;
}

// --- single lookup -------------------------------------------------------

async function runSingle(isbn) {
  const hit = await lookupByIsbn(isbn);
  if (!hit) {
    console.log(`No results for ${isbn}`);
    return;
  }
  console.log(`\nTitle:   ${hit.title ?? '(no title)'}`);
  console.log(`Author:  ${asList(hit.author_names).join(', ') || '(unknown)'}`);
  console.log(`ISBNs:   ${asList(hit.isbns).join(', ') || '(none)'}`);
  console.log(`\nDescription:\n${clean(hit.description) || '(no description)'}`);
}

// --- backfill ------------------------------------------------------------

async function runBackfill() {
  const books = JSON.parse(readFileSync(BOOKS_PATH, 'utf8'));
  if (!Array.isArray(books)) throw new Error(`${BOOKS_PATH} is not a JSON array`);

  const misses = [];
  let fetched = 0, skipped = 0, missed = 0, errored = 0;
  const total = books.length;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const label = `[${i + 1}/${total}] ${book.title}`;

    if (book.summary && book.summary.trim()) {
      skipped++;
      console.log(`${label} — skip (already has summary)`);
      continue;
    }

    let hit = null;
    try {
      // Title (book name) first, ISBN as fallback — ISBN-only misses (most of
      // the no-summary list) get a second chance via a fuzzy title match.
      hit = await lookupByTitle(book.title);
      if (!hit && book.isbn) {
        await sleep(THROTTLE_MS); // keep ~1 req/1.1s even with two lookups
        hit = await lookupByIsbn(book.isbn);
      }
    } catch (e) {
      errored++;
      misses.push(`${book.title} — ${book.isbn || '(no isbn)'} — ERROR: ${e.message}`);
      console.log(`${label} — ✗ ERROR: ${e.message}`);
      await sleep(THROTTLE_MS);
      continue;
    }

    const desc = clean(hit?.description);
    if (desc) {
      book.summary = desc;
      fetched++;
      console.log(`${label} — ✓ ${desc.length} chars`);
    } else {
      missed++;
      misses.push(`${book.title} — ${book.isbn || '(no isbn)'} — no description on Hardcover`);
      console.log(`${label} — ✗ no description`);
    }

    await sleep(THROTTLE_MS);
  }

  console.log(
    `\nResult: ${fetched} fetched, ${skipped} skipped, ${missed} no-description, ${errored} errored (of ${total}).`
  );

  if (misses.length) {
    writeFileSync(MISSES_PATH, misses.join('\n') + '\n');
    console.log(`Misses logged to ${MISSES_PATH}`);
  }

  if (!isDryRun && fetched > 0) {
    const tmp = `${BOOKS_PATH}.tmp`;
    writeFileSync(tmp, JSON.stringify(books, null, 2) + '\n');
    renameSync(tmp, BOOKS_PATH);
    console.log(`Wrote ${BOOKS_PATH} (${fetched} summaries added).`);
  } else {
    console.log(isDryRun ? 'Dry run — books.json not modified.' : 'No changes to write.');
  }
}

// --- main ----------------------------------------------------------------

if (isBackfill) {
  await runBackfill();
} else if (isbnArg) {
  await runSingle(isbnArg);
} else {
  console.error('usage: node hardcover-summary.mjs <isbn> | --backfill [--dry-run]');
  process.exit(1);
}
