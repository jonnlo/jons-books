# jon's books

A personal book-library web app — built for my own reading collection, but free for anyone to download, run, and customize. It's a single static HTML file with no build step: the same file is a full editor locally and a read-only site when deployed.

**Live site:** https://jonnlo.github.io/jons-books/

## About

This started as a personal project to track and browse my reading — 223 books organized into reading volumes and stages, with tags, publisher summaries, and cover images. You can browse the collection on the live site above, or clone this repo and run your own copy locally, where you get the full editing UI to add, organize, and reorder books in your own catalog.

### Features

- **Two views:** a visual **Grid** of cover cards and a **Volumes** ("roadmap") view that groups books into reading volumes and stages.
- **Active Books:** three "reading engine" tracks — Deep Focus, Complementary, Exploration — that pin currently-read books.
- **Search & filter:** full-text search (title, author, stage, notes, ISBN), plus **volume**, **status**, and multi-select **tag** filters.
- **Sorting:** reading order (volume → stage → order), year (newest/oldest), title (A–Z) — plus **Random** mode with a **Shuffle** button and a **Surprise Me** pick.
- **Edit / View modes:** flip between maintaining the library and read-only browsing on the same data.
- **Book details modal:** cover, volume/stage, reading order, publisher **summary** (collapsible), notes, tags, and ISBN links to Google Books and Goodreads.
- **Status tracking:** opt-in *To Read / Reading / Completed*, with distinct pill styles — To Read neutral, Reading accent outline, Completed solid accent fill.
- **Covers:** local JPEGs in `covers/`, uploaded via a click-or-drop zone (drag in a cover image file or even a raw image URL).
- **Dark / light themes**, with browser-chrome tinting tuned for iOS Safari 26.
- **Accessibility:** focus-trapped modals, ARIA labels, keyboard/Escape support, touch drag-to-dismiss on mobile, and `prefers-reduced-motion` support.

### How it works: one file, two modes

`index.html` is the whole app — HTML, CSS, and JavaScript in a single static file. There's no build step, no bundler, and no server code. The same file behaves differently depending on where it's opened:

| | Local (`file://` or localhost) | Public (any other host) |
|---|---|---|
| Data | `localStorage`, bootstrapped from `books.json` | `books.json` fetched at runtime |
| Mode | **Edit | View** toggle in the header | Always view-only; toggle hidden |
| Clicks on a book | Edit mode → edit modal; View mode → read-only details | Read-only details modal |

## Download & run it locally

Clone or download this repo to your machine, then serve the folder:

```sh
# 1. Go to the project root — the folder that contains index.html
#    (change this to your actual path)
cd /your/project/root

# 2. Serve the folder
python3 -m http.server 8123
```

- **http://localhost:8123** → local (editor) mode.
- **http://localtest.me:8123** → exercises *public* mode (the hostname resolves to 127.0.0.1 without being "localhost"), handy for verifying the view-only behavior before pushing.
- Opening `index.html` directly via `file://` also works in local mode: browsers block fetching `books.json` there, so on first run the app shows a **"Choose books.json"** banner — pick the file once to load the catalog.

Everything you edit lives in `localStorage`; **Export** writes it back to `books.json` (Chrome/Edge can write the file directly via the File System Access API; other browsers download it). An **Edit | View** toggle switches between maintaining the library and read-only browsing — both modes share the same in-memory data, so unsaved edits still show in View.

### Using the app

- **Add a book:** `+ Add Book` in the toolbar → fill in title/author/year/ISBN, volume & stage, status, engine, tags, notes, and summary; optionally upload a cover via the click-or-drop zone (drag in an image file or a raw image URL).
- **Edit a book:** click any card in Grid view (in Edit mode) → the edit modal opens prefilled (with a **Delete Book** button for removal). Closing it with unsaved changes prompts a confirmation first.
- **Reorder:** switch to the **Volumes** view and drag & drop books between volumes and stages.
- **Assign status / engine:** via the add/edit form. A status pill only renders on cards that have one — status is opt-in.
- **Tags:** added in the edit form via a type-ahead dropdown with suggestions (Enter or comma commits a tag; the list is pre-filled with existing tags).
- **Save your changes:** **Export** writes the current `localStorage` state back to `books.json`. The app shows an **Export Now** reminder when you have unsaved changes, and **Check for Updates** compares your local copy against the on-disk/remote `books.json` (it can read the file directly via the File System Access API when opened from `file://`).

All editing controls live in the toolbar and are hidden on the public site.

### Data model (`books.json`)

`books.json` is the committed source of truth (`catalog.csv` and `CSV/` are legacy backups and are gitignored). It's an array of book objects; a complete book looks like:

```json
{
  "id": "1786171495955",
  "title": "Tools for Conviviality",
  "author": "Ivan Illich",
  "year": "1973",
  "isbn": "9781842300114",
  "cover": "covers/1786171495955.jpg",
  "status": "",
  "volumeNumber": 3,
  "volumeName": "The Designer",
  "stageNumber": 6,
  "stageName": "Broader Creative and Cultural Context",
  "readingOrder": 5,
  "engine": "None",
  "tags": ["design"],
  "notes": "",
  "summary": "**Tools for Conviviality** is a 1973 book by Ivan Illich..."
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique id (timestamp); also the cover filename |
| `title` | string | |
| `author` | string | |
| `year` | string | |
| `isbn` | string | Empty when unknown |
| `cover` | string | `covers/<id>.jpg`, or `""` for the generated CSS-jacket fallback |
| `status` | string | Opt-in: `""` (none), `To Read`, `Reading`, `Completed` |
| `volumeNumber` / `volumeName` | number / string | Reading volume |
| `stageNumber` / `stageName` | number / string | Stage within the volume |
| `readingOrder` | number | Order within the stage |
| `engine` | string | `None`, or e.g. `Engine 1: Deep Focus` |
| `tags` | string[] | Lowercase, trimmed, deduped |
| `notes` | string | Free-text notes |
| `summary` | string | Publisher blurb (`""` when none) |

Current catalog: **223 books** across **7 volumes** and **41 stages**, with a **28-tag** vocabulary. Imports and the public fetch both normalize records through the same code path, so optional fields get sensible defaults on load.

### Scripts (dev tooling)

Both scripts are Node ESM and run from the repo root. Neither is part of the app itself — they were used for one-time data migrations and backfills.

#### `scripts/migrate-covers.mjs`

Downloads external cover URLs from `books.json` into local `covers/<id>.jpg` (downscaled JPEG, ≤800px wide, height uncapped), then rewrites each book's `cover` field to the local path. Idempotent — skips covers that already start with `covers/`.

```sh
node scripts/migrate-covers.mjs                                          # migrate remaining external URLs
node scripts/migrate-covers.mjs --force --source <old-books.json>        # re-download existing covers (uses the old file for the original URLs)
```

Requires **Node 18+** and the `sharp` dependency (`npm install` in `scripts/`).

#### `scripts/hardcover-summary.mjs`

Fetches publisher blurbs from the [Hardcover GraphQL API](https://docs.hardcover.app/api/getting-started) and backfills the `summary` field in `books.json`.

```sh
HARDCOVER_TOKEN=... node scripts/hardcover-summary.mjs <isbn>                # single lookup
HARDCOVER_TOKEN=... node scripts/hardcover-summary.mjs --backfill            # fill all missing summaries
HARDCOVER_TOKEN=... node scripts/hardcover-summary.mjs --backfill --force    # re-fetch flat (single-paragraph) summaries
HARDCOVER_TOKEN=... node scripts/hardcover-summary.mjs --backfill --dry-run  # report only, no writes
```

The token is read from the `HARDCOVER_TOKEN` env var or a gitignored `.hardcover-token` file (never committed). Requests are throttled to ~1/second to stay under Hardcover's 60/min limit. Misses are logged to `scripts/hardcover-summary-misses.txt` (gitignored).

## Deploy it publicly

The public site is served from GitHub Pages, driven by `.github/workflows/deploy.yml`:

- Stages `_site/` = `index.html` + `books.json` + the `covers/` folder.
- Deploys via `actions/deploy-pages`, with `workflow_dispatch` available for manual runs.
- Triggers on pushes to `main` touching `books.json`, `index.html`, `scripts/**`, `covers/**`, or the workflow file.

Live: **https://jonnlo.github.io/jons-books/** — the deploy turns this same file into the public, view-only site.
