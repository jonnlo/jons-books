# TODO: Wire `created` (date added) into the app

**Status:** DONE (2026-08-24) — migration + app wiring both complete.
Items 1–3 below are implemented in `index.html`; item 4's "show Added in the
detail modal" remains optional/not requested.
`books.json` now carries a `created` field (ISO datetime, e.g. `"2026-08-22T16:40:54.794Z"`)
on 216 of 232 books, backfilled from each book's epub file creation date via
`scripts/add-created-dates.mjs` (one-time; dry-run by default, `--write` to apply).
Backup taken before the run: `bkup/books_backup_2026-08-24_pre-created-dates.json`.
The 16 books without a `created` value have no top-level epub in
`~/Library/Mobile Documents/com~apple~CloudDocs/books from jon` (PDF-only,
in a subfolder, or not present) — they should sort last, not break anything.

## Code changes needed in `index.html`

1. **[x] `normalizeBook()` preserves the field** (it rebuilds each book with an
   explicit field list, so unknown fields are silently dropped on every load):
   - added `created: b.created || ""` alongside the other defaults.

2. **[x] Write `created` when adding a new book** (the user-facing goal: new books
   get their date automatically):
   - in the `bookForm` submit handler, new books (`existing === null`) get
     `created: new Date().toISOString()`;
   - edits keep the original `created` untouched;
   - books restored/imported without a `created` keep `""`.

3. **[x] Sort options** (`#sort-select`):
   - added `<option value="created-desc">Date Added (Newest First)</option>` +
     `<option value="created-asc">Date Added (Oldest First)</option>`;
   - handled in `computeFilteredBooks()`: sorts by `Date.parse(created)`, books
     with empty `created` go LAST regardless of direction;
   - participates in the existing view↔sort coupling for free
     (`lastGridSort`/`syncViewFromSort` are value-agnostic); the filter badge
     counts it as a non-default sort.

4. **Persistence notes:**
   - `exportJson()` serializes localStorage books as-is, so `created` survives
     export once (1) is in place;
   - existing localStorage copies bootstrapped BEFORE this change won't have
     `created` until the updated `books.json` is imported (or storage reset) —
     same situation as the `summary`/`pages` rollouts;
   - optional: show "Added" in the read-only detail modal (not requested yet).

## Verification checklist (when implemented)

- Fresh load (public + local): no console errors, 216 books carry dates.
- Sort dropdown: Date Added newest→oldest correct; 16 undated books last.
- Add a test book → its `created` ≈ now; export → field present in books.json.
- Edit an old book → its original `created` unchanged.
