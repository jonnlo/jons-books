# Filter bar — scroll behavior reference (mobile + desktop)

> **Purpose:** a consolidated record of how the filter bar's scroll behavior works,
> so it can be referenced (and debugged) later without re-deriving everything.
> All behavior lives in a single static file: **`index.html`** (no build system).

Last verified: 2026-08-13 (desktop first-load reveal guard; not yet committed).
Line numbers drift — reference by **function/class names**.

---

## 1. The big picture

There are **two independent systems** that interact:

1. **The sticky/pinned bar itself** (`applyStickyBarState()` + CSS classes) — decides
   whether the bar is visible at the top, scrolled away, tucked, or pinned.
2. **The scroll-to-first-book reset** (`scrollToFirstBooks()`) — when a sort/filter
   change (or view switch, or shuffle) reorders the results, the page scrolls back
   to the new first book instead of leaving you stranded mid-list.

The behaviors differ by **viewport** (mobile ≤ 600px vs desktop > 600px) and by
**view** (Grid vs Volumes/roadmap).

### DOM layout (top → bottom, in `index.html`)

```
.filter-bar#filter-bar            ← the filter bar (search, panel, buttons, tags)
  .search-input-wrap              ← row 1 (mobile) / inline (desktop)
  .filter-panel#filter-panel      ← Volume / Status / Sort / Clear-all
  #shuffle-btn, #surprise-btn
  .view-toggle                    ← Grid / Volumes
  .tag-row                        ← row 2 (mobile): full-bleed wrapper
    .tag-filters#tag-filters      ← tag chips (single-row strip on mobile)
    #filter-toggle                ← ⚙ lives BESIDE the chips on mobile
.results-count                    ← "Showing N books"
main#book-grid                    ← Grid: class="book-grid" | Volumes: class="roadmap-container"
```

Two zero-height **sentinels** are injected around the bar in JS:
- `filterBarSentinel` — inserted **above** the bar (`parentNode.insertBefore(filterBarSentinel, filterBar)`).
  Marks when the bar's **own top** reaches the viewport top.
- `filterBarGoneSentinel` — inserted **below** the bar (`insertBefore(filterBarGoneSentinel, filterBar.nextSibling)`).
  Marks when the **whole bar** (its in-flow spot + margin) has scrolled off the top.

---

## 2. Scroll-state variables (module scope, near the sentinels)

| Variable | Meaning |
|---|---|
| `barPastTop` | `filterBarSentinel.bottom <= 0` (bar top at/above viewport top). Driven by an `IntersectionObserver` + `syncStickyBar()`. Used by the **mobile** branch. |
| `lastScrollDir` | `'up'` / `'down'`, from velocity. Drives reveal/tuck. |
| `lastScrollY` | last scroll position (for the velocity sample window). |
| `barPanelLocked` | true while the mobile Filters panel is open → the bar is forced revealed so the panel can't ride away. Read via the `isBarLocked()` helper (below), never directly. |
| `isBarLocked()` | `barPanelLocked \|\| filterBar.classList.contains('search-open')` — the expanded mobile search locks the bar too. All three lock reads (scroll-listener early return, desktop reveal condition, mobile reveal calc) go through this helper so closing the Filters panel can't silently unlock an open search (`closeFilterPanel` resets `barPanelLocked` unconditionally). |
| `barLandingLock` | true while a programmatic scroll-reset (shuffle/tag/sort/filter/view) is landing on mobile Grid. Forces the bar pinned+revealed through the jump so it can't end up half-tucked; released on a real scroll (whole bar off again, or back at its natural spot). |
| `scrollSamples` | sliding window of `{y, t}` scroll samples. |
| `VELOCITY_WINDOW_MS` | `90` ms — samples older than this are dropped. |
| `REVEAL_UP_VELOCITY` | `0.5` px/ms — upward velocity needed to **reveal** the bar (higher = less eager). |
| `HIDE_DOWN_VELOCITY` | `0.15` px/ms — downward velocity needed to **hide** it. |

The scroll listener computes `velocity = (y - first.y) / max(t - first.t, 16)` over the
window and picks `dir`:
- `velocity <= -REVEAL_UP_VELOCITY` → `'up'`
- `velocity >= HIDE_DOWN_VELOCITY` → `'down'`
- otherwise (the **dead zone**) → keep `lastScrollDir` unchanged (no flapping on slow drifts).

While the mobile Filters panel is open **or the mobile search is expanded**
(`isBarLocked() === true`) the listener records the sample and then **returns early** —
the bar is forced revealed, so scroll direction doesn't change its state until both
close.

**Important:** a slow nudge (scroll events > 90 ms apart) never accumulates a window,
so velocity ≈ 0 → the bar does **not** reveal. You must scroll up with a bit of speed.

---

## 3. `applyStickyBarState()` — the bar's visible/hidden/pinned state

Called from the scroll listener, the `IntersectionObserver`, `syncStickyBar()`, and the
filter-panel open/close. It branches on `mobileView.matches` (`window.matchMedia('(max-width: 600px)')`).

### 3a. Mobile (≤ 600px) — tuck + reveal

```js
const pinned = barLandingLock || barPastTop;
const reveal = pinned && (barPanelLocked || barLandingLock || lastScrollDir === 'up' || forceReveal);
filterBar.classList.toggle('is-past', pinned);       // hidden above (-110%)
filterBar.classList.toggle('is-revealed', reveal);   // slid down to top:0
```

- Bar is **sticky at top:0** (`position: sticky`) in both views on mobile.
- Scroll down → `is-past` (translateY -110%, tucked off-screen). Scroll up (fast enough)
  → `is-past` + `is-revealed` (slides back to top:0).
- `barLandingLock` is a **temporary override** set by `scrollToFirstBooks()` before a
  mobile-Grid jump: it pins the bar even though the below-bar sentinel is back in view
  at the landing point (which would otherwise un-stick it → half-tucked bar).
- CSS: `.filter-bar.is-past { transform: translateY(-110%) }`,
  `.filter-bar.is-past.is-revealed { transform: translateY(0) }`.
- `prefers-reduced-motion` disables the transition.

### 3b. Desktop (> 600px) — natural scroll-away + latched compact pinned bar

Desktop logic keys off two booleans:
- `barTopGone` = `filterBarSentinel.bottom <= 0` (the bar's **own top** has hit the viewport top).
- `fullBarGone` = `filterBarGoneSentinel.bottom <= 0` (the **whole bar** has scrolled past).

The branch (a **latched** state machine — `is-pinned` once engaged stays on until the bar
returns to its natural spot):

| Condition | Action |
|---|---|
| `!barTopGone` (bar back at natural spot) | remove `is-pinned` + `is-revealed` (release sticky entirely) |
| `barPanelLocked \|\| lastScrollDir === 'up'` **and the latest scroll delta is upward** | add `is-pinned` + `is-revealed` (reveal pinned at top) |
| `fullBarGone` (down-scroll, whole bar past) | add `is-pinned`, remove `is-revealed` (sticky but hidden above) |
| else (down-scroll, not fully past) | remove `is-revealed` (keep any latched sticky, just tuck; if never pinned the bar stays static and scrolls away naturally) |

Also always `filterBar.classList.remove('is-past')` (desktop never uses the mobile tuck).

**First-pin guard:** when `is-pinned` is first applied, `filterBar.style.transition = 'none'`
is set, `void filterBar.offsetHeight` forces a reflow, then the transition is restored —
so the bar snaps into its hidden-above state instead of animating a visible flash.

**Downward first-load guard:** a downward scroll can engage the compact pinned state,
but it cannot reveal that state. The wrapped natural bar and the compact bar have
different in-flow heights; revealing while moving down can move the sentinels during
the same scroll pass and produce a one-time compact-bar flash. The explicit
`scrollToFirstBooks()` coexistence path may still force a reveal after a filter/view
reset.

Desktop CSS (`min-width: 601px`):
- Base `.filter-bar { position: static }` → the **full bar scrolls away naturally**.
- `.filter-bar.is-pinned { position: sticky; top: 0; z-index: 60; background: var(--bg-main);
  transform: translateY(-110%); transition: transform 0.25s ease; }` — sticky, hidden above.
- `.filter-bar.is-pinned.is-revealed { transform: translateY(0); padding: 12px 0px; }` — slid down.
- `.filter-bar.is-pinned .tag-filters` — tags compacted to a **single scrollable row**
  (`flex-wrap: nowrap; overflow-x: auto`, with edge mask fades: a right-edge fade cues
  more chips, and a left-edge fade appears once the strip is scrolled — toggled by
  `.at-start` / `.at-end` classes in `updateTagFiltersFade`).
- In Volumes view the pinned bar overlays the volume/stage sticky headers (z 60 > their 10 / 9).

**Key geometry insight (why the pinned bar + first book CAN coexist):** the coexistence
scroll position (`gridTop − compactBarHeight − 8`) sits **between** `barTopGone` and
`fullBarGone`, so the bar can be sticky there. The old implementation pinned only at
`fullBarGone`, by which point the grid's first book had already scrolled past — that's
why coexistence wasn't possible before the latch change.

---

## 4. `scrollToFirstBooks()` — reset to the new first book

Called **after** a re-render that changes what "first book" means:
- `sortSelect` `change`
- `[filterVolume, filterStatus]` `change`
- tag chip click (`tagFilters` click handler)
- `filterClear` (Clear all)
- `shuffleBtn` click
- detail-modal tag chip click (`detailTagsList` handler — also clears Volume/Status first, see §6 note)
- Grid/Volumes view switch (`viewGridBtn` / `viewRoadmapBtn` handlers)

NOT wired: `surpriseBtn` — it only opens a random book's detail modal (picked from ALL
books); it never re-renders or moves the page, and leaves filters/search untouched.

Branches on view + breakpoint:

| Case | Landing target | Guard (no-op when) |
|---|---|---|
| **Volumes** (both breakpoints) | `gridTop − 4` (first volume flush) | `scrollY <= landingY` |
| **Mobile Grid** | force-reveal the bar, then `gridTop − (filterBar.offsetHeight + 8)` (first book just below the pinned bar = "filter top") | `scrollY <= landingY` |

**Mobile Grid landing lock (why it exists):** the mobile bar's sticky state is gated by
`barPastTop`, which is driven by the **below-bar** sentinel — the bar counts as "past" only
once its WHOLE box (+ margin) has scrolled off. The "filter top" landing point
(`gridTop − barH − 8`) sits *before* that threshold, so on the jump's own scroll event the
below-sentinel is back in view, `barPastTop` flips false, `is-past` is removed, and the bar
falls back to natural flow with its top partially above the viewport → **half-tucked bar**
(the bug fixed 2026-08-16). The fix sets `barLandingLock = true` + forces the reveal
(snapped, transition off) before `window.scrollTo`, and the scroll listener keeps the pin
while the lock is held. The lock releases on a real scroll once the whole bar is off again
(`pastNow`) or the bar is back at its natural spot (`scrollY <= barNaturalTop`), then
normal tuck/reveal resumes. The no-op guard (`scrollY <= landingY`) returns before the lock
is set, so a near-top trigger never leaves stale pinned classes.
| **Desktop Grid** | reveal compact bar, then `gridTop_compacted − (filterBar.offsetHeight + 8)` (pinned bar + first book **coexist**) | `scrollY <= gridTop` (first book still on screen) |

Before scrolling it resets the velocity baseline (`scrollSamples.length = 0;
lastScrollY = window.scrollY`) so the programmatic jump isn't read as a user flick
(otherwise the up-scroll would wrongly reveal the bar).

### Desktop Grid details (the coexistence case)

```js
if (window.scrollY <= docTop) return;          // first book still visible → no-op
lastScrollDir = 'up';
applyStickyBarState();                          // force reveal (barTopGone + up)
const docTopCompacted = target.getBoundingClientRect().top + window.scrollY;
const landingY = Math.max(0, Math.round(docTopCompacted - ((filterBar.offsetHeight || 0) + 8)));
window.scrollTo(0, landingY);
```

**Critical:** `docTop` is re-measured **after** `applyStickyBarState()` because pinning
compacts the tags to one row, which shifts the grid **up** in the layout (~60 px).
Landing from the pre-compaction `docTop` would put the first book *behind* the pinned bar
(observed: `gridTop 62` vs `bar bottom 114`).

---

## 5. Mobile Filters panel (`#filter-panel`)

- Mobile: the panel is an **absolute overlay** just below the bar (`.filter-panel {
  position: absolute; top: calc(100% + 4px); ... }`), shown when `.filter-bar.filters-open`
  is present; z-index 15 (must clear the roadmap's sticky headers at z 10/9).
- Desktop: the panel is `display: contents` (the selects flow inline) and the
  `#filter-toggle` / `#filter-clear` buttons are hidden.
- `filterToggle` click toggles `.filters-open` + `aria-expanded` and sets `barPanelLocked`
  (bar stays revealed while open). Outside-tap / Escape call `closeFilterPanel()`.
- `closeFilterPanel()` removes `.filters-open`, resets `aria-expanded`, sets
  `barPanelLocked = false`, and calls `applyStickyBarState()`.

**Auto-collapse (mobile):** picking a Volume/Status/Sort option or pressing Clear-all
calls `if (mobileView.matches) closeFilterPanel();` **before** `scrollToFirstBooks()` —
so the panel closes and the new results (from the top) are immediately visible.
Tag chips and the search box are not panel controls, so they don't auto-close it.

---
5b. Responsive filter-bar bands (search / toggle / panel)

The bar no longer has a single mobile/desktop cut — it degrades through FOUR bands
(three MQs: ≤780, ≤550, ≤460, plus desktop ≥781). Search has priority everywhere:
it stays a real field as long as physically possible, and everything else
progressively collapses into the ⚙ panel on the tag row.

| Band | Search | Grid/Volumes toggle | Volume/Status/Sort | ⚙ |
|---|---|---|---|---|
| ≥ 781px (desktop) | inline, grows | labeled, 222px | **inline** (panel is `display:contents`) | hidden |
| 461–780px (middle) | field, flex-fill (`min-width:140`) | labeled, natural size (~180px, segment `min-width:0`) | **in panel** | on tag row |
| ≤ 460px (small phones) | 🔍 icon (`.search-open` expands over the row) | flex-fill WITH labels (18px icons) | in panel | on tag row |

- JS matchers: `mobileView = '(max-width: 460px)'` gates the sticky tuck/reveal +
  scroll-landing offsets; `narrowPanel = '(max-width: 780px)'` gates the panel
  auto-collapse after picking a filter. Sticky behavior: ≤460 tucks like mobile,
  461+ pins like desktop.
- Row 2 on ≤780px: `.tag-row` holds the chip strip + ⚙ side by side (strip
  `flex:1; min-width:0`, single-row scroll with fade cues). Zero tags → strip
  hides, ⚙ remains alone right-aligned. ≤460px adds the full-bleed treatment
  (`width: calc(100% + 32px); margin-inline:-16px` + end-chip gutter margins).
- Collapsed search (≤460 only): `.search-input-wrap { display:none }`; row 1 =
  🔍 + shuffle + surprise + flex-fill toggle. Tap 🔍 → `.search-open` (field takes
  over the row, other controls hide, sticky bar force-revealed via
  `isBarLocked()`), focuses the input.
- Field actions (`.search-actions`, right edge of the field): ✕ clears the query
  IN PLACE (hidden while empty via `.has-value` on the wrap — that class also
  drives the input's `padding-right`); ‹ collapses (≤460 only). An applied query
  survives collapsing and shows as a corner dot on 🔍 (`updateSearchBadge()` also
  sets the toggle's aria-label "Search books — query active").
- Desktop pinned compaction (`.filter-bar.is-pinned .tag-filters`) still applies
  ≥781px; `.tag-row` carries base `width:100%; min-width:0` so the pinned nowrap
  strip can never push it past the site width.

---

## 6. Which controls reset scroll — summary

| Control | Desktop | Mobile |
|---|---|---|
| Sort change | reset (coexist) | reset (barH+8) |
| Volume / Status change | reset (coexist) | reset + panel auto-collapse |
| Tag chip click | reset (coexist) | reset |
| Clear all | reset (coexist) | reset + panel auto-collapse |
| Shuffle | reset (coexist) | reset |
| Detail-modal tag chip | reset (coexist) + clears Volume/Status too | reset + clears Volume/Status too |
| Surprise me | **no** reset — opens a random book (from all books) without touching filters | **no** reset |
| View switch | reset (first volume / coexist) | reset (first volume / barH+8) |
| Search input | **no** reset (per-keystroke would jump) | **no** reset |

---

## 7. Known gotchas / lessons (test env + design)

- **Throttled VS Code browser:** `window.scrollTo()`/`scrollTop` change `scrollY` but fire
  **no** `scroll` events; `requestAnimationFrame` hangs; CSS transitions never advance.
  → Verify scroll behavior by **dispatching** `new Event('scroll')` after `scrollTo`, and
  drive velocity deterministically by overriding `performance.now` with a fake clock.
  Real browsers fire scroll events and run transitions normally.
- Reading `window.scrollY` **synchronously** in the same `page.evaluate` that triggers the
  click/dispatch returns a **stale** value — always `waitForTimeout` after the action and
  read in a separate evaluate.
- Passing a Node-side variable into `page.evaluate(fn)` requires passing it as an
  **argument** (`evaluate((base) => {...}, base)`); closures don't cross the boundary.
- A "slow nudge" test must space scroll events **> 90 ms apart** — tiny moves 5 ms apart
  are actually a fast burst (velocity ≈ −0.625 → reveals), which looks like a bug but isn't.
- `lucide.createIcons()` replaces `<i>` with `<svg>`; never cache icon element references
  across renders (re-query each time).
- `.tag-filters`/`.filter-panel`/`.filter-badge` etc. set their own `display`, so the
  `hidden` attribute needs `[hidden] { display: none !important }` guards.

---

## 8. Commit trail (2026-08-12)

| Commit | What |
|---|---|
| `65bbea7` | Reset scroll to first book on sort/filter changes (mobile + desktop) |
| `a9716c5` | Desktop: pinned filter bar + first book coexist (Option A latch) |
| `116cc29` | Mobile: all filter/sort changes reset scroll to the filter top |
| `d25b1ce` | Mobile: filter panel auto-collapses after a pick/reset |
