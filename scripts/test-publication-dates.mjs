import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const helpers = html.slice(html.indexOf('  function parsePublicationDate('), html.indexOf('    // Parse free-text year for sorting:'));
const { parse, invalid, format } = vm.runInNewContext(helpers + '\n({ parse: parsePublicationDate, invalid: invalidPublicationDate, format: formatPublicationDate })');

test('partial dates preserve precision and validate calendars', () => {
  for (const [value, text] of [['1949', '1949'], ['1949-06', '1949-06'], ['1949-06-08', '1949-06-08'], ['8/6/1949', '1949-06-08'], ['2000-02-29', '2000-02-29']]) assert.equal(parse(value).text, text);
  for (const value of ['29/02/1900', '31/04/2020', '00/2020', '2020-13', '2020-01-00']) assert.equal(invalid(value), true, value);
  for (const value of ['', '65 CE', '400 BCE', '1st Century CE', 'c. 1800']) assert.equal(invalid(value), false);
});

test('published sorting includes month/day and preserves historical sorting', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const code = html.match(/    function parseYearForSort\(s\) \{[\s\S]*?\n    \}/)[0];
  const sort = vm.runInNewContext(code + '\nparseYearForSort', { parsePublicationDate: parse });
  assert.ok(sort('31/12/1948') < sort('01/01/1949'));
  assert.ok(sort('01/06/1949') < sort('1949-06-08'));
  assert.equal(sort('400 BCE'), -400);
  assert.equal(sort('65 CE'), 65);
});

test('backfill preserves conflicts, distinguishes work/edition and reports missing dates', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-test-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  const records = [
    { id: 'a', title: 'Example', isbn: '9781234567890', year: '2020', firstPublished: '1949' },
    { id: 'b', title: 'Conflict', isbn: '9781234567890', year: '2019', firstPublished: '65 CE' },
    { id: 'c', title: 'Unknown', isbn: '', year: '1800' }
  ];
  writeFileSync(input, JSON.stringify(records));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout;
  globalThis.setTimeout = (callback) => oldTimer(callback, 0);
  globalThis.fetch = async url => ({ ok: true, status: 200, json: async () => url.includes('/isbn/') ? { publish_date: 'April 3, 2020', works: [{ key: '/works/OL1W' }] } : { first_publish_date: 'June 1949' } });
  process.argv = ['node', 'script', '--no-hardcover', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs');
    const updated = JSON.parse(readFileSync(input));
    assert.equal(updated[0].year, '2020-04-03');
    assert.equal(updated[0].firstPublished, '1949');
    assert.equal(JSON.parse(readFileSync(report)).records[0].review[0].after, '1949-06');
    assert.deepEqual(updated[1], records[1]);
    assert.deepEqual(updated[2], records[2]);
    assert.equal(JSON.parse(readFileSync(report)).records.length, 3);
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('modal dates preserve precision and historical text', () => {
  for (const [value, expected] of [['2026-10-09', 'Oct 09, 2026'], ['8/6/1949', 'Jun 08, 1949'], ['1949-06', 'Jun 1949'], ['1949', '1949'], ['65 CE', '65 CE'], ['', '']]) {
    assert.equal(format(value), expected);
  }
});

// Exercise the actual filtering/sorting function with its UI inputs stubbed.
function publishedSorter(records) {
  const yearCode = html.match(/    function parseYearForSort\(s\) \{[\s\S]*?\n    \}/)[0];
  const filterCode = html.slice(html.indexOf('    function computeFilteredBooks() {'), html.indexOf('    // Main Render Function'));
  const context = {
    books: records,
    searchInput: { value: '' }, filterVolume: { value: '' }, filterStatus: { value: '' },
    sortSelect: { value: '' }, activeTags: new Set(), shuffledIds: null,
    parsePublicationDate: parse
  };
  const compute = vm.runInNewContext(yearCode + '\n' + filterCode + '\ncomputeFilteredBooks', context);
  return direction => {
    context.sortSelect.value = direction;
    return Array.from(compute(), b => b.id);
  };
}

test('published dropdown sorts full/partial dates, historical dates, originals and missing dates', () => {
  const specs = [
    ['missing', '', ''], ['modern-edition', '2026-10-19', '1949-06-08'],
    ['day-later', '1949-06-09', ''], ['month', '1949-06', ''], ['year', '1949', ''],
    ['bce', '400 BCE', ''], ['century', '1st Century CE', ''], ['ce', '65 CE', ''],
    ['approx', 'c. 1800', ''], ['slash', '07/06/1949', ''], ['unknown', 'Unknown', '']
  ];
  const sort = publishedSorter(specs.map(([id, year, firstPublished]) => ({ id, year, firstPublished })));
  const asc = ['bce', 'century', 'ce', 'approx', 'year', 'month', 'slash', 'modern-edition', 'day-later'];
  assert.deepEqual(sort('year-asc'), [...asc, 'missing', 'unknown']);
  assert.deepEqual(sort('year-desc'), [...asc].reverse().concat('missing', 'unknown'));
});

test('both published directions order every current JSON record correctly', () => {
  const records = JSON.parse(readFileSync(new URL('../books.json', import.meta.url), 'utf8'));
  // Independent integer key: YYYYMMDD, with absent month/day ordered first.
  function key(book) {
    const value = book.firstPublished || book.year;
    const iso = value.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    if (iso) return +iso[1] * 10000 + +(iso[2] || 0) * 100 + +(iso[3] || 0);
    const ce = value.match(/^(\d+) CE$/);
    assert.ok(ce, `Add independent expectation for ${value}`);
    return +ce[1] * 10000;
  }
  const sort = publishedSorter(records);
  for (const [direction, sign] of [['year-asc', 1], ['year-desc', -1]]) {
    const expected = [...records].sort((a, b) => sign * (key(a) - key(b))).map(b => b.id);
    assert.deepEqual(sort(direction), expected);
  }
});

test('Google exact matching, provider disagreements and quota isolation', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-providers-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  const records = ['9781234567890', '9781234567891', '9781234567892', '9781234567893'].map((isbn, i) => ({ id: String(i), title: `Book ${i}`, isbn, year: '2020', firstPublished: '' }));
  writeFileSync(input, JSON.stringify(records));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout;
  let googleCalls = 0;
  globalThis.setTimeout = callback => oldTimer(callback, 0);
  const ok = data => ({ ok: true, status: 200, json: async () => data });
  globalThis.fetch = async url => {
    if (url.includes('googleapis')) {
      googleCalls++;
      if (googleCalls === 3) return { ok: false, status: 429 };
      const isbn = '978123456789' + new URL(url).searchParams.get('q').match(/\d/)[0];
      return ok({ items: [
        { id: 'wrong', volumeInfo: { industryIdentifiers: [{ identifier: '9780000000000' }], publishedDate: '1999' } },
        { id: 'correct', volumeInfo: { industryIdentifiers: [{ identifier: isbn }], publishedDate: googleCalls === 1 ? '2020-04-03' : '2020-05-01' } }
      ] });
    }
    if (url.includes('9781234567890')) return { ok: false, status: 404 };
    return ok({ publish_date: '2020-04-03' });
  };
  process.argv = ['node', 'script', '--no-hardcover', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs?providers');
    const updated = JSON.parse(readFileSync(input));
    assert.equal(updated[0].year, '2020-04-03');
    assert.equal(updated[1].year, '2020');
    assert.equal(updated[2].year, '2020-04-03');
    assert.equal(updated[3].year, '2020-04-03');
    assert.equal(googleCalls, 3);
    assert.ok(JSON.parse(readFileSync(report)).records[1].issues.some(x => x.includes('providers disagree')));
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verified updates respect dry run, identity and existing edits, and are idempotent', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-verified-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json'), verified = path.join(dir, 'verified.json');
  const records = [{ id: 'a', title: 'Example', isbn: '9781234567890', year: '2020', firstPublished: '' }];
  writeFileSync(input, JSON.stringify(records));
  writeFileSync(verified, JSON.stringify({ verifiedAt: '2026-10-19', records: [{ ...records[0], changes: [
    { field: 'year', before: '2020', after: '2020-04-03', source: 'https://example.org/book', reason: 'Verified edition' },
    { field: 'firstPublished', before: '1999', after: '1999-01-02', source: 'https://example.org/book', reason: 'Stale expected value' }
  ] }] }));
  const oldArgs = process.argv;
  try {
    for (const [suffix, dry] of [['dry', true], ['apply', false], ['again', false]]) {
      process.argv = ['node', 'script', '--no-hardcover', '--verified-only', '--verified', verified, '--input', input, '--report', report, ...(dry ? ['--dry-run'] : [])];
      await import(`./fetch-publication-dates.mjs?verified-${suffix}`);
      const updated = JSON.parse(readFileSync(input));
      assert.equal(updated[0].year, dry ? '2020' : '2020-04-03');
      assert.equal(updated[0].firstPublished, '');
      if (suffix === 'again') assert.equal(JSON.parse(readFileSync(report)).records[0].changes.length, 0);
    }
  } finally {
    process.argv = oldArgs;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Google title searches fall back to the subtitle-stripped title and require an exact ISBN', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-fallback-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  writeFileSync(input, JSON.stringify([{ id: 'a', title: 'Example: Subtitle', author: 'An Author', isbn: '9781234567890', year: '2020', firstPublished: '1980' }]));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout;
  const queries = [];
  globalThis.setTimeout = callback => oldTimer(callback, 0);
  globalThis.fetch = async url => {
    const query = new URL(url).searchParams.get('q'); queries.push(query);
    // The full-title search only surfaces the wrong edition; the shortened title finds the owned ISBN.
    return { ok: true, status: 200, json: async () => query.includes('Subtitle') ? { items: [
      { id: 'other-edition', volumeInfo: { publishedDate: '1980', industryIdentifiers: [{ identifier: '9780000000000' }] } }
    ] } : { items: [
      { id: 'owned-edition', volumeInfo: { publishedDate: '2020-04-03', industryIdentifiers: [{ identifier: '9781234567890' }] } }
    ] } };
  };
  process.argv = ['node', 'script', '--no-hardcover', '--google-only', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs?fallback');
    const book = JSON.parse(readFileSync(input))[0];
    assert.deepEqual(queries, ['"Example: Subtitle" An Author', '"Example" An Author']);
    assert.equal(book.year, '2020-04-03');
    assert.equal(book.firstPublished, '1980');
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a year-only source agrees with a full stored date in the same year', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-precision-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  writeFileSync(input, JSON.stringify([{ id: 'a', title: 'Example', isbn: '9781234567890', year: '2020-04-03', firstPublished: '' }]));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout;
  globalThis.setTimeout = callback => oldTimer(callback, 0);
  globalThis.fetch = async url => url.includes('/isbn/')
    ? { ok: true, status: 200, json: async () => ({ publish_date: '2020', works: [] }) }
    : { ok: true, status: 200, json: async () => ({ items: [] }) };
  process.argv = ['node', 'script', '--no-hardcover', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs?precision');
    const result = JSON.parse(readFileSync(report)).records[0];
    assert.equal(result.changes.length, 0);
    assert.ok(!result.issues.some(x => x.includes('conflicting date')));
    assert.equal(JSON.parse(readFileSync(input))[0].year, '2020-04-03');
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Google queries avoid the broken fielded operators and accept ISBN-10/13 equivalents', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-google-forms-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  writeFileSync(input, JSON.stringify([
    { id: 'a', title: 'Example', author: 'An Author', isbn: '9781846140556', year: '2011', firstPublished: '' },
    { id: 'b', title: 'Second', author: 'Another Author', isbn: '1846140552', year: '2011', firstPublished: '' }
  ]));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout;
  const queries = [];
  globalThis.setTimeout = callback => oldTimer(callback, 0);
  globalThis.fetch = async url => {
    queries.push(new URL(url).searchParams.get('q'));
    return { ok: true, status: 200, json: async () => ({ items: [
      // Google lists this edition under its ISBN-10 even though the catalogue stores the ISBN-13.
      { id: 'owned', volumeInfo: { publishedDate: '2011-10-25', industryIdentifiers: [{ type: 'ISBN_10', identifier: '1846140552' }] } },
      // ...and this one under the ISBN-13 while the catalogue stores the ISBN-10.
      { id: 'owned-13', volumeInfo: { publishedDate: '2011-10-25', industryIdentifiers: [{ type: 'ISBN_13', identifier: '9781846140556' }] } }
    ] }) };
  };
  process.argv = ['node', 'script', '--no-hardcover', '--google-only', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs?google-forms');
    assert.ok(queries.length > 0);
    for (const query of queries) assert.ok(!/(^|\s)(isbn|intitle|inauthor|inpublisher|lccn|oclc):/i.test(query), `fielded operator in ${query}`);
    const updated = JSON.parse(readFileSync(input));
    assert.equal(updated[0].year, '2011-10-25');
    assert.equal(updated[1].year, '2011-10-25');
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('transient Google outages are retried before a date is reported missing', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-google-retry-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  writeFileSync(input, JSON.stringify([{ id: 'a', title: 'Example', author: 'An Author', isbn: '9781234567890', year: '2020', firstPublished: '' }]));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout;
  let calls = 0;
  globalThis.setTimeout = callback => oldTimer(callback, 0);
  globalThis.fetch = async () => {
    if (++calls <= 2) return { ok: false, status: 503 };
    return { ok: true, status: 200, json: async () => ({ items: [
      { id: 'owned', volumeInfo: { publishedDate: '2020-04-03', industryIdentifiers: [{ identifier: '9781234567890' }] } }
    ] }) };
  };
  process.argv = ['node', 'script', '--no-hardcover', '--google-only', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs?google-retry');
    assert.equal(calls, 3);
    assert.equal(JSON.parse(readFileSync(input))[0].year, '2020-04-03');
    assert.ok(!JSON.parse(readFileSync(report)).records[0].issues.some(x => x.includes('503')));
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Hardcover batches and deduplicates ISBNs and rejects unrelated editions', async () => {
  const { fetchHardcoverPublicationDates } = await import('./hardcover-publication-dates.mjs');
  const identifiers = Array.from({ length: 26 }, (_, i) => String(9781234567800 + i));
  const calls = [];
  const { records, failures } = await fetchHardcoverPublicationDates([...identifiers, identifiers[0], '', 'bad'], 'Bearer test-secret', {
    pause: async () => {},
    request: async (url, options) => {
      const batch = JSON.parse(options.body).variables.isbns;
      calls.push(batch);
      assert.equal(options.headers.Authorization, 'Bearer test-secret');
      return { ok: true, status: 200, json: async () => ({ data: { editions: [
        { id: 1, isbn_13: batch[0], release_date: '2020-04-03' },
        { id: 2, isbn_13: '9780000000000', release_date: '1990-01-01' }
      ] } }) };
    }
  });
  assert.deepEqual(calls.map(x => x.length), [25, 1]);
  assert.equal(failures.size, 0);
  assert.equal(records.get(identifiers[0]).length, 1);
  assert.equal(records.get(identifiers[1]).length, 0);
  assert.equal(records.get(identifiers[25]).length, 1);
});

test('Hardcover retries throttling and isolates authentication and GraphQL failures', async () => {
  const { fetchHardcoverPublicationDates } = await import('./hardcover-publication-dates.mjs');
  let calls = 0;
  const retried = await fetchHardcoverPublicationDates(['9781234567890'], 'test', {
    pause: async () => {}, request: async () => ++calls === 1 ? { ok: false, status: 429 } : { ok: true, status: 200, json: async () => ({ data: { editions: [] } }) }
  });
  assert.equal(calls, 2);
  assert.equal(retried.failures.size, 0);
  calls = 0;
  const denied = await fetchHardcoverPublicationDates(Array.from({ length: 26 }, (_, i) => String(9781234567800 + i)), 'test', {
    pause: async () => {}, request: async () => { calls++; return { ok: false, status: 401 }; }
  });
  assert.equal(calls, 1);
  assert.equal(denied.failures.size, 26);
  const malformed = await fetchHardcoverPublicationDates(['9781234567890'], 'secret', {
    pause: async () => {}, request: async () => ({ ok: true, status: 200, json: async () => ({ data: { editions: [] }, errors: [{ message: 'secret' }] }) })
  });
  assert.equal(malformed.records.size, 0);
  assert.ok(!JSON.stringify([...malformed.failures]).includes('secret'));
  calls = 0;
  const recovered = await fetchHardcoverPublicationDates(['9781234567890'], 'test', {
    pause: async () => {}, request: async () => {
      if (++calls === 1) throw new Error('temporary network failure');
      return { ok: true, status: 200, json: async () => ({ data: { editions: [] } }) };
    }
  });
  assert.equal(calls, 2);
  assert.equal(recovered.failures.size, 0);
});

test('Hardcover distinguishes original and edition, preserves precision and flags inconsistent years', async () => {
  const { hardcoverDateCandidates } = await import('./hardcover-publication-dates.mjs');
  const candidates = hardcoverDateCandidates([
    { id: 1, release_date: '2020-04-03', book: { id: 2, slug: 'example', release_date: '1949-01-01', release_year: 1949 } },
    { id: 3, release_year: 2021, book: { id: 2, slug: 'example', release_date: '1949-01-01', release_year: 1949 } },
    { id: 4, release_date: '2020-04-03', release_year: 2019 },
    { id: 5, release_date: '2020-05-01' }
  ]);
  assert.equal(candidates.filter(x => x.field === 'firstPublished').length, 1);
  assert.equal(candidates.find(x => x.field === 'firstPublished').raw, '1949');
  assert.equal(candidates.find(x => x.recordId === 3).raw, '2021');
  assert.ok(candidates.find(x => x.recordId === 4).reviewOnly);
  assert.equal(candidates.find(x => x.recordId === 5).raw, '2020-05');
});

test('Hardcover-only backfill applies compatible edition precision and reviews original dates', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'publication-hardcover-'));
  const input = path.join(dir, 'books.json'), report = path.join(dir, 'report.json');
  writeFileSync(input, JSON.stringify([
    { id: 'a', title: 'Example', isbn: '9781234567890', year: '2020', firstPublished: '1949' },
    { id: 'b', title: 'Other', isbn: '9781234567891', year: '2020', firstPublished: '1950' },
    { id: 'c', title: 'Known incorrect source record', isbn: '9781953953568', year: '2025', firstPublished: '' }
  ]));
  const oldFetch = globalThis.fetch, oldArgs = process.argv, oldTimer = globalThis.setTimeout, oldToken = process.env.HARDCOVER_TOKEN;
  globalThis.setTimeout = callback => oldTimer(callback, 0);
  process.env.HARDCOVER_TOKEN = 'test-secret';
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.hardcover.app/v1/graphql');
    assert.equal(options.method, 'POST');
    return { ok: true, status: 200, json: async () => ({ data: { editions: [
      { id: 1, isbn_13: '9781234567890', release_date: '2020-04-03', book: { id: 2, slug: 'example', release_date: '1949-06-08' } },
      { id: 3, isbn_13: '9781234567891', release_date: '2019-04-03', book: { id: 4, slug: 'other', release_date: '1950-01-01' } },
      { id: 32163022, isbn_13: '9781953953568', release_date: '2025-03-25' }
    ] } }) };
  };
  process.argv = ['node', 'script', '--hardcover-only', '--input', input, '--report', report];
  try {
    await import('./fetch-publication-dates.mjs?hardcover');
    const updated = JSON.parse(readFileSync(input)), result = JSON.parse(readFileSync(report));
    assert.equal(updated[0].year, '2020-04-03');
    assert.equal(updated[0].firstPublished, '1949');
    assert.equal(result.records[0].review[0].after, '1949-06-08');
    assert.equal(updated[1].year, '2020');
    assert.ok(result.records[1].issues.some(x => x.includes('conflicting date')));
    assert.equal(updated[2].year, '2025');
    assert.ok(result.records[2].review[0].reason.includes('Publisher'));
    assert.ok(!readFileSync(report, 'utf8').includes('test-secret'));
  } finally {
    globalThis.fetch = oldFetch; process.argv = oldArgs; globalThis.setTimeout = oldTimer;
    if (oldToken === undefined) delete process.env.HARDCOVER_TOKEN; else process.env.HARDCOVER_TOKEN = oldToken;
    rmSync(dir, { recursive: true, force: true });
  }
});
