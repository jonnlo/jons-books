#!/usr/bin/env node
// Node 18+. One-time JSON enrichment. --dry-run reports without editing.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fetchHardcoverPublicationDates, hardcoverDateCandidates, normalizeISBN } from './hardcover-publication-dates.mjs';
  function parsePublicationDate(value) {
    const text = String(value ?? '').trim();
    let m = text.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    if (!m) {
      const slash = text.match(/^(?:(\d{1,2})\/)?(\d{1,2})\/(\d{4})$/);
      if (slash) m = [text, slash[3], slash[2], slash[1]];
    }
    if (!m) return null;
    const year = +m[1], month = m[2] ? +m[2] : 0, day = m[3] ? +m[3] : 0;
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (!year || (m[2] && (month < 1 || month > 12)) || (m[3] && (day < 1 || day > days[month - 1]))) return null;
    return { year, month, day, precision: day ? 3 : month ? 2 : 1,
      sort: year + month / 100 + day / 10000,
      text: `${m[1]}${month ? '-' + String(month).padStart(2, '0') : ''}${day ? '-' + String(day).padStart(2, '0') : ''}` };
  }
  function invalidPublicationDate(value) {
    const text = String(value ?? '').trim();
    return !!text && /^[\d/\-]+$/.test(text) && !parsePublicationDate(text);
  }
  // Catalogue records list either ISBN-10 or ISBN-13 for the same edition, so match
  // against every form of the owned ISBN before rejecting a provider result.
  function isbnForms(value) {
    const text = normalizeISBN(value);
    const forms = new Set(text ? [text] : []);
    if (/^\d{13}$/.test(text) && text.startsWith('978')) {
      const core = text.slice(3, 12);
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += (+core[i]) * (10 - i);
      const check = (11 - (sum % 11)) % 11;
      forms.add(core + (check === 10 ? 'X' : String(check)));
    } else if (/^\d{9}[\dX]$/.test(text)) {
      const core = '978' + text.slice(0, 9);
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += (+core[i]) * (i % 2 ? 3 : 1);
      forms.add(core + String((10 - (sum % 10)) % 10));
    }
    return [...forms];
  }


const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node scripts/fetch-publication-dates.mjs [--dry-run] [--google-only | --hardcover-only] [--no-hardcover] [--verified-only] [--verified FILE] [--limit N] [--input books.json] [--report publication-dates-report.json]');
  process.exit(0);
}
// Environment overrides the repository-local, Git-ignored key file.
let googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();
if (!googleBooksKey) {
  try {
    googleBooksKey = readFileSync(new URL('../.google-books-api-key', import.meta.url), 'utf8').trim();
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Cannot read local Google Books key file');
  }
}
let hardcoverToken = process.env.HARDCOVER_TOKEN?.trim();
if (!hardcoverToken && !args.includes('--no-hardcover')) {
  try { hardcoverToken = readFileSync(new URL('../.hardcover-token', import.meta.url), 'utf8').trim(); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Cannot read local Hardcover token file'); }
}
if (args.includes('--google-only') && args.includes('--hardcover-only')) throw new Error('Choose only one provider-only flag');
if (args.includes('--hardcover-only') && (args.includes('--no-hardcover') || !hardcoverToken)) throw new Error('--hardcover-only requires HARDCOVER_TOKEN or .hardcover-token');
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const input = option('--input', fileURLToPath(new URL('../books.json', import.meta.url)));
const reportPath = option('--report', fileURLToPath(new URL('../publication-dates-report.json', import.meta.url)));
const limit = Number(option('--limit', Infinity));
if (!(limit > 0)) throw new Error('--limit must be positive');
const original = readFileSync(input, 'utf8');
const books = JSON.parse(original);
const parse = parsePublicationDate;
const cache = new Map();
const disabledProviders = new Map();
const MAX_RETRIES = 2;
async function get(url, attempt = 0) {
  const host = new URL(url).hostname;
  if (disabledProviders.has(host)) throw new Error(disabledProviders.get(host));
  if (cache.has(url)) return cache.get(url);
  const retry = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
    return get(url, attempt + 1);
  };
  await new Promise(resolve => setTimeout(resolve, 1100));
  let response;
  try {
    response = await fetch(url, { headers: { 'User-Agent': 'PersonalLibraryPublicationDates/1.0' }, signal: AbortSignal.timeout(20000) });
  } catch (error) {
    // Network failures and timeouts are transient; only the final failure is reported.
    if (attempt < MAX_RETRIES) return retry();
    throw error;
  }
  const safeUrl = new URL(url);
  safeUrl.searchParams.delete('key');
  if (response.status === 404) { cache.set(url, null); return null; }
  if (response.status === 429) disabledProviders.set(host, `Provider quota exceeded: ${host}`);
  // Provider outages surface as 5xx or as empty payloads; retry the transient ones.
  if (!response.ok && attempt < MAX_RETRIES && (response.status >= 500 || response.status === 408)) return retry();
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${safeUrl}`);
  const data = await response.json();
  cache.set(url, data);
  return data;
}
// Parse only explicit dates; never let Date.parse invent missing components.
function sourceDate(raw) {
  const direct = parse(raw);
  if (direct) return direct;
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const text = String(raw ?? '').toLowerCase().replace(/,/g, '').trim();
  let m = text.match(/^([a-z]+) (?:(\d{1,2}) )?(\d{4})$/);
  if (!m) {
    const reversed = text.match(/^(\d{1,2}) ([a-z]+) (\d{4})$/);
    if (reversed) m = [text, reversed[2], reversed[1], reversed[3]];
  }
  if (!m) return null;
  const month = months.findIndex(name => name === m[1] || name.slice(0, 3) === m[1]) + 1;
  return month ? parse(`${m[3]}-${String(month).padStart(2, '0')}${m[2] ? '-' + m[2].padStart(2, '0') : ''}`) : null;
}
let hardcoverRejections = [];
try { hardcoverRejections = JSON.parse(readFileSync(new URL('./hardcover-date-rejections.json', import.meta.url), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw new Error('Cannot read Hardcover date rejections'); }
const report = [];
const hardcoverEnabled = !!hardcoverToken && !args.includes('--no-hardcover') && !args.includes('--google-only') && !args.includes('--verified-only');
const hardcover = hardcoverEnabled ? await fetchHardcoverPublicationDates(books.slice(0, limit).map(book => book.isbn), hardcoverToken) : null;
for (const book of (args.includes('--verified-only') ? [] : books.slice(0, limit))) {
  const row = { id: book.id, title: book.title, changes: [], issues: [] };
  report.push(row);
  const isbn = String(book.isbn ?? '').replace(/[^0-9Xx]/g, '');
  if (!/^(\d{13}|\d{9}[\dXx])$/.test(isbn)) { row.issues.push('No usable ISBN; manual research required'); continue; }
  const candidates = [];
  if (!args.includes('--google-only') && !args.includes('--hardcover-only')) try {
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    const edition = await get(url);
    if (!edition) row.issues.push('Open Library: ISBN not found');
    else candidates.push({ field: 'year', raw: edition.publish_date, source: url });
    if (edition?.works?.length === 1 && /^\/works\/OL\d+W$/.test(edition.works[0].key)) {
      const workUrl = `https://openlibrary.org${edition.works[0].key}.json`;
      const work = await get(workUrl);
      candidates.push({ field: 'firstPublished', raw: work?.first_publish_date, source: workUrl });
    } else row.issues.push('No unambiguous work link for first publication');
  } catch (error) { row.issues.push(error.message); }
  if (!args.includes('--hardcover-only')) try {
    const clean = value => String(value ?? '').replace(/["\\]/g, ' ').trim();
    // Google Books' fielded operators (isbn:, intitle:, inauthor:) return HTTP 200
    // with zero items since October 2026, so search with unfielded terms and prove
    // the match by requiring the owned ISBN on the result. Quoting the full title
    // first keeps subtitle editions findable; the subtitle-stripped retry catches
    // editions catalogued under a shorter title.
    const full = clean(book.title);
    const short = clean(String(book.title ?? '').split(':')[0]);
    const author = clean(book.author);
    const quoted = title => author ? `"${title}" ${author}` : `"${title}"`;
    const queries = [];
    if (full) queries.push(quoted(full));
    if (short && short !== full) queries.push(quoted(short));
    const forms = new Set(isbnForms(isbn));
    let matches = [];
    for (const query of queries) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40`;
      const data = await get(googleBooksKey ? `${url}&key=${encodeURIComponent(googleBooksKey)}` : url);
      matches = (data?.items ?? []).filter(item => item.volumeInfo?.industryIdentifiers?.some(identifier => forms.has(normalizeISBN(identifier.identifier))));
      if (matches.length) break;
    }
    if (!matches.length) row.issues.push('Google Books: no exact ISBN match after fallback searches');
    for (const item of matches) candidates.push({ field: 'year', raw: item.volumeInfo.publishedDate, source: `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(item.id)}` });
  } catch (error) { row.issues.push(error.message); }
  if (hardcover) {
    const matches = hardcover.records.get(isbn.toUpperCase()) ?? [];
    if (hardcover.failures.has(isbn.toUpperCase())) row.issues.push(hardcover.failures.get(isbn.toUpperCase()));
    else if (!matches.length) row.issues.push('Hardcover: no exact ISBN edition match');
    for (const candidate of hardcoverDateCandidates(matches)) {
      const rejection = hardcoverRejections.find(entry => entry.isbn === isbn && entry.field === candidate.field && entry.recordId === candidate.recordId && entry.raw === (candidate.sourceRaw ?? candidate.raw));
      candidates.push(rejection ? { ...candidate, reviewOnly: rejection.reason, verificationSource: rejection.source } : candidate);
    }
  }
  row.candidates = candidates;
  // Conflicting providers must not silently select whichever was queried first.
  const dates = candidates.filter(c => c.field === 'year' && !c.reviewOnly).map(c => sourceDate(c.raw)).filter(Boolean);
  const disagreement = dates.some(a => dates.some(b => a.year !== b.year || (a.month && b.month && a.month !== b.month) || (a.day && b.day && a.day !== b.day)));
  if (disagreement) row.issues.push('Edition providers disagree; date preserved for review');
    for (const candidate of candidates) {
      const { field, raw, source } = candidate;
      if (candidate.reviewOnly) {
        (row.review ??= []).push({ ...candidate, before: String(book[field] ?? ''), reason: candidate.reviewOnly });
        continue;
      }
      if (field === 'year' && disagreement) continue;
      const next = sourceDate(raw), before = String(book[field] ?? '').trim(), previous = parse(before);
      if (!next) { row.issues.push(`${field}: no explicit supported date available`); continue; }
      // A year-only source agrees with a fuller stored date in the same year; only
      // components both sources state can conflict (same rule as the provider check above).
      if (before && (!previous || previous.year !== next.year || (previous.month && next.month && previous.month !== next.month) || (previous.day && next.day && previous.day !== next.day))) {
        row.issues.push(`${field}: conflicting date ${JSON.stringify(raw)} (${source}); preserved ${before}`); continue;
      }
      if (previous && previous.precision >= next.precision) continue;
      if (field === 'firstPublished') {
        (row.review ??= []).push({ field, before, after: next.text, raw, source, reason: 'Work metadata can describe a later edition; independently verify original publication before applying' });
        continue;
      }
      const originalDate = parse(book.firstPublished);
      if (field === 'year' && originalDate && next.year < originalDate.year) {
        row.issues.push('year: edition predates verified original publication; preserved'); continue;
      }
      row.changes.push({ ...candidate, field, before, after: next.text, raw, source });
      book[field] = next.text;
    }
  console.error(`${report.length}/${Math.min(books.length, limit)} ${book.title}: ${row.changes.length} improvements`);
}
// Explicitly researched records use optimistic guards, so reruns cannot overwrite edits.
if (args.includes('--verified') || args.includes('--verified-only')) {
  const verifiedPath = option('--verified', fileURLToPath(new URL('../publication-dates-verified.json', import.meta.url)));
  const verified = JSON.parse(readFileSync(verifiedPath, 'utf8'));
  for (const entry of verified.records) {
    const book = books.slice(0, limit).find(b => b.id === entry.id);
    if (!book) continue;
    let row = report.find(r => r.id === book.id);
    if (!row) { row = { id: book.id, title: book.title, changes: [], issues: [] }; report.push(row); }
    if (book.title !== entry.title || book.isbn !== entry.isbn) {
      row.issues.push('Verified record identity changed; preserved'); continue;
    }
    for (const change of entry.changes) {
      if (!['year', 'firstPublished'].includes(change.field) || !parse(change.after) || !change.source?.startsWith('https://') || !change.reason) throw new Error('Invalid verified change');
      const before = String(book[change.field] ?? '');
      if (before === change.after) continue;
      if (before !== change.before) { row.issues.push(`${change.field}: changed since verification; preserved ${before}`); continue; }
      row.changes.push({ ...change, before, verifiedAt: verified.verifiedAt });
      book[change.field] = change.after;
    }
  }
}
writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), records: report }, null, 2) + '\n');
if (!args.includes('--dry-run')) {
  if (readFileSync(input, 'utf8') !== original) throw new Error('Input changed during lookup; report saved, books not overwritten');
  writeFileSync(input + '.tmp', JSON.stringify(books, null, 2) + '\n');
  renameSync(input + '.tmp', input);
}
console.log(`Saved ${reportPath}; ${report.reduce((n, row) => n + row.changes.length, 0)} improvements${!args.includes('--dry-run') ? ' applied' : ' proposed (dry run)'}.`);
