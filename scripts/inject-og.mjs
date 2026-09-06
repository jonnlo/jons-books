#!/usr/bin/env node
// Deploy-time OG injection for the static GitHub Pages site.
//
// Crawlers (iMessage, WhatsApp, X, Facebook, Google) do NOT run JavaScript,
// so the og: tags in index.html must already carry the deployer's values in
// the served HTML. This script rewrites the `og:sync` span of the STAGED
// index.html (never the source) from the deployer's site.json and GitHub's
// own Pages URL — so any fork redeploys with correct previews and zero
// manual steps:
//   - og:title / og:site_name / twitter:title   <- site.json title
//   - og:description / twitter:description /
//     meta description                          <- site.json ogDescription,
//                                                 only when non-empty (the
//                                                 committed HTML already has
//                                                 the static default)
//   - og:image / twitter:image                  <- <base-url>/og-card.jpg?v=<sha1-10>
//                                                 (content hash cache-bust)
//   - og:image:alt / twitter:image:alt          <- "A grid of book covers from <title>"
//   - og:url / <link rel=canonical>             <- <base-url>/
//   - window.__BAKED_THEME + <html data-theme>  <- site.json theme, ONLY when
//                                                 forced light/dark ('system'
//                                                 or missing bakes null — the
//                                                 page resolves the OS
//                                                 preference live at boot)
//
// Usage (in deploy.yml, after staging _site/):
//   node scripts/inject-og.mjs --dir _site --base-url "${{ steps.pages.outputs.base_url }}"

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : null;
}

const dir = argValue('--dir') || '_site';
const baseUrl = (argValue('--base-url') || '').replace(/\/+$/, '');
if (!baseUrl) {
  console.error('inject-og: --base-url is required');
  process.exit(1);
}

const htmlPath = path.join(dir, 'index.html');
const sitePath = path.join(dir, 'site.json');
const cardPath = path.join(dir, 'og-card.jpg');

let html;
try {
  html = fs.readFileSync(htmlPath, 'utf8');
} catch {
  console.error(`inject-og: cannot read ${htmlPath}`);
  process.exit(1);
}

const SPAN_RE = /<!-- og:sync:start -->([\s\S]*?)<!-- og:sync:end -->/;
const spanMatch = html.match(SPAN_RE);
if (!spanMatch) {
  console.error('inject-og: og:sync span not found in index.html');
  process.exit(1);
}

// site.json is optional in the artifact (older forks): fall back to leaving
// title/description as committed and only patching the URL-dependent tags.
let settings = {};
let haveSettings = false;
try {
  const parsed = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    settings = parsed;
    haveSettings = true;
  }
} catch {
  console.warn('inject-og: site.json missing or invalid — leaving title/description as committed');
}
const title = (haveSettings && typeof settings.title === 'string' && settings.title.trim())
  ? settings.title.trim() : null;
const ogDescription = (haveSettings && typeof settings.ogDescription === 'string')
  ? settings.ogDescription.trim() : '';

// Short content hash of og-card.jpg → ?v= cache-bust. Platforms cache og
// images per URL, so a changed card MUST get a changed URL to be re-fetched.
let version = '1';
try {
  const bytes = fs.readFileSync(cardPath);
  version = crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 10);
} catch {
  console.warn('inject-og: og-card.jpg not found in staging — og:image will 404 until it is committed');
}

// HTML-attribute escaping: injected values may contain &, quotes, angle brkts.
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Replace `attr="…"` of a specific meta tag inside the span. Values are
// escaped first, so the regex works on the escaped form (no raw quotes).
function setMeta(span, selector, value) {
  const re = new RegExp(`(<meta[^>]*${selector}[^>]*content=")([^"]*)(")`);
  if (!re.test(span)) {
    console.warn(`inject-og: no meta matches ${selector} — skipped`);
    return span;
  }
  return span.replace(re, (_m, pre, _old, post) => `${pre}${esc(value)}${post}`);
}

let span = spanMatch[1];

if (title) {
  span = span.replace(/(<meta[^>]*property="og:title"[^>]*content=")[^"]*(")/, `$1${esc(title)}$2`);
  span = span.replace(/(<meta[^>]*property="og:site_name"[^>]*content=")[^"]*(")/, `$1${esc(title)}$2`);
  span = span.replace(/(<meta[^>]*name="twitter:title"[^>]*content=")[^"]*(")/, `$1${esc(title)}$2`);
  const alt = `A grid of book covers from ${title}`;
  span = span.replace(/(<meta[^>]*property="og:image:alt"[^>]*content=")[^"]*(")/, `$1${esc(alt)}$2`);
  span = span.replace(/(<meta[^>]*name="twitter:image:alt"[^>]*content=")[^"]*(")/, `$1${esc(alt)}$2`);
}

if (ogDescription) {
  span = setMeta(span, 'property="og:description"', ogDescription);
  span = setMeta(span, 'name="twitter:description"', ogDescription);
  span = setMeta(span, 'name="description"', ogDescription);
}

const imageUrl = `${baseUrl}/og-card.jpg?v=${version}`;
span = span.replace(/(<meta[^>]*property="og:image"[^>]*content=")[^"]*(")/, `$1${esc(imageUrl)}$2`);
span = span.replace(/(<meta[^>]*name="twitter:image"[^>]*content=")[^"]*(")/, `$1${esc(imageUrl)}$2`);

const pageUrl = `${baseUrl}/`;
span = span.replace(/(<meta[^>]*property="og:url"[^>]*content=")[^"]*(")/, `$1${esc(pageUrl)}$2`);
span = span.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(pageUrl)}$2`);

html = html.replace(SPAN_RE, `<!-- og:sync:start -->${span}<!-- og:sync:end -->`);

// Color theme (site.json "theme"): bake a forced light/dark into the staged
// HTML so the first paint is already correct — no flash for visitors whose OS
// preference differs. 'system' (or a missing/invalid key) bakes null: the
// page's own boot script resolves the OS preference live.
const rawTheme = haveSettings && typeof settings.theme === 'string' ? settings.theme.trim() : '';
const bakedTheme = (rawTheme === 'light' || rawTheme === 'dark') ? rawTheme : null;
const THEME_SPAN_RE = /<!-- theme:sync:start -->([\s\S]*?)<!-- theme:sync:end -->/;
const themeSpanMatch = html.match(THEME_SPAN_RE);
if (themeSpanMatch) {
  const themeAssignRe = /window\.__BAKED_THEME\s*=\s*(?:"(?:light|dark)"|null)\s*;/;
  if (!themeAssignRe.test(themeSpanMatch[1])) {
    console.warn('inject-og: theme:sync span found but no __BAKED_THEME assignment — skipped');
  } else {
    html = html.replace(THEME_SPAN_RE, (_m, inner) =>
      `<!-- theme:sync:start -->${inner.replace(themeAssignRe, `window.__BAKED_THEME = ${bakedTheme === null ? 'null' : JSON.stringify(bakedTheme)};`)}<!-- theme:sync:end -->`);
    // Pre-JS paint: on very slow devices the parser can paint before the
    // end-of-body boot script runs, so also pin the static <html data-theme>.
    if (bakedTheme) {
      html = html.replace(/(<html[^>]*data-theme=")(?:light|dark)(")/, `$1${bakedTheme}$2`);
    }
  }
} else {
  console.warn('inject-og: theme:sync span not found — skipping theme bake (older index.html?)');
}

// Atomic write so a failed run never leaves a half-patched page in staging.
const tmp = htmlPath + '.tmp';
fs.writeFileSync(tmp, html);
fs.renameSync(tmp, htmlPath);

console.log(`inject-og: title=${title ? JSON.stringify(title) : '(as committed)'}`);
console.log(`inject-og: description=${ogDescription ? JSON.stringify(ogDescription) : '(default as committed)'}`);
console.log(`inject-og: image=${imageUrl}`);
console.log(`inject-og: url=${pageUrl}`);
console.log(`inject-og: theme=${bakedTheme ? JSON.stringify(bakedTheme) : '(system — null)'}`);
console.log('inject-og: done');
