// Read-only Hardcover metadata adapter. Credentials are sent only in headers.
export const normalizeISBN = value => String(value ?? '').replace(/[^0-9Xx]/g, '').toUpperCase();
export async function fetchHardcoverPublicationDates(isbns, token, { request = globalThis.fetch, pause = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const records = new Map(), failures = new Map();
  const identifiers = [...new Set(isbns.map(normalizeISBN).filter(x => /^(\d{13}|\d{9}[\dX])$/.test(x)))];
  const query = `query PublicationDates($isbns: [String!]!) {
    editions(where: {_or: [{isbn_13: {_in: $isbns}}, {isbn_10: {_in: $isbns}}]}) {
      id title isbn_13 isbn_10 release_date release_year
      book { id slug title release_date release_year }
    }
  }`;
  let disabled;
  for (let offset = 0; offset < identifiers.length; offset += 25) {
    const batch = identifiers.slice(offset, offset + 25);
    if (disabled) { for (const isbn of batch) failures.set(isbn, disabled); continue; }
    try {
      let data;
      for (let attempt = 0; attempt < 3; attempt++) {
        await pause(1100);
        let response;
        try { response = await request('https://api.hardcover.app/v1/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.trim().replace(/^Bearer\s+/i, '')}`, 'User-Agent': 'PersonalLibraryPublicationDates/1.0' },
          body: JSON.stringify({ query, variables: { isbns: batch } }),
          signal: AbortSignal.timeout(20000)
        }); } catch (error) {
          if (attempt < 2) { await pause(2000 * (attempt + 1)); continue; }
          throw error;
        }
        if ((response.status === 429 || response.status >= 500) && attempt < 2) { await pause(2000 * (attempt + 1)); continue; }
        if (!response.ok) {
          const message = `Hardcover: HTTP ${response.status}`;
          if ([401, 403, 429].includes(response.status)) disabled = message;
          throw new Error(message);
        }
        const payload = await response.json();
        if (payload.errors?.length || !Array.isArray(payload.data?.editions)) throw new Error('Hardcover: GraphQL query failed or returned malformed edition data');
        data = payload.data.editions;
        break;
      }
      for (const isbn of batch) records.set(isbn, data.filter(edition => [edition.isbn_13, edition.isbn_10].some(value => normalizeISBN(value) === isbn)));
    } catch (error) {
      // Do not expose request headers or arbitrary server messages in reports.
      const message = error.message.startsWith('Hardcover:') ? error.message : 'Hardcover: network request failed';
      for (const isbn of batch) failures.set(isbn, message);
    }
  }
  return { records, failures };
}
export function hardcoverDateCandidates(editions) {
  const candidates = [];
  const seen = new Set();
  function add(field, record, source) {
    const sourceRaw = record.release_date || (record.release_year == null ? '' : String(record.release_year));
    if (!sourceRaw) return;
    // Imported first-of-month dates can encode partial knowledge. Never invent a day.
    const raw = /^\d{4}-01-01$/.test(sourceRaw) ? sourceRaw.slice(0, 4) : /^\d{4}-\d{2}-01$/.test(sourceRaw) ? sourceRaw.slice(0, 7) : sourceRaw;
    const key = `${field}:${record.id}:${raw}`;
    if (seen.has(key)) return;
    seen.add(key);
    const inconsistent = record.release_date && record.release_year && String(record.release_year) !== record.release_date.slice(0, 4);
    candidates.push({ field, raw, source, provider: 'Hardcover', recordId: record.id, ...(sourceRaw !== raw ? { sourceRaw, precisionNote: 'First-of-month date treated conservatively as partial metadata' } : {}), ...(inconsistent ? { reviewOnly: 'Hardcover release_date and release_year disagree' } : {}) });
  }
  for (const edition of editions) {
    const source = edition.book?.slug ? `https://hardcover.app/books/${encodeURIComponent(edition.book.slug)}/editions` : 'https://api.hardcover.app/v1/graphql';
    add('year', edition, source);
    if (edition.book) add('firstPublished', edition.book, edition.book.slug ? `https://hardcover.app/books/${encodeURIComponent(edition.book.slug)}` : source);
  }
  return candidates;
}
