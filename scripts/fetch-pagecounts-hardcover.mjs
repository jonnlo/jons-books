#!/usr/bin/env node
/**
 * Fetch page counts from Hardcover for books missing them (isbn-but-missed list).
 * Tries ISBN first, then title fallback (like hardcover-summary.mjs).
 * Writes pages into books.json where found; logs misses to pagecount-hardcover-misses.txt.
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API = 'https://api.hardcover.app/v1/graphql';
const THROTTLE_MS = 1100;
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKS_PATH = path.join(REPO_ROOT, 'books.json');
const OUT_MISSES = path.join(REPO_ROOT, 'scripts', 'pagecount-hardcover-misses.txt');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

function resolveToken() {
  if (process.env.HARDCOVER_TOKEN) return process.env.HARDCOVER_TOKEN;
  const f = path.join(REPO_ROOT, '.hardcover-token');
  try { if (existsSync(f)) return readFileSync(f, 'utf8').trim(); } catch {}
  return null;
}
const TOKEN = resolveToken();
if (!TOKEN) { console.error('No Hardcover token'); process.exit(1); }

const SEARCH_QUERY = `query($q: String!) { search(query: $q, query_type: "Book", per_page: 5) { results } }`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function postWithRetry(query, variables, auth) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json', authorization: auth }, body: JSON.stringify({ query, variables }) });
    if (res.status === 429) { await sleep(4000*attempt); continue; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data, errors } = await res.json();
    if (errors) throw new Error(JSON.stringify(errors));
    return data;
  }
  throw new Error('Exhausted');
}
async function fetchGraphQL(query, variables) {
  for (const auth of [TOKEN, `Bearer ${TOKEN}`]) {
    try { return await postWithRetry(query, variables, auth); } catch (e) {
      if (!/401/.test(String(e.message))) throw e;
    }
  }
  throw new Error('401');
}
function asList(v){ if(Array.isArray(v)) return v; if(v==null) return []; return [v]; }
function resultsOf(data){
  const raw = data?.search?.results;
  const parsed = typeof raw === 'string' ? (()=>{try{return JSON.parse(raw);}catch{return null;}})() : raw;
  return Array.isArray(parsed?.hits) ? parsed.hits.map(h=>h?.document).filter(Boolean) : [];
}
function pickHit(results, query){
  const q = String(query).toLowerCase();
  const exact = asList(results).find(r=> asList(r.isbns).some(i=> String(i).toLowerCase()===q));
  return exact || asList(results)[0] || null;
}
function normTitle(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,' ').trim().replace(/\s+/g,' '); }
async function lookupByTitle(title){
  const data = await fetchGraphQL(SEARCH_QUERY,{q:title});
  const results = resultsOf(data);
  if(!results.length) return null;
  const target = normTitle(title);
  const m = results.find(r=>{ const t=normTitle(r.title); if(!t) return false; return t===target || t.startsWith(target) || (target.includes(t) && t.length>=5); });
  return m || null;
}
async function lookupByIsbn(isbn){
  const data = await fetchGraphQL(SEARCH_QUERY,{q:isbn});
  return pickHit(resultsOf(data), isbn);
}
function extractPages(doc){
  if(doc?.pages) return parseInt(doc.pages,10) || null;
  if(doc?.number_of_pages) return parseInt(doc.number_of_pages,10) || null;
  // editions object sometimes carries pages — inspect raw keys
  const raw = JSON.stringify(doc||{});
  const m = raw.match(/"(?:pages|number_of_pages)"\s*:\s*(\d{2,4})/);
  if(m) return parseInt(m[1],10);
  return null;
}

const books = JSON.parse(readFileSync(BOOKS_PATH,'utf8'));
const targetIds = new Set(
  // Only books that currently lack pages AND have an isbn or title to try
  books.filter(b=> b.pages==null && (b.isbn || b.title)).map(b=>b.id)
);
let fetched=0, missed=0;
const misses=[];

for (const book of books) {
  if (!targetIds.has(book.id)) continue;
  let hit = null;
  try {
    if (book.isbn) {
      hit = await lookupByIsbn(book.isbn);
      let pages = extractPages(hit);
      if (pages) { book.pages = pages; fetched++; console.log(`ok isbn ${book.isbn} -> ${pages} ${book.title.slice(0,40)}`); await sleep(THROTTLE_MS); continue; }
      await sleep(THROTTLE_MS);
    }
    hit = await lookupByTitle(book.title);
    let pages = extractPages(hit);
    if (pages) { book.pages = pages; fetched++; console.log(`ok title ${book.title.slice(0,30)} -> ${pages}`); }
    else { misses.push(`${book.id}\t${book.isbn||'(no ISBN)'}\t${book.title}`); missed++; console.log(`miss ${book.title.slice(0,40)}`); }
  } catch(e){
    misses.push(`${book.id}\t${book.isbn||''}\t${book.title} — ERROR ${e.message}`);
    console.log(`err ${book.title.slice(0,30)} ${e.message}`);
  }
  await sleep(THROTTLE_MS);
}

if (!isDryRun && fetched>0) {
  const tmp = BOOKS_PATH+'.tmp';
  writeFileSync(tmp, JSON.stringify(books,null,1)+'\n','utf8');
  renameSync(tmp, BOOKS_PATH);
  console.log(`\nWrote ${fetched} page counts to books.json`);
} else console.log(`\nDry run: ${fetched} would be written`);

writeFileSync(OUT_MISSES, misses.join('\n')+'\n','utf8');
console.log(`${missed} misses -> ${OUT_MISSES}`);
