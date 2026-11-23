    // LocalStorage Keys
    const STORAGE_KEY = 'personal_library_books_v2';
    const LAST_MODIFIED_KEY = 'personal_library_last_modified';
    const LAST_EXPORTED_KEY = 'personal_library_last_exported';
    const STATUS_CLEANUP_KEY = 'personal_library_status_cleanup_v1';
    const ORDER_CLEANUP_KEY = 'personal_library_order_cleanup_v1';
    const STAGE_CLEANUP_KEY = 'personal_library_stage_cleanup_v1';

    // Site settings (site.json) — owner config for the site title + default
    // sort. Layered at startup: these defaults < fetched site.json < the
    // localStorage working copy (SETTINGS_KEY, local editing only — visitors
    // always get whatever site.json says). Machinery lives in the Site Settings
    // block near the JSON import/export logic.
    const SITE_FILE = 'site.json';
    const SETTINGS_KEY = 'personal_library_settings_v1';
    const SITE_FILE_HANDLE_KEY = 'siteJsonFileHandle';
    const DEFAULT_SETTINGS = { title: "jon's books", defaultSort: 'year-desc', accent: 'ink', theme: 'system', adaptiveDetail: true, adaptiveDetailMode: 'auto', filterBarAlwaysVisible: false, ogDescription: '' };
    const VALID_SORTS = ['reading-order', 'year-desc', 'year-asc', 'created-desc', 'created-asc', 'title-asc', 'random'];
    const VALID_ADAPTIVE_MODES = ['auto', 'theme'];
    // Color theme: the site.json default ('system' follows the OS preference).
    // Visitors override it per browser via the header toggle (THEME_MODE_KEY);
    // the visitor choice always wins over the site default.
    const VALID_THEMES = ['system', 'light', 'dark'];
    const THEME_MODE_KEY = 'themeMode';
    // Anti-flash paint hint (see applyTheme): the last FORCED resolved theme,
    // so the next boot can paint it before site.json resolves. Never written
    // in system mode — the live OS read is always fresher there.
    const THEME_HINT_KEY = 'themeHint';

    // Accent color presets — each one re-tints the whole palette by swapping
    // the hue of the theme tokens while keeping every contrast-validated
    // lightness value from :root / [data-theme="light"] (which stay untouched
    // as the defaults). 'ink' ships EMPTY overrides: it IS the code-defined
    // look, so no override stylesheet is generated for it. Accent fills are
    // Tailwind -700 shades (white text ≥4.5:1); accent inks are -300 on dark /
    // -800 on light (readable as text/borders/focus rings). Neutral ladders
    // keep their exact L values with a faint hue cast; text tokens shift hue
    // at low saturation so the AA ratios hold.
    const VALID_ACCENTS = ['ink', 'indigo', 'moss', 'clay', 'ocean', 'plum'];
    // All themes share ink's L/C ladder — only H shifts per hue. Keeps
    // contrast ratios identical across themes; hue is the only variable.
    // Neutrals use ink's exact L/C with theme H; accents use ink's L/C
    // ladder for fills/inks but with theme H and tuned C for vividness.
    const ACCENT_PRESETS = {
      ink:   { name: 'Ink',   swatch: '#4d5058', dark: {}, light: {} },
      indigo: {
        name: 'Indigo', swatch: '#4f46e5',
        dark: {
          '--bg-main': 'oklch(0.2011 0.015 277)', '--bg-surface': 'oklch(0.2348 0.018 277)',
          '--bg-card': 'oklch(0.2646 0.022 277)', '--bg-card-hover': 'oklch(0.3057 0.028 277)',
          '--bg-input': 'oklch(0.2223 0.02 277)', '--border-color': 'oklch(0.3167 0.025 277)',
          '--text-primary': 'oklch(0.9459 0.0029 277)', '--text-secondary': 'oklch(0.7923 0.0087 277)',
          '--text-muted': 'oklch(0.6597 0.0109 277)', '--text-faint': 'oklch(0.5475 0.0119 277)',
          '--img-bg': 'oklch(0.2348 0.018 277)', '--img-bg-hover': 'oklch(0.277 0.022 277)',
          '--btn-secondary-bg': 'oklch(0.3167 0.025 277)', '--btn-secondary-bg-hover': 'oklch(0.3648 0.03 277)',
          '--accent-color': 'oklch(0.7853 0.1041 277)', '--accent-fill': 'oklch(0.5106 0.2301 277)'
        },
        light: {
          '--bg-main': 'oklch(0.9911 0.008 277)', '--bg-surface': 'oklch(0.9702 0.015 277)',
          '--bg-card': 'oklch(0.9702 0.015 277)', '--bg-card-hover': 'oklch(0.931 0.02 277)',
          '--bg-input': 'oklch(1 0.005 277)', '--border-color': 'oklch(0.8761 0.02 277)',
          '--border-accent': 'var(--accent-color)',
          '--text-primary': 'oklch(0.2264 0 277)', '--text-secondary': 'oklch(0.4568 0 277)',
          '--text-muted': 'oklch(0.5452 0 277)', '--text-faint': 'oklch(0.6567 0 277)',
          '--img-bg': 'oklch(0.9731 0.012 277)', '--img-bg-hover': 'oklch(0.9461 0.018 277)',
          '--btn-secondary-bg': 'oklch(1 0.005 277)', '--btn-secondary-bg-hover': 'oklch(0.9612 0.015 277)',
          '--accent-color': 'oklch(0.4568 0.2146 277)', '--accent-fill': 'oklch(0.5106 0.2301 277)'
        }
      },
      moss: {
        name: 'Moss', swatch: '#15803d',
        dark: {
          '--bg-main': 'oklch(0.2011 0.015 150.1)', '--bg-surface': 'oklch(0.2348 0.018 150.1)',
          '--bg-card': 'oklch(0.2646 0.022 150.1)', '--bg-card-hover': 'oklch(0.3057 0.028 150.1)',
          '--bg-input': 'oklch(0.2223 0.02 150.1)', '--border-color': 'oklch(0.3167 0.025 150.1)',
          '--text-primary': 'oklch(0.9459 0.0029 150.1)', '--text-secondary': 'oklch(0.7923 0.0087 150.1)',
          '--text-muted': 'oklch(0.6597 0.0109 150.1)', '--text-faint': 'oklch(0.5475 0.0119 150.1)',
          '--img-bg': 'oklch(0.2348 0.018 150.1)', '--img-bg-hover': 'oklch(0.277 0.022 150.1)',
          '--btn-secondary-bg': 'oklch(0.3167 0.025 150.1)', '--btn-secondary-bg-hover': 'oklch(0.3648 0.03 150.1)',
          '--accent-color': 'oklch(0.8712 0.1363 154.5)', '--accent-fill': 'oklch(0.5273 0.1371 150.1)'
        },
        light: {
          '--bg-main': 'oklch(0.9911 0.008 150.1)', '--bg-surface': 'oklch(0.9702 0.015 150.1)',
          '--bg-card': 'oklch(0.9702 0.015 150.1)', '--bg-card-hover': 'oklch(0.931 0.02 150.1)',
          '--bg-input': 'oklch(1 0.005 150.1)', '--border-color': 'oklch(0.8761 0.02 150.1)',
          '--border-accent': 'var(--accent-color)',
          '--text-primary': 'oklch(0.2264 0 150.1)', '--text-secondary': 'oklch(0.4568 0 150.1)',
          '--text-muted': 'oklch(0.5452 0 150.1)', '--text-faint': 'oklch(0.6567 0 150.1)',
          '--img-bg': 'oklch(0.9731 0.012 150.1)', '--img-bg-hover': 'oklch(0.9461 0.018 150.1)',
          '--btn-secondary-bg': 'oklch(1 0.005 150.1)', '--btn-secondary-bg-hover': 'oklch(0.9612 0.015 150.1)',
          '--accent-color': 'oklch(0.4479 0.1083 151.3)', '--accent-fill': 'oklch(0.5273 0.1371 150.1)'
        }
      },
      clay: {
        name: 'Clay', swatch: '#c2410c',
        dark: {
          '--bg-main': 'oklch(0.2011 0.015 38.4)', '--bg-surface': 'oklch(0.2348 0.018 38.4)',
          '--bg-card': 'oklch(0.2646 0.022 38.4)', '--bg-card-hover': 'oklch(0.3057 0.028 38.4)',
          '--bg-input': 'oklch(0.2223 0.02 38.4)', '--border-color': 'oklch(0.3167 0.025 38.4)',
          '--text-primary': 'oklch(0.9459 0.0029 38.4)', '--text-secondary': 'oklch(0.7923 0.0087 38.4)',
          '--text-muted': 'oklch(0.6597 0.0109 38.4)', '--text-faint': 'oklch(0.5475 0.0119 38.4)',
          '--img-bg': 'oklch(0.2348 0.018 38.4)', '--img-bg-hover': 'oklch(0.277 0.022 38.4)',
          '--btn-secondary-bg': 'oklch(0.3167 0.025 38.4)', '--btn-secondary-bg-hover': 'oklch(0.3648 0.03 38.4)',
          '--accent-color': 'oklch(0.8366 0.1165 66.3)', '--accent-fill': 'oklch(0.5534 0.1739 38.4)'
        },
        light: {
          '--bg-main': 'oklch(0.9911 0.008 38.4)', '--bg-surface': 'oklch(0.9702 0.015 38.4)',
          '--bg-card': 'oklch(0.9702 0.015 38.4)', '--bg-card-hover': 'oklch(0.931 0.02 38.4)',
          '--bg-input': 'oklch(1 0.005 38.4)', '--border-color': 'oklch(0.8761 0.02 38.4)',
          '--border-accent': 'var(--accent-color)',
          '--text-primary': 'oklch(0.2264 0 38.4)', '--text-secondary': 'oklch(0.4568 0 38.4)',
          '--text-muted': 'oklch(0.5452 0 38.4)', '--text-faint': 'oklch(0.6567 0 38.4)',
          '--img-bg': 'oklch(0.9731 0.012 38.4)', '--img-bg-hover': 'oklch(0.9461 0.018 38.4)',
          '--btn-secondary-bg': 'oklch(1 0.005 38.4)', '--btn-secondary-bg-hover': 'oklch(0.9612 0.015 38.4)',
          '--accent-color': 'oklch(0.4698 0.143 37.3)', '--accent-fill': 'oklch(0.5534 0.1739 38.4)'
        }
      },
      ocean: {
        name: 'Ocean', swatch: '#0369a1',
        dark: {
          '--bg-main': 'oklch(0.2011 0.015 242.7)', '--bg-surface': 'oklch(0.2348 0.018 242.7)',
          '--bg-card': 'oklch(0.2646 0.022 242.7)', '--bg-card-hover': 'oklch(0.3057 0.028 242.7)',
          '--bg-input': 'oklch(0.2223 0.02 242.7)', '--border-color': 'oklch(0.3167 0.025 242.7)',
          '--text-primary': 'oklch(0.9459 0.0029 242.7)', '--text-secondary': 'oklch(0.7923 0.0087 242.7)',
          '--text-muted': 'oklch(0.6597 0.0109 242.7)', '--text-faint': 'oklch(0.5475 0.0119 242.7)',
          '--img-bg': 'oklch(0.2348 0.018 242.7)', '--img-bg-hover': 'oklch(0.277 0.022 242.7)',
          '--btn-secondary-bg': 'oklch(0.3167 0.025 242.7)', '--btn-secondary-bg-hover': 'oklch(0.3648 0.03 242.7)',
          '--accent-color': 'oklch(0.8276 0.1013 230.3)', '--accent-fill': 'oklch(0.5 0.1193 242.7)'
        },
        light: {
          '--bg-main': 'oklch(0.9911 0.008 242.7)', '--bg-surface': 'oklch(0.9702 0.015 242.7)',
          '--bg-card': 'oklch(0.9702 0.015 242.7)', '--bg-card-hover': 'oklch(0.931 0.02 242.7)',
          '--bg-input': 'oklch(1 0.005 242.7)', '--border-color': 'oklch(0.8761 0.02 242.7)',
          '--border-accent': 'var(--accent-color)',
          '--text-primary': 'oklch(0.2264 0 242.7)', '--text-secondary': 'oklch(0.4568 0 242.7)',
          '--text-muted': 'oklch(0.5452 0 242.7)', '--text-faint': 'oklch(0.6567 0 242.7)',
          '--img-bg': 'oklch(0.9731 0.012 242.7)', '--img-bg-hover': 'oklch(0.9461 0.018 242.7)',
          '--btn-secondary-bg': 'oklch(1 0.005 242.7)', '--btn-secondary-bg-hover': 'oklch(0.9612 0.015 242.7)',
          '--accent-color': 'oklch(0.4434 0.1 240.8)', '--accent-fill': 'oklch(0.5 0.1193 242.7)'
        }
      },
      plum: {
        name: 'Plum', swatch: '#a21caf',
        dark: {
          '--bg-main': 'oklch(0.2011 0.015 323.9)', '--bg-surface': 'oklch(0.2348 0.018 323.9)',
          '--bg-card': 'oklch(0.2646 0.022 323.9)', '--bg-card-hover': 'oklch(0.3057 0.028 323.9)',
          '--bg-input': 'oklch(0.2223 0.02 323.9)', '--border-color': 'oklch(0.3167 0.025 323.9)',
          '--text-primary': 'oklch(0.9459 0.0029 323.9)', '--text-secondary': 'oklch(0.7923 0.0087 323.9)',
          '--text-muted': 'oklch(0.6597 0.0109 323.9)', '--text-faint': 'oklch(0.5475 0.0119 323.9)',
          '--img-bg': 'oklch(0.2348 0.018 323.9)', '--img-bg-hover': 'oklch(0.277 0.022 323.9)',
          '--btn-secondary-bg': 'oklch(0.3167 0.025 323.9)', '--btn-secondary-bg-hover': 'oklch(0.3648 0.03 323.9)',
          '--accent-color': 'oklch(0.833 0.1322 321.4)', '--accent-fill': 'oklch(0.518 0.2258 323.9)'
        },
        light: {
          '--bg-main': 'oklch(0.9911 0.008 323.9)', '--bg-surface': 'oklch(0.9702 0.015 323.9)',
          '--bg-card': 'oklch(0.9702 0.015 323.9)', '--bg-card-hover': 'oklch(0.931 0.02 323.9)',
          '--bg-input': 'oklch(1 0.005 323.9)', '--border-color': 'oklch(0.8761 0.02 323.9)',
          '--border-accent': 'var(--accent-color)',
          '--text-primary': 'oklch(0.2264 0 323.9)', '--text-secondary': 'oklch(0.4568 0 323.9)',
          '--text-muted': 'oklch(0.5452 0 323.9)', '--text-faint': 'oklch(0.6567 0 323.9)',
          '--img-bg': 'oklch(0.9731 0.012 323.9)', '--img-bg-hover': 'oklch(0.9461 0.018 323.9)',
          '--btn-secondary-bg': 'oklch(1 0.005 323.9)', '--btn-secondary-bg-hover': 'oklch(0.9612 0.015 323.9)',
          '--accent-color': 'oklch(0.4519 0.1922 324.6)', '--accent-fill': 'oklch(0.518 0.2258 323.9)'
        }
      }
    };
    let siteSettings = { ...DEFAULT_SETTINGS };

    // Public / View-Only Mode — on the published site we load books.json
    // (the committed source of truth, staged by the deploy workflow) and hide editing.
    const isPublic = window.location.protocol !== 'file:' &&
      !['localhost', '127.0.0.1'].includes(window.location.hostname);
    // Local Edit/View mode key — remembers whether the owner chose the
    // read-only "View" browsing surface. Only meaningful when !isPublic: the
    // published site is always view-only and never writes this key.
    const VIEW_MODE_KEY = 'personal_library_view_mode';
    let viewOnly = isPublic || localStorage.getItem(VIEW_MODE_KEY) === 'view';
    if (viewOnly) document.body.classList.add('view-only');
    // Distinguishes the real published site (toggle hidden) from a manual
    // View-mode toggle (toggle stays visible so you can switch back to editing).
    if (isPublic) document.body.classList.add('site-public');

    // Switches between local Edit mode (full editing controls) and local View
    // mode (public-style read-only browsing). Both sides read the SAME working
    // copy (in-memory `books` + localStorage) — toggling is presentation-only,
    // so unexported edits always remain visible and nothing is ever lost.
    // Reflect the current mode on the segmented control AND drive its sliding
    // pill via the .is-view class (class-based transitions animate reliably
    // in Safari; :has()-triggered ones don't — see the .mode-toggle CSS).
    function applyModeToggleState() {
      const editBtn = document.getElementById('mode-edit-btn');
      const viewBtn = document.getElementById('mode-view-btn');
      const wrap = document.getElementById('mode-toggle');
      if (editBtn) {
        editBtn.classList.toggle('active', !viewOnly);
        editBtn.setAttribute('aria-pressed', String(!viewOnly));
      }
      if (viewBtn) {
        viewBtn.classList.toggle('active', viewOnly);
        viewBtn.setAttribute('aria-pressed', String(viewOnly));
      }
      if (wrap) wrap.classList.toggle('is-view', viewOnly);
    }

    function setViewOnly(v) {
      viewOnly = v;
      document.body.classList.toggle('view-only', v);
      if (!isPublic) localStorage.setItem(VIEW_MODE_KEY, v ? 'view' : 'edit');
      // Flip the pill/classes FIRST, then yield before the heavy re-render so
      // the slide starts on the compositor instead of being starved by
      // renderBooks()'s main-thread work (the iOS lag).
      applyModeToggleState();
      scheduleViewWork(() => {
        renderBooks(); // re-render current view (roadmap re-render swaps sortables/stage classes)
        if (!v) updateExportReminder(); // back in edit mode — refresh the export nudge
      });
    }

    // --- Adaptive detail modal: OKLCH pipeline (perceptual) ---
    // Ported from exp/adaptive-detail-modal.html — tuned defaults: chroma -0.02 / lum +0.03.
    // When adaptiveDetail is on, the detail modal ignores the site accent hue and tints from coverColor.
    function srgbToLinear(c){c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
    function linearToSrgb(c){c=Math.max(0,Math.min(1,c));return Math.round(255*(c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055))}
    function hexToRgb(hex){const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
    function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
    function rgbToOklch(r,g,b){
      const lr=srgbToLinear(r),lg=srgbToLinear(g),lb=srgbToLinear(b);
      const l=Math.cbrt(0.4122214708*lr+0.5363325363*lg+0.0514459929*lb);
      const m=Math.cbrt(0.2119034982*lr+0.6806995451*lg+0.1073969566*lb);
      const s=Math.cbrt(0.0883024619*lr+0.2817188376*lg+0.6299787005*lb);
      const L=0.2104542553*l+0.7936177850*m-0.0040720468*s;
      const A=1.9779984951*l-2.4285922050*m+0.4505937099*s;
      const B=0.0259040371*l+0.7827717662*m-0.8086757660*s;
      const C=Math.sqrt(A*A+B*B);
      let H=Math.atan2(B,A)*180/Math.PI; if(H<0)H+=360;
      return {L,C,H};
    }
    function oklchToRgb(L,C,H){
      const h=H*Math.PI/180, a=C*Math.cos(h), b2=C*Math.sin(h);
      const l_=L+0.3963377774*a+0.2158037573*b2;
      const m_=L-0.1055613458*a-0.0638541728*b2;
      const s_=L-0.0894841775*a-1.2914855480*b2;
      const l3=l_*l_*l_, m3=m_*m_*m_, s3=s_*s_*s_;
      return {r:linearToSrgb(4.0767416621*l3-3.3077115913*m3+0.2309699292*s3),g:linearToSrgb(-1.2684380046*l3+2.6097574011*m3-0.3413193965*s3),b:linearToSrgb(-0.0041960863*l3-0.7034186147*m3+1.7076147010*s3)};
    }
    function inGamut(rgb,tol=0.004){const check=v=>{const c=v/255;return c>=-tol&&c<=1+tol};return check(rgb.r)&&check(rgb.g)&&check(rgb.b)}
    function clampChroma(L,C,H){if(inGamut(oklchToRgb(L,C,H)))return C;let lo=0,hi=C;for(let i=0;i<12;i++){const mid=(lo+hi)/2;if(inGamut(oklchToRgb(L,mid,H)))lo=mid;else hi=mid}return lo}
    function adaptiveFromHex(hex, opts){
      const satPct = opts && typeof opts.satPct === 'number' ? opts.satPct : 25;
      const lumPct = opts && typeof opts.lumPct === 'number' ? opts.lumPct : 80;
      const forcedMode = opts && opts.forcedMode;
      const {r,g,b}=hexToRgb(hex);
      const {L:Lo,C:Craw,H}=rgbToOklch(r,g,b);
      // Keep near-grays gray: below 0.03 chroma is noise/hue is random, so
      // scale with source chroma instead of adding saturation (which invents color).
      let scaled;
      if (Craw < 0.03) {
        scaled = Craw * 0.35;
      } else {
        const t = Math.max(0, Math.min(1, (Craw - 0.03) / 0.19));
        const Cbase = 0.04 + t * 0.08;
        scaled = Math.max(0.01, Math.min(0.16, Cbase + ((satPct - 50) / 100) * 0.08));
      }
      let isDark;
      if(forcedMode==='theme') isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      else isDark=Lo < 0.58;
      // Light backgrounds show chroma more strongly — desaturate light adaptive
      // colors so they don't feel oversaturated while dark stays rich.
      if (!isDark) scaled *= 0.55;
      let Lbase;
      if(isDark){ const t=Math.max(0,Math.min(1,(Lo-0.15)/0.30)); Lbase=0.16+t*0.12; }
      else { const t=Math.max(0,Math.min(1,(Lo-0.50)/0.35)); Lbase=0.90+t*0.07; }
      const lumOffset=((lumPct-50)/100)*0.10;
      const L=Math.max(isDark?0.12:0.86,Math.min(isDark?0.34:0.99,Lbase+lumOffset));
      const C=clampChroma(L,scaled,H);
      const {r:r2,g:g2,b:b2}=oklchToRgb(L,C,H);
      return {hex:rgbToHex(r2,g2,b2), isDark, Lo, Craw, L, C};
    }
    function isValidHexColor(s){return typeof s==='string' && /^#[0-9a-f]{6}$/i.test(s.trim())}
    function resolveAdaptiveForBook(book){
      if(!siteSettings.adaptiveDetail) return null;
      const hex=(book && book.coverColor || '').trim();
      if(!isValidHexColor(hex)) return null;
      const forcedMode = siteSettings.adaptiveDetailMode !== 'auto' ? siteSettings.adaptiveDetailMode : null;
      return adaptiveFromHex(hex, { forcedMode });
    }
    // ── Shadow tuning ── ONE place to tune shadows.
    // Alpha = opacity (0→1). Chroma cap/scale = saturation — higher = more vivid shadow.
    // Lightness: dark = offset from bg L (higher offset = darker shadow), light = fixed L (lower = darker).
    // Geometry (y/blur) is in CSS :root — mobile detail has its own y/blur there, color stays shared.
    const SHADOW_TUNING = {
      cardDarkAlpha: 0.52,        // card hover on dark adaptive bg
      cardLightAlpha: 0.34,       // card hover on light adaptive bg
      detailDarkAlpha: 0.60,      // detail modal on dark adaptive bg
      detailLightAlpha: 0.45,     // detail modal on light adaptive bg
      // Saturation — raise cap/scale for more vivid tone-on-tone shadows.
      // Previous defaults were cap 0.05/0.07 scale 0.38/0.42 (muted). Bumped for punch.
      cardDarkChromaCap: 0.2, cardDarkChromaScale: 0.85,
      cardLightChromaCap: 0.5, cardLightChromaScale: 0.90,
      detailDarkChromaCap: 0.2, detailDarkChromaScale: 0.85,
      detailLightChromaCap: 1, detailLightChromaScale: 0.90,
      grayChromaScale: 0.45,      // near-grays (Craw<0.03) — keep low so grays don't invent color
      // Lightness — tune shadow darkness
      cardDarkLightnessOffset: 0.3,  // dark bg: shadow L = adp.L - offset (higher = darker)
      cardLightLs: 0.4,              // light bg: fixed shadow L (lower = darker, 0.40 dark / 0.60 light)
      detailDarkLightnessOffset: 0.3,
      detailLightLs: 0.6,
      detailDarkLightnessFloor: 0.08  // dark bg: minimum L so shadow never goes pure black
    };
    // Tone-on-tone shadow for book cards — same OKLCH pipeline as detail modal,
    // emitted as rgba() so it works everywhere (no color-mix).
    function cardShadowRgba(book, adp){
      if(!adp) return null;
      const srcHex=(book && book.coverColor || '').trim();
      if(!isValidHexColor(srcHex)) return null;
      const {C:Craw,H}=rgbToOklch(...Object.values(hexToRgb(srcHex)));
      let Ls, Cs, alpha;
      if(adp.isDark){
        Ls=Math.max(SHADOW_TUNING.detailDarkLightnessFloor, adp.L - SHADOW_TUNING.cardDarkLightnessOffset);
        Cs=Craw < 0.03 ? Craw * SHADOW_TUNING.grayChromaScale : Math.min(SHADOW_TUNING.cardDarkChromaCap, Craw * SHADOW_TUNING.cardDarkChromaScale);
        alpha=SHADOW_TUNING.cardDarkAlpha;
      } else {
        Ls=SHADOW_TUNING.cardLightLs;
        Cs=Craw < 0.03 ? Craw * SHADOW_TUNING.grayChromaScale : Math.min(SHADOW_TUNING.cardLightChromaCap, Craw * SHADOW_TUNING.cardLightChromaScale);
        alpha=SHADOW_TUNING.cardLightAlpha;
      }
      const c=clampChroma(Ls, Cs, H);
      const {r,g,b}=oklchToRgb(Ls, c, H);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ── Card hover tint ── ONE place to tune the cover-container hover wash.
    // Same "keep L from the theme token, inject C/H from coverColor" logic the
    // oklch token ladder uses: the hover stays at the --img-bg-hover lightness
    // step (so it reads as the same surface in both themes and follows accent
    // presets) and only picks up a quiet tint from the cover's dominant color.
    // Falls back to plain --img-bg-hover (via the CSS var fallback) when the
    // book has no usable coverColor.
    const HOVER_TINT_TUNING = {
      maxChroma: 0.08,        // tint strength cap (token ladder sits at ~0.005–0.01)
      chromaScale: 0.4,       // how much of the cover's own chroma carries over
      grayChromaScale: 0.35   // near-grays (Craw<0.03) — keep low so grays don't invent color
    };
    function cardHoverTintHex(book) {
      if(!siteSettings.adaptiveDetail) return null;
      const srcHex=(book && book.coverColor || '').trim();
      if(!isValidHexColor(srcHex)) return null;
      const baseHex=resolveTokenHex('--img-bg-hover');
      if(!baseHex) return null;
      const {L}=rgbToOklch(...Object.values(hexToRgb(baseHex)));
      const {C:Craw,H}=rgbToOklch(...Object.values(hexToRgb(srcHex)));
      const rawC=Craw < 0.03
        ? Craw * HOVER_TINT_TUNING.grayChromaScale
        : Math.min(HOVER_TINT_TUNING.maxChroma, Craw * HOVER_TINT_TUNING.chromaScale);
      const c=clampChroma(L, rawC, H);
      const {r,g,b}=oklchToRgb(L, c, H);
      return rgbToHex(r, g, b);
    }

    // Collapsible States (volumes only — stages are compact rows now, so they
    // aren't collapsible; dragging between rows is easy enough.)
    // SESSION-ONLY by design: collapse state lives in memory for the current
    // page load and resets to all-expanded on every reload. Never persisted.
    let collapsedVolumes = new Set();

    // Default Seed Dataset
    const defaultBooksSeed = [
      {
        id: "1",
        title: "The Surfer: How to Stop Playing Somebody Else's Game",
        author: "C. Thi Nguyen",
        volumeNumber: 1,
        volumeName: "Agency & Games",
        stageNumber: 1,
        stageName: "Value Capture & Play",
        readingOrder: 1,
        year: "2026",
        status: "",
        engine: "Engine 1: Deep Focus",
        cover: "",
        notes: "Explores how scoring systems in games and life can narrow agency.",
        isbn: "9780197686546"
      },
      {
        id: "2",
        title: "The Creative Act: A Way of Being",
        author: "Rick Rubin",
        volumeNumber: 1,
        volumeName: "Agency & Games",
        stageNumber: 1,
        stageName: "Value Capture & Play",
        readingOrder: 2,
        year: "2023",
        status: "Reading",
        engine: "Engine 2: Complementary",
        cover: "",
        notes: "Practical insights on awareness and expressive momentum.",
        isbn: "9780593652886"
      },
      {
        id: "3",
        title: "Why We Meditate: The Science and Practice of Clarity",
        author: "Daniel Goleman & Tsoknyi Rinpoche",
        volumeNumber: 1,
        volumeName: "Agency & Games",
        stageNumber: 2,
        stageName: "Mindful Awareness",
        readingOrder: 1,
        year: "2022",
        status: "",
        engine: "None",
        cover: "",
        notes: "",
        isbn: "9781982178451"
      },
      {
        id: "4",
        title: "Make Your Art No Matter What: Moving Beyond Resistance",
        author: "Beth Pickens",
        volumeNumber: 2,
        volumeName: "Creative Process",
        stageNumber: 1,
        stageName: "Overcoming Resistance",
        readingOrder: 1,
        year: "2021",
        status: "Reading",
        engine: "Engine 3: Exploration",
        cover: "",
        notes: "",
        isbn: "9781797206073"
      },
      {
        id: "5",
        title: "How to Fall in Love with Questions: A New Way to Thrive",
        author: "Elizabeth Pastor",
        volumeNumber: 2,
        volumeName: "Creative Process",
        stageNumber: 2,
        stageName: "Inquiry Frameworks",
        readingOrder: 1,
        year: "2025",
        status: "",
        engine: "None",
        cover: "",
        notes: "",
        isbn: "9781637742111"
      },
      {
        id: "6",
        title: "The Hidden Spring: A Journey to the Source of Consciousness",
        author: "Mark Solms",
        volumeNumber: 3,
        volumeName: "Cognition & Consciousness",
        stageNumber: 1,
        stageName: "Neuropsychoanalysis",
        readingOrder: 1,
        year: "2021",
        status: "Completed",
        engine: "None",
        cover: "",
        notes: "",
        isbn: "9780393525557"
      }
    ];

    let books = [];
    let currentView = 'grid';
    let sortableInstances = [];
    let dragExpandTimeout = null;

    // One-time migration: the old model defaulted every book to "To Read". Under
    // the new opt-in model empty status = "No status" (no pill). Clear legacy
    // "To Read" values once so only actively-assigned statuses remain visible.
    function migrateLegacyToRead(booksArray) {
      if (localStorage.getItem(STATUS_CLEANUP_KEY)) return booksArray;
      const migrated = booksArray.map(b => (b.status === 'To Read' ? { ...b, status: '' } : b));
      localStorage.setItem(STATUS_CLEANUP_KEY, '1');
      return migrated;
    }

    // Renumber EVERY stage 1..n. The stable sort preserves each stage's
    // existing relative order, so nothing visibly reshuffles. A no-op on
    // already-clean data, hence safe to run unguarded (e.g. on imports).
    function normalizeAllReadingOrders(booksArray) {
      const groups = new Map();
      booksArray.forEach(b => {
        const k = `${b.volumeNumber}:${b.stageNumber}`;
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(b);
      });
      groups.forEach(list => {
        list.sort((a, b) => a.readingOrder - b.readingOrder)
            .forEach((b, i) => { b.readingOrder = i + 1; });
      });
      return booksArray;
    }

    // One-time migration: earlier versions left gaps and duplicate reading
    // orders behind when a book was moved between stages (or deleted) via the
    // edit modal. Heal pre-fix localStorage copies once per browser.
    function migrateReadingOrders(booksArray) {
      if (localStorage.getItem(ORDER_CLEANUP_KEY)) return booksArray;
      normalizeAllReadingOrders(booksArray);
      localStorage.setItem(ORDER_CLEANUP_KEY, '1');
      return booksArray;
    }

    // Renumber volume numbers 1..n, then every volume's stages 1..n, each
    // preserving the current relative order (names — volumeName/stageName —
    // live on the books and are untouched). Both number sets are DERIVED from
    // the books, so once a volume/stage loses its last book the number is
    // gone for good and the sequence shows gaps (e.g. 1,2,4,5…). This closes
    // those gaps. A no-op on already-clean data, hence safe to run unguarded
    // (e.g. on imports). Volumes are relabelled FIRST — stage grouping is
    // unaffected (same books per group), so the stage pass runs after.
    function normalizeAllVolumeStageNumbers(booksArray) {
      const volNums = Array.from(new Set(booksArray.map(b => b.volumeNumber))).sort((a, b) => a - b);
      const volMap = new Map(); // oldVolumeNumber → newVolumeNumber
      volNums.forEach((oldNum, i) => volMap.set(oldNum, i + 1));
      booksArray.forEach(b => { b.volumeNumber = volMap.get(b.volumeNumber); });

      const vols = new Map();
      booksArray.forEach(b => {
        if (!vols.has(b.volumeNumber)) vols.set(b.volumeNumber, new Set());
        vols.get(b.volumeNumber).add(b.stageNumber);
      });
      const remap = new Map(); // volumeNumber → Map(oldStageNum → newStageNum)
      vols.forEach((stageSet, volNum) => {
        const sorted = Array.from(stageSet).sort((a, b) => a - b);
        const map = new Map();
        sorted.forEach((oldNum, i) => map.set(oldNum, i + 1));
        remap.set(volNum, map);
      });
      booksArray.forEach(b => {
        const map = remap.get(b.volumeNumber);
        if (map) b.stageNumber = map.get(b.stageNumber);
      });
      return booksArray;
    }

    // One-time migration: deleting a stage (or dragging its last book out)
    // left permanent gaps in the stage numbering (volume 5 went 1,2,4,5,6,7);
    // the same shape applies to deleted volumes. Heal pre-fix localStorage
    // copies once per browser.
    function migrateStageNumbers(booksArray) {
      if (localStorage.getItem(STAGE_CLEANUP_KEY)) return booksArray;
      normalizeAllVolumeStageNumbers(booksArray);
      localStorage.setItem(STAGE_CLEANUP_KEY, '1');
      return booksArray;
    }

    // Backfill coverColor into a localStorage copy from the committed books.json.
    // LocalStorage Operations
    // Prefer existing localStorage. On a fresh start (no usable stored data) we
    // bootstrap from the committed books.json when it's reachable (e.g. served
    // over http://localhost), and only fall back to the sample seed otherwise.
    async function loadBooksFromStorage() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const data = migrateStageNumbers(migrateReadingOrders(migrateLegacyToRead(parsed.map(normalizeBook))));
            // Persist the cleanup so it survives reloads even without a later save.
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
          }
        } catch (e) {
          console.error("Failed to parse books from localStorage:", e);
        }
      }

      // file:// first-run: browsers block fetch of local files (CORS "null"
      // origin), so a downloaded repo can't pull books.json over HTTP. Reuse the
      // persisted File System Access handle if one is saved (silent), otherwise
      // fall through to the seed + a first-run banner that lets the user pick it.
      if (window.location.protocol === 'file:') {
        const handle = await loadBooksFileHandle();
        if (handle) {
          try {
            const data = await readBooksJsonData();
            if (Array.isArray(data) && data.length > 0) {
              const seeded = migrateStageNumbers(migrateReadingOrders(migrateLegacyToRead(data.map(normalizeBook))));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
              localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
              return seeded;
            }
          } catch (err) {
            console.warn('[library] could not read books.json via saved handle:', err);
          }
        }
        // No usable catalog yet — seed so the page isn't blank, and surface the
        // banner (picking books.json needs a user click).
        showFirstRunBanner();
        saveBooksToStorage(defaultBooksSeed);
        return defaultBooksSeed;
      }

      try {
        const response = await fetch('books.json', { cache: 'no-store' });
        if (response.ok) {
          const parsed = await response.json();
          if (Array.isArray(parsed) && parsed.length > 0) {
            const seeded = migrateStageNumbers(migrateReadingOrders(migrateLegacyToRead(parsed.map(normalizeBook))));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            // Matches the committed books.json — no export reminder needed.
            localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
            return seeded;
          }
        }
      } catch (err) {
        console.warn('[library] books.json unavailable for first-run bootstrap, using seed:', err);
      }

      saveBooksToStorage(defaultBooksSeed);
      return defaultBooksSeed;
    }

    function saveBooksToStorage(data) {
      if (viewOnly) return; // Read-only modes never persist visitor edits.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(LAST_MODIFIED_KEY, new Date().toISOString());
      updateExportReminder();
    }

    function toggleVolumeCollapse(volNum) {
      const key = `vol-${volNum}`;
      const collapsing = !collapsedVolumes.has(key);

      // Collapsing re-renders the whole roadmap while the scroll offset stays
      // put — the collapsed volume's content is removed, everything below it
      // slides up, and the viewport lands MID-WAY inside the next volume. When
      // this volume's header is pinned at (or has scrolled past) its sticky
      // point, rest the scroll on the collapsed section instead: the header
      // keeps its position at the top of the viewport and the next volume
      // starts right below it. A header still in natural flow (clicked before
      // it ever pinned) doesn't move when content below it collapses, so no
      // correction is needed there.
      let restOnCollapsedHeader = false;
      if (collapsing) {
        const header = document.querySelector(
          `.volume-section[data-vol-num="${volNum}"] .volume-header`
        );
        if (header) {
          // Same stick test syncVolumeHeaderStuck uses: the computed `top` IS
          // the sticky point (safe-area inset; plus the pinned bar height in
          // always-bar mode).
          const stickyTop = parseFloat(getComputedStyle(header).top) || 0;
          restOnCollapsedHeader = header.getBoundingClientRect().top <= stickyTop + 1;
        }
      }

      if (collapsing) collapsedVolumes.add(key);
      else collapsedVolumes.delete(key);
      renderBooks();

      if (restOnCollapsedHeader) {
        // Land on the collapsed SECTION — never the header (it's sticky; the
        // section always reports its true position, same contract as
        // jumpToVolumeStage). scrollIntoView resolves the target atomically at
        // scroll time against the already-swapped DOM, so it can run
        // synchronously right after renderBooks — no rAF wait, and no
        // intermediate frame ever paints the mid-next-volume state. The
        // section's scroll-margin-top supplies the safe-area / pinned-bar
        // clearance in every mode.
        const section = document.querySelector(`.volume-section[data-vol-num="${volNum}"]`);
        if (section) {
          // Reset the velocity baseline so the programmatic jump isn't read as
          // a user flick (which would wrongly reveal the filter bar) — same
          // reset jumpToVolumeStage performs for its jumps.
          scrollSamples.length = 0;
          lastScrollY = window.scrollY;
          lastScrollDir = 'down';
          syncStickyBar();
          section.scrollIntoView({ block: 'start' });
        }
      }
    }

    function normalizeBook(b) {
      return {
        id: b.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title: b.title || "Untitled",
        author: b.author || "Unknown Author",
        volumeNumber: parseInt(b.volumeNumber || b.volume) || 1,
        volumeName: b.volumeName || (b.volume && isNaN(b.volume) ? b.volume : "General"),
        stageNumber: parseInt(b.stageNumber || b.stage) || 1,
        stageName: b.stageName || "General Stage",
        readingOrder: parseInt(b.readingOrder || b.order) || 1,
        year: (b.year || "").toString(),
        firstPublished: (b.firstPublished ?? b.originalYear ?? "").toString().trim(),
        status: b.status || "",
        engine: b.engine || "None",
        cover: b.cover || b.cover_url || "",
        notes: b.notes || "",
        summary: b.summary || "",
        isbn: (b.isbn || "").toString(),
        pages: b.pages ? parseInt(b.pages, 10) : undefined,
        // Date Added (ISO datetime). Backfilled from epub file creation dates
        // by scripts/add-created-dates.mjs; new books are stamped at save time.
        created: b.created || "",
        coverColor: (typeof b.coverColor === 'string' && /^#[0-9a-f]{6}$/i.test(b.coverColor.trim())) ? b.coverColor.trim().toLowerCase() : "",
        tags: Array.isArray(b.tags)
          ? [...new Set(b.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean))]
          : []
      };
    }

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
  // Format calendar components directly so publication dates never shift timezones.
  function formatPublicationDate(value) {
    const date = parsePublicationDate(value);
    if (!date) return String(value ?? '').trim();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = date.text.slice(0, 4);
    return date.day ? `${months[date.month - 1]} ${String(date.day).padStart(2, '0')}, ${year}`
      : date.month ? `${months[date.month - 1]} ${year}` : year;
  }
  function invalidPublicationDate(value) {
    const text = String(value ?? '').trim();
    return !!text && /^[\d/\-]+$/.test(text) && !parsePublicationDate(text);
  }

    // Parse free-text year for sorting: handles "65 CE", "400 BCE", "1st Century CE", "c. 1800"
    function parseYearForSort(s) {
      if (!s) return null;
      const date = parsePublicationDate(s);
      if (date) return date.sort;
      let t = s.trim().toLowerCase().replace(/^(c\.|ca\.|circa|~)\s*/, '');
      const isBCE = /\b(bce|bc)\b/.test(t);
      const cent = t.match(/(\d+)\s*(st|nd|rd|th)?\s*century/);
      if (cent) {
        const c = parseInt(cent[1], 10);
        return isBCE ? -(c * 100 - 50) : c * 100 - 50;
      }
      const n = t.match(/-?\d+/);
      if (!n) return null;
      let y = parseInt(n[0], 10);
      return isBCE ? -Math.abs(y) : y;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    }

    // Subdued title tail — everything after the first ":", full-width "：", or "("
    // is wrapped in a muted span so the main title pops in cards/engine slots.
    // Display-only: stored titles and search/filter (which match book.title) are untouched.
    function renderTitleHtml(title) {
      const escaped = escapeHtml(title);
      // Split on the FIRST of :, ：, ( (whichever comes first). Works on the escaped
      // string because escapeHtml preserves those characters.
      const m = escaped.match(/^(.*?)([:：(].*)$/);
      return m ? `${m[1]}<span class="title-sub">${m[2]}</span>` : escaped;
    }

    // Main title only — drops the subtitle tail (everything from the first
    // ":", full-width "：", or "("). Same rule as renderTitleHtml; used for
    // [[book ref]] chips in notes so long subtitles don't bloat the text.
    function shortTitle(title) {
      const m = String(title || '').match(/^(.*?)([:：(].*)$/);
      return (m ? m[1] : String(title || '')).trim() || title;
    }

    // Mini-markdown for personal notes — DISPLAY-TIME ONLY, stored text stays
    // plain (search/export untouched). Supports **bold**, *italic*,
    // [label](https://url) external links, and [[Book Title]] cross-reference
    // chips that open that book's detail modal. HTML is escaped FIRST so
    // nothing else can inject markup; unmatched [[...]] renders literally.
    function renderNotesHtml(text) {
      // Tokenize source before producing HTML; never run replacements over
      // generated attributes or book titles. Notes retain their inline layout.
      const source = String(text || '');
      const tokens = /\[\[([^\[\]]+)\]\]|\[([^\]\[]+)\]\(([^()\s]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
      let result = '', end = 0;
      for (const match of source.matchAll(tokens)) {
        result += escapeHtml(source.slice(end, match.index));
        const [literal, title, label, url, bold, italic] = match;
        if (title !== undefined) {
          const q = title.trim().toLowerCase();
          const hit = q && (books.find(b => (b.title || '').toLowerCase() === q) || books.find(b => (b.title || '').toLowerCase().startsWith(q)));
          result += hit ? `<button type="button" class="note-bookref" data-book-id="${escapeHtml(hit.id)}" title="${escapeHtml(hit.title)}">${escapeHtml(shortTitle(hit.title))}</button>` : escapeHtml(literal);
        } else if (label !== undefined) {
          result += /^https?:\/\//i.test(url) ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${renderNotesHtml(label)}</a>` : escapeHtml(literal);
        } else {
          result += bold !== undefined ? `<strong>${escapeHtml(bold)}</strong>` : `<em>${escapeHtml(italic)}</em>`;
        }
        end = match.index + literal.length;
      }
      return result + escapeHtml(source.slice(end));
    }

    function renderMiniMarkdown(text) {
      const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
      const output = [];
      let paragraph = [], list = [], listType = '';
      const flushParagraph = () => { if (paragraph.length) output.push('<p>' + paragraph.map(renderNotesHtml).join('<br>') + '</p>'); paragraph = []; };
      const flushList = () => { if (list.length) output.push(`<${listType}>` + list.map(item => '<li>' + renderNotesHtml(item) + '</li>').join('') + `</${listType}>`); list = []; listType = ''; };
      for (const line of lines) {
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        const bullet = line.match(/^\s*(?:([-*])\s+|\d+\.\s+)(.+)$/);
        const quote = line.match(/^>\s?(.*)$/);
        if (bullet) {
          flushParagraph();
          const type = bullet[1] ? 'ul' : 'ol';
          if (listType && listType !== type) flushList();
          listType = type; list.push(bullet[2]); continue;
        }
        flushList();
        if (!line.trim() || heading || quote || /^\s*---\s*$/.test(line)) {
          flushParagraph();
          if (heading) { const level = heading[1].length + 1; output.push(`<h${level}>${renderNotesHtml(heading[2])}</h${level}>`); }
          else if (quote) output.push('<blockquote>' + renderNotesHtml(quote[1]) + '</blockquote>');
          else if (line.trim()) output.push('<hr>');
        } else paragraph.push(line);
      }
      flushParagraph(); flushList();
      return output.join('');
    }

    // Cover Rendering
    function createJacketHtml(title, author) {
      return `
        <div class="book-jacket">
          <div class="jacket-header"><i data-lucide="book" style="width: 16px; height: 16px;"></i></div>
          <div class="jacket-title">${escapeHtml(title)}</div>
          <div class="jacket-author">${escapeHtml(author)}</div>
        </div>
      `;
    }

    function handleCoverError(imgElement) {
      const title = imgElement.getAttribute('data-title') || 'Untitled';
      const author = imgElement.getAttribute('data-author') || 'Unknown Author';
      const container = imgElement.parentElement;
      if (container) {
        container.innerHTML = createJacketHtml(title, author);
        lucide.createIcons();
      }
    }

    // Per-book cover version for cache-busting covers/<id>.jpg. The cover URL
    // never changes across edits (it's keyed by the book id), so after the file
    // is re-written the browser would otherwise keep serving the stale cached
    // bytes. Bumped in writeCoverBlob when the new file lands in covers/;
    // renderCoverHtml appends ?v=N so the grid re-fetches immediately.
    const coverVersions = new Map();

    function renderCoverHtml(coverUrl, title, author, imgClass = 'cover-img', bookId, opts = {}) {
      const inner = (() => {
        if (coverUrl && coverUrl.trim() !== '') {
          const version = bookId && coverVersions.get(bookId);
          const src = version ? `${coverUrl}?v=${version}` : coverUrl;
          return `<img src="${escapeHtml(src)}" 
                       alt="${escapeHtml(title)}" 
                       class="${imgClass}" 
                       loading="lazy" 
                       data-title="${escapeHtml(title)}" 
                       data-author="${escapeHtml(author)}" 
                       onerror="handleCoverError(this)" />`;
        }
        return createJacketHtml(title, author);
      })();

      // Wrap the flat cover in a 3D "book" (spine + page edges) for the hover effect.
      // The spine texture is derived purely in CSS from the cover's left edge at
      // layout time (see sizeAllBook3D), so no stored color is needed here.
      if (opts.threeD) {
        const pagesAttr = opts.pages ? ` data-pages="${parseInt(opts.pages, 10)}"` : '';
        // Back cover: solid card tinted from the book's dominant coverColor —
        // closes the box so no spin angle can ever reveal a hollow. Invisible
        // at rest (backface-visibility) — only a >90° spin would show it.
        const backStyle = opts.back ? ` style="--back-color:${escapeHtml(opts.back)}"` : '';
        // Optional rotate-hint badge (detail modal only) — a sibling AFTER
        // .book3d so it stays flat (never inherits the 3D transform).
        const hintHtml = opts.hint
          ? `<div class="book3d-hint" aria-hidden="true"><i data-lucide="rotate-3d"></i></div>`
          : '';
        return `<div class="book3d"${pagesAttr}${backStyle}>
          <div class="book3d__face book3d__front">${inner}<div class="book3d__gloss"></div></div>
          <div class="book3d__face book3d__spine"></div>
          <div class="book3d__face book3d__pages book3d__pages--right"></div>
          <div class="book3d__face book3d__pages book3d__pages--top"></div>
          <div class="book3d__face book3d__pages book3d__pages--bottom"></div>
          <div class="book3d__face book3d__back"></div>
        </div>${hintHtml}`;
      }
      return inner;
    }

    // Cover upload — pick a local image, downscale it, and save it into covers/.
    const MAX_COVER_WIDTH = 800; // max width in px (height uncapped)
    const COVER_QUALITY = 0.85;

    // The spine texture is derived purely in CSS from the cover's left edge
    // (see sizeAllBook3D): the cover URL is used as a background and sized so the
    // leftmost few pixels fill the spine. No canvas, so it works on every origin
    // (http, https, file://) and is GPU-composited — no main-thread encode and no
    // double-decode. No stored color is needed.

    function processCoverImage(file) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
          reject(new Error('Please choose an image file.'));
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, MAX_COVER_WIDTH / img.naturalWidth);
          const w = Math.max(1, Math.round(img.naturalWidth * scale));
          const h = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(objectUrl);
          canvas.toBlob(blob => blob ? resolve({ blob }) : reject(new Error('Could not encode the image.')), 'image/jpeg', COVER_QUALITY);
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read that image.')); };
        img.src = objectUrl;
      });
    }

    // --- Covers directory handle persistence (File System Access API) ---
    // After the user picks the covers/ folder once, we remember the handle in
    // IndexedDB so later saves reuse it instead of re-opening the folder picker.
    // Chrome persists the readwrite permission per origin, so after the first
    // grant, saves write straight into covers/ with no dialog at all.
    const COVER_DIR_DB = 'jons-books';
    const COVER_DIR_STORE = 'kv';
    const COVER_DIR_KEY = 'coversDirHandle';

    function openCoverDirDb() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
        const req = indexedDB.open(COVER_DIR_DB, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(COVER_DIR_STORE)) db.createObjectStore(COVER_DIR_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    async function loadCoversDirHandle() {
      try {
        const db = await openCoverDirDb();
        return await new Promise((resolve, reject) => {
          const get = db.transaction(COVER_DIR_STORE, 'readonly').objectStore(COVER_DIR_STORE).get(COVER_DIR_KEY);
          get.onsuccess = () => { db.close(); resolve(get.result || null); };
          get.onerror = () => { db.close(); reject(get.error); };
        });
      } catch { return null; }
    }

    async function saveCoversDirHandle(handle) {
      try {
        const db = await openCoverDirDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(COVER_DIR_STORE, 'readwrite');
          tx.objectStore(COVER_DIR_STORE).put(handle, COVER_DIR_KEY);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        db.close();
      } catch { /* best-effort; picker will just appear next time */ }
    }

    // True when the saved handle is usable without showing a dialog (permission
    // already granted); false means the user needs to pick the folder again.
    async function coversDirPermissionGranted(handle) {
      try {
        if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
        if (await handle.requestPermission({ mode: 'readwrite' }) === 'granted') return true;
      } catch { /* fall through */ }
      return false;
    }

    // Hybrid write: File System Access API writes straight into covers/ when
    // available (Chrome/Edge); otherwise we download the file for the user to
    // drop into covers/. Either way the stored cover value is "covers/<id>.jpg".
    async function writeCoverBlob(blob, id) {
      const fileName = `${id}.jpg`;
      if (window.showDirectoryPicker) {
        try {
          // Reuse the folder chosen last time when its permission is still granted.
          let dirHandle = await loadCoversDirHandle();
          if (dirHandle && !(await coversDirPermissionGranted(dirHandle))) {
            dirHandle = null; // revoked or denied → let the user pick again
          }
          if (!dirHandle) {
            dirHandle = await window.showDirectoryPicker();
            saveCoversDirHandle(dirHandle); // remember for next time (fire-and-forget)
          }
          const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          // New bytes are on disk at covers/<id>.jpg — bump the version so the
          // next render's src (covers/<id>.jpg?v=N) bypasses the HTTP cache.
          coverVersions.set(id, (coverVersions.get(id) || 0) + 1);
          return `covers/${fileName}`;
        } catch (err) {
          if (err && err.name === 'AbortError') return null; // user cancelled the folder picker
          // Any other FS error → fall through to the download path.
        }
      }
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      return `covers/${fileName}`;
    }

    // --- Link-preview social card (og-card.jpg at the repo ROOT) ---
    // Settings → Link preview overwrites this file directly (the path is
    // fixed; it is not a site.json key). The default card is generated by
    // scripts/make-og-card.mjs. Writes go through a persisted directory
    // handle for the repo root — same IndexedDB kv store as the covers
    // handle, different key. The deployed og:image URL is cache-busted at
    // deploy time by scripts/inject-og.mjs from the file's content hash.
    const OG_CARD_FILE = 'og-card.jpg';
    const OG_CARD_WIDTH = 1200;
    const OG_CARD_HEIGHT = 630;
    const OG_CARD_QUALITY = 0.85;
    const OG_CARD_DIR_KEY = 'ogCardDirHandle';

    // Cover-CROP (not aspect-preserving) to exactly 1200×630: link platforms
    // render og:image at this ratio, and fixed dimensions let the deploy-time
    // injection emit static og:image:width/height.
    function processOgImage(file) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
          reject(new Error('Please choose an image file.'));
          return;
        }
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          // Scale until BOTH dimensions cover the target, then center-crop.
          const scale = Math.max(OG_CARD_WIDTH / img.naturalWidth, OG_CARD_HEIGHT / img.naturalHeight);
          const sw = OG_CARD_WIDTH / scale;
          const sh = OG_CARD_HEIGHT / scale;
          const sx = (img.naturalWidth - sw) / 2;
          const sy = (img.naturalHeight - sh) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = OG_CARD_WIDTH;
          canvas.height = OG_CARD_HEIGHT;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OG_CARD_WIDTH, OG_CARD_HEIGHT);
          URL.revokeObjectURL(objectUrl);
          canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode the image.')), 'image/jpeg', OG_CARD_QUALITY);
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not read that image.')); };
        img.src = objectUrl;
      });
    }

    async function loadOgCardDirHandle() {
      try {
        const db = await openCoverDirDb();
        return await new Promise((resolve, reject) => {
          const get = db.transaction(COVER_DIR_STORE, 'readonly').objectStore(COVER_DIR_STORE).get(OG_CARD_DIR_KEY);
          get.onsuccess = () => { db.close(); resolve(get.result || null); };
          get.onerror = () => { db.close(); reject(get.error); };
        });
      } catch { return null; }
    }

    async function saveOgCardDirHandle(handle) {
      try {
        const db = await openCoverDirDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(COVER_DIR_STORE, 'readwrite');
          tx.objectStore(COVER_DIR_STORE).put(handle, OG_CARD_DIR_KEY);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        db.close();
      } catch { /* best-effort; picker will just appear next time */ }
    }

    // Hybrid write for og-card.jpg: File System Access API writes straight
    // into the picked (repo-root) folder on Chrome/Edge; otherwise the file
    // downloads and the user moves it into the repo root by hand.
    // Returns 'written' | 'download' | 'cancelled'.
    async function writeOgCardBlob(blob) {
      if (window.showDirectoryPicker) {
        try {
          // Reuse the root folder chosen last time when its permission is
          // still granted (same requestPermission pattern as covers).
          let dirHandle = await loadOgCardDirHandle();
          if (dirHandle && !(await coversDirPermissionGranted(dirHandle))) {
            dirHandle = null; // revoked or denied → let the user pick again
          }
          if (!dirHandle) {
            dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
            saveOgCardDirHandle(dirHandle); // remember for next time (fire-and-forget)
          }
          const fileHandle = await dirHandle.getFileHandle(OG_CARD_FILE, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          return 'written';
        } catch (err) {
          if (err && err.name === 'AbortError') return 'cancelled'; // picker dismissed
          // Any other FS error → fall through to the download path.
        }
      }
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = OG_CARD_FILE;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      return 'download';
    }

    // DOM Elements
    const viewGridBtn = document.getElementById('view-grid-btn');
    const viewRoadmapBtn = document.getElementById('view-roadmap-btn');
    const viewToggleWrap = document.querySelector('.view-toggle');
    const bookGrid = document.getElementById('book-grid');

    // 3D book hover: cursor-following tilt + gloss sheen on covers (grid + volumes rows).
    // Delegated on bookGrid so it survives grid/roadmap re-renders (innerHTML swaps).
    // TUNE: MAX_X = max vertical tilt (rotateX, ±MAX_X° at top/bottom edge);
    //       MAX_Y = max horizontal tilt (rotateY, ±MAX_Y° at left/right edge).
    (function initBook3DTilt() {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const MAX_X = 4; // degrees — try 6-8 for steeper vertical tilt
      const MAX_Y = 15; // degrees — try 54 for dramatic card hover
      let raf = null;
      let lastBook = null;

      function reset(book) {
        if (!book) return;
        book.style.setProperty('--ry', '0deg');
        book.style.setProperty('--rx', '0deg');
        const g = book.querySelector('.book3d__gloss');
        if (g) g.style.opacity = '0';
      }

      bookGrid.addEventListener('pointermove', (e) => {
        const book = e.target.closest('.book3d');
        if (book !== lastBook) { reset(lastBook); lastBook = book; }
        if (!book) return;
        // Anchor to the stable container (untransformed) — measuring the
        // rotating book's own rect shrinks as it tilts (w*cos) and feeds back.
        const container = book.closest('.cover-container') || book;
        const r = container.getBoundingClientRect();
        const px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        const py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const ry = (px - 0.5) * 2 * MAX_Y;
          const rx = -(py - 0.5) * 2 * MAX_X;
          book.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          book.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          const gloss = book.querySelector('.book3d__gloss');
          if (gloss) {
            gloss.style.opacity = '1';
            gloss.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
            gloss.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
          }
          raf = null;
        });
      });
      bookGrid.addEventListener('pointerleave', () => { reset(lastBook); lastBook = null; });
    })();

    // Size each 3D book to its cover's natural aspect ratio, contained within
    // the original 85%×80% footprint of the grey .cover-container. CSS can't
    // both "contain" an image and wrap a 3D box of that exact size, so we
    // measure: box = container content area * 0.85 / 0.80; contained size =
    // min(boxW, boxH*ar) × min(boxH, boxW/ar). Jackets (no <img>) keep the box.
    function sizeBook3D(book3d) {
      // Detail modal cover has no .cover-container — size from #detail-cover directly.
      const detailCoverEl = book3d.closest('#detail-cover');
      const isDetailBook = !!detailCoverEl;
      const container = book3d.closest('.cover-container') || detailCoverEl;
      if (!container) return;
      const cs = getComputedStyle(container);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const availW = container.clientWidth - padX;
      const availH = container.clientHeight - padY;
      // Detail book: fill its fixed 320×~480 box directly (no grey footprint shrinkage);
      // grid books: fit the grey footprint at 0.84/0.79.
      const boxW = isDetailBook ? availW *0.90 : availW * 0.84;
      const boxH = isDetailBook ? availH *0.90 : availH * 0.79;

      const img = book3d.querySelector('.book3d__front img');
      let w, h;
      if (img && img.naturalWidth && img.naturalHeight) {
        const ar = img.naturalWidth / img.naturalHeight;
        w = Math.min(boxW, boxH * ar);
        h = w / ar;
        book3d.style.width = w + 'px';
        book3d.style.height = h + 'px';
      } else {
        // Jacket fallback: keep the box size.
        w = boxW;
        h = boxH;
      }
      // Depth scales with both cover width and page count. Thick books are
      // genuinely thicker; covers still look consistent when w changes.
      const pagesEff = (book3d.dataset.pages && parseInt(book3d.dataset.pages, 10)) || 240;
      const depth = Math.round(Math.max(14, Math.min(56, w * 0.10 + pagesEff * 0.06)));
      book3d.style.setProperty('--book-depth', depth + 'px');
    }

    function deriveSpineTexture(book3d) {
      const img = book3d.querySelector('.book3d__front img');
      const coverSrc = img && (img.currentSrc || img.src);
      if (coverSrc && img && img.naturalWidth) {
        const N = 3;
        const cw = img.naturalWidth || 400;
        const bgWpct = (cw / N) * 100;
        book3d.style.setProperty('--spine-img', `url("${coverSrc}")`);
        book3d.style.setProperty('--spine-bg-size', `${bgWpct}% 100%`);
        book3d.style.setProperty('--spine-bg-pos', 'left center');
      }
    }

    function sizeAllBook3D() {
      bookGrid.querySelectorAll('.book3d').forEach(book3d => {
        const img = book3d.querySelector('.book3d__front img');
        const apply = () => {
          sizeBook3D(book3d);
          deriveSpineTexture(book3d);
        };
        if (img && img.naturalWidth) {
          apply();
        } else if (img) {
          // Lazy covers load late — size + set spine once pixels are available.
          img.addEventListener('load', apply, { once: true });
        } else {
          sizeBook3D(book3d); // jacket fallback (no <img>)
        }
      });
    }

    // Recompute on viewport changes (container size drives the footprint).
    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        sizeAllBook3D();
        // Detail modal lives outside bookGrid — re-measure it live while open
        // so the cover shrinks/grows with the viewport without needing a refresh.
        if (window.sizeDetailBook3D) {
          const dm = document.getElementById('book-detail-modal');
          if (dm && dm.classList.contains('active')) window.sizeDetailBook3D();
        }
      });
    });

    const searchInput = document.getElementById('search-input');
    const filterVolume = document.getElementById('filter-volume');
    const filterStatus = document.getElementById('filter-status');
    const sortSelect = document.getElementById('sort-select');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const surpriseBtn = document.getElementById('surprise-btn');
    const tagFilters = document.getElementById('tag-filters');
    const filterBar = document.getElementById('filter-bar');
    const filterPanel = document.getElementById('filter-panel');
    const filterToggle = document.getElementById('filter-toggle');
    const filterBadge = document.getElementById('filter-badge');
    const filterClear = document.getElementById('filter-clear');
    // Mobile collapsible search (see openMobileSearch/closeMobileSearch below).
    const searchToggle = document.getElementById('search-toggle');
    const searchBadge = document.getElementById('search-badge');
    const searchClearBtn = document.getElementById('search-clear');
    const searchCollapseBtn = document.getElementById('search-collapse');
    const searchWrap = document.querySelector('.search-input-wrap');
    // Mobile-only: view switches land at the first books (see scrollToFirstBooks).
    const mobileView = window.matchMedia('(max-width: 460px)');
    // Panel-as-overlay band (≤780px): selects live behind ⚙ on the tag row.
    // Drives panel auto-collapse on picks; sticky/scroll behavior instead
    // follows mobileView (≤460px tucks like mobile, above pins like desktop).
    const narrowPanel = window.matchMedia('(max-width: 780px)');

    // Unified sticky filter bar (desktop + mobile, Grid + Volumes): the bar
    // tucks off-screen once you scroll past it and re-reveals pinned at the
    // top when you scroll up (see the .is-past / .is-revealed CSS). A zero-
    // height sentinel sits just above the bar — while it's on screen the bar
    // is at its natural spot; once it scrolls out of view the bar has reached
    // its sticky point.
    const filterBarSentinel = document.createElement('div');
    filterBarSentinel.style.height = '0px';
    filterBarSentinel.setAttribute('aria-hidden', 'true');
    filterBar.parentNode.insertBefore(filterBarSentinel, filterBar);
    // Desktop-only: a zero-height sentinel BELOW the bar marks when the WHOLE
    // bar (its natural in-flow spot) has scrolled off the top. Used to decide
    // when the compact pinned bar may appear — it stays accurate even while
    // the bar is sticky-pinned (see applyStickyBarState).
    const filterBarGoneSentinel = document.createElement('div');
    filterBarGoneSentinel.style.height = '0px';
    filterBarGoneSentinel.setAttribute('aria-hidden', 'true');
    filterBar.parentNode.insertBefore(filterBarGoneSentinel, filterBar.nextSibling);
    // Desktop-only flow shim: pinning compacts the bar, but the original OG
    // bar must keep its document-space height. Without this shim, revealing
    // or releasing the compact bar moves the results underneath it and causes
    // a visible layout stutter near the top of the page.
    const filterBarFlowShim = document.createElement('div');
    filterBarFlowShim.setAttribute('aria-hidden', 'true');
    filterBarFlowShim.style.height = '0px';
    filterBar.parentNode.insertBefore(filterBarFlowShim, filterBarGoneSentinel.nextSibling);

    // Scroll state for the reveal-on-scroll-up bar.
    let barPastTop = false;
    let lastScrollY = window.scrollY || 0;
    let lastScrollDelta = 0;
    let lastScrollDir = 'down';
    let desktopBarNaturalHeight = 0;
    let desktopPinReleaseTimer = null;
    let barPanelLocked = false; // mobile Filters panel open → keep the bar revealed
    // The bar must ALSO stay revealed while the expanded mobile search is open
    // (either surface would otherwise tuck away mid-use). All reads go through
    // this helper so closing the Filters panel can't unlock an open search
    // (closeFilterPanel resets barPanelLocked unconditionally).
    function isBarLocked() {
      return barPanelLocked || filterBar.classList.contains('search-open');
    }
    // A programmatic scroll-reset (shuffle/tag/sort/filter/view) pins the bar at
    // the landing point. Without this lock the jump's own scroll event sees the
    // below-bar sentinel back in view and un-sticks the bar, leaving it half-
    // tucked above the viewport. Released on a real scroll (see the listener).
    let barLandingLock = false;
    // Velocity tuning (NOT distance): revealing takes a real upward scroll, not
    // a slow nudge. A sliding window of recent scroll samples gives px/ms
    // velocity; the dead zone between the two thresholds stops it flapping.
    // Raise REVEAL_UP_VELOCITY to require a quicker upward flick to reveal
    // (higher = LESS eager).
    const scrollSamples = []; // {y, t} scroll positions inside VELOCITY_WINDOW_MS
    const VELOCITY_WINDOW_MS = 90;
    const REVEAL_UP_VELOCITY = 0.25; // px/ms upward needed to reveal the bar
    const HIDE_DOWN_VELOCITY = 0.35; // px/ms downward needed to hide it

    // ===== Always-visible filter bar mode (siteSettings.filterBarAlwaysVisible) =====
    // When enabled, `.is-always` pins the bar at the top at EVERY scroll
    // position and the tags are ONE horizontal scrollable row — so the bar's
    // height NEVER changes and pinning is layout-neutral: no flow shim, no
    // reserved space, and the stick decision (a pure rect read) cannot feed
    // back into the layout. That kills the flicker loop structurally — the
    // loop the first attempt fought existed only because the bar's height
    // changed when it stuck. The tuck/reveal/pin machinery above is bypassed:
    // applyStickyBarState early-returns and the scroll listener routes here.
    // Stick detection is rounding-only hysteresis: stick at rectTop ≤ top+0.5,
    // unstick at > top+2 (the class only adds a shadow — height is constant).
    let alwaysBarStuck = false;

    // Visual height the content below must clear — volume headers pin below
    // the bar via --filter-bar-h (with an 8px overlap fold). Constant while
    // scrolled; re-written on resize/zoom/font changes.
    function syncAlwaysBarMetrics() {
      document.documentElement.style.setProperty('--filter-bar-h', `${filterBar.offsetHeight}px`);
    }

    // The bar's height changes OUTSIDE the stuck flip too — renderBooks
    // populates the tag strip after applySettings runs (init measures a
    // chipless bar), webfonts change chip metrics, viewport resizes rewrap.
    // A ResizeObserver catches every source; without it the header offset
    // goes stale (observed: 78px pre-render vs 114px post-render).
    const alwaysBarRO = new ResizeObserver(() => {
      if (filterBar.classList.contains('is-always')) syncAlwaysBarMetrics();
    });
    alwaysBarRO.observe(filterBar);
    const syncAlwaysBarMetricsIfActive = () => {
      if (filterBar.classList.contains('is-always')) syncAlwaysBarMetrics();
    };
    window.addEventListener('resize', syncAlwaysBarMetricsIfActive);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncAlwaysBarMetricsIfActive);

    function syncAlwaysBarStuck() {
      // Keep the header offset fresh on every sync — covers viewport resizes
      // that arrive between renders (idempotent when the value is unchanged).
      syncAlwaysBarMetrics();
      const stickyTop = parseFloat(getComputedStyle(filterBar).top) || 0;
      const rectTop = filterBar.getBoundingClientRect().top;
      const stuck = alwaysBarStuck ? rectTop <= stickyTop + 2 : rectTop <= stickyTop + 0.5;
      if (stuck === alwaysBarStuck) return;
      alwaysBarStuck = stuck;
      filterBar.classList.toggle('is-stuck', stuck);
      updateTagFiltersFade();
    }

    // Mode switch — the ONLY writer of .is-always / body.filter-always.
    // Called from applySettings (init + settings save).
    function applyFilterBarMode() {
      const always = siteSettings.filterBarAlwaysVisible === true;
      filterBar.classList.toggle('is-always', always);
      document.body.classList.toggle('filter-always', always);
      if (always) {
        // Strip every auto-mode state so the two machines can never fight.
        filterBar.classList.remove('is-past', 'is-revealed', 'is-pinned', 'is-stuck');
        filterBar.style.transition = '';
        filterBarFlowShim.style.height = '0px';
        barPastTop = false;
        barLandingLock = false;
        alwaysBarStuck = false;
        syncAlwaysBarMetrics();
        syncAlwaysBarStuck();
      } else {
        filterBar.classList.remove('is-stuck');
        alwaysBarStuck = false;
        document.documentElement.style.removeProperty('--filter-bar-h');
        syncStickyBar(); // restore the tuck/reveal/pin state for the current scroll
      }
      updateTagFiltersFade();
    }

    // Active tag filter (multi-select, OR).
    let activeTags = new Set();

    // Cached shuffled book-id order for Random sort (stable across renders).
    let shuffledIds = null;

    // Header Stats
    const statTotal = document.getElementById('stat-total');
    const statToRead = document.getElementById('stat-toread');
    const statReading = document.getElementById('stat-reading');
    const displayedCount = document.getElementById('displayed-count');
    const headerStatBtns = document.querySelectorAll('.header-stats .stat-item');

    function syncHeaderStatActive() {
      const cur = filterStatus.value;
      headerStatBtns.forEach(btn => {
        const f = btn.dataset.filter;
        const active = (f === 'all' && cur === '') || f === cur;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    headerStatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.filter === 'all' ? '' : btn.dataset.filter;
        // Toggle: clicking the active filter clears it (except Total which is already "all")
        if (filterStatus.value === target) {
          if (target === '') return;
          filterStatus.value = '';
        } else {
          filterStatus.value = target;
        }
        renderBooks();
        scrollToFirstBooks();
      });
    });

    // Engine Slots
    const slot1 = document.getElementById('engine-slot-1');
    const slot2 = document.getElementById('engine-slot-2');
    const slot3 = document.getElementById('engine-slot-3');

    // Modals
    const modal = document.getElementById('book-modal');
    const modalTitle = document.getElementById('modal-title');
    const bookForm = document.getElementById('book-form');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const deleteBookBtn = document.getElementById('delete-book-btn');
    const addBookBtn = document.getElementById('add-book-btn');

    // Form Fields
    const inputId = document.getElementById('book-id');
    const inputTitle = document.getElementById('book-title-input');
    const inputAuthor = document.getElementById('book-author-input');
    const inputVolSelect = document.getElementById('book-volume-input');
    const inputStageSelect = document.getElementById('book-stage-input');
    const inputNewVolName = document.getElementById('book-new-volume-name-input');
    const inputNewStageName = document.getElementById('book-new-stage-name-input');
    const newVolNameGroup = document.getElementById('new-volume-name-group');
    const newStageNameGroup = document.getElementById('new-stage-name-group');
    const inputReadingOrder = document.getElementById('book-reading-order-input');
    const inputYear = document.getElementById('book-year-input');
    const inputFirstPublished = document.getElementById('book-first-published-input');
    for (const field of [inputYear, inputFirstPublished]) {
      field.addEventListener('input', () => field.setCustomValidity(''));
    }
    const inputStatus = document.getElementById('book-status-input');
    const inputEngine = document.getElementById('book-engine-input');
    const inputCover = document.getElementById('book-cover-input');
    const coverFileInput = document.getElementById('book-cover-file');
    const coverDropzone = document.getElementById('book-cover-dropzone');
    const coverClearBtn = document.getElementById('book-cover-clear-btn');
    const coverPreview = document.getElementById('book-cover-preview');
    const coverPlaceholder = document.getElementById('cover-dropzone-placeholder');
    const coverHint = document.getElementById('book-cover-hint');
    let pendingCoverBlob = null; // downscaled cover chosen but not yet saved
    let pendingCoverColor = ""; // hex extracted from pendingCoverBlob (client-side, mirrors extract-cover-colors.mjs)
    let formBaseline = null; // form snapshot taken on open — for unsaved-change detection

    function resetCoverUploadState() {
      pendingCoverBlob = null;
      pendingCoverColor = "";
      inputCover.value = ''; // hidden source-of-truth — don't rely on bookForm.reset() to clear it
      coverPreview.hidden = true;
      coverPreview.removeAttribute('src');
      coverPlaceholder.hidden = false;
      coverClearBtn.hidden = true;
      coverFileInput.value = '';
      coverHint.textContent = 'Saved to covers/ in this repo.';
    }

    // Client-side dominant color extraction — mirrors scripts/extract-cover-colors.mjs (64×64 + 16-step quantize + histogram peak).
    // Runs on the downscaled blob before writeCoverBlob so coverColor is saved with the book.
    async function extractCoverColorFromBlob(blob){
      try{
        const bmp = await createImageBitmap(blob);
        const W=64,H=64;
        const c=document.createElement('canvas'); c.width=W; c.height=H;
        const ctx=c.getContext('2d'); ctx.drawImage(bmp,0,0,W,H);
        if(typeof bmp.close==='function') bmp.close();
        const data=ctx.getImageData(0,0,W,H).data;
        const Q=16, buckets=new Map();
        for(let i=0;i<data.length;i+=4){
          const a=data[i+3]; if(a<128) continue;
          const r=Math.floor(data[i]/Q)*Q, g=Math.floor(data[i+1]/Q)*Q, b=Math.floor(data[i+2]/Q)*Q;
          const k=(r<<16)|(g<<8)|b;
          buckets.set(k,(buckets.get(k)||0)+1);
        }
        let best=null, bestN=-1;
        for(const [k,n] of buckets){ if(n>bestN){bestN=n; best=k} }
        if(best===null) return "";
        const r=(best>>16)&255, g=(best>>8)&255, b=best&255;
        return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
      }catch{ return ""; }
    }
    const coverColorInput = document.getElementById('cover-color-input');
    const coverColorPicker = document.getElementById('cover-color-picker');
    const coverColorExtractBtn = document.getElementById('cover-color-extract-btn');
    function syncCoverColorUI(hex){
      const v = (hex && /^#[0-9a-f]{6}$/i.test(hex.trim())) ? hex.trim().toLowerCase() : "";
      if(coverColorInput) coverColorInput.value = v;
      if(coverColorPicker) coverColorPicker.value = v || "#808080";
    }
    if(coverColorPicker) coverColorPicker.addEventListener('input', ()=>{ if(coverColorInput) coverColorInput.value = coverColorPicker.value.toLowerCase(); });
    if(coverColorInput) coverColorInput.addEventListener('input', ()=>{
      const v=coverColorInput.value.trim();
      if(/^#[0-9a-f]{6}$/i.test(v) && coverColorPicker) coverColorPicker.value = v.toLowerCase();
    });
    if(coverColorExtractBtn) coverColorExtractBtn.addEventListener('click', async ()=>{
      coverColorExtractBtn.disabled=true; const prev=coverColorExtractBtn.textContent; coverColorExtractBtn.textContent='…';
      try{
        let hex="";
        if(pendingCoverBlob) hex = pendingCoverColor || await extractCoverColorFromBlob(pendingCoverBlob);
        else if(coverPreview && !coverPreview.hidden && coverPreview.src){
          try{
            const res=await fetch(coverPreview.src, {cache:'no-store'});
            const blob=await res.blob();
            hex = await extractCoverColorFromBlob(blob);
          }catch{}
        }
        if(hex) syncCoverColorUI(hex);
        else alert('No cover image to extract from.');
      } finally { coverColorExtractBtn.disabled=false; coverColorExtractBtn.textContent=prev; }
    });
    const inputIsbn = document.getElementById('book-isbn-input');
    const inputPages = document.getElementById('book-pages-input');
    const inputNotes = document.getElementById('book-notes-input');
    const inputSummary = document.getElementById('book-summary-input');
    const inputTags = document.getElementById('book-tags-input');

    // --- Date Added (`created`) helpers ---
    // Books store `created` as an ISO string; the edit form edits it through a
    // datetime-local input (local time, minute precision). Clearing the field
    // is non-destructive: the submit handler falls back to the persisted date.
    const inputCreated = document.getElementById('book-created-input');
    function toDatetimeLocalValue(iso) {
      const d = iso ? new Date(iso) : null;
      if (!d || isNaN(d)) return '';
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function createdToIso(value) {
      if (!value) return '';
      const d = new Date(value);
      return isNaN(d) ? '' : d.toISOString();
    }

    // --- Tag editor (edit modal): chip input + type-ahead tag picker. ---
    // #book-tags-input is a hidden field that stays the single source of truth
    // for the submit handler; the chip editor syncs its value on every change.
    const tagEditor = document.getElementById('tag-editor');
    const tagEditorInput = document.getElementById('tag-editor-input');
    const tagEditorChips = document.getElementById('tag-editor-chips');
    let tagEditorTags = [];

    function normalizeTag(str) {
      return String(str).trim().toLowerCase();
    }

    function addTag(raw) {
      const t = normalizeTag(raw);
      if (!t) return false;
      if (tagEditorTags.includes(t)) return false; // dedupe — no-op if already selected
      tagEditorTags.push(t);
      renderTagEditor();
      return true;
    }

    function removeTag(tag) {
      tagEditorTags = tagEditorTags.filter(t => t !== tag);
      renderTagEditor();
    }

    function renderTagEditor() {
      // Sync the hidden source-of-truth field (submit handler reads this value).
      inputTags.value = tagEditorTags.join(', ');
      tagEditorChips.innerHTML = tagEditorTags.map(t =>
        `<span class="tag-editor-chip">${escapeHtml(t)}` +
        `<button type="button" class="tag-chip-remove" data-remove="${escapeHtml(t)}" aria-label="Remove ${escapeHtml(t)} tag">×</button></span>`
      ).join('');
      // Keep the open type-ahead dropdown's ✓ states in sync (add/remove/Backspace/×).
      if (!tagDropdown.hidden) renderTagDropdown();
    }

    function resetTagEditor() {
      tagEditorTags = [];
      tagEditorInput.value = '';
      renderTagEditor();
      closeTagDropdown();
    }

    // Click a chip's × to remove it (refocus the input so typing can continue).
    tagEditorChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag-chip-remove');
      if (btn) {
        removeTag(btn.dataset.remove);
        tagEditorInput.focus();
      }
    });

    // Clicking anywhere in the editor box focuses the text input (feels like a real input).
    tagEditor.addEventListener('click', (e) => {
      if (e.target === tagEditorInput) return;
      if (e.target.closest('.tag-chip-remove')) return; // don't steal focus from remove buttons
      tagEditorInput.focus();
    });

    // Enter / comma commit the typed value; Backspace on empty removes the last chip.
    // ArrowDown/ArrowUp move through the type-ahead dropdown; Escape closes it.
    tagEditorInput.addEventListener('keydown', (e) => {
      const dropdownOpts = () => [...tagDropdown.querySelectorAll('.tag-dropdown-option')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const opts = dropdownOpts();
        if (!tagDropdown.hidden && opts.length > 0) {
          e.preventDefault();
          const dir = e.key === 'ArrowDown' ? 1 : -1;
          dropdownIndex = (dropdownIndex + dir + opts.length) % opts.length;
          renderTagDropdown();
        }
        return;
      }
      if (e.key === 'Escape' && !tagDropdown.hidden) {
        e.preventDefault();
        e.stopPropagation(); // keep the edit modal's document Escape handler from firing
        closeTagDropdown();
        return;
      }
      if (e.key === 'Enter' && !tagDropdown.hidden && dropdownIndex >= 0) {
        const opts = dropdownOpts();
        const opt = opts[dropdownIndex];
        if (opt) {
          e.preventDefault();
          addTag(opt.dataset.tag);
          tagEditorInput.value = '';
          renderTagDropdown(); // stay open — pick more, or Escape/blur to close
          return;
        }
      }
      if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
        e.preventDefault();
        addTag(tagEditorInput.value);
        tagEditorInput.value = '';
        renderTagDropdown(); // show the full list again (new tag now ✓)
      } else if (e.key === 'Backspace' && tagEditorInput.value === '' && tagEditorTags.length > 0) {
        removeTag(tagEditorTags[tagEditorTags.length - 1]);
      }
    });

    // Commit any trailing text on blur so a typed tag isn't silently dropped.
    tagEditorInput.addEventListener('blur', () => {
      if (tagEditorInput.value.trim()) {
        addTag(tagEditorInput.value);
        tagEditorInput.value = '';
      }
      closeTagDropdown();
    });

    // --- Tag type-ahead dropdown (edit modal) ---
    // Replaces the browser's native <datalist> popup (which can't be styled) with
    // a custom dropdown that matches the app. It opens on focus showing every tag;
    // typing filters the list, picking toggles a tag on/off, and it stays open so
    // you can add several in one go (Escape/blur/click-outside closes it).
    const tagDropdown = document.getElementById('tag-dropdown');
    let dropdownIndex = -1;
    let catalogTags = [];

    function closeTagDropdown() {
      tagDropdown.hidden = true;
      tagDropdown.innerHTML = '';
      dropdownIndex = -1;
      tagEditorInput.setAttribute('aria-expanded', 'false');
      tagEditorInput.removeAttribute('aria-activedescendant');
    }

    const DD_CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    function renderTagDropdown() {
      const q = tagEditorInput.value.trim().toLowerCase();
      // Empty field → show the whole vocabulary; typing narrows it by prefix.
      const matches = q ? catalogTags.filter(t => t.startsWith(q)).slice(0, 12) : catalogTags;
      if (matches.length === 0) {
        closeTagDropdown();
        return;
      }
      tagDropdown.hidden = false;
      tagDropdown.innerHTML = matches.map((t, i) => {
        const added = tagEditorTags.includes(t);
        const highlighted = i === dropdownIndex;
        return `<button type="button" class="tag-dropdown-option${added ? ' is-added' : ''}${highlighted ? ' highlighted' : ''}" role="option" data-tag="${escapeHtml(t)}" ${highlighted ? `id="tag-dd-opt-${i}"` : ''} aria-selected="${highlighted ? 'true' : 'false'}">` +
          `${escapeHtml(t)}${added ? `<span class="dd-check" aria-hidden="true">${DD_CHECK_SVG}</span>` : ''}` +
          `</button>`;
      }).join('');
      tagEditorInput.setAttribute('aria-expanded', 'true');
      if (dropdownIndex >= 0) {
        tagEditorInput.setAttribute('aria-activedescendant', `tag-dd-opt-${dropdownIndex}`);
      } else {
        tagEditorInput.removeAttribute('aria-activedescendant');
      }
    }

    // Clicking the field opens the full tag list.
    tagEditorInput.addEventListener('focus', () => {
      renderTagDropdown();
    });

    // Re-filter the dropdown as the user types.
    tagEditorInput.addEventListener('input', () => {
      renderTagDropdown();
    });

    // Selecting an option: mousedown preventDefault keeps focus in the input (so
    // the blur handler doesn't commit/clear first), then the click adds the tag.
    tagDropdown.addEventListener('mousedown', (e) => {
      if (e.target.closest('.tag-dropdown-option')) e.preventDefault();
    });
    tagDropdown.addEventListener('click', (e) => {
      const opt = e.target.closest('.tag-dropdown-option');
      if (!opt) return;
      const t = opt.dataset.tag;
      // Toggle: click an unchecked tag to add it, a checked one to remove it.
      if (tagEditorTags.includes(t)) {
        removeTag(t);
      } else {
        addTag(t);
      }
      tagEditorInput.value = '';
      renderTagDropdown(); // stay open with updated ✓ states
      tagEditorInput.focus();
    });

    // Controls
    const importJsonBtn = document.getElementById('import-json-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const resetBtn = document.getElementById('reset-btn');
    const jsonFileInput = document.getElementById('json-file-input');
    const copyTitlesBtn = document.getElementById('copy-titles-btn');

    // Dropdown Filters
    function updateVolumeFilterDropdown() {
      const selectedVal = filterVolume.value;
      const volumeMap = new Map();
      books.forEach(b => {
        const key = b.volumeNumber;
        if (!volumeMap.has(key) || (b.volumeName && b.volumeName !== "General")) {
          volumeMap.set(key, b.volumeName);
        }
      });

      const sortedVolNumbers = Array.from(volumeMap.keys()).sort((a, b) => a - b);
      let optionsHTML = '<option value="">All Volumes</option>';
      sortedVolNumbers.forEach(volNum => {
        const volName = volumeMap.get(volNum) || `Volume ${volNum}`;
        optionsHTML += `<option value="${volNum}">Vol ${volNum} - ${escapeHtml(volName)}</option>`;
      });

      filterVolume.innerHTML = optionsHTML;
      filterVolume.value = selectedVal;
    }

    // Tag filter chips — one toggle per tag in the catalog (multi-select, OR).
    // Ordered by how many books carry the tag (most first), alphabetical as tiebreak.
    function updateTagFilters() {
      const tagCounts = new Map();
      for (const b of books) {
        for (const t of (b.tags || [])) {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }
      }
      const allTags = [...tagCounts.keys()].sort((a, b) =>
        (tagCounts.get(b) - tagCounts.get(a)) || a.localeCompare(b)
      );

      // Drop any selected tags that no longer exist in the catalog (e.g. after a reset/import).
      const tagSet = new Set(allTags);
      for (const t of [...activeTags]) {
        if (!tagSet.has(t)) activeTags.delete(t);
      }

      // Vocabulary for the edit form's tag type-ahead dropdown (filtered per keystroke).
      catalogTags = allTags;

      if (allTags.length === 0) {
        tagFilters.hidden = true;
        tagFilters.innerHTML = '';
        return;
      }

      tagFilters.hidden = false;
      // Keep the horizontal strip where the user left it — re-rendering resets scroll otherwise.
      const prevScrollLeft = tagFilters.scrollLeft;
      tagFilters.innerHTML = allTags.map(t => `
        <button type="button" class="tag-filter-chip" data-tag="${escapeHtml(t)}" aria-pressed="${activeTags.has(t) ? 'true' : 'false'}">
          ${escapeHtml(t)}
        </button>
      `).join('');
      tagFilters.scrollLeft = prevScrollLeft;
      // Desktop: if the chips just (re)rendered into 3+ wrapped rows, collapse
      // to a single horizontal scrollable row instead.
      updateTagRowWrap();
    }

    // Edge fade cues on the tag strip: the mask-image fades should not mask
    // the first chip once it's at the start (scrollLeft 0) nor the last chip
    // once it's fully in view — same rule as the stage rows. The strip is
    // "at its start" when scrollLeft is 0; "at its end" when scrolled to its
    // max OR when it never overflows (nothing to scroll → the last chip is
    // already fully visible). The .at-start / .at-end classes adjust the mask
    // in CSS (mobile MQ + pinned-bar masks).
    function updateTagFiltersFade() {
      if (tagFilters.hidden) return;
      const atStart = tagFilters.scrollLeft <= 1;
      const atEnd = tagFilters.scrollWidth - tagFilters.clientWidth - tagFilters.scrollLeft <= 1;
      tagFilters.classList.toggle('at-start', atStart);
      tagFilters.classList.toggle('at-end', atEnd);
    }

    // updateTagFilters() re-renders the chips (preserving scrollLeft), so the
    // fade state is re-synced after every render (see renderBooks). Scroll
    // doesn't bubble, so listen directly on the strip; a window resize can
    // change how many chips fit, so re-check on resize too.
    tagFilters.addEventListener('scroll', updateTagFiltersFade);
    window.addEventListener('resize', updateTagFiltersFade);

    // Desktop (≥781px): when the chips would wrap into 3+ rows, collapse the
    // strip into ONE horizontal scrollable row (.strip-scroll) — same pattern
    // as the ≤780px band, but only when it's actually tall. Two wrapped rows
    // are kept as-is: the at-a-glance overview is worth the vertical space.
    // CSS can't count wrapped lines, so measure: clear the class, read the
    // wrapped height, compare against a 2-row budget. Re-run on resize (rAF-
    // debounced) and after webfonts load (they change chip widths).
    function updateTagRowWrap() {
      // Always-visible mode: the tags are a single scrollable row via CSS
      // (.filter-bar.is-always .tag-filters) — the wrap measurement is
      // bypassed so the bar's height can never change. Re-write the header
      // offset here too: this runs at the end of every render, after the
      // tag strip has been populated (the RO alone misses the post-render
      // growth in throttled environments).
      if (filterBar.classList.contains('is-always')) {
        tagFilters.classList.remove('strip-scroll');
        syncAlwaysBarMetrics();
        updateTagFiltersFade();
        return;
      }
      if (typeof narrowPanel !== 'undefined' && narrowPanel.matches) return; // ≤780px is always single-row
      if (tagFilters.hidden) { tagFilters.classList.remove('strip-scroll'); return; }
      tagFilters.classList.remove('strip-scroll');
      const chip = tagFilters.querySelector('.tag-filter-chip');
      if (!chip) return;
      const gapH = parseFloat(getComputedStyle(tagFilters).rowGap) || 0;
      const twoRows = chip.offsetHeight * 2 + gapH + 2; // +2px rounding slack
      if (tagFilters.scrollHeight > twoRows) tagFilters.classList.add('strip-scroll');
      updateTagFiltersFade();
    }
    let tagRowWrapRaf = null;
    window.addEventListener('resize', () => {
      if (tagRowWrapRaf) return;
      tagRowWrapRaf = requestAnimationFrame(() => { tagRowWrapRaf = null; updateTagRowWrap(); });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateTagRowWrap);

    // Modal Volume/Stage Dropdown Helpers
    function getVolumeMap() {
      const map = new Map();
      books.forEach(b => {
        const key = b.volumeNumber;
        if (!map.has(key) || (b.volumeName && b.volumeName !== "General")) {
          map.set(key, b.volumeName);
        }
      });
      return map;
    }

    function getStageMap(volNum) {
      const map = new Map();
      books.filter(b => b.volumeNumber === volNum).forEach(b => {
        const key = b.stageNumber;
        if (!map.has(key) || (b.stageName && b.stageName !== "Stage " + key)) {
          map.set(key, b.stageName);
        }
      });
      return map;
    }

    function nextVolumeNumber() {
      return books.length > 0 ? Math.max(...books.map(b => b.volumeNumber)) + 1 : 1;
    }

    function nextStageNumber(volNum) {
      const volBooks = books.filter(b => b.volumeNumber === volNum);
      return volBooks.length > 0 ? Math.max(...volBooks.map(b => b.stageNumber)) + 1 : 1;
    }

    function populateVolumeDropdown(selectedVolNum) {
      const volMap = getVolumeMap();
      const sorted = Array.from(volMap.keys()).sort((a, b) => a - b);
      if (selectedVolNum && selectedVolNum !== '__new__' && !volMap.has(selectedVolNum)) {
        sorted.push(selectedVolNum);
        volMap.set(selectedVolNum, `Volume ${selectedVolNum}`);
      }
      let html = '';
      sorted.forEach(v => {
        const volName = volMap.get(v) || `Volume ${v}`;
        const selected = (selectedVolNum && selectedVolNum === v) ? ' selected' : '';
        html += `<option value="${v}"${selected}>Vol ${v} — ${escapeHtml(volName)}</option>`;
      });
      html += `<option value="__new__">➕ New Volume…</option>`;
      inputVolSelect.innerHTML = html;
      inputVolSelect.value = selectedVolNum === '__new__' ? '__new__' : (selectedVolNum || '');
      onVolumeChange();
    }

    function populateStageDropdown(volNum, selectedStageNum) {
      const stageMap = getStageMap(volNum);
      const sorted = Array.from(stageMap.keys()).sort((a, b) => a - b);
      if (selectedStageNum && selectedStageNum !== '__new__' && !stageMap.has(selectedStageNum)) {
        sorted.push(selectedStageNum);
        stageMap.set(selectedStageNum, `Stage ${selectedStageNum}`);
      }
      let html = '';
      sorted.forEach(s => {
        const sName = stageMap.get(s) || `Stage ${s}`;
        const selected = (selectedStageNum && selectedStageNum === s) ? ' selected' : '';
        html += `<option value="${s}"${selected}>Stage ${s} — ${escapeHtml(sName)}</option>`;
      });
      html += `<option value="__new__">➕ New Stage…</option>`;
      inputStageSelect.innerHTML = html;
      inputStageSelect.value = selectedStageNum === '__new__' ? '__new__' : (selectedStageNum || '');
      onStageChange();
    }

    function onVolumeChange() {
      const v = inputVolSelect.value;
      if (v === '__new__') {
        newVolNameGroup.hidden = false;
        if (!inputNewVolName.value.trim()) inputNewVolName.value = `Volume ${nextVolumeNumber()}`;
        // Brand-new volume → no existing stages yet; start with "+ New Stage…"
        inputStageSelect.innerHTML = '<option value="__new__" selected>➕ New Stage…</option>';
        newStageNameGroup.hidden = false;
        inputNewStageName.value = 'Stage 1';
      } else {
        newVolNameGroup.hidden = true;
        if (v === '') {
          inputStageSelect.innerHTML = '<option value="">Select a volume first</option>';
          newStageNameGroup.hidden = true;
        } else {
          const vol = parseInt(v);
          const stageMap = getStageMap(vol);
          const firstStage = Array.from(stageMap.keys()).sort((a, b) => a - b)[0];
          populateStageDropdown(vol, firstStage);
        }
      }
    }

    function onStageChange() {
      const s = inputStageSelect.value;
      if (s === '__new__') {
        newStageNameGroup.hidden = false;
        const v = inputVolSelect.value;
        const baseVol = (v && v !== '__new__') ? parseInt(v) : nextVolumeNumber();
        inputNewStageName.value = `Stage ${nextStageNumber(baseVol)}`;
      } else {
        newStageNameGroup.hidden = true;
      }
    }

    inputVolSelect.addEventListener('change', onVolumeChange);
    inputStageSelect.addEventListener('change', onStageChange);

    // View Toggles
    // Switching views (and sort/filter changes) lands at the FIRST BOOKS of
    // the current view (top of the grid / top of the first volume) rather
    // than wherever the other view left the scroll — and rather than the very
    // top of the page.
    // MOBILE Grid: the always-sticky filter bar sits above the first books,
    // so we offset by its height. DESKTOP Grid: the compact pinned bar can
    // coexist with the first book — we reveal it and land the first book just
    // below it. VOLUMES (both breakpoints): the bar is static (scrolls away),
    // so the first volume lands flush at the top.
    function scrollToFirstBooks() {
      const target = document.getElementById('book-grid');
      if (!target) return;
      const docTop = target.getBoundingClientRect().top + window.scrollY;
      const alwaysMode = filterBar.classList.contains('is-always');

      if (currentView !== 'grid') {
        // Volumes: auto-mode → the bar is static (scrolls away), land flush.
        // Always-mode → the bar is pinned above the first volume; clear it.
        const clearance = alwaysMode ? ((filterBar.offsetHeight || 0) + 4) : 4;
        const landingY = Math.max(0, Math.round(docTop - clearance));
        if (window.scrollY <= landingY) return;
        if (!alwaysMode) {
          scrollSamples.length = 0;
          lastScrollY = window.scrollY;
        }
        window.scrollTo(0, landingY);
        return;
      }

      if (alwaysMode) {
        // Always-mode Grid: the bar is pinned at every depth with a CONSTANT
        // height (no compaction shift), so land the first book just below it —
        // no coexist dance, no re-measure after a reveal.
        const landingY = Math.max(0, Math.round(docTop - ((filterBar.offsetHeight || 0) + 8)));
        if (window.scrollY <= landingY) return; // near/above the landing → no-op
        syncAlwaysBarStuck();
        window.scrollTo(0, landingY);
        return;
      }

      if (mobileView.matches) {
        // Mobile Grid: land the first book just below the (pinned) filter bar.
        const landingY = Math.max(0, Math.round(docTop - ((filterBar.offsetHeight || 0) + 8)));
        if (window.scrollY <= landingY) return; // near/above the landing → no-op
        // The bar must be forced into the pinned+revealed state and LATCHED
        // through the jump. Otherwise the jump's own scroll event sees the
        // below-bar sentinel back in view, un-sticks the bar (is-past removed),
        // and it returns to natural flow with its top partially above the
        // viewport — the bar ends up half-tucked. Snap the pin (transition off)
        // so it's committed before the jump; the lock releases on a real scroll.
        lastScrollDir = 'up';
        barLandingLock = true;
        filterBar.style.transition = 'none';
        applyStickyBarState(true);
        void filterBar.offsetHeight; // commit the pinned state before the jump
        filterBar.style.transition = '';
        scrollSamples.length = 0;
        lastScrollY = window.scrollY;
        window.scrollTo(0, landingY);
        return;
      }

      // Desktop Grid: only touch the scroll when the first book has actually
      // scrolled off the top (grid top above the viewport).
      if (window.scrollY <= docTop) return;
      // Reveal the compact pinned bar so it coexists with the first book:
      // force the reveal (barTopGone + scroll-up). NOTE: pinning compacts the
      // tags to a single row, which shifts the grid UP in the layout — so
      // re-measure the grid's document top AFTER the reveal, then land the
      // first book just below the (now compact) bar.
      lastScrollDir = 'up';
      applyStickyBarState(true);
      const docTopCompacted = target.getBoundingClientRect().top + window.scrollY;
      const landingY = Math.max(0, Math.round(docTopCompacted - ((filterBar.offsetHeight || 0) + 8)));
      // Reset the velocity baseline so the programmatic jump isn't read as a
      // user flick (otherwise the up-scroll would wrongly reveal the bar).
      scrollSamples.length = 0;
      lastScrollY = window.scrollY;
      window.scrollTo(0, landingY);
    }

    // --- Filter bar: natural scroll-away (desktop) / tuck+reveal (mobile) ---
    // DESKTOP (>600px): the FULL bar sits in normal flow (static) and scrolls
    // away naturally like any content. Once the WHOLE bar has scrolled off and
    // the user scrolls back up (velocity-tuned), .is-pinned makes it sticky at
    // top:0 with ALL controls and the tags compacted to a single scrollable
    // row. Sticky keeps it in flow, so toggling never shifts the layout.
    // MOBILE (≤600px): unchanged — the bar tucks away on scroll-down and
    // re-reveals pinned on scroll-up (.is-past / .is-revealed).
    function applyStickyBarState(forceReveal = false) {
      // Always-visible mode: syncAlwaysBarStuck owns the bar — the tuck/reveal
      // machinery below must never touch it (no is-past/is-pinned writes).
      if (filterBar.classList.contains('is-always')) return;
      if (!mobileView.matches) {
        // Desktop: the compact bar may engage as soon as its OWN top reaches
        // the viewport top (barTopGone), so it can pin while the first book is
        // still visible below it (they coexist). It engages on scroll-up (or
        // the filter-panel lock), or once the WHOLE bar has scrolled past on
        // the way down (preserving the natural scroll-away). Once engaged
        // (is-pinned = sticky) it stays latched until the bar returns to its
        // natural spot, so browsing down just tucks it (-110%) instead of
        // leaving a partial-bar sliver.
        // .is-pinned = bar is sticky, hidden above (translateY -110%).
        // .is-revealed = it has slid down to top:0 (visible).
        const barTopGone = filterBarSentinel.getBoundingClientRect().bottom <= 0;
        const fullBarGone = filterBarGoneSentinel.getBoundingClientRect().bottom <= 0;
        const wasPinned = filterBar.classList.contains('is-pinned');
        const naturalHeightBeforeChange = !wasPinned ? filterBar.offsetHeight : desktopBarNaturalHeight;
        if (!barTopGone) {
          // Bar back at its natural spot → release sticky entirely.
          if (desktopPinReleaseTimer) {
            clearTimeout(desktopPinReleaseTimer);
            desktopPinReleaseTimer = null;
          }
          filterBar.classList.remove('is-pinned', 'is-revealed');
          filterBarFlowShim.style.height = '0px';
          desktopBarNaturalHeight = filterBar.offsetHeight;
        } else if (isBarLocked() || (lastScrollDir === 'up' && (forceReveal || lastScrollDelta < 0))) {
          // Scroll up (or panel locked): reveal pinned at top. Downward
          // scrolling must never reveal the compact layout: changing from the
          // wrapped natural bar to the compact bar changes the in-flow height
          // and can make the sentinels move during the same first scroll pass.
          if (desktopPinReleaseTimer) {
            clearTimeout(desktopPinReleaseTimer);
            desktopPinReleaseTimer = null;
          }
          if (!wasPinned) {
            // Establish the compact sticky geometry in its hidden position,
            // then let the normal transform transition animate the reveal.
            filterBar.style.transition = 'none';
            filterBar.classList.add('is-pinned');
            void filterBar.offsetHeight;
            filterBar.style.transition = '';
          } else {
            filterBar.classList.add('is-pinned');
          }
          filterBar.classList.add('is-revealed');
          if (!wasPinned) desktopBarNaturalHeight = naturalHeightBeforeChange;
          filterBarFlowShim.style.height = `${Math.max(0, desktopBarNaturalHeight - filterBar.offsetHeight)}px`;
        } else {
          // Desktop never hides the OG bar in a pinned/off-screen state. On a
          // down-scroll, slide the compact bar away first, then release the
          // pin after the transform transition. The full bar remains normal
          // document content and naturally returns when the user scrolls back.
          filterBar.classList.remove('is-revealed');
          if (wasPinned) {
            if (desktopPinReleaseTimer) clearTimeout(desktopPinReleaseTimer);
            desktopPinReleaseTimer = setTimeout(() => {
              desktopPinReleaseTimer = null;
              if (filterBar.classList.contains('is-pinned') && lastScrollDir === 'down') {
                filterBar.classList.remove('is-pinned');
                filterBarFlowShim.style.height = '0px';
                desktopBarNaturalHeight = filterBar.offsetHeight;
                updateTagFiltersFade();
              }
            }, 260);
          }
        }
        // Pinning/unpinning changes the tag strip's overflow (the compact bar
        // switches it to nowrap + scrollable), so re-evaluate its fade state
        // on desktop too — otherwise a stale .at-end from the wrapped bar would
        // suppress the right-edge fade at scroll 0 of the compact strip.
        updateTagFiltersFade();
        filterBar.classList.remove('is-past');
        return;
      }
      // Mobile: existing tuck-away / reveal-on-scroll-up. The bar is in
      // natural flow (no reserved space); its sticky point equals its natural
      // spot, so engaging is-past never shifts the layout. The first hide is
      // snapped (transition off) — like the desktop first-pin guard — so a
      // down-scroll dismissal never animates through a visible position, and
      // the up-scroll reveal still slides in.
      const wasPast = filterBar.classList.contains('is-past');
      // A programmatic scroll-reset (barLandingLock) pins the bar at the
      // landing even though the below-bar sentinel is back in view there —
      // otherwise the jump's scroll event would un-stick it and leave it
      // half-tucked above the viewport. The lock is released once the user
      // scrolls the whole bar off again (or back to its natural spot).
      const pinned = barLandingLock || barPastTop;
      const reveal = pinned && (isBarLocked() || barLandingLock || lastScrollDir === 'up' || forceReveal);
      const hideNow = pinned && !reveal;
      if (hideNow && !wasPast) filterBar.style.transition = 'none';
      filterBar.classList.toggle('is-past', pinned);
      filterBar.classList.toggle('is-revealed', reveal);
      if (hideNow && !wasPast) {
        void filterBar.offsetHeight; // commit the snapped-hide state
        filterBar.style.transition = '';
      }
      filterBarFlowShim.style.height = '0px';
      // Pinning/unpinning the bar changes the tag strip's overflow (desktop
      // compact bar switches it to nowrap + scrollable), so re-evaluate the
      // strip's fade state after every state change.
      updateTagFiltersFade();
    }

    // Re-read the sentinel directly: the IntersectionObserver only fires on
    // intersection CHANGES, so a view switch while scrolled deep wouldn't
    // re-fire it — sync after any structural change (view switch, etc.).
    // The mobile bar is ALWAYS sticky (its flow space is reserved by the shim),
    // and the below-bar sentinel marks its natural BOTTOM — the true trigger
    // for sliding it up (the bar must be fully above the viewport). Desktop
    // uses the same below-bar sentinel for its compact-pin logic.
    function syncStickyBar() {
      // Always-visible mode: re-sync the pinned bar + header stuck states.
      if (filterBar.classList.contains('is-always')) {
        syncAlwaysBarStuck();
        syncVolumeHeaderStuck();
        return;
      }
      barPastTop = filterBarGoneSentinel.getBoundingClientRect().bottom <= 0;
      applyStickyBarState();
      syncVolumeHeaderStuck();
    }

    // --- Volume header stick detection (Volumes view) ---
    // Volume headers pin BELOW the status bar (top: env(safe-area-inset-top)).
    // Their backdrop may only extend up over the status-bar strip WHILE
    // pinned (.is-stuck) — in natural flow an extended backdrop would paint
    // over the rows above (the Home-Screen overlap bug). A header is stuck
    // exactly when its rect top equals its sticky top: before sticking the
    // rect is lower, after its container ends it releases and drops again.
    function syncVolumeHeaderStuck() {
      document.querySelectorAll('.volume-header').forEach((h) => {
        const stickyTop = parseFloat(getComputedStyle(h).top) || 0;
        const stuck = Math.abs(h.getBoundingClientRect().top - stickyTop) < 1;
        h.classList.toggle('is-stuck', stuck);
      });
    }
    window.addEventListener('scroll', syncVolumeHeaderStuck, { passive: true });
    window.addEventListener('resize', syncVolumeHeaderStuck);

    const barSentinelObserver = new IntersectionObserver(([entry]) => {
      const past = !entry.isIntersecting;
      if (past === barPastTop) return;
      barPastTop = past;
      applyStickyBarState();
    }, { threshold: 0 });
    barSentinelObserver.observe(filterBarGoneSentinel);

    window.addEventListener('scroll', () => {
      const y = window.scrollY || 0;
      // Always-visible mode: the pinned bar's own single state writer owns
      // the scroll; the velocity/tuck machinery below is bypassed entirely.
      if (filterBar.classList.contains('is-always')) {
        syncAlwaysBarStuck();
        return;
      }
      const t = performance.now();
      if (y === lastScrollY) return;
      lastScrollDelta = y - lastScrollY;
      lastScrollY = y;
      scrollSamples.push({ y, t });
      // Keep only samples inside the velocity window; slow nudges (events far
      // apart) never accumulate a window, so they can't trigger a reveal.
      while (scrollSamples.length > 1 && t - scrollSamples[0].t > VELOCITY_WINDOW_MS) {
        scrollSamples.shift();
      }
      if (isBarLocked()) return; // panel/search open → the bar stays revealed
      // Re-read the sentinel on every scroll. The below-bar sentinel marks
      // the natural BOTTOM of the always-sticky mobile bar (its flow space is
      // reserved by the shim), so it is stable and flips exactly when the bar
      // is fully above the viewport. Desktop uses the same sentinel for its
      // compact-pin logic.
      const pastNow = filterBarGoneSentinel.getBoundingClientRect().bottom <= 0;
      if (pastNow !== barPastTop) {
        barPastTop = pastNow;
        applyStickyBarState();
      }
      // Release the landing lock once the user scrolls the whole bar off again
      // (pastNow true) or the bar is back at its natural spot (scrollY at/below
      // its natural top) — normal tuck/reveal resumes from there. Re-evaluate
      // after releasing so the forced pin is cleared even when barPastTop did
      // not change (e.g. the jump itself: both false at the landing point).
      if (barLandingLock) {
        const barNaturalTop = filterBarSentinel.getBoundingClientRect().bottom + y;
        if (pastNow || y <= barNaturalTop) {
          barLandingLock = false;
          applyStickyBarState();
        }
      }
      // px/ms over the window (+ down / − up). In the dead zone the previous
      // direction (and so the bar state) is left untouched.
      const first = scrollSamples[0];
      const dt = Math.max(t - first.t, 16);
      const velocity = (y - first.y) / dt;
      const dir = velocity <= -REVEAL_UP_VELOCITY ? 'up'
        : velocity >= HIDE_DOWN_VELOCITY ? 'down'
        : lastScrollDir;
      if (dir !== lastScrollDir) {
        lastScrollDir = dir;
        applyStickyBarState();
      } else if (!mobileView.matches && lastScrollDelta < 0) {
        // Desktop: only re-evaluate on upward scroll when the delta is clearly
        // upward (lastScrollDelta < 0). This prevents jitter from tiny scroll
        // nudges in the dead zone — the bar state only updates when the user
        // is clearly scrolling up, not on every minor movement.
        applyStickyBarState();
      }
    }, { passive: true });

    // --- Sort ⇄ View coupling ---
    // "reading-order" IS the Volumes view; every other sort value is Grid.
    // The Sort dropdown and the segmented toggle are two entry points into
    // this ONE piece of state, so the dropdown always truthfully reflects the
    // active view ("Reading Order" while in Volumes). Entering Volumes also
    // discards any cached Random shuffle for free: computeFilteredBooks()
    // nulls shuffledIds whenever the sort isn't random.
    let lastGridSort = 'year-desc'; // restored when returning to Grid

    // Derive the active view from the sort dropdown. Programmatic .value
    // writes fire no events, so every writer pairs its assignment with a
    // syncViewFromSort() + renderBooks() call.
    function syncViewFromSort() {
      const wantRoadmap = sortSelect.value === 'reading-order';
      const target = wantRoadmap ? 'roadmap' : 'grid';
      if (currentView === target) return;
      currentView = target;
      document.body.classList.toggle('view-roadmap', wantRoadmap);
      closeFilterPanel();
      viewRoadmapBtn.classList.toggle('active', wantRoadmap);
      viewRoadmapBtn.setAttribute('aria-pressed', String(wantRoadmap));
      viewGridBtn.classList.toggle('active', !wantRoadmap);
      viewGridBtn.setAttribute('aria-pressed', String(!wantRoadmap));
      // Slide-pill driver: a class instead of :has() — WebKit doesn't start
      // transitions off a :has() match, so Safari showed no slide at all.
      if (viewToggleWrap) viewToggleWrap.classList.toggle('is-roadmap', wantRoadmap);
    }

    // Heavy post-toggle work (renderBooks + scroll landing) is deferred by a
    // couple of frames AFTER the toggle classes flip. A transform transition
    // needs one committed frame to start on the compositor; rendering 200+
    // cards synchronously in the same task starves it, which is why the pill
    // slide felt laggy on iOS. Cancelling means rapid re-clicks never stack
    // renders — the last click wins. A short setTimeout watchdog backs the
    // rAF chain up: in normal browsers the frames win long before it fires,
    // but in environments that starve rAF the view still swaps.
    let pendingViewWork = 0;
    function scheduleViewWork(fn) {
      if (pendingViewWork) {
        cancelAnimationFrame(pendingViewWork);
        clearTimeout(pendingViewWork);
      }
      let done = false;
      const run = () => {
        if (done) return;
        done = true;
        pendingViewWork = 0;
        fn();
      };
      pendingViewWork = requestAnimationFrame(() => requestAnimationFrame(run));
      setTimeout(run, 120);
    }

    viewGridBtn.addEventListener('click', () => {
      // Returning to Grid restores the user's last real sort — the dropdown
      // kept it while Volumes held reading-order.
      sortSelect.value = lastGridSort;
      // Classes flip now (pill starts sliding); the re-render yields to it.
      syncViewFromSort();
      scheduleViewWork(() => {
        renderBooks();
        // View switch reveals the bar in Grid so the mobile first-books landing
        // (offset = bar height + 8) matches the visible pinned bar.
        lastScrollDir = 'up';
        syncStickyBar();
        scrollToFirstBooks();
      });
    });

    viewRoadmapBtn.addEventListener('click', () => {
      // Volumes view = Reading Order sort. Setting the dropdown keeps both
      // controls in lockstep instead of letting them drift apart.
      sortSelect.value = 'reading-order';
      // Classes flip now (pill starts sliding); the re-render yields to it.
      syncViewFromSort();
      scheduleViewWork(() => {
        renderBooks();
        // In Volumes the first volume lands flush (offset 4) with the bar hidden,
        // so leave it tucked until the user scrolls up.
        lastScrollDir = 'down';
        syncStickyBar();
        scrollToFirstBooks();
      });
    });

    // --- Filters panel (mobile "Filters" sheet) ---
    // Badge counts the active filters: Volume / Status set, Sort changed from
    // the default (year-desc), and any active tags. Search is deliberately not
    // counted (it's always visible in row 1).
    function updateFilterBadge() {
      let count = 0;
      if (filterVolume.value !== '') count++;
      if (filterStatus.value !== '') count++;
      // 'reading-order' IS the Volumes view (not a pending filter), so it
      // never counts toward the badge. Other sorts count when they differ from
      // the CONFIGURED default (site settings), not a hardcoded year-desc.
      if (sortSelect.value !== 'reading-order' && sortSelect.value !== effectiveDefaultSort()) count++;
      count += activeTags.size;
      filterBadge.textContent = String(count);
      filterBadge.hidden = count === 0;
    }

    function closeFilterPanel() {
      filterBar.classList.remove('filters-open');
      filterToggle.setAttribute('aria-expanded', 'false');
      // Unlock the bar so normal hide/reveal resumes once the panel closes.
      barPanelLocked = false;
      applyStickyBarState();
    }

    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // keep the document outside-tap handler from closing it
      const open = filterBar.classList.toggle('filters-open');
      filterToggle.setAttribute('aria-expanded', String(open));
      // While the panel is open keep the bar revealed so it can't ride away.
      barPanelLocked = open;
      applyStickyBarState();
    });

    // Outside tap (anywhere outside the whole bar) closes the panel.
    document.addEventListener('click', (e) => {
      if (filterBar.classList.contains('filters-open') && !filterBar.contains(e.target)) {
        closeFilterPanel();
      }
    });

    // Escape closes the Filters panel, else the expanded mobile search.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (filterBar.classList.contains('filters-open')) {
        closeFilterPanel();
      } else if (filterBar.classList.contains('search-open')) {
        closeMobileSearch();
      }
    });

    // --- Mobile collapsible search ---
    // On phones the search field collapses to a 🔍 icon so row 1 fits the
    // labeled Grid/Volumes toggle. Tapping the icon expands the field across
    // the whole row (other controls step aside via .search-open CSS) and locks
    // the sticky bar so it can't tuck away under the keyboard. Inside the
    // expanded field: ✕ clears the query IN PLACE (field stays open); ‹
    // collapses back to the icon — an applied query SURVIVES collapsing and
    // shows as a corner dot on the icon (updateSearchBadge). Desktop only
    // ever sees the ✕ (while the field has text); the 🔍/‹ machinery is
    // display:none there.
    function updateSearchBadge() {
      if (!searchBadge) return;
      const hasQuery = searchInput.value.trim() !== '';
      searchBadge.hidden = !hasQuery;
      // The badge is a bare dot (no text), so carry the state on the button's
      // accessible name instead — otherwise SR users can't tell a query is on.
      if (searchToggle) {
        searchToggle.setAttribute('aria-label', hasQuery ? 'Search books — query active' : 'Search books');
      }
      // ✕ exists only while there's something to clear (both breakpoints);
      // .has-value on the wrap reserves input padding-right for it in CSS.
      if (searchClearBtn) searchClearBtn.hidden = !hasQuery;
      if (searchWrap) searchWrap.classList.toggle('has-value', hasQuery);
    }

    function openMobileSearch() {
      filterBar.classList.add('search-open');
      searchToggle.setAttribute('aria-expanded', 'true');
      // Force-reveal + latch the bar (mirrors the Filters-panel behaviour) so
      // the freshly-expanded field is never stranded above the viewport.
      applyStickyBarState(true);
      searchInput.focus();
      if (searchInput.value) searchInput.select();
    }

    function closeMobileSearch() {
      filterBar.classList.remove('search-open');
      searchToggle.setAttribute('aria-expanded', 'false');
      applyStickyBarState();
      updateSearchBadge();
    }

    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        if (filterBar.classList.contains('search-open')) closeMobileSearch();
        else openMobileSearch();
      });
    }
    // ✕ clears in place — empty the field, re-render, keep the field open and
    // focused so typing can continue. ‹ collapses (query survives).
    if (searchClearBtn) searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      renderBooks(); // programmatic value writes fire no input event
      searchInput.focus();
    });
    if (searchCollapseBtn) searchCollapseBtn.addEventListener('click', closeMobileSearch);

    searchInput.addEventListener('blur', () => {
      if (!mobileView.matches || !filterBar.classList.contains('search-open') || searchInput.value.trim()) return;
      searchInput.value = '';
      closeMobileSearch();
    });

    // Crossing the 460px breakpoint drops any lingering search-open state
    // (desktop always shows the full field; the class is inert there anyway).
    if (typeof mobileView.addEventListener === 'function') {
      mobileView.addEventListener('change', () => {
        if (!mobileView.matches && filterBar.classList.contains('search-open')) {
          closeMobileSearch();
        }
      });
    }

    // Clear all resets the panel filters, tags, and search. On mobile the
    // panel auto-collapses after a reset so the full results are visible.
    filterClear.addEventListener('click', () => {
      filterVolume.value = '';
      filterStatus.value = '';
      sortSelect.value = effectiveDefaultSort(); // full reset ⇒ configured default sort
      searchInput.value = '';
      activeTags.clear();
      syncViewFromSort(); // pill/classes flip now; render yields below
      scheduleViewWork(() => {
        renderBooks();
        if (narrowPanel.matches) closeFilterPanel();
        // Land at the first book when filters are cleared (both breakpoints).
        scrollToFirstBooks();
      });
    });

    // 1) FIX: Copy All Titles Functionality (Nested under Volumes & Stages)
    copyTitlesBtn.addEventListener('click', () => {
      if (!books || books.length === 0) {
        alert("No books in library to copy.");
        return;
      }

      // Group books by Volume -> Stage
      const volumeMap = new Map();
      books.forEach(book => {
        const vKey = book.volumeNumber;
        if (!volumeMap.has(vKey)) {
          volumeMap.set(vKey, {
            volumeName: book.volumeName || `Volume ${vKey}`,
            stages: new Map()
          });
        }
        const stageMap = volumeMap.get(vKey).stages;
        const sKey = book.stageNumber;
        if (!stageMap.has(sKey)) {
          stageMap.set(sKey, {
            stageName: book.stageName || `Stage ${sKey}`,
            books: []
          });
        }
        stageMap.get(sKey).books.push(book);
      });

      const sortedVolKeys = Array.from(volumeMap.keys()).sort((a, b) => a - b);
      const lines = [];

      sortedVolKeys.forEach(volNum => {
        const volData = volumeMap.get(volNum);
        lines.push(`Volume ${volNum}: ${volData.volumeName}`);

        const sortedStageKeys = Array.from(volData.stages.keys()).sort((a, b) => a - b);
        sortedStageKeys.forEach(stageNum => {
          const stageData = volData.stages.get(stageNum);
          lines.push(`  Stage ${stageNum}: ${stageData.stageName}`);

          stageData.books.sort((a, b) => a.readingOrder - b.readingOrder);
          stageData.books.forEach((b, idx) => {
            lines.push(`    ${idx + 1}. ${b.title} - ${b.author} - ${b.year || 'N/A'}`);
          });
        });
        lines.push(''); // Blank line between volumes
      });

      const formattedText = lines.join('\n').trim();

      navigator.clipboard.writeText(formattedText).then(() => {
        const originalHTML = copyTitlesBtn.innerHTML;
        copyTitlesBtn.innerHTML = `<i data-lucide="check"></i> Copied!`;
        lucide.createIcons();
        setTimeout(() => {
          copyTitlesBtn.innerHTML = originalHTML;
          lucide.createIcons();
        }, 2000);
      }).catch(err => {
        console.error("Clipboard write error:", err);
        alert("Failed to copy titles.");
      });
    });

    // Active Engines UI
    function updateActiveEngines() {
      const activeE1 = books.find(b => b.engine === 'Engine 1: Deep Focus');
      const activeE2 = books.find(b => b.engine === 'Engine 2: Complementary');
      const activeE3 = books.find(b => b.engine === 'Engine 3: Exploration');

      renderEngineSlot(slot1, activeE1);
      renderEngineSlot(slot2, activeE2);
      renderEngineSlot(slot3, activeE3);

      // data-active-count lets mobile CSS hide the whole section (heading
      // included) when no engine has a book. Inert on desktop.
      const filled = [activeE1, activeE2, activeE3].filter(Boolean).length;
      const wrap = document.querySelector('.engines-wrap');
      if (wrap) wrap.setAttribute('data-active-count', filled);
    }

    function renderEngineSlot(slotElem, book) {
      const card = slotElem.closest('.engine-card');
      if (book) {
        slotElem.innerHTML = `
          <div class="engine-book-container" onclick="openBookDetails('${book.id}', this)" title="Open Book Details" style="cursor: pointer;">
            <div class="engine-cover">
              ${renderCoverHtml(book.cover, book.title, book.author, 'engine-cover-img', book.id)}
            </div>
            <div class="engine-book-info">
              <div class="engine-book-title" title="${escapeHtml(book.title)}">${renderTitleHtml(book.title)}</div>
              <div class="engine-book-author">${escapeHtml(book.author)}</div>
            </div>
          </div>
        `;
        if (card) card.classList.remove('empty');
      } else {
        slotElem.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No active book yet</p>`;
        if (card) card.classList.add('empty');
      }
      if (window.lucide) lucide.createIcons();
    }

    function unassignEngine(bookId) {
      const idx = books.findIndex(b => b.id === bookId);
      if (idx !== -1) {
        books[idx].engine = "None";
        saveBooksToStorage(books);
        renderBooks();
      }
    }

    // Render Card HTML
    function renderBookCardHtml(book, showReorderControls = false) {
      const reorderHtml = showReorderControls ? `
        <div class="card-reorder-toolbar" onclick="event.stopPropagation();">
          <button class="action-icon-btn" title="Move Up in Stage" onclick="moveBookOrder('${book.id}', 'up')">
            <i data-lucide="chevron-up"></i>
          </button>
          <button class="action-icon-btn" title="Move Down in Stage" onclick="moveBookOrder('${book.id}', 'down')">
            <i data-lucide="chevron-down"></i>
          </button>
        </div>
      ` : '';

      const adp = resolveAdaptiveForBook(book);
      const shadow = adp ? cardShadowRgba(book, adp) : null;
      // Hover = --img-bg-hover tinted from coverColor (token-ladder logic);
      // shadow stays tied to the adaptive detail setting.
      const hoverTint = cardHoverTintHex(book);
      const hoverVars = [
        hoverTint ? `--card-hover-bg:${hoverTint}` : '',
        shadow ? `--card-shadow:${shadow}` : ''
      ].filter(Boolean).join(';');
      const hoverStyle = hoverVars ? ` style="${hoverVars}"` : '';
      return `
        <article class="book-card" data-id="${book.id}" onclick="openBookDetails('${book.id}', this)">
          <div class="cover-container"${hoverStyle}>
            ${renderCoverHtml(book.cover, book.title, book.author, 'cover-img', book.id, { threeD: !mobileView.matches, pages: book.pages, back: book.coverColor })}
          </div>
          <div class="book-info">
            <div class="book-vol-stage">
              <span>Vol ${book.volumeNumber} · Stage ${book.stageNumber} · <span class="reading-order-number">#${book.readingOrder}</span></span>
              ${reorderHtml}
            </div>
            <h2 class="book-title" title="${escapeHtml(book.title)}">${renderTitleHtml(book.title)}</h2>
            <p class="book-author">${escapeHtml(book.author)}</p>
            ${book.status ? `<span class="status-pill" data-status="${escapeHtml(book.status)}">${escapeHtml(book.status)}</span>` : ''}
          </div>
        </article>
      `;
    }

    // Row card for the horizontal stage rows (Volumes view): same layout &
    // sizing as the grid card (cover + book-info with title/author/status),
    // with the reading-order badge on the cover. Keeps the same
    // <article class="book-card" data-id onclick> contract as the grid card so
    // click→detail/edit and SortableJS keep working.
    function renderRowCardHtml(book) {
      const adp2 = resolveAdaptiveForBook(book);
      const shadow2 = adp2 ? cardShadowRgba(book, adp2) : null;
      const hoverTint2 = cardHoverTintHex(book);
      const hoverVars2 = [
        hoverTint2 ? `--card-hover-bg:${hoverTint2}` : '',
        shadow2 ? `--card-shadow:${shadow2}` : ''
      ].filter(Boolean).join(';');
      const hoverStyle2 = hoverVars2 ? ` style="${hoverVars2}"` : '';
      return `
        <article class="book-card" data-id="${book.id}" onclick="openBookDetails('${book.id}', this)">
          <div class="cover-container"${hoverStyle2}>
            <span class="order-badge" title="Reading order in stage">${book.readingOrder}</span>
            ${renderCoverHtml(book.cover, book.title, book.author, 'cover-img', book.id, { threeD: !mobileView.matches, pages: book.pages, back: book.coverColor })}
          </div>
          <div class="book-info">
            <div class="book-vol-stage">
              <span>Vol ${book.volumeNumber} · Stage ${book.stageNumber} · <span class="reading-order-number">#${book.readingOrder}</span></span>
            </div>
            <h2 class="book-title" title="${escapeHtml(book.title)}">${renderTitleHtml(book.title)}</h2>
            <p class="book-author">${escapeHtml(book.author)}</p>
            ${book.status ? `<span class="status-pill" data-status="${escapeHtml(book.status)}">${escapeHtml(book.status)}</span>` : ''}
          </div>
        </article>
      `;
    }

    function destroySortables() {
      sortableInstances.forEach(inst => {
        try { inst.destroy(); } catch (e) {}
      });
      sortableInstances = [];
    }

    // Auto-Expand Collapsed Sections when hovering over them while dragging
    function attachHeaderDragListeners() {
      const headers = document.querySelectorAll('.volume-header, .stage-header');
      headers.forEach(header => {
        const handleDragOver = (e) => {
          if (!document.body.classList.contains('is-dragging')) return;
          if (dragExpandTimeout) return;

          dragExpandTimeout = setTimeout(() => {
            dragExpandTimeout = null;
            const volSection = header.closest('.volume-section');

            if (header.classList.contains('volume-header') && volSection && volSection.classList.contains('collapsed-volume')) {
              const volNum = volSection.getAttribute('data-vol-num');
              volSection.classList.remove('collapsed-volume');
              collapsedVolumes.delete(`vol-${volNum}`);
              // This path mutates in place (no renderBooks), so keep the
              // disclosure state in sync with the expansion.
              header.setAttribute('aria-expanded', 'true');
              const icon = header.querySelector('.vol-expand-icon');
              if (icon) {
                icon.setAttribute('data-lucide', 'minus');
                lucide.createIcons();
              }
            }
          }, 250);
        };

        const handleDragLeave = () => {
          if (dragExpandTimeout) {
            clearTimeout(dragExpandTimeout);
            dragExpandTimeout = null;
          }
        };

        header.addEventListener('pointerover', handleDragOver);
        header.addEventListener('pointerleave', handleDragLeave);
        header.addEventListener('dragover', handleDragOver);
        header.addEventListener('dragleave', handleDragLeave);
      });
    }

    // Arrow buttons scroll the stage row sideways by ~80% of its visible width.
    // The buttons live in the stage header, which is a SIBLING of the row
    // (header → arrows; row is a sibling div in the same .stage-block), so
    // climb via the block instead of closest('.stage-row'). Smooth scrolling;
    // only fall back to an instant jump in hidden tabs, where Chromium
    // suppresses smooth-scroll animation (making the arrows appear dead).
    function scrollStageRow(btn, dir) {
      const block = btn.closest('.stage-block');
      const row = block ? block.querySelector('.stage-row') : null;
      if (!row) return;
      const behavior = document.hidden ? 'auto' : 'smooth';
      row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior });
    }

    // Edge fade cues on stage rows: the mask-image fades should not mask the
    // first book once it's at the start (scrollLeft 0) nor the last book once
    // it's fully in view. A row is "at its start" when scrollLeft is 0; "at
    // its end" when scrolled to its max (scrollLeft at scrollWidth -
    // clientWidth) OR when it never overflows at all — then the last book is
    // already fully visible and there's nothing to scroll for. The .at-start /
    // .at-end classes adjust the mask in CSS (desktop only).
    function updateStageRowFade(row) {
      if (!row || !row.classList.contains('stage-row')) return;
      const atStart = row.scrollLeft <= 1;
      const atEnd = row.scrollWidth - row.clientWidth - row.scrollLeft <= 1;
      row.classList.toggle('at-start', atStart);
      row.classList.toggle('at-end', atEnd);
    }

    function updateAllStageRowFades() {
      if (currentView !== 'roadmap') return;
      bookGrid.querySelectorAll('.stage-row').forEach(updateStageRowFade);
    }

    // Stage rows re-render on every renderBooks, so after rendering we
    // re-evaluate every row (updateAllStageRowFades is called at the end of
    // renderBooks). Scroll doesn't bubble, so the delegated listener uses the
    // capture phase to catch each row's own scroll event; a window resize can
    // change how many books fit, so re-check on resize too.
    bookGrid.addEventListener('scroll', (e) => {
      if (currentView !== 'roadmap') return;
      const row = e.target && e.target.closest ? e.target.closest('.stage-row') : null;
      if (row) updateStageRowFade(row);
    }, true);

    window.addEventListener('resize', updateAllStageRowFades);

    // Initialize SortableJS on Roadmap Stages
    function initRoadmapSortables() {
      destroySortables();

      const stageGrids = document.querySelectorAll('.sortable-row');
      stageGrids.forEach(gridEl => {
        const instance = new Sortable(gridEl, {
          group: 'roadmap-books-group', // Allows drag-and-drop across all stages/volumes
          animation: 150,
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          delay: 50,
          delayOnTouchOnly: true,
          onStart: function () {
            document.body.classList.add('is-dragging');
          },
          onEnd: function (evt) {
            document.body.classList.remove('is-dragging');
            if (dragExpandTimeout) {
              clearTimeout(dragExpandTimeout);
              dragExpandTimeout = null;
            }

            const bookId = evt.item.getAttribute('data-id');
            if (!bookId) return;

            const targetGrid = evt.to;
            const sourceGrid = evt.from;

            const targetVolNum = parseInt(targetGrid.getAttribute('data-vol-num'));
            const targetVolName = targetGrid.getAttribute('data-vol-name');
            const targetStageNum = parseInt(targetGrid.getAttribute('data-stage-num'));
            const targetStageName = targetGrid.getAttribute('data-stage-name');

            // Update Target Stage Books order & Volume/Stage assignments
            const targetChildren = Array.from(targetGrid.children).filter(c => c.hasAttribute('data-id'));
            targetChildren.forEach((child, index) => {
              const id = child.getAttribute('data-id');
              const b = books.find(item => item.id === id);
              if (b) {
                b.readingOrder = index + 1;
                b.volumeNumber = targetVolNum;
                b.volumeName = targetVolName;
                b.stageNumber = targetStageNum;
                b.stageName = targetStageName;
              }
            });

            // Update Source Stage Books order if moved to another stage
            if (sourceGrid !== targetGrid) {
              const sourceChildren = Array.from(sourceGrid.children).filter(c => c.hasAttribute('data-id'));
              sourceChildren.forEach((child, index) => {
                const id = child.getAttribute('data-id');
                const b = books.find(item => item.id === id);
                if (b) {
                  b.readingOrder = index + 1;
                }
              });
            }

            // Dragging a stage's last book out leaves an empty stage, which
            // (being derived from books) vanishes and gaps the numbering.
            // Renumber both affected volumes' stages 1..n in visual order,
            // then the volume numbers themselves (a cross-volume drag can
            // empty the source volume entirely). Stage renumbers MUST run
            // first — they filter by the current volume numbers.
            renumberVolumeStages(targetVolNum);
            const sourceVolNum = parseInt(sourceGrid.getAttribute('data-vol-num'));
            if (sourceVolNum !== targetVolNum) renumberVolumeStages(sourceVolNum);
            renumberVolumeNumbers();

            // renderBooks() rebuilds the whole roadmap DOM, which resets each
            // stage row's horizontal scroll to 0. Remember the scroll offset
            // of the source/target rows (keyed by vol+stage) and restore it
            // after the re-render so dragging within a wide row doesn't jump.
            const scrollMemory = new Map();
            [sourceGrid, targetGrid].forEach(grid => {
              if (!grid || !grid.classList) return;
              const key = `${grid.getAttribute('data-vol-num')}-${grid.getAttribute('data-stage-num')}`;
              if (!scrollMemory.has(key)) scrollMemory.set(key, grid.scrollLeft);
            });

            saveBooksToStorage(books);
            renderBooks();

            scrollMemory.forEach((left, key) => {
              const [volNum, stageNum] = key.split('-');
              const row = bookGrid.querySelector(`.stage-row[data-vol-num="${volNum}"][data-stage-num="${stageNum}"]`);
              if (row && left > 0) {
                row.scrollLeft = left;
                updateStageRowFade(row);
              }
            });
          }
        });
        sortableInstances.push(instance);
      });

      attachHeaderDragListeners();
    }

    // 2) FIX: Roadmap View Rendering Logic with Full Support for Collapsed Stages & Volumes Drag Target
    function renderRoadmapView(filteredBooks) {
      destroySortables();

      if (filteredBooks.length === 0) {
        bookGrid.innerHTML = `<p style="color: var(--text-muted); padding: 20px;">No books match the current filters.</p>`;
        return;
      }

      const volumeMap = new Map();
      filteredBooks.forEach(book => {
        const vKey = book.volumeNumber;
        if (!volumeMap.has(vKey)) {
          volumeMap.set(vKey, {
            volumeName: book.volumeName,
            stages: new Map()
          });
        }
        
        const stageMap = volumeMap.get(vKey).stages;
        const sKey = book.stageNumber;
        if (!stageMap.has(sKey)) {
          stageMap.set(sKey, {
            stageName: book.stageName,
            books: []
          });
        }
        stageMap.get(sKey).books.push(book);
      });

      const sortedVolKeys = Array.from(volumeMap.keys()).sort((a, b) => a - b);

      // The roadmap top bar is editor-only — the whole bar is hidden on the
      // public site via `body.view-only .roadmap-top-bar` (view-only CSS block),
      // so there's no read-only variant to render here.
      let html = `
        <div class="roadmap-top-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">
            <i data-lucide="git-branch" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></i> Volumes View
          </span>
          <button class="btn-primary btn-xs" onclick="addNewVolume()"><i data-lucide="plus"></i> Add Volume</button>
        </div>
      `;

      sortedVolKeys.forEach(volNum => {
        const volData = volumeMap.get(volNum);
        const isVolCollapsed = collapsedVolumes.has(`vol-${volNum}`);
        const sortedStageKeys = Array.from(volData.stages.keys()).sort((a, b) => a - b);

        let totalVolBooks = 0;
        sortedStageKeys.forEach(sKey => {
          totalVolBooks += volData.stages.get(sKey).books.length;
        });

        html += `
          <section class="volume-section ${isVolCollapsed ? 'collapsed-volume' : ''}" data-vol-num="${volNum}">
            <!-- Disclosure header: role=button + tabindex + aria-expanded make
                 the collapse keyboard-operable and announced to AT (the header
                 was click-only before). aria-label overrides the inner content
                 (incl. the action buttons) for a clean "Volume N — Name"
                 announcement. The keydown guard (event.target === this) keeps
                 Enter/Space on the INNER action buttons from also toggling. -->
            <h2 class="volume-header"
                role="button"
                tabindex="0"
                aria-expanded="${!isVolCollapsed}"
                aria-label="Volume ${volNum} — ${escapeHtml(volData.volumeName)}"
                onclick="toggleVolumeCollapse(${volNum})"
                onkeydown="if ((event.key === 'Enter' || event.key === ' ') && event.target === this) { event.preventDefault(); toggleVolumeCollapse(${volNum}); }">
              <div class="volume-title-group">
                <i data-lucide="${isVolCollapsed ? 'plus' : 'minus'}" class="vol-expand-icon"></i>
                <!-- Sibling spans (NOT nested): when the name wraps, its 2nd
                     line aligns under the name — not under the number — for a
                     hanging-indent hierarchy. Spacing comes from the group gap. -->
                <span class="volume-number">Volume ${volNum}</span><span class="volume-name">${escapeHtml(volData.volumeName)}</span>
                <span class="count-badge">${totalVolBooks}</span>
              </div>
              <div class="section-action-btns" onclick="event.stopPropagation();">
                <button class="action-icon-btn" title="Move Volume Up" onclick="moveVolume(${volNum}, 'up')"><i data-lucide="chevron-up"></i></button>
                <button class="action-icon-btn" title="Move Volume Down" onclick="moveVolume(${volNum}, 'down')"><i data-lucide="chevron-down"></i></button>
                <button class="action-icon-btn" title="Edit Volume Name" onclick="openEditVolumeModal(${volNum})"><i data-lucide="edit-3"></i></button>
                <button class="action-icon-btn danger" title="Delete Volume" onclick="deleteVolume(${volNum})"><i data-lucide="trash-2"></i></button>
                <button class="btn-secondary btn-xs" title="Add New Stage" onclick="addNewStageToVolume(${volNum})"><i data-lucide="plus"></i> Stage</button>
              </div>
            </h2>
            <div class="volume-content">
        `;

        sortedStageKeys.forEach(stageNum => {
          const stageData = volData.stages.get(stageNum);
          stageData.books.sort((a, b) => a.readingOrder - b.readingOrder);

          const stageGridClass = `stage-row ${!viewOnly ? 'sortable-row' : ''} ${stageData.books.length === 0 ? 'empty-stage-row' : ''}`.trim();

          html += `
            <div class="stage-block" data-vol-num="${volNum}" data-stage-num="${stageNum}">
              <div class="stage-header">
                <div class="stage-title-group">
                  <!-- Sibling spans (NOT nested): a wrapped name's 2nd line
                       aligns under the name, not under the number — hanging-
                       indent hierarchy. Spacing comes from the group gap. -->
                  <span class="stage-number">Stage ${stageNum}</span><span class="stage-name">${escapeHtml(stageData.stageName)}</span>
                  <span class="count-badge">${stageData.books.length}</span>
                </div>
                <div class="stage-arrows" onclick="event.stopPropagation();" aria-label="Scroll stage">
                  <button class="arrow-btn" type="button" title="Scroll stage left" onclick="scrollStageRow(this, -1)"><i data-lucide="chevron-left"></i></button>
                  <button class="arrow-btn" type="button" title="Scroll stage right" onclick="scrollStageRow(this, 1)"><i data-lucide="chevron-right"></i></button>
                </div>
                <div class="section-action-btns" onclick="event.stopPropagation();">
                  <button class="action-icon-btn" title="Move Stage Up" onclick="moveStage(${volNum}, ${stageNum}, 'up')"><i data-lucide="chevron-up"></i></button>
                  <button class="action-icon-btn" title="Move Stage Down" onclick="moveStage(${volNum}, ${stageNum}, 'down')"><i data-lucide="chevron-down"></i></button>
                  <button class="action-icon-btn" title="Edit Stage Name" onclick="openEditStageModal(${volNum}, ${stageNum})"><i data-lucide="edit-3"></i></button>
                  <button class="action-icon-btn danger" title="Delete Stage" onclick="deleteStage(${volNum}, ${stageNum})"><i data-lucide="trash-2"></i></button>
                  <button class="btn-secondary btn-xs" title="Add Book to Stage" onclick="addNewBookToStage(${volNum}, ${stageNum})"><i data-lucide="plus"></i> Book</button>
                </div>
              </div>

              <div class="${stageGridClass}" 
                   data-vol-num="${volNum}" 
                   data-vol-name="${escapeHtml(volData.volumeName)}" 
                   data-stage-num="${stageNum}" 
                   data-stage-name="${escapeHtml(stageData.stageName)}">
                ${stageData.books.length > 0 
                  ? stageData.books.map(book => renderRowCardHtml(book)).join('') 
                  : '<p class="empty-stage-msg" style="pointer-events:none;">Drag books here into this stage</p>'}
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </section>
        `;
      });

      bookGrid.innerHTML = html;
      if (!viewOnly) initRoadmapSortables(); // Read-only in view mode.
    }

    // Fisher–Yates shuffle (in-place). Random sort uses this once per entry
    // into Random mode; NEVER put Math.random() in a sort comparator.
    function fisherYates(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Filter + sort the library into the order the current view should show.
    // Extracted from renderBooks() so the Surprise button reuses the exact
    // same filtered set the grid/roadmap is currently displaying.
    function computeFilteredBooks() {
      const query = searchInput.value.toLowerCase().trim();
      const selectedVol = filterVolume.value;
      const selectedStatus = filterStatus.value;
      const sortVal = sortSelect.value;

      let filtered = books.filter(b => {
        const matchesSearch = !query || 
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.volumeName.toLowerCase().includes(query) ||
          b.stageName.toLowerCase().includes(query) ||
          b.notes.toLowerCase().includes(query) ||
          b.isbn.toLowerCase().includes(query) ||
          (b.year || "").toLowerCase().includes(query) ||
          (b.firstPublished || "").toLowerCase().includes(query);

        const matchesVol = !selectedVol || b.volumeNumber === parseInt(selectedVol);
        const matchesStatus = !selectedStatus ||
          (selectedStatus === '__none__' ? !b.status : b.status === selectedStatus);
        const matchesTag = activeTags.size === 0 || (b.tags || []).some(t => activeTags.has(t));

        return matchesSearch && matchesVol && matchesStatus && matchesTag;
      });

      // Sorting Logic
      filtered.sort((a, b) => {
        if (sortVal === 'reading-order') {
          if (a.volumeNumber !== b.volumeNumber) return a.volumeNumber - b.volumeNumber;
          if (a.stageNumber !== b.stageNumber) return a.stageNumber - b.stageNumber;
          return a.readingOrder - b.readingOrder;
        }
        if (sortVal === 'year-desc' || sortVal === 'year-asc') {
          const ya = parseYearForSort(a.firstPublished || a.year);
          const yb = parseYearForSort(b.firstPublished || b.year);
          if (ya === null && yb === null) return 0;
          if (ya === null) return 1;
          if (yb === null) return -1;
          return sortVal === 'year-desc' ? yb - ya : ya - yb;
        }
        // Date Added: books without a `created` stamp (no matching epub at
        // migration time) always sink to the end, whichever direction.
        if (sortVal === 'created-desc' || sortVal === 'created-asc') {
          const ta = a.created ? Date.parse(a.created) : NaN;
          const tb = b.created ? Date.parse(b.created) : NaN;
          if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
          if (Number.isNaN(ta)) return 1;
          if (Number.isNaN(tb)) return -1;
          return sortVal === 'created-desc' ? tb - ta : ta - tb;
        }
        if (sortVal === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
      });

      // Random: stable shuffle — shuffle ONCE on entering Random mode, then
      // keep that order across renders so search/tag/filter changes narrow it
      // instead of reshuffling every keystroke. Books that start matching later
      // (e.g. clearing a search) fall to the end. Leaving Random mode discards
      // the cached order so re-entering gives a fresh shuffle.
      if (sortVal === 'random') {
        if (!shuffledIds) shuffledIds = fisherYates(filtered.map(b => b.id));
        const pos = new Map(shuffledIds.map((id, i) => [id, i]));
        filtered.sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity));
      } else {
        shuffledIds = null;
      }

      return filtered;
    }

    // Main Render Function
    function renderBooks() {
      updateVolumeFilterDropdown();
      updateTagFilters();
      // Tag chips were just (re)built — sync the edge fade state so a strip
      // that's already at its end (or never overflows) has no fade.
      updateTagFiltersFade();
      updateFilterBadge();
      updateSearchBadge();

      const sortVal = sortSelect.value;
      const filtered = computeFilteredBooks();

      // Random-sort / Surprise button state. The shuffle button is always
      // visible in BOTH views — clicking it enters Random mode (or reshuffles
      // if already random) and, from Volumes, first switches to Grid so the
      // new order is actually visible (the roadmap regroups by Volume → Stage,
      // making Random a no-op there). Its active state + tooltip reflect
      // whether Random is currently engaged.
      const inRandom = sortVal === 'random';
      shuffleBtn.hidden = false;
      shuffleBtn.classList.toggle('active', inRandom);
      // Shuffle/Random reorder whatever is currently listed (filters stay
      // engaged) — say so in the tooltip so the scope is never a surprise.
      const shuffleScope = filtered.length === books.length
        ? `all ${books.length} books`
        : `${filtered.length} filtered books`;
      shuffleBtn.title = inRandom
        ? `Reshuffle ${shuffleScope}`
        : `Shuffle — random order for the current list (${shuffleScope})`;
      shuffleBtn.setAttribute('aria-label', shuffleBtn.title);
      surpriseBtn.title = 'Surprise me — a random book from your entire library';
      surpriseBtn.disabled = filtered.length === 0;

      // Update Header Stats
      displayedCount.textContent = filtered.length;
      statTotal.textContent = books.length;
      statToRead.textContent = books.filter(b => b.status === 'To Read').length;
      statReading.textContent = books.filter(b => b.status === 'Reading').length;
      syncHeaderStatActive();

      // Render View
      if (currentView === 'grid') {
        destroySortables();
        bookGrid.className = 'book-grid';
        bookGrid.innerHTML = filtered.map(book => renderBookCardHtml(book, false)).join('');
      } else {
        bookGrid.className = 'roadmap-container';
        renderRoadmapView(filtered);
      }

      lucide.createIcons();
      updateActiveEngines();
      // Stage rows were just (re)built — sync the edge fade state so a row
      // that's already at its end (or never overflows) has no fade.
      updateAllStageRowFades();
      // Size each 3D book to its cover's aspect ratio (lazy covers size on load).
      sizeAllBook3D();
    }

    // --- Volume & Stage Reordering & CRUD Functions ---

    function moveVolume(volNum, direction) {
      const volNumbers = Array.from(new Set(books.map(b => b.volumeNumber))).sort((a, b) => a - b);
      const idx = volNumbers.indexOf(volNum);
      if (idx === -1) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= volNumbers.length) return;

      const otherVolNum = volNumbers[targetIdx];

      books.forEach(b => {
        if (b.volumeNumber === volNum) {
          b.volumeNumber = otherVolNum;
        } else if (b.volumeNumber === otherVolNum) {
          b.volumeNumber = volNum;
        }
      });

      // The swap preserves the visual order but reuses the old (possibly
      // gapped) numbers — renumber 1..n so the sequence stays contiguous.
      renumberVolumeNumbers();
      saveBooksToStorage(books);
      renderBooks();
    }

    function moveStage(volNum, stageNum, direction) {
      const volBooks = books.filter(b => b.volumeNumber === volNum);
      const stageNumbers = Array.from(new Set(volBooks.map(b => b.stageNumber))).sort((a, b) => a - b);
      const idx = stageNumbers.indexOf(stageNum);
      if (idx === -1) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= stageNumbers.length) return;

      const otherStageNum = stageNumbers[targetIdx];

      books.forEach(b => {
        if (b.volumeNumber === volNum) {
          if (b.stageNumber === stageNum) {
            b.stageNumber = otherStageNum;
          } else if (b.stageNumber === otherStageNum) {
            b.stageNumber = stageNum;
          }
        }
      });

      // The swap preserves the visual order but reuses the old (possibly
      // gapped) numbers — renumber 1..n so the sequence stays contiguous.
      renumberVolumeStages(volNum);
      saveBooksToStorage(books);
      renderBooks();
    }

    function moveBookOrder(bookId, direction) {
      const targetBook = books.find(b => b.id === bookId);
      if (!targetBook) return;

      const stageBooks = books
        .filter(b => b.volumeNumber === targetBook.volumeNumber && b.stageNumber === targetBook.stageNumber)
        .sort((a, b) => a.readingOrder - b.readingOrder);

      const idx = stageBooks.findIndex(b => b.id === bookId);
      if (idx === -1) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= stageBooks.length) return;

      const otherBook = stageBooks[targetIdx];

      const tempOrder = targetBook.readingOrder;
      targetBook.readingOrder = otherBook.readingOrder;
      otherBook.readingOrder = tempOrder;

      // Normalize Reading Order sequence
      stageBooks.sort((a, b) => a.readingOrder - b.readingOrder);
      stageBooks.forEach((b, index) => {
        b.readingOrder = index + 1;
      });

      saveBooksToStorage(books);
      renderBooks();
    }

    // Volume CRUD
    const volumeModal = document.getElementById('volume-modal');
    const volumeForm = document.getElementById('volume-form');
    const editVolTargetNum = document.getElementById('edit-volume-target-num');
    const volNameModalInput = document.getElementById('volume-name-modal-input');
    const closeVolumeModalBtn = document.getElementById('close-volume-modal');
    const cancelVolumeModalBtn = document.getElementById('cancel-volume-modal-btn');

    function openEditVolumeModal(volNum) {
      const volBook = books.find(b => b.volumeNumber === volNum);
      if (!volBook) return;

      editVolTargetNum.value = volNum;
      volNameModalInput.value = volBook.volumeName || `Volume ${volNum}`;
      volumeModal.classList.add('active');
      void volumeModal.offsetWidth;
      volumeModal.classList.add('anim-in');
    }

    function closeVolumeModal() {
      volumeModal.classList.remove('active');
      volumeModal.classList.remove('anim-in');
    }

    closeVolumeModalBtn.addEventListener('click', closeVolumeModal);
    cancelVolumeModalBtn.addEventListener('click', closeVolumeModal);

    volumeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const volNum = parseInt(editVolTargetNum.value);
      const newName = volNameModalInput.value.trim();

      if (volNum && newName) {
        books.forEach(b => {
          if (b.volumeNumber === volNum) {
            b.volumeName = newName;
          }
        });
        saveBooksToStorage(books);
        closeVolumeModal();
        renderBooks();
      }
    });

    function deleteVolume(volNum) {
      const volBooks = books.filter(b => b.volumeNumber === volNum);
      if (volBooks.length === 0) return;

      const volName = volBooks[0].volumeName || `Volume ${volNum}`;
      if (confirm(`Are you sure you want to delete Volume ${volNum}: "${volName}" and all ${volBooks.length} book(s) in it?`)) {
        books = books.filter(b => b.volumeNumber !== volNum);
        // Volumes are derived from books — removing this one leaves a
        // numbering gap (1,2,4…). Close it so the sequence stays contiguous.
        renumberVolumeNumbers();
        saveBooksToStorage(books);
        renderBooks();
      }
    }

    function addNewVolume() {
      const maxVol = books.length > 0 ? Math.max(...books.map(b => b.volumeNumber)) : 0;
      const newVolNum = maxVol + 1;

      modalTitle.textContent = "Add New Volume & Book";
      inputId.value = "";
      document.getElementById('book-view-btn').hidden = true;
      bookForm.reset();
      resetCoverUploadState(); // bookForm.reset() doesn't cover the preview <img>.
      resetTagEditor();       // ...or the tag chips/editor.
      inputCreated.value = toDatetimeLocalValue(new Date().toISOString()); // "Added On" defaults to now

      populateVolumeDropdown('__new__');
      inputNewVolName.value = `Volume ${newVolNum}`;
      inputNewStageName.value = "Stage 1";
      inputReadingOrder.value = 1;

      deleteBookBtn.style.display = "none";
      modal.classList.add('active');
      void modal.offsetWidth;
      modal.classList.add('anim-in');
      formBaseline = snapshotFormState(); // baseline for unsaved-change detection
    }

    // Stage CRUD
    const stageModal = document.getElementById('stage-modal');
    const stageForm = document.getElementById('stage-form');
    const editStageTargetVol = document.getElementById('edit-stage-target-vol');
    const editStageTargetNum = document.getElementById('edit-stage-target-num');
    const stageNameModalInput = document.getElementById('stage-name-modal-input');
    const closeStageModalBtn = document.getElementById('close-stage-modal');
    const cancelStageModalBtn = document.getElementById('cancel-stage-modal-btn');

    function openEditStageModal(volNum, stageNum) {
      const stageBook = books.find(b => b.volumeNumber === volNum && b.stageNumber === stageNum);
      if (!stageBook) return;

      editStageTargetVol.value = volNum;
      editStageTargetNum.value = stageNum;
      stageNameModalInput.value = stageBook.stageName || `Stage ${stageNum}`;
      stageModal.classList.add('active');
      void stageModal.offsetWidth;
      stageModal.classList.add('anim-in');
    }

    function closeStageModal() {
      stageModal.classList.remove('active');
      stageModal.classList.remove('anim-in');
    }

    stageModal.classList.remove('anim-in');
    closeStageModalBtn.addEventListener('click', closeStageModal);
    cancelStageModalBtn.addEventListener('click', closeStageModal);

    stageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const volNum = parseInt(editStageTargetVol.value);
      const stageNum = parseInt(editStageTargetNum.value);
      const newName = stageNameModalInput.value.trim();

      if (volNum && stageNum && newName) {
        books.forEach(b => {
          if (b.volumeNumber === volNum && b.stageNumber === stageNum) {
            b.stageName = newName;
          }
        });
        saveBooksToStorage(books);
        closeStageModal();
        renderBooks();
      }
    });

    function deleteStage(volNum, stageNum) {
      const stageBooks = books.filter(b => b.volumeNumber === volNum && b.stageNumber === stageNum);
      if (stageBooks.length === 0) return;

      const stageName = stageBooks[0].stageName || `Stage ${stageNum}`;
      if (confirm(`Are you sure you want to delete Stage ${stageNum}: "${stageName}" and all ${stageBooks.length} book(s) in it?`)) {
        books = books.filter(b => !(b.volumeNumber === volNum && b.stageNumber === stageNum));
        // Stages are derived from books — removing this one leaves a numbering
        // gap (1,2,4…). Close it so the sequence stays contiguous.
        renumberVolumeStages(volNum);
        saveBooksToStorage(books);
        renderBooks();
      }
    }

    function addNewStageToVolume(volNum) {
      const volBooks = books.filter(b => b.volumeNumber === volNum);
      const volName = volBooks.length > 0 ? volBooks[0].volumeName : `Volume ${volNum}`;
      const maxStage = volBooks.length > 0 ? Math.max(...volBooks.map(b => b.stageNumber)) : 0;
      const newStageNum = maxStage + 1;

      modalTitle.textContent = `Add Stage to ${volName}`;
      inputId.value = "";
      document.getElementById('book-view-btn').hidden = true;
      bookForm.reset();
      resetCoverUploadState(); // bookForm.reset() doesn't cover the preview <img>.
      syncCoverColorUI("");
      resetTagEditor();       // ...or the tag chips/editor.
      inputCreated.value = toDatetimeLocalValue(new Date().toISOString()); // "Added On" defaults to now

      populateVolumeDropdown(volNum);
      populateStageDropdown(volNum, '__new__');
      inputNewStageName.value = `Stage ${newStageNum}`;
      inputReadingOrder.value = 1;

      deleteBookBtn.style.display = "none";
      modal.classList.add('active');
      void modal.offsetWidth;
      modal.classList.add('anim-in');
      formBaseline = snapshotFormState(); // baseline for unsaved-change detection
    }

    function addNewBookToStage(volNum, stageNum) {
      const stageBooks = books.filter(b => b.volumeNumber === volNum && b.stageNumber === stageNum);
      const volName = stageBooks.length > 0 ? stageBooks[0].volumeName : `Volume ${volNum}`;
      const stageName = stageBooks.length > 0 ? stageBooks[0].stageName : `Stage ${stageNum}`;
      const maxOrder = stageBooks.length > 0 ? Math.max(...stageBooks.map(b => b.readingOrder)) : 0;

      modalTitle.textContent = `Add Book to Stage ${stageNum}: ${stageName}`;
      inputId.value = "";
      document.getElementById('book-view-btn').hidden = true;
      bookForm.reset();
      syncCoverColorUI("");
      resetCoverUploadState(); // bookForm.reset() doesn't cover the preview <img>.
      resetTagEditor();       // ...or the tag chips/editor.
      inputCreated.value = toDatetimeLocalValue(new Date().toISOString()); // "Added On" defaults to now

      populateVolumeDropdown(volNum);
      populateStageDropdown(volNum, stageNum);
      inputReadingOrder.value = maxOrder + 1;

      deleteBookBtn.style.display = "none";
      modal.classList.add('active');
      void modal.offsetWidth;
      modal.classList.add('anim-in');
      formBaseline = snapshotFormState(); // baseline for unsaved-change detection
    }

    // Modal Control Functions
    function openAddModal() {
      if (viewOnly) return; // View-only mode — no editing.
      modalTitle.textContent = "Add New Book";
      inputId.value = "";
      document.getElementById('book-view-btn').hidden = true;
      bookForm.reset();
      resetCoverUploadState(); // bookForm.reset() doesn't cover the preview <img>.
      syncCoverColorUI("");
      resetTagEditor();       // ...or the tag chips/editor.
      inputCreated.value = toDatetimeLocalValue(new Date().toISOString()); // "Added On" defaults to now

      const volMap = getVolumeMap();
      const sortedVols = Array.from(volMap.keys()).sort((a, b) => a - b);
      if (sortedVols.length > 0) {
        const firstVol = sortedVols[0];
        populateVolumeDropdown(firstVol);
        const stageMap = getStageMap(firstVol);
        const firstStage = Array.from(stageMap.keys()).sort((a, b) => a - b)[0];
        if (firstStage) {
          populateStageDropdown(firstVol, firstStage);
        }
      } else {
        populateVolumeDropdown('__new__');
      }
      // Suggest appending at the end of the preselected stage, not a global
      // count — matches addNewBookToStage. The submit path clamps anyway.
      const selVol = parseInt(inputVolSelect.value);
      const selStage = parseInt(inputStageSelect.value);
      const selStageBooks = books.filter(b => b.volumeNumber === selVol && b.stageNumber === selStage);
      inputReadingOrder.value = selStageBooks.length > 0
        ? Math.max(...selStageBooks.map(b => b.readingOrder)) + 1
        : 1;

      deleteBookBtn.style.display = "none";
      modal.classList.add('active');
      void modal.offsetWidth;
      modal.classList.add('anim-in');
      formBaseline = snapshotFormState(); // baseline for unsaved-change detection
    }

    function openEditModal(id) {
      if (viewOnly) return; // View-only mode — no editing.
      const book = books.find(b => b.id === id);
      if (!book) return;

      modalTitle.textContent = "Edit Book Details";
      inputId.value = book.id;
      document.getElementById('book-view-btn').hidden = false;
      inputTitle.value = book.title;
      inputAuthor.value = book.author;
      populateVolumeDropdown(book.volumeNumber);
      populateStageDropdown(book.volumeNumber, book.stageNumber);
      inputNewVolName.value = book.volumeName;
      inputNewStageName.value = book.stageName;
      inputReadingOrder.value = book.readingOrder;
      inputYear.value = book.year;
      if (inputFirstPublished) inputFirstPublished.value = book.firstPublished || "";
      inputStatus.value = book.status;
      inputEngine.value = book.engine;
      resetCoverUploadState();
      inputCover.value = book.cover; // re-prefill AFTER the reset clears it
      if (book.cover) {
        coverPreview.src = book.cover;
        coverPreview.hidden = false;
        coverPlaceholder.hidden = true;
        coverClearBtn.hidden = false;
      }
      syncCoverColorUI(book.coverColor || "");
      inputIsbn.value = book.isbn;
      inputPages.value = book.pages != null ? String(book.pages) : '';
      inputCreated.value = toDatetimeLocalValue(book.created);
      inputNotes.value = book.notes;
      inputSummary.value = book.summary;
      // Tags — initialize the chip editor from the book's tags.
      tagEditorTags = [...(book.tags || [])];
      tagEditorInput.value = '';
      renderTagEditor();
      deleteBookBtn.style.display = "block";
      modal.classList.add('active');
      void modal.offsetWidth;
      modal.classList.add('anim-in');
      formBaseline = snapshotFormState(); // baseline for unsaved-change detection
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.classList.remove('anim-in');
    }

    // Snapshot the book form's current values so we can detect unsaved changes
    // when the modal is dismissed. Cover state is tracked separately below.
    function snapshotFormState() {
      return {
        title: inputTitle.value,
        author: inputAuthor.value,
        volume: inputVolSelect.value,
        stage: inputStageSelect.value,
        newVol: inputNewVolName.value,
        newStage: inputNewStageName.value,
        readingOrder: inputReadingOrder.value,
        year: inputYear.value,
        firstPublished: inputFirstPublished ? inputFirstPublished.value : "",
        status: inputStatus.value,
        engine: inputEngine.value,
        cover: inputCover.value,
        coverColor: coverColorInput ? coverColorInput.value.trim().toLowerCase() : "",
        isbn: inputIsbn.value,
        pages: inputPages.value,
        created: inputCreated.value,
        notes: inputNotes.value,
        summary: inputSummary.value,
        tags: inputTags.value
      };
    }

    // True when the form differs from the baseline captured when it opened.
    // A cover picked but not yet saved counts as a change even though the
    // hidden input value may still match the baseline.
    function hasUnsavedChanges() {
      if (!formBaseline) return false;
      const cur = snapshotFormState();
      for (const key in formBaseline) {
        if (cur[key] !== formBaseline[key]) {
          // Clearing "Added On" is not a real change — saving restores the
          // persisted date, so closing without saving loses nothing.
          if (key === 'created' && cur.created === '') continue;
          return true;
        }
      }
      if (pendingCoverBlob !== null) return true;
      return false;
    }

    // Dismiss path for X / Cancel / backdrop / Escape: confirm before closing
    // when there are unsaved changes. Save and delete call closeModal()
    // directly and bypass this prompt.
    function requestCloseModal() {
      if (hasUnsavedChanges()) {
        if (!confirm("You have unsaved changes. Are you sure you want to close without saving?")) {
          return; // stay open — keep the user's edits
        }
      }
      closeModal();
    }

    function normalizeAbout(raw) {
      const src = raw && typeof raw === 'object' ? raw : {};
      return {
        title: typeof src.title === 'string' && src.title.trim() ? src.title.trim() : 'About this library',
        body: typeof src.body === 'string' ? src.body : "A personal library, organized around ideas and connections.\n\n## How to explore\nBrowse by volume, stage, or tag. Open a book to read its notes and follow connections to other books.",
        footer: typeof src.footer === 'string' ? src.footer : '',
        showStats: src.showStats !== false
      };
    }

    const aboutModal = document.getElementById('about-modal');
    const aboutSheet = aboutModal.querySelector('.modal-content');
    const aboutForm = document.getElementById('about-form');
    const aboutPreview = document.getElementById('about-preview');
    const aboutEdit = document.getElementById('about-edit-btn');
    const aboutView = document.getElementById('about-view-btn');
    const aboutClose = document.getElementById('about-close-btn');
    const aboutTitleInput = document.getElementById('about-title-input');
    const aboutBodyInput = document.getElementById('about-body-input');
    const aboutFooterInput = document.getElementById('about-footer-input');
    const aboutShowStatsInput = document.getElementById('about-show-stats-input');
    const aboutDraftPreview = document.getElementById('about-draft-preview');
    const aboutStatus = document.getElementById('about-save-status');
    let aboutBaseline = '', aboutTrigger = null, aboutSaving = false;
    function aboutDraft() { return { title: aboutTitleInput.value, body: aboutBodyInput.value, footer: aboutFooterInput.value, showStats: aboutShowStatsInput.checked }; }
    function aboutDirty() { return !aboutForm.hidden && JSON.stringify(aboutDraft()) !== aboutBaseline; }
    function canLeaveAbout() { return !aboutSaving && (!aboutDirty() || confirm('Discard your unsaved About changes?')); }
    function renderAbout() {
      const content = normalizeAbout(siteSettings.about);
      document.getElementById('about-heading').textContent = content.title;
      document.getElementById('about-body').innerHTML = renderMiniMarkdown(content.body);
      document.getElementById('about-footer').textContent = content.footer;
      document.getElementById('about-footer').hidden = !content.footer;
      const aboutStats = document.getElementById('about-stats');
      aboutStats.textContent = `${books.length} books · ${books.filter(b => b.status === 'To Read').length} to read · ${books.filter(b => b.status === 'Reading').length} reading · ${books.filter(b => b.status === 'Completed').length} completed`;
      aboutStats.hidden = !content.showStats;
      aboutForm.hidden = true; aboutPreview.hidden = false; aboutDraftPreview.hidden = true;
      aboutEdit.hidden = viewOnly;
      aboutView.hidden = true;
    }
    function openAboutModal() {
      if (aboutModal.classList.contains('active')) return;
      aboutTrigger = document.activeElement;
      if (detailModal.classList.contains('active')) closeDetailModal();
      renderAbout(); aboutStatus.textContent = '';
      aboutSheet.style.transform = '';
      aboutSheet.style.transition = '';
      aboutModal.style.opacity = '';
      aboutModal.style.transition = '';
      aboutDragActive = false;
      aboutDismissing = false;
      aboutModal.classList.add('active');
      document.querySelector('.container').inert = true;
      if (location.hash !== '#about') history.pushState(null, '', '#about');
      if (viewOnly) aboutClose.focus();
      else editAbout();
    }
    function closeAboutModal(updateURL = true, restoreFocus = true) {
      aboutModal.classList.remove('active');
      aboutSheet.style.transform = '';
      aboutSheet.style.transition = '';
      aboutModal.style.opacity = '';
      aboutModal.style.transition = '';
      aboutDragActive = false;
      aboutDismissing = false;
      aboutForm.hidden = true;
      document.querySelector('.container').inert = false;
      if (updateURL && location.hash === '#about') history.replaceState(null, '', location.pathname + location.search);
      if (restoreFocus && aboutTrigger?.isConnected) aboutTrigger.focus();
    }
    function requestCloseAbout() { if (canLeaveAbout()) closeAboutModal(); }
    document.getElementById('about-btn').addEventListener('click', openAboutModal);
    aboutClose.addEventListener('click', requestCloseAbout);
    function editAbout() {
      if (viewOnly || aboutSaving) return;
      const content = normalizeAbout(siteSettings.about);
      aboutTitleInput.value = content.title; aboutBodyInput.value = content.body; aboutFooterInput.value = content.footer; aboutShowStatsInput.checked = content.showStats;
      aboutBaseline = JSON.stringify(aboutDraft());
      aboutForm.hidden = false; aboutPreview.hidden = true; aboutEdit.hidden = true;
      aboutView.hidden = false; aboutDraftPreview.hidden = true;
      aboutStatus.textContent = ''; aboutTitleInput.focus();
    }
    aboutEdit.addEventListener('click', editAbout);
    aboutView.addEventListener('click', () => {
      if (viewOnly || !canLeaveAbout()) return;
      renderAbout();
      aboutStatus.textContent = '';
      aboutEdit.focus();
    });
    document.getElementById('about-cancel-btn').addEventListener('click', () => {
      if (canLeaveAbout()) { renderAbout(); aboutEdit.focus(); }
    });
    document.getElementById('about-preview-btn').addEventListener('click', () => {
      aboutDraftPreview.hidden = !aboutDraftPreview.hidden;
      aboutDraftPreview.innerHTML = renderMiniMarkdown(aboutBodyInput.value);
    });
    aboutBodyInput.addEventListener('input', () => {
      if (!aboutDraftPreview.hidden) aboutDraftPreview.innerHTML = renderMiniMarkdown(aboutBodyInput.value);
    });
    aboutForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (viewOnly || aboutSaving) return;
      const next = normalizeSiteSettings({ ...siteSettings, about: aboutDraft() });
      aboutSaving = true;
      const saveButton = document.getElementById('about-save-btn');
      saveButton.disabled = true;
      aboutForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
      aboutStatus.textContent = 'Saving…';
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        siteSettings = next;
        aboutBaseline = JSON.stringify(aboutDraft());
        const result = await writeSiteJsonFile(JSON.stringify(next, null, 2));
        renderAbout();
        aboutStatus.textContent = result === 'written' ? 'Saved to site.json. Commit and push to publish.' : result === 'download' ? 'Saved locally. Move the downloaded site.json into your project to publish.' : 'Saved locally. File save was cancelled; edit and save again to publish.';
        aboutEdit.focus();
      } catch (error) {
        aboutStatus.textContent = 'Could not finish saving: ' + (error.message || error);
      } finally {
        aboutSaving = false;
        aboutForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
      }
    });
    let aboutBackdropDown = false;
    aboutModal.addEventListener('pointerdown', e => { aboutBackdropDown = e.target === aboutModal; });
    aboutModal.addEventListener('click', e => {
      if (aboutBackdropDown && e.target === aboutModal) requestCloseAbout();
      aboutBackdropDown = false;
      const ref = e.target.closest('.note-bookref');
      if (ref && canLeaveAbout()) {
        closeAboutModal(false, false);
        document.getElementById('about-btn').focus();
        openReadOnlyModal(ref.dataset.bookId);
      }
    });
    aboutModal.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); requestCloseAbout(); }
      if (e.key !== 'Tab') return;
      const focusable = [...aboutModal.querySelectorAll('button, a[href], input, textarea, summary, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // View-only About sheet: pull down from its scroll origin to dismiss on
    // touch devices. The editor deliberately has no gesture.
    const aboutFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const aboutReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let aboutDragStartY = 0, aboutDragDy = 0, aboutDragActive = false, aboutDismissing = false;
    let aboutLastY = 0, aboutLastT = 0, aboutVelY = 0;
    const ABOUT_DRAG_DIST = 120;
    const ABOUT_DRAG_VEL = 0.8;

    aboutSheet.addEventListener('touchstart', e => {
      if (!viewOnly || aboutFinePointer || e.touches.length !== 1) return;
      if (e.target.closest('button, a, input, textarea, summary, [contenteditable]')) return;
      aboutDragStartY = e.touches[0].clientY;
      aboutDragDy = 0; aboutDragActive = false; aboutDismissing = false;
      aboutLastY = aboutDragStartY; aboutLastT = performance.now(); aboutVelY = 0;
      aboutSheet.style.transition = 'none';
    }, { passive: true });

    aboutSheet.addEventListener('touchmove', e => {
      if (!viewOnly || aboutFinePointer || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const t = performance.now();
      aboutVelY = (y - aboutLastY) / Math.max(t - aboutLastT, 1);
      aboutLastY = y; aboutLastT = t;

      const raw = y - aboutDragStartY;
      if (!aboutDragActive) {
        if (!(raw > 0 && aboutSheet.scrollTop <= 0)) return;
        aboutDragActive = true;
        aboutDragStartY = y;
        aboutSheet.style.transition = 'none';
        aboutSheet.style.transform = 'translateY(0)';
      }
      e.preventDefault();
      aboutDragDy = Math.pow(y - aboutDragStartY, 0.92);
      aboutSheet.style.transform = `translateY(${aboutDragDy}px) scale(0.99)`;
    }, { passive: false });

    function snapAboutSheetBack() {
      if (aboutReduceMotion) {
        aboutSheet.style.transform = '';
        aboutDragActive = false; aboutDismissing = false;
        return;
      }
      aboutSheet.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
      aboutSheet.style.transform = 'translateY(0)';
      aboutDragActive = false; aboutDismissing = false;
    }

    aboutSheet.addEventListener('touchend', () => {
      if (!viewOnly || aboutFinePointer || !aboutDragActive) return;
      const shouldDismiss = aboutDragDy > ABOUT_DRAG_DIST || aboutVelY > ABOUT_DRAG_VEL;
      aboutDragActive = false;
      if (aboutReduceMotion) {
        if (shouldDismiss) requestCloseAbout();
        else aboutSheet.style.transform = '';
        return;
      }
      aboutDismissing = shouldDismiss;
      if (aboutDismissing) {
        aboutSheet.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)';
        aboutModal.style.transition = 'opacity 0.28s ease';
        aboutSheet.style.transform = `translateY(${window.innerHeight}px)`;
        aboutModal.style.opacity = '0';
      } else {
        snapAboutSheetBack();
      }
    });

    aboutSheet.addEventListener('touchcancel', snapAboutSheetBack);
    aboutSheet.addEventListener('transitionend', e => {
      if (e.target === aboutSheet && e.propertyName === 'transform' && aboutDismissing) {
        requestCloseAbout();
      }
    });

    window.addEventListener('beforeunload', e => {
      if (!aboutDirty() && !aboutSaving) return;
      e.preventDefault(); e.returnValue = '';
    });

    // --- Read-Only Book Details Modal (public / view-only) ---
    // Card clicks route here on the public site; locally they open the edit modal.
    const detailModal = document.getElementById('book-detail-modal');
    const detailSheet = detailModal.querySelector('.modal-content');
    // Drag-to-dismiss state (touch devices only; desktop is untouched).
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dragStartY = 0, dragDy = 0, dragActive = false, dismissing = false;
    let lastY = 0, lastT = 0, velY = 0;
    // True while a touch gesture BEGAN on the interactive 3D cover — that
    // gesture belongs to the tilt, so drag-to-dismiss stays disengaged for
    // the whole touch (touch events keep targeting the start element).
    let sheetDragOnCover = false;
    const DRAG_DIST = 120; // px of downward travel to dismiss
    const DRAG_VEL = 0.8;  // px/ms (~900px/s) flick to dismiss
    const closeDetailModalBtn = document.getElementById('close-detail-modal');
    const detailCover = document.getElementById('detail-cover');
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailStatus = document.getElementById('detail-status');
    const detailEngine = document.getElementById('detail-engine');
    const detailVolume = document.getElementById('detail-volume');
    const detailStage = document.getElementById('detail-stage');
    const detailOrder = document.getElementById('detail-order');
    const detailYear = document.getElementById('detail-year');
    const detailIsbnRow = document.getElementById('detail-isbn-row');
    const detailIsbn = document.getElementById('detail-isbn');
    const detailAddedRow = document.getElementById('detail-added-row');
    const detailAdded = document.getElementById('detail-added');
    const detailLinks = document.getElementById('detail-links');
    const detailLinkGoodreads = document.getElementById('detail-link-goodreads');
    const detailNotes = document.getElementById('detail-notes');
    const detailNotesText = document.getElementById('detail-notes-text');
    const detailTags = document.getElementById('detail-tags');
    const detailTagsList = document.getElementById('detail-tags-list');
    const detailSummary = document.getElementById('detail-summary');
    const detailSummaryText = document.getElementById('detail-summary-text');
    const detailSummaryToggle = document.getElementById('detail-summary-toggle');
    let summaryExpanded = false;

    // Clicking a tag chip in the read-only detail modal filters the grid to it.
    detailTagsList.addEventListener('click', (e) => {
      const chip = e.target.closest('.tag-chip');
      if (!chip || !chip.dataset.tag) return;
      activeTags.clear();
      activeTags.add(chip.dataset.tag);
      // A tag click here means "explore this tag" — drop any Volume/Status
      // slice too, so the tag can never land on an empty grid.
      filterVolume.value = '';
      filterStatus.value = '';
      closeDetailModal();
      renderBooks();
      // Land at the new first book, same as filter-bar tag chips.
      scrollToFirstBooks();
    });

    // Clicking a [[book cross-reference]] chip in personal notes opens that
    // book's detail modal. In View mode the read-only modal swaps content in
    // place (no close/reopen flash); in Edit mode close first so the edit
    // modal doesn't stack on top of the detail modal.
    detailNotesText.addEventListener('click', (e) => {
      const ref = e.target.closest('.note-bookref');
      if (!ref || !ref.dataset.bookId) return;
      if (!viewOnly) closeDetailModal();
      openBookDetails(ref.dataset.bookId, ref);
    });

    // Clicking Volume / Stage in the detail modal jumps to that spot in
    // Volumes (roadmap) view. Volume clicks land on the volume header;
    // stage clicks land on the stage header inside that volume.
    detailModal.addEventListener('click', (e) => {
      const link = e.target.closest('.detail-meta-link');
      if (!link) return;
      const volNum = parseInt(link.dataset.vol);
      const stageNum = parseInt(link.dataset.stage);
      if (!volNum) return;
      closeDetailModal();
      jumpToVolumeStage(volNum, stageNum || null);
    });

    function jumpToVolumeStage(volNum, stageNum) {
      // Ensure the roadmap view is active (via the sort ⇄ view coupling).
      if (currentView !== 'roadmap') {
        sortSelect.value = 'reading-order';
        syncViewFromSort(); // pill/classes flip now; render yields below
      }
      scheduleViewWork(() => {
        // Expand the target volume if collapsed.
        const volKey = `vol-${volNum}`;
        if (collapsedVolumes.has(volKey)) {
          collapsedVolumes.delete(volKey);
        }
        renderBooks();
        // Scroll via scrollIntoView — the browser resolves the target position
        // atomically at scroll time, so there's no measure-then-scroll race
        // when a collapsed volume just expanded and shifted the layout (the old
        // getBoundingClientRect + scrollTo math could land at a stale spot).
        // Landing clearances live in CSS as scroll-margin-top on the targets:
        // .volume-section 4px / .stage-block 72px desktop, 84px mobile (clears
        // the sticky volume header pinned at top:0). The section is targeted
        // for volume jumps — never sticky itself, so its rect is always its
        // true position (a stuck header would report top:0).
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const selector = stageNum
              ? `.volume-section[data-vol-num="${volNum}"] .stage-block[data-stage-num="${stageNum}"]`
              : `.volume-section[data-vol-num="${volNum}"]`;
            const target = document.querySelector(selector);
            if (!target) return;
            // Reset the velocity baseline so the programmatic jump isn't read
            // as a user flick (which would wrongly reveal the filter bar).
            scrollSamples.length = 0;
            lastScrollY = window.scrollY;
            lastScrollDir = 'down';
            syncStickyBar();
            target.scrollIntoView({ block: 'start' });
          });
        });
      });
    }

    const ENGINE_COLORS = {
      'Engine 1: Deep Focus': 'var(--engine-1)',
      'Engine 2: Complementary': 'var(--engine-2)',
      'Engine 3: Exploration': 'var(--engine-3)'
    };

    let detailTrigger = null;
    let detailBookId = null;

    document.getElementById('book-view-btn').addEventListener('click', () => {
      const id = inputId.value;
      if (viewOnly || !books.some(book => book.id === id)) return;
      if (hasUnsavedChanges() && !confirm('Discard your unsaved changes and view the saved book?')) return;
      closeModal();
      detailTrigger = document.querySelector('.book-card[data-id="' + CSS.escape(id) + '"]') || document.getElementById('mode-edit-btn');
      openReadOnlyModal(id);
    });

    document.getElementById('detail-edit-btn').addEventListener('click', () => {
      if (viewOnly || !detailBookId) return;
      const id = detailBookId;
      closeDetailModal();
      openEditModal(id);
      document.getElementById('book-view-btn').focus();
    });

    function openBookDetails(id, triggerEl) {
      if (viewOnly) {
        detailTrigger = triggerEl || document.activeElement;
        openReadOnlyModal(id);
      } else {
        openEditModal(id);
      }
    }

    function openReadOnlyModal(id) {
      const book = books.find(b => b.id === id);
      if (!book) return;
      detailBookId = id;
      document.getElementById('detail-edit-btn').hidden = viewOnly;

      // Cover (renders the CSS jacket fallback if the image fails).
      // Always use 3D book in detail modal for interactive viewing.
      // hint: true adds the small rotate badge (bottom-right) that tells the
      // user the cover tilts — it fades away on first interaction.
      detailCover.innerHTML = renderCoverHtml(book.cover, book.title, book.author, 'detail-cover-img', book.id, { threeD: true, pages: book.pages, hint: true, back: book.coverColor });

      detailTitle.textContent = book.title;
      detailAuthor.textContent = book.author;
      if (book.status) {
        detailStatus.textContent = book.status;
        detailStatus.dataset.status = book.status;
        detailStatus.hidden = false;
      } else {
        detailStatus.textContent = '';
        delete detailStatus.dataset.status;
        detailStatus.hidden = true;
      }

      // Engine track (only when assigned).
      const engine = (book.engine && book.engine !== 'None') ? book.engine : '';
      if (engine) {
        const shortName = engine.replace(/^Engine \d+: /, '');
        const dotColor = ENGINE_COLORS[engine] || 'var(--text-muted)';
        detailEngine.hidden = false;
        detailEngine.innerHTML = `<span class="dot" style="background: ${dotColor};"></span>${escapeHtml(shortName)}`;
      } else {
        detailEngine.hidden = true;
        detailEngine.innerHTML = '';
      }

      // Volume / stage — the label carries the "Volume" / "Stage" word, so the
      // value just shows the number + name. Rendered as clickable buttons that
      // jump to the matching volume/stage in Volumes view on click.
      detailVolume.dataset.vol = book.volumeNumber;
      detailVolume.textContent = `${book.volumeNumber} / ${book.volumeName}`;
      detailStage.dataset.vol = book.volumeNumber;
      detailStage.dataset.stage = book.stageNumber;
      detailStage.textContent = `${book.stageNumber} / ${book.stageName}`;
      detailOrder.textContent = `#${book.readingOrder} in stage`;
      {
        // Show the complete first-publication date, with just the 4-digit edition
        // year in parentheses. Same-year dates (precision differences only) skip
        // the redundant suffix and show whichever date is more precise.
        const firstDate = parsePublicationDate(book.firstPublished);
        const editionDate = parsePublicationDate(book.year);
        const fp = formatPublicationDate(book.firstPublished);
        const y = formatPublicationDate(book.year);
        const editionYear = editionDate ? editionDate.text.slice(0, 4) : y;
        if (fp && y && fp !== y) {
          const sameYear = firstDate && editionDate && firstDate.year === editionDate.year;
          detailYear.textContent = sameYear
            ? (firstDate.precision >= editionDate.precision ? fp : y)
            : `${fp} (${editionYear} edition)`;
        } else {
          detailYear.textContent = fp || y || '—';
        }
      }

      // ISBN + find-this-book links (only when an ISBN exists).
      if (book.isbn) {
        detailIsbnRow.hidden = false;
        detailIsbn.textContent = book.isbn;
        detailLinkGoodreads.href = `https://www.goodreads.com/search?q=${encodeURIComponent(book.isbn)}`;
        detailLinks.hidden = false;
      } else {
        detailIsbnRow.hidden = true;
        detailLinks.hidden = true;
      }

      // Date added (only when the book carries a `created` stamp).
      if (book.created) {
        const d = new Date(book.created);
        detailAddedRow.hidden = false;
        detailAdded.textContent = isNaN(d)
          ? book.created
          : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
      } else {
        detailAddedRow.hidden = true;
        detailAdded.textContent = '';
      }

      // Personal notes (only when present). Rendered through the mini-markdown
      // helper (bold/italic/links/[[book refs]]) — input is escaped first.
      if (book.notes && book.notes.trim()) {
        detailNotes.hidden = false;
        detailNotesText.innerHTML = renderNotesHtml(book.notes);
      } else {
        detailNotes.hidden = true;
        detailNotesText.textContent = '';
      }

      // Tags (only when present) — click a chip to filter the grid by that tag.
      if (book.tags && book.tags.length > 0) {
        detailTags.hidden = false;
        detailTagsList.innerHTML = book.tags.map(t => `<button type="button" class="tag-chip" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
      } else {
        detailTags.hidden = true;
        detailTagsList.innerHTML = '';
      }

      // Publisher blurb (from Hardcover) — only when a summary exists. Always
      // start collapsed; the rAF / ResizeObserver below re-evaluates the
      // "Read more" toggle once the sheet is actually visible.
      summaryExpanded = false;
      detailSummaryText.classList.add('clamped');
      detailSummaryToggle.textContent = 'Read more';
      detailSummaryToggle.setAttribute('aria-expanded', 'false');
      detailSummaryToggle.hidden = true;
      if (book.summary && book.summary.trim()) {
        detailSummary.hidden = false;
        detailSummaryText.textContent = book.summary;
      } else {
        detailSummary.hidden = true;
        detailSummaryText.textContent = '';
      }

      if (window.lucide) lucide.createIcons();
      // Adaptive tint — when enabled and the book has a coverColor, tint the modal from it (ignores site accent hue).
      (function applyAdaptiveDetail(){
        const adp = resolveAdaptiveForBook(book);
        if(adp){
          detailModal.setAttribute('data-adaptive', adp.isDark ? 'dark' : 'light');
          detailSheet.style.setProperty('--detail-bg', adp.hex);
          // Derive surface tokens from --detail-bg via OKLCH L shift (mirrors --bg-surface / --img-bg ladder).
          // Dark: surfaces lighter than bg (+3-6% L); Light: surfaces darker than bg (-2.5-6% L).
          function detailSurface(deltaL){
            const {r,g,b}=hexToRgb(adp.hex);
            const {L,C,H}=rgbToOklch(r,g,b);
            const nL=Math.max(0,Math.min(1,L+deltaL));
            const nC=clampChroma(nL,C,H);
            const {r:r2,g:g2,b:b2}=oklchToRgb(nL,nC,H);
            return rgbToHex(r2,g2,b2);
          }
          // Text/border/accent keep perceived lightness (L) from default theme, inject C/H from coverColor.
          // Surfaces already derived via detailSurface(deltaL) above.
          function detailText(L, scale){
            const {C:Ca, H:Ha}=rgbToOklch(...Object.values(hexToRgb(adp.hex)));
            let Ct = Ca < 0.03 ? Ca*0.35 : Math.min(0.04, Ca*scale);
            if(!adp.isDark) Ct *= 0.55;
            const c = clampChroma(L, Ct, Ha);
            const {r,g,b}=oklchToRgb(L,c,Ha);
            return rgbToHex(r,g,b);
          }
          if(adp.isDark){
            detailSheet.style.setProperty('--detail-text', detailText(0.9459, 0.25));
            detailSheet.style.setProperty('--detail-text-secondary', detailText(0.7923, 0.30));
            detailSheet.style.setProperty('--detail-text-muted', detailText(0.6597, 0.25));
            detailSheet.style.setProperty('--detail-text-faint', detailText(0.5475, 0.60));
            detailSheet.style.setProperty('--detail-border', detailSurface(0.08));
            detailSheet.style.setProperty('--detail-accent', detailText(0.9459, 0.50));
            detailSheet.style.setProperty('--detail-accent-contrast','#161618');
            detailSheet.style.setProperty('--detail-surface', detailSurface(0.03));
            detailSheet.style.setProperty('--detail-surface-hover', detailSurface(0.06));
            detailSheet.style.setProperty('--detail-chip-bg', detailSurface(0.03));
            detailSheet.style.setProperty('--detail-chip-hover', detailSurface(0.07));
          } else {
            detailSheet.style.setProperty('--detail-text', detailText(0.3, 0.6));
            detailSheet.style.setProperty('--detail-text-secondary', detailText(0.4568, 0.30));
            detailSheet.style.setProperty('--detail-text-muted', detailText(0.5452, 0.25));
            detailSheet.style.setProperty('--detail-text-faint', detailText(0.7, 0.90));
            detailSheet.style.setProperty('--detail-border', detailSurface(-0.08));
            detailSheet.style.setProperty('--detail-accent', detailText(0.3, 0.9));
            detailSheet.style.setProperty('--detail-accent-contrast','#ffffff');
            detailSheet.style.setProperty('--detail-surface', detailSurface(-0.03));
            detailSheet.style.setProperty('--detail-surface-hover', detailSurface(-0.06));
            detailSheet.style.setProperty('--detail-chip-bg', detailSurface(-0.025));
            detailSheet.style.setProperty('--detail-chip-hover', detailSurface(-0.055));
          }
          // Tone-on-tone book shadow — same hue as cover, no color-mix needed.
          // Color is shared desktop/mobile; only geometry (y/blur) splits in CSS.
          (function setDetailShadow(){
            const srcHex = (book && book.coverColor || adp.hex || '').trim();
            if(!isValidHexColor(srcHex)) return;
            const {C:Craw, H} = rgbToOklch(...Object.values(hexToRgb(srcHex)));
            let Ls, Cs, alpha;
            if(adp.isDark){
              Ls = Math.max(SHADOW_TUNING.detailDarkLightnessFloor, adp.L - SHADOW_TUNING.detailDarkLightnessOffset);
              Cs = Craw < 0.03 ? Craw * SHADOW_TUNING.grayChromaScale : Math.min(SHADOW_TUNING.detailDarkChromaCap, Craw * SHADOW_TUNING.detailDarkChromaScale);
              alpha = SHADOW_TUNING.detailDarkAlpha;
            } else {
              Ls = SHADOW_TUNING.detailLightLs;
              Cs = Craw < 0.03 ? Craw * SHADOW_TUNING.grayChromaScale : Math.min(SHADOW_TUNING.detailLightChromaCap, Craw * SHADOW_TUNING.detailLightChromaScale);
              alpha = SHADOW_TUNING.detailLightAlpha;
            }
            const c = clampChroma(Ls, Cs, H);
            const {r:r2,g:g2,b:b2} = oklchToRgb(Ls, c, H);
            detailSheet.style.setProperty('--detail-shadow', `rgba(${r2}, ${g2}, ${b2}, ${alpha})`);
          })();
        } else {
          detailModal.removeAttribute('data-adaptive');
          ['--detail-bg','--detail-text','--detail-text-secondary','--detail-text-muted','--detail-text-faint','--detail-border','--detail-accent','--detail-accent-contrast','--detail-surface','--detail-surface-hover','--detail-chip-bg','--detail-chip-hover','--detail-shadow'].forEach(k=>detailSheet.style.removeProperty(k));
        }
      })();
      // Clear any leftover drag state so the sheet never opens stuck translated
      // and the entrance rise + overlay fade replay on every open.
      detailSheet.style.transform = '';
      detailSheet.style.transition = '';
      detailSheet.style.animation = '';
      detailModal.style.opacity = '';
      detailModal.style.transition = '';
      detailModal.style.animation = '';
      dismissing = false;
      // Kill any leftover 3D spin coast (mobile physics): the coast loop
      // re-queries .book3d live every frame, so an uncancelled raf would
      // grab the freshly built book and keep spinning it.
      if (window.__book3dCancelCoast) window.__book3dCancelCoast();
      detailModal.classList.add('active');
      // Size the 3D book now that #detail-cover has a layout (display:flex).
      // Doing it before .active leaves clientWidth at 0 -> default 85%×80%
      // box + no spine texture -> gapped + flat colour.
      if (window.sizeDetailBook3D) requestAnimationFrame(window.sizeDetailBook3D);
      // Auto-demo tilt: right pages first (-ry) → left spine (+ry) → rest.
      // Twice per session, interruptible, jacket-safe, respects reduced-motion.
      try {
        const DEMO_KEY = 'detail-demo-count';
        const demoCount = parseInt(sessionStorage.getItem(DEMO_KEY) || '0', 10);
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hasCoverImg = !!detailCover.querySelector('.book3d img');
        const canDemo = !prefersReduced && demoCount < 2 && hasCoverImg;
        if (canDemo) {
          // Clear any leftover inline animation from a previous cancel
          const prevB = detailCover.querySelector('.book3d');
          if (prevB) prevB.style.removeProperty('animation');
          detailModal.classList.add('demo-run');
          sessionStorage.setItem(DEMO_KEY, String(demoCount + 1));
          const cancelDemo = () => {
            detailModal.classList.remove('demo-run');
          };
          detailCover.addEventListener('pointermove', cancelDemo, { once: true });
          detailCover.addEventListener('pointerdown', cancelDemo, { once: true });
          detailCover.addEventListener('touchstart', cancelDemo, { once: true, passive: true });
          const book3dEl = detailCover.querySelector('.book3d');
          if (book3dEl) {
            book3dEl.addEventListener('animationend', () => {
              detailModal.classList.remove('demo-run');
            }, { once: true });
          }
        }
      } catch (e) { /* sessionStorage unavailable — skip demo */ }
      // Reflect the open book in the URL (#book=<id>) so the page is
      // deep-linkable and Back/Forward toggle the modal. pushState adds a
      // history entry without firing hashchange (so no recursion), and we skip
      // the push when the hash already matches (re-clicking the same book, or
      // opening from a deep link) to avoid stacking duplicate entries.
      const bookHash = '#book=' + encodeURIComponent(id);
      if (location.hash !== bookHash) {
        history.pushState(null, '', bookHash);
      }
      // The summary text is unmeasurable while the modal is display:none, so
      // re-evaluate the Read more toggle on the next frame (the ResizeObserver
      // below also covers later viewport/orientation changes).
      requestAnimationFrame(updateSummaryToggle);
      // Remove the app behind from tab order / assistive tech while open.
      const appContainer = document.querySelector('.container');
      if (appContainer) appContainer.inert = true;
      closeDetailModalBtn.focus();
    }

    // Show/hide the summary toggle based on whether the clamped text overflows
    // its box; while expanded it always shows "Show less".
    function updateSummaryToggle() {
      if (summaryExpanded) {
        detailSummaryToggle.hidden = false;
        detailSummaryToggle.textContent = 'Show less';
        detailSummaryToggle.setAttribute('aria-expanded', 'true');
        return;
      }
      const overflowing = detailSummaryText.scrollHeight > detailSummaryText.clientHeight + 1;
      detailSummaryToggle.hidden = !overflowing;
      detailSummaryToggle.textContent = 'Read more';
      detailSummaryToggle.setAttribute('aria-expanded', 'false');
    }

    function closeDetailModal() {
      detailBookId = null;
      // Strip the book hash when closing via X / overlay / Escape / drag.
      // replaceState (not back()) keeps the history entry count stable.
      if (getBookIdFromHash()) {
        history.replaceState(null, '', location.pathname + location.search);
      }
      detailModal.removeAttribute('data-adaptive');
      ['--detail-bg','--detail-text','--detail-text-secondary','--detail-text-muted','--detail-text-faint','--detail-border','--detail-accent','--detail-accent-contrast','--detail-surface','--detail-surface-hover','--detail-chip-bg','--detail-chip-hover','--detail-shadow'].forEach(k=>detailSheet.style.removeProperty(k));
      detailModal.classList.remove('active');
      detailModal.classList.remove('demo-run');
      detailModal.classList.remove('anim-in');
      // Stop any 3D spin coast still running from the mobile physics.
      if (window.__book3dCancelCoast) window.__book3dCancelCoast();
      const appContainer = document.querySelector('.container');
      if (appContainer) appContainer.inert = false;
      // Return focus to whatever opened the modal (best effort).
      if (detailTrigger && typeof detailTrigger.focus === 'function') {
        detailTrigger.focus();
      }
      detailTrigger = null;
    }

    closeDetailModalBtn.addEventListener('click', closeDetailModal);

    // Backdrop dismissal only when the press STARTS on the overlay too — same
    // common-ancestor click issue as the edit modal (see there).
    let detailOverlayPointerDown = false;
    detailModal.addEventListener('mousedown', (e) => {
      detailOverlayPointerDown = (e.target === detailModal);
    });
    detailModal.addEventListener('click', (e) => {
      if (detailOverlayPointerDown && e.target === detailModal) closeDetailModal();
      detailOverlayPointerDown = false;
    });

    // Escape closes the detail modal.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && detailModal.classList.contains('active')) {
        closeDetailModal();
      }
    });

    // Parse the open-book id from the URL, e.g. "#book=1785948535767".
    function getBookIdFromHash() {
      const m = location.hash.match(/^#book=(.+)$/);
      try { return m ? decodeURIComponent(m[1]) : null; }
      catch { return null; }
    }

    // Back/Forward (and manual hash edits) open/close the detail modal to match
    // the URL. The pushState/replaceState above don't fire hashchange, so this
    // only runs on real navigation — and by then the browser has already set the
    // hash, so openReadOnlyModal's push is skipped (no duplicate entry).
    function syncPublicRoute() {
      if (aboutModal.classList.contains('active') && location.hash !== '#about') {
        if (!canLeaveAbout()) { history.pushState(null, '', '#about'); return; }
        closeAboutModal(false);
      }
      if (location.hash === '#about') { openAboutModal(); return; }
      const id = getBookIdFromHash();
      if (id && books.find(b => b.id === id)) {
        openReadOnlyModal(id);
      } else if (detailModal.classList.contains('active')) {
        closeDetailModal();
      }
    }
    window.addEventListener('hashchange', syncPublicRoute);

    // Summary "Read more" toggle: re-evaluate whenever the text is laid out
    // (fires on open, and on viewport/orientation changes that alter the count).
    const detailSummaryObserver = new ResizeObserver(updateSummaryToggle);
    detailSummaryObserver.observe(detailSummaryText);

    detailSummaryToggle.addEventListener('click', () => {
      summaryExpanded = !summaryExpanded;
      detailSummaryText.classList.toggle('clamped', !summaryExpanded);
      updateSummaryToggle();
    });

    // --- Drag-to-dismiss: detail modal (touch only) ---
    // The centered card follows the finger downward (translateY), then springs
    // off-screen to close on release past a distance/velocity threshold, or
    // springs back if released early. Fine-pointer / reduced-motion devices are
    // handled too. The card stays centered — this is NOT a bottom sheet.
    detailSheet.addEventListener('touchstart', (e) => {
      if (finePointer || e.touches.length !== 1) return;
      // Finger down on the 3D book: hand the gesture to the tilt handler —
      // never engage drag-to-dismiss from the cover.
      sheetDragOnCover = !!(e.target.closest && e.target.closest('#detail-cover'));
      if (sheetDragOnCover) return;
      dragStartY = e.touches[0].clientY;
      dragDy = 0; dragActive = false; dismissing = false;
      lastY = dragStartY; lastT = performance.now(); velY = 0;
      // Track the finger with zero lag; the release anim re-enables transitions.
      detailSheet.style.transition = 'none';
    }, { passive: true });

    detailSheet.addEventListener('touchmove', (e) => {
      if (finePointer || e.touches.length !== 1 || sheetDragOnCover) return;
      const y = e.touches[0].clientY;
      const t = performance.now();
      velY = (y - lastY) / Math.max(t - lastT, 1);
      lastY = y; lastT = t;

      const raw = y - dragStartY;
      if (!dragActive) {
        // Take over only when pulling DOWN at the very top of the sheet;
        // otherwise let native scrolling handle it.
        if (!(raw > 0 && detailSheet.scrollTop <= 0)) return;
        dragActive = true;
        dragStartY = y;                       // re-baseline so the sheet starts at 0
        // Cancel any CSS entrance transition by jumping to end state.
        detailSheet.style.transition = 'none';
        detailSheet.style.transform = 'translateY(0)';
      }
      e.preventDefault();                     // stop native scroll / rubber-band

      // Gentle rubber-band resistance so the sheet doesn't run away from the finger.
      const dy = Math.pow(y - dragStartY, 0.92);
      dragDy = dy;
      // Position only — no overlay fade while the finger is dragging.
      detailSheet.style.transform = `translateY(${dy}px) scale(0.99)`;
    }, { passive: false });

    function snapSheetBack() {
      if (reduceMotion) {
        detailSheet.style.transform = '';
        dragActive = false; dismissing = false;
        return;
      }
      detailSheet.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
      detailSheet.style.transform = 'translateY(0)';
      dragActive = false; dismissing = false;
    }

    detailSheet.addEventListener('touchend', () => {
      if (finePointer || !dragActive) return;
      const shouldDismiss = dragDy > DRAG_DIST || velY > DRAG_VEL;
      dragActive = false;

      if (reduceMotion) {
        if (shouldDismiss) closeDetailModal();
        else detailSheet.style.transform = '';
        return;
      }

      dismissing = shouldDismiss;
      if (dismissing) {
        detailSheet.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)';
        detailModal.style.transition = 'opacity 0.28s ease';
        detailSheet.style.transform = `translateY(${window.innerHeight}px)`;
        detailModal.style.opacity = '0';
      } else {
        snapSheetBack();
      }
    });

    detailSheet.addEventListener('touchcancel', snapSheetBack);

    // Close only after the exit animation finishes — the sheet stays `.active`
    // (display:flex) during the slide-out, then flips to display:none, which
    // also keeps Safari 26's browser-chrome tint sampler from reading a ghost.
    detailSheet.addEventListener('transitionend', (e) => {
      if (e.target === detailSheet && e.propertyName === 'transform' && dismissing) {
        closeDetailModal();
      }
    });

    // Lightweight focus trap while the detail modal is open.
    detailModal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = detailModal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // --- 3D Book in Detail Modal ---
    // Desktop: hover tilt + gloss (reuse grid logic).
    // Mobile: touch drag rotation + gloss + limited tilt.
    (function initDetailBook3D() {
      const detailCover = document.getElementById('detail-cover');
      if (!detailCover) return;
      // Shared tilt limits degrees for desktop hover + mobile drag — one place to tune.
      const DETAIL_TILT_MAX_X = 4;  // ±° vertical (rotateX)
      const DETAIL_TILT_MAX_Y = 40; // ±° horizontal (rotateY)

      // Fade the rotate-hint badge once the user has interacted (hover/drag) —
      // re-queried fresh each time since openReadOnlyModal rebuilds innerHTML
      // (and thus a NEW hint element) on every open. Idempotent via classList.
      function hideRotateHint() {
        const hint = detailCover.querySelector('.book3d-hint');
        if (hint) hint.classList.add('is-hidden');
      }

      // Size the 3D book when the modal opens (sizes to #detail-cover
      // box and derives the cover's real left-edge pixels for the spine).
      function sizeDetailBook3D() {
        const book3d = detailCover.querySelector('.book3d');
        if (!book3d) return;
        const apply = () => { sizeBook3D(book3d); deriveSpineTexture(book3d); };
        const img = book3d.querySelector('.book3d__front img');
        if (!img) { apply(); return; }
        if (img.complete && img.naturalWidth) {
          apply();
        } else {
          img.addEventListener('load', apply, { once: true });
          // Also handle detail images outside grid — lazy load may fire into
          // a hidden detail-cover; observe the image until it decodes.
          if (!img.complete) img.addEventListener('load', () => requestAnimationFrame(apply), { once: true });
        }
      }

      // ===== Spin spring — ONE integrator owns the detail book =====
      // Shared by the desktop hover branch and the mobile touch branch.
      // Input handlers never write the tilt directly while a motion is
      // running; they move the spring's TARGET (cursor position while
      // hovering, face-front after release) or inject a velocity impulse
      // (tap/click) and start the integrator. Chasing a target instead of
      // writing the angle is what lets hover + click coexist without
      // clashing: a moving cursor and a click nudge both just reshape what
      // the same spring is chasing. Mobile touch tracking stays zero-lag
      // (writes the angle directly while the finger is down; the spring
      // takes over on release).
      //
      // TUNE — all spin-physics feel knobs live here.
      // -- drag + release (mobile; the release spring is shared) --
      const SPIN_SENS = 0.45;      // deg of spin per px of horizontal drag
      const MAX_SPIN = 80;         // spine limit (deg) — rubber-bands past this
      const RUBBER = 0.05;         // drag resistance multiplier past the limit
      const BOUNDARY_SPRING = 0.005; // SETTLE: spine-limit clamp accel (deg/ms^2) per deg past the limit
      const SETTLE_K = 0.00005;    // SETTLE: spring stiffness — sets bounce rhythm (π/√K ms per bounce)
      const SETTLE_ZETA = 0.5;    // SETTLE: damping ratio ζ — THE bounce feel (0.2–0.35 = ball bounce, 0.8 ≈ dead)
      const SETTLE_C = 2 * SETTLE_ZETA * Math.sqrt(SETTLE_K); // derived from ζ + K — tune ζ above, not this
      const END_ANGLE = 0.1;       // deg — settle ends below this
      const END_VEL = 0.005;       // deg/ms — settle ends below this
      const VEL_CAP = 0.5;         // deg/ms — max release velocity
      const SAMPLE_MS = 80;        // release-velocity sample window
      const TAP_DRAG_PX = 19;      // total drag below this = a tap, not a drag
      const TAP_IMPULSE = 0.6;     // deg/ms — tap nudge, ~15-20deg glide under friction
      const GLOSS_SWEEP = 33;      // % — how far the highlight travels across the cover
      const GLOSS_FLOOR = 0.2;     // gloss opacity at the edge-on worst case
      const GLOSS_FADE_MS = 700;   // ms — eased gloss fade-out after release (smoothstep 1→0)
      // -- desktop hover/click --
      const HOVER_K = 0.001;       // chase stiffness — snappier than the release spring
      const HOVER_ZETA = 0.8;      // chase damping — tracks the cursor without wobbling
      const CLICK_IMPULSE = 0.9;   // deg/ms — click nudge (the clicked side sets direction)
      // Desktop's own release spring (click bounce + leave-return). A hover UI
      // doesn't need the mobile flick bounce — one small overshoot reads as
      // weight without the wobble. Same K keeps the return rhythm identical;
      // raise ζ toward 1.0 for a dead-calm return, lower it for more bounce.
      const DESKTOP_SETTLE_K = 0.00005;  // desktop return stiffness (same rhythm as mobile)
      const DESKTOP_SETTLE_ZETA = 0.7;   // desktop damping — one small overshoot, no ball bounce
      const DESKTOP_SETTLE_C = 2 * DESKTOP_SETTLE_ZETA * Math.sqrt(DESKTOP_SETTLE_K);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Which input branch registered (the two are mutually exclusive). Picks
      // the release-spring constants in stepSpring: mobile keeps the tuned
      // ball bounce, desktop returns calmer.
      const isTouchInput = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      let angle = 0;       // current spin (deg)
      let vel = 0;         // angular velocity (deg/ms) — release + integrator
      let lean = 0;        // vertical lean (deg, --rx) — released on the same spring
      let leanVel = 0;     // lean velocity (deg/ms)
      let target = 0;      // spin chase target (cursor while hovering, 0 after release)
      let leanTarget = 0;  // lean chase target
      let hovering = false;       // desktop pointer inside → chase the cursor
      let impulseActive = false;  // click/tap nudge → ride the bouncy release spring
      let glossEnv = 1;    // gloss fade envelope (1 = full, → 0 during the settle)
      let fadeStart = -1;  // integrator-clock time the release fade began (-1 = not fading)
      let lastT = 0;       // last integrator timestamp (ms)
      let lastX = 0;
      let totalDrag = 0;   // Σ|dx| this touch — distinguishes a tap from a drag
      let samples = [];    // {x, t} inside SAMPLE_MS, for release velocity
      let rafId = null;
      let tracking = false;

      const book3dEl = () => detailCover.querySelector('.book3d');
      const glossEl = () => detailCover.querySelector('.book3d__gloss');

      function cancelCoast() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }

      // Instant full rest — reduced-motion paths and lifecycle resets.
      function restAll() {
        cancelCoast();
        angle = 0; vel = 0;
        lean = 0; leanVel = 0;
        target = 0; leanTarget = 0;
        hovering = false; impulseActive = false;
        fadeStart = -1; glossEnv = 1;
        setAngle(0); setLean(0);
        const g = glossEl();
        if (g) { g.style.transition = ''; g.style.opacity = '0'; }
      }

      // Single writer for spin state: --ry on the book + gloss derived
      // from the ANGLE, not the pointer — the light stays fixed in world
      // space, so the highlight sweeps across the cover as the book turns
      // and dims edge-on.
      function setAngle(a, gyPct) {
        angle = a;
        const b = book3dEl();
        if (!b) return;
        b.style.setProperty('--ry', a.toFixed(2) + 'deg');
        const rad = a * Math.PI / 180;
        const cos = Math.max(0, Math.cos(rad));
        const g = glossEl();
        if (g) {
          g.style.setProperty('--gx', (50 + Math.sin(rad) * GLOSS_SWEEP).toFixed(1) + '%');
          if (gyPct != null) g.style.setProperty('--gy', gyPct.toFixed(1) + '%');
          // glossEnv: release fade envelope (1 while touching/hovering) — see stepSpring
          g.style.opacity = ((GLOSS_FLOOR + 0.4 * cos) * glossEnv).toFixed(2);
        }
      }

      // Vertical lean: small and direct while touching (Fitness is
      // horizontal-dominant) — on release it rides the SAME settle spring
      // as the spin (see stepSpring), so the whole book relaxes flat as
      // one movement instead of snapping upright at the end. On desktop
      // hover, lean CHASES the cursor's height via leanTarget.
      function setLean(rx, gyPct) {
        lean = rx;
        const b = book3dEl();
        if (!b) return;
        b.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        const g = glossEl();
        if (g && gyPct != null) g.style.setProperty('--gy', gyPct.toFixed(1) + '%');
      }

      // Start (or ensure) the integrator. Per-frame writes need transitions
      // off — the base .book3d transition would otherwise chase the spring.
      function startIntegrator() {
        if (rafId || reduceMotion) return;
        lastT = performance.now();
        const b = book3dEl();
        if (b) b.style.transition = 'none';
        const g = glossEl();
        if (g) g.style.transition = 'none';
        rafId = requestAnimationFrame(stepSpring);
      }

      // ONE spring integrator for every motion — hover chase, click
      // impulse, or a mobile release. Per frame: a damped spring toward the
      // current target (cursor while hovering, face-front otherwise) with
      // the spine-limit clamp in the same loop, so nothing can swing past
      // ±MAX_SPIN (the book has no back face). While purely hovering the
      // chase uses stiffer, near-critically-damped constants (the cursor
      // feels tracked, not jelly); a click/tap impulse rides the bouncier
      // release spring until it comes to rest. stepSpring is separated from
      // the rAF driver so tests can step it with fake timestamps (the
      // integrated test browser never fires rAF).
      function stepSpring(now) {
        const dt = Math.min(32, Math.max(1, now - lastT));
        lastT = now;
        // Gloss fade-out envelope: smoothstep 1→0 over GLOSS_FADE_MS from
        // release/leave, multiplying the angle-driven brightness — the sheen
        // sweeps and dies WITH the motion instead of popping off at the end.
        if (fadeStart >= 0 && GLOSS_FADE_MS > 0) {
          const p = Math.max(0, Math.min(1, (now - fadeStart) / GLOSS_FADE_MS));
          glossEnv = 1 - p * p * (3 - 2 * p);
        }
        // Spring constants by regime: hovering (no impulse) = stiff,
        // near-critically damped cursor chase; otherwise the release spring,
        // which differs per input branch — mobile keeps the tuned ball
        // bounce, desktop returns calmer (see DESKTOP_SETTLE_* above).
        const chasing = hovering && !impulseActive;
        const k = chasing ? HOVER_K : (isTouchInput ? SETTLE_K : DESKTOP_SETTLE_K);
        const c = chasing ? 2 * HOVER_ZETA * Math.sqrt(HOVER_K)
                          : (isTouchInput ? SETTLE_C : DESKTOP_SETTLE_C);
        vel -= ((angle - target) * k + vel * c) * dt;
        // Spine-limit clamp: pull-back accel while past ±MAX_SPIN.
        const over = angle - Math.max(-MAX_SPIN, Math.min(MAX_SPIN, angle));
        if (over) vel -= over * BOUNDARY_SPRING * dt;
        setAngle(angle + vel * dt);
        // Vertical lean rides the SAME spring (same K + ζ) toward its own
        // target — the whole book relaxes/moves as one.
        leanVel -= ((lean - leanTarget) * k + leanVel * c) * dt;
        setLean(lean + leanVel * dt);
        const settled = Math.abs(angle - target) < END_ANGLE && Math.abs(vel) < END_VEL &&
                        Math.abs(lean - leanTarget) < END_ANGLE && Math.abs(leanVel) < END_VEL;
        if (settled && hovering) {
          // Rest AT the cursor target — stay until the cursor moves again.
          rafId = null;
          angle = target; vel = 0;
          lean = leanTarget; leanVel = 0;
          impulseActive = false;
          setAngle(angle);
          setLean(lean);
        } else if (settled) {
          rafId = null;
          angle = 0; vel = 0;
          lean = 0; leanVel = 0;
          impulseActive = false;
          fadeStart = -1;
          setAngle(0);
          setLean(0);
          // Hand any remaining fade to the CSS transition from the CURRENT
          // (envelope-dimmed) brightness — mostly a no-op since the JS
          // envelope usually reaches 0 first. The transition must be
          // restored here because it is 'none' while the integrator runs.
          const g = glossEl();
          if (g) { g.style.transition = ''; g.style.opacity = '0'; }
          glossEnv = 1; // reset for the next touch/hover (handlers re-assert)
        } else {
          rafId = requestAnimationFrame(stepSpring);
        }
      }

      // Release velocity from the recent sample window: px/ms → deg/ms.
      function releaseVelocity() {
        const now = performance.now();
        const recent = samples.filter(s => now - s.t <= SAMPLE_MS);
        if (recent.length < 2) return 0;
        const first = recent[0], last = recent[recent.length - 1];
        const vPx = (last.x - first.x) / Math.max(16, last.t - first.t);
        return Math.max(-VEL_CAP, Math.min(VEL_CAP, vPx * SPIN_SENS));
      }

      // ===== Desktop: hover-chase + click impulse (fine pointer only) =====
      // The tilt TARGETS the cursor; the spring chases it (±DETAIL_TILT_MAX
      // at the edges, like before). A click adds a velocity impulse that the
      // same spring absorbs with the bouncy release feel. Registered only on
      // fine-pointer, non-reduced-motion devices, so it can never fire
      // alongside the touch branch below.
      if (!isTouchInput && !reduceMotion) {
        detailCover.addEventListener('pointermove', (e) => {
          hideRotateHint();
          const r = detailCover.getBoundingClientRect();
          const px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          const py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
          target = (px - 0.5) * 2 * DETAIL_TILT_MAX_Y;
          leanTarget = -(py - 0.5) * 2 * DETAIL_TILT_MAX_X;
          if (!hovering) {
            // Re-entered: cancel any leftover fade, gloss back to full.
            hovering = true;
            fadeStart = -1;
            glossEnv = 1;
          }
          const g = glossEl();
          if (g) g.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
          startIntegrator();
        });
        detailCover.addEventListener('pointerleave', () => {
          hovering = false;
          impulseActive = false;
          target = 0;
          leanTarget = 0;
          fadeStart = performance.now(); // gloss dies with the return spring
          startIntegrator();
        });
        detailCover.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          hideRotateHint();
          const r = detailCover.getBoundingClientRect();
          const px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          const py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
          target = (px - 0.5) * 2 * DETAIL_TILT_MAX_Y;
          leanTarget = -(py - 0.5) * 2 * DETAIL_TILT_MAX_X;
          hovering = true;
          glossEnv = 1;
          fadeStart = -1;
          vel += (px - 0.5) * 2 * CLICK_IMPULSE; // clicked side sets the direction
          impulseActive = true;
          startIntegrator();
        });
      }

      // Mobile detail touch — Fitness-badge-style grab-and-spin physics.
      // Horizontal drag SPINS the book with ZERO-LAG finger tracking (the
      // touchmove handler writes the angle directly while the finger is
      // down), and EVERY release — flick, slow drag, or bare tap — hands
      // the velocity to the SHARED spin spring above, which carries the
      // book back to face-front with the tuned bounce. Drag-to-dismiss
      // never engages from the cover (see sheetDragOnCover).
      if (isTouchInput) {

        detailCover.addEventListener('touchstart', (e) => {
          if (e.touches.length !== 1) return;
          const b = book3dEl();
          if (!b) return;
          cancelCoast();
          tracking = true;
          totalDrag = 0;
          leanVel = 0; // the finger owns the lean now — no stale spring velocity
          glossEnv = 1; // fresh touch: gloss back to full envelope
          fadeStart = -1;
          lastX = e.touches[0].clientX;
          samples = [{ x: lastX, t: performance.now() }];
          hideRotateHint();
          // No press-zoom (user request) — but the inline transition MUST be
          // 'none' from the first frame: the base .book3d transition would
          // otherwise chase the integrator's per-frame updates with lag.
          b.style.transition = 'none';
          // Same for the gloss: its 0.25s opacity fade would low-pass the
          // per-frame opacity updates into invisibility during a drag.
          const g = glossEl();
          if (g) g.style.transition = 'none';
        }, { passive: true });

        detailCover.addEventListener('touchmove', (e) => {
          if (!tracking || e.touches.length !== 1) return;
          const b = book3dEl();
          if (!b) return;
          e.preventDefault();
          hideRotateHint();
          const t = e.touches[0];
          const now = performance.now();
          const dx = t.clientX - lastX;
          lastX = t.clientX;
          totalDrag += Math.abs(dx);
          // Delta-based spin with rubber-band resistance past the limit.
          let spin = angle + dx * SPIN_SENS;
          if (spin > MAX_SPIN) spin = MAX_SPIN + (spin - MAX_SPIN) * RUBBER;
          else if (spin < -MAX_SPIN) spin = -MAX_SPIN + (spin + MAX_SPIN) * RUBBER;
          // Vertical: lean toward the finger (absolute, clamped, direct).
          const r = detailCover.getBoundingClientRect();
          const py = Math.max(0, Math.min(1, (t.clientY - r.top) / r.height));
          setLean(-(py - 0.5) * 2 * DETAIL_TILT_MAX_X);
          setAngle(spin, py * 100);
          samples.push({ x: t.clientX, t: now });
          while (samples.length > 2 && now - samples[0].t > SAMPLE_MS) samples.shift();
        }, { passive: false });

        detailCover.addEventListener('touchend', (e) => {
          if (!tracking) return;
          tracking = false;
          if (reduceMotion) { restAll(); return; }
          if (totalDrag < TAP_DRAG_PX) {
            // Bare tap: a slight nudge with momentum — the tapped side sets
            // the direction (push the side you touched), then the integrator
            // glides it out and curves it home.
            const r = detailCover.getBoundingClientRect();
            const px = Math.max(0, Math.min(1, (e.changedTouches[0].clientX - r.left) / r.width));
            vel = (px - 0.5) * 2 * TAP_IMPULSE;
          } else {
            vel = releaseVelocity();
          }
          // Hand off to the shared spring: chase face-front with the
          // finalized bounce; the gloss fade rides the integrator clock.
          target = 0; leanTarget = 0; hovering = false;
          fadeStart = performance.now();
          startIntegrator();
        });

        detailCover.addEventListener('touchcancel', () => {
          if (!tracking) return;
          tracking = false;
          target = 0; leanTarget = 0; hovering = false;
          fadeStart = performance.now();
          startIntegrator();
        });
      }

      // Test seam (not used by the app): the integrated test browser never
      // fires rAF, so integrator math is drivable with fake timestamps —
      // arm(t0) → setVel(v) → stepSpring(t)… → getState(). Shared scope so
      // BOTH input branches are drivable (background tabs starve rAF on
      // desktop too).
      window.__book3dTest = {
        arm: (now) => { lastT = now; vel = 0; },
        setAngle: (a) => setAngle(a),
        setVel: (v) => { vel = v; },
        stepSpring: (now) => stepSpring(now),
        releaseVelocity,
        getState: () => ({ angle, vel, lean, leanVel, target, hovering, tracking, coasting: rafId !== null })
      };

      // Lifecycle hook (shared by both input branches): openReadOnlyModal /
      // closeDetailModal cancel any running integrator AND zero the module
      // state, so a book opened mid-spin never inherits stale motion (the
      // fresh .book3d element renders 0 while the spring would otherwise
      // resume from a stale angle).
      window.__book3dCancelCoast = () => {
        cancelCoast();
        angle = 0; vel = 0;
        lean = 0; leanVel = 0;
        target = 0; leanTarget = 0;
        hovering = false; impulseActive = false;
        fadeStart = -1; glossEnv = 1;
      };

      // Size the 3D book when modal opens (called from openReadOnlyModal).
      window.sizeDetailBook3D = sizeDetailBook3D;
    })();
    detailModal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = detailModal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Renumber one stage's books 1..n, preserving their current relative
    // order. Used after a book leaves a stage (moved via the edit modal, or
    // deleted) so the remaining books close the gap instead of starting at #2.
    function renumberStage(volNum, stageNum) {
      books
        .filter(b => b.volumeNumber === volNum && b.stageNumber === stageNum)
        .sort((a, b) => a.readingOrder - b.readingOrder)
        .forEach((b, i) => { b.readingOrder = i + 1; });
    }

    // Renumber one volume's STAGE numbers 1..n in the current visual order.
    // Stage numbers are stored per book and stages are derived from them, so
    // any mutation that empties a stage (delete, drag its last book out) or
    // swaps numbers (moveStage) would otherwise leave a permanent gap. Call
    // after every stage-number mutation; a no-op on contiguous numbering.
    function renumberVolumeStages(volNum) {
      const stageNums = Array.from(new Set(
        books.filter(b => b.volumeNumber === volNum).map(b => b.stageNumber)
      )).sort((a, b) => a - b);
      stageNums.forEach((oldNum, i) => {
        if (oldNum === i + 1) return; // already correct — skip
        books.forEach(b => {
          if (b.volumeNumber === volNum && b.stageNumber === oldNum) b.stageNumber = i + 1;
        });
      });
    }

    // Renumber ALL volume numbers 1..n in the current visual order. Volumes
    // are derived from books just like stages, so deleting one (or dragging
    // its last book out) would otherwise leave a permanent gap — and
    // moveVolume() swaps numbers, which can never close one. Ascending
    // processing is collision-safe (target i+1 ≤ oldNum). No-op when clean.
    function renumberVolumeNumbers() {
      const volNums = Array.from(new Set(books.map(b => b.volumeNumber))).sort((a, b) => a - b);
      volNums.forEach((oldNum, i) => {
        if (oldNum === i + 1) return; // already correct — skip
        books.forEach(b => {
          if (b.volumeNumber === oldNum) b.volumeNumber = i + 1;
        });
      });
    }

    // Treat the form's reading-order value as the POSITION the book should
    // hold in its (possibly new) stage. The stage's other books — the moving
    // book is already excluded by the caller — are rebuilt around it: splice
    // it into the sorted list at that position, then renumber 1..n. One
    // mechanism covers every case: brand-new books, cross-stage arrivals, and
    // same-stage moves in EITHER direction (on a forward move the displaced
    // neighbour slides up into the gap the mover left). Orders stay contiguous
    // and unique. Does NOT insert the book into `books`; the caller places it
    // (preserving array position).
    function placeBookAtOrder(book, requestedOrder) {
      const others = books
        .filter(b => b.volumeNumber === book.volumeNumber && b.stageNumber === book.stageNumber)
        .sort((a, b) => a.readingOrder - b.readingOrder);
      const pos = Math.max(1, Math.min(requestedOrder || others.length + 1, others.length + 1));
      others.splice(pos - 1, 0, book);
      others.forEach((b, i) => { b.readingOrder = i + 1; });
    }

    bookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      for (const field of [inputYear, inputFirstPublished]) {
        field.setCustomValidity(invalidPublicationDate(field.value) ? 'Enter a valid date: YYYY, YYYY-MM or YYYY-MM-DD.' : '');
        if (!field.reportValidity()) return;
        const date = parsePublicationDate(field.value);
        if (date) field.value = date.text;
      }
      const id = inputId.value;
      const newEngine = inputEngine.value;

      if (newEngine !== "None") {
        books.forEach(b => {
          if (b.engine === newEngine && b.id !== id) {
            b.engine = "None";
          }
        });
      }

      // Derive Volume from dropdown (or new volume name/number)
      let volumeNumber, volumeName;
      const volVal = inputVolSelect.value;
      if (volVal === '__new__') {
        volumeNumber = nextVolumeNumber();
        volumeName = inputNewVolName.value.trim() || `Volume ${volumeNumber}`;
      } else {
        volumeNumber = parseInt(volVal) || 1;
        volumeName = getVolumeMap().get(volumeNumber) || `Volume ${volumeNumber}`;
      }

      // Derive Stage from dropdown (cascaded by volume, or new stage name/number)
      let stageNumber, stageName;
      const stageVal = inputStageSelect.value;
      if (stageVal === '__new__') {
        stageNumber = nextStageNumber(volumeNumber);
        stageName = inputNewStageName.value.trim() || `Stage ${stageNumber}`;
      } else {
        stageNumber = parseInt(stageVal) || 1;
        stageName = getStageMap(volumeNumber).get(stageNumber) || `Stage ${stageNumber}`;
      }

      // Resolve id first — it determines the cover filename in covers/.
      const newId = id || Date.now().toString();
      // Date Added: the form prefills the book's stamp ("now" for new books).
      // Clearing the field is non-destructive — the persisted date survives.
      const existing = id ? books.find(b => b.id === id) : null;
      const fallbackCreated = existing ? (existing.created || "") : new Date().toISOString();

      // Persist any newly picked cover before saving the record.
      let cover = inputCover.value.trim();
      const manualRaw = coverColorInput ? coverColorInput.value.trim() : "";
      if (manualRaw !== "" && !/^#[0-9a-f]{6}$/i.test(manualRaw)) { alert('Cover color must be #rrggbb or empty.'); return; }
      const manualHex = manualRaw ? manualRaw.toLowerCase() : "";
      let finalCoverColor = "";
      if (pendingCoverBlob) {
        const written = await writeCoverBlob(pendingCoverBlob, newId);
        if (written) cover = written;
        if (!cover) finalCoverColor = "";
        else if (manualHex) finalCoverColor = manualHex;
        else finalCoverColor = pendingCoverColor || "";
        pendingCoverBlob = null;
        pendingCoverColor = "";
        coverPreview.hidden = true;
        coverPreview.removeAttribute('src');
        coverPlaceholder.hidden = false;
        coverClearBtn.hidden = true;
        coverFileInput.value = '';
      } else {
        if (!cover) finalCoverColor = "";
        else finalCoverColor = manualHex; // manual field is source of truth (empty = no tint)
      }

      const bookData = normalizeBook({
        id: newId,
        title: inputTitle.value.trim(),
        author: inputAuthor.value.trim(),
        volumeNumber,
        volumeName,
        stageNumber,
        stageName,
        readingOrder: parseInt(inputReadingOrder.value) || 1,
        year: inputYear.value.trim(),
        firstPublished: inputFirstPublished ? inputFirstPublished.value.trim() : "",
        status: inputStatus.value,
        engine: newEngine,
        cover,
        coverColor: finalCoverColor,
        isbn: inputIsbn.value.trim(),
        pages: inputPages.value ? parseInt(inputPages.value, 10) : undefined,
        created: createdToIso(inputCreated.value) || fallbackCreated,
        notes: inputNotes.value.trim(),
        summary: inputSummary.value.trim(),
        tags: [...new Set(inputTags.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean))]
      });

      // Reading-order integrity: remove the old record first so its old slot
      // doesn't take part in the ordering, place the saved book at the
      // requested position of its (possibly new) stage — siblings shift to
      // make room — and renumber the stage it left so no gap remains.
      const requestedOrder = parseInt(inputReadingOrder.value) || 0;

      if (id) {
        const idx = books.findIndex(b => b.id === id);
        if (idx !== -1) {
          const previous = books[idx];
          const leftStage = previous.volumeNumber !== volumeNumber || previous.stageNumber !== stageNumber;
          books.splice(idx, 1);
          placeBookAtOrder(bookData, requestedOrder);
          books.splice(idx, 0, bookData);
          if (leftStage) {
            renumberStage(previous.volumeNumber, previous.stageNumber);
            // The stage the book left may now be empty (derived stages vanish)
            // — close any stage-numbering gap it left behind.
            renumberVolumeStages(previous.volumeNumber);
            // Same for the volume itself (a cross-volume move can empty it).
            // Must run AFTER both calls above — they filter by the old number.
            renumberVolumeNumbers();
          }
        }
      } else {
        placeBookAtOrder(bookData, requestedOrder);
        books.unshift(bookData);
      }

      saveBooksToStorage(books);
      closeModal();
      renderBooks();
    });

    deleteBookBtn.addEventListener('click', () => {
      const id = inputId.value;
      if (id && confirm("Are you sure you want to remove this book from your catalog?")) {
        const victim = books.find(b => b.id === id);
        books = books.filter(b => b.id !== id);
        if (victim) renumberStage(victim.volumeNumber, victim.stageNumber); // close the gap left behind
        saveBooksToStorage(books);
        closeModal();
        renderBooks();
      }
    });

    // Event Listeners
    addBookBtn.addEventListener('click', openAddModal);

    // Cover upload: pick or drop → downscale → preview (the blob is written to covers/ on submit).
    async function handleCoverFile(file) {
      try {
        const { blob } = await processCoverImage(file);
        pendingCoverBlob = blob;
        pendingCoverColor = await extractCoverColorFromBlob(blob);
        if (pendingCoverColor) syncCoverColorUI(pendingCoverColor);
        if (coverPreview.src && coverPreview.src.startsWith('blob:')) URL.revokeObjectURL(coverPreview.src);
        coverPreview.src = URL.createObjectURL(blob);
        coverPreview.hidden = false;
        coverPlaceholder.hidden = true;
        coverClearBtn.hidden = false;
        coverHint.textContent = window.showDirectoryPicker
          ? 'On save, pick the covers/ folder once — it will be remembered for future saves.'
          : 'A cover file will download when you save — drop it into the covers/ folder.';
      } catch (err) {
        alert(err.message || 'Could not process that image.');
      }
      coverFileInput.value = '';
    }

    // A drop can carry an image URL instead of file bytes (e.g. dragging a raw
    // image from the browser's own image viewer). Fetch it and wrap it as a File.
    async function fetchImageUrlAsFile(url) {
      if (!/^https?:\/\//i.test(url)) throw new Error('Not an image URL');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const blob = await res.blob();
      const looksImage = blob.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif|bmp)(\?|#|$)/i.test(url);
      if (!looksImage) throw new Error('Not an image URL');
      const name = (url.split('/').pop().split('?')[0].split('#')[0]) || 'cover.jpg';
      return new File([blob], name, { type: blob.type || 'image/jpeg' });
    }

    coverFileInput.addEventListener('change', () => {
      const file = coverFileInput.files && coverFileInput.files[0];
      if (file) handleCoverFile(file);
    });

    // The whole cover slot is the click/keyboard target for browsing.
    coverDropzone.addEventListener('click', () => coverFileInput.click());
    coverDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        coverFileInput.click();
      }
    });

    // Drag & drop is an enhancement — click/keyboard above stay the universal path.
    if (window.DragEvent && window.DataTransfer) {
      let dragDepth = 0; // counter: children fire dragenter/leave, avoid flicker
      coverDropzone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragDepth++;
        coverDropzone.classList.add('dragging');
      });
      coverDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      coverDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) coverDropzone.classList.remove('dragging');
      });
      coverDropzone.addEventListener('drop', async (e) => {
        e.preventDefault(); // stop the browser navigating to a dropped file
        dragDepth = 0;
        coverDropzone.classList.remove('dragging');
        const dt = e.dataTransfer;
        if (!dt) return;
        const file = dt.files && dt.files[0];
        if (file && file.type.startsWith('image/')) {
          handleCoverFile(file);
          return;
        }
        // No file bytes → try an image URL dragged from another tab/page.
        const url = (dt.getData('text/uri-list') || dt.getData('text/plain') || '').trim().split(/\r?\n/)[0];
        if (!url || !/^https?:\/\//i.test(url)) return;
        coverHint.textContent = 'Fetching image from URL…';
        try {
          handleCoverFile(await fetchImageUrlAsFile(url));
        } catch (err) {
          coverHint.textContent = /not an image/i.test(err.message)
            ? 'That doesn\u2019t look like an image — download it and drop the file instead.'
            : 'Couldn\u2019t fetch that image — download it and drop the file instead.';
          console.warn('Cover URL drop failed:', url, err);
        }
      });
    }

    // Remove badge (stopPropagation so it doesn't trigger the dropzone click→picker).
    coverClearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetCoverUploadState();
      inputCover.value = ''; // save as "no cover"
    });
    closeModalBtn.addEventListener('click', requestCloseModal);
    cancelModalBtn.addEventListener('click', requestCloseModal);
    // Backdrop dismissal only when the press STARTS on the overlay too: a press
    // inside the modal (selecting text, starting a scroll) that is released on
    // the overlay would otherwise fire a click on the overlay (the mousedown /
    // mouseup common ancestor) and dismiss the modal mid-interaction.
    let overlayPointerDown = false;
    modal.addEventListener('mousedown', (e) => {
      overlayPointerDown = (e.target === modal);
    });
    modal.addEventListener('click', (e) => {
      if (overlayPointerDown && e.target === modal) requestCloseModal();
      overlayPointerDown = false;
    });

    // Escape closes the edit modal too — but only after confirming unsaved
    // changes. The tagDropdown.hidden guard keeps Escape from closing the whole
    // modal while the tag type-ahead dropdown is open (its own handler closes
    // that dropdown and stops propagation). The read-only detail modal already
    // closes on Escape via its own document handler, so the two coexist.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active') && tagDropdown.hidden) {
        requestCloseModal();
      }
    });

    // sortSelect is deliberately absent — it renders via its own 'change'
    // handler below, which also syncs the coupled view state (its 'input'
    // would double-render before the sync runs).
    [searchInput, filterVolume, filterStatus].forEach(elem => {
      elem.addEventListener('input', renderBooks);
    });

    // Changing the volume/status filter resets the scroll to the new first
    // book on both breakpoints (fires after 'input' re-renders). On mobile the
    // panel auto-collapses after a pick so the new results are visible.
    [filterVolume, filterStatus].forEach(el => {
      el.addEventListener('change', () => {
        if (narrowPanel.matches) closeFilterPanel();
        scrollToFirstBooks();
      });
    });

    // Shuffle: auto-select Random in the sort dropdown, or reshuffle if already
    // in Random mode — regenerate the cached order either way. Random implies
    // Grid under the sort ⇄ view coupling, so sync directly (a .click() on
    // the grid button would clobber 'random' with lastGridSort).
    shuffleBtn.addEventListener('click', () => {
      sortSelect.value = 'random';
      shuffledIds = null;
      syncViewFromSort(); // pill/classes flip now; render yields below
      scheduleViewWork(() => {
        renderBooks();
        // If the user has scrolled past the sticky point, land at the new first
        // book so the reshuffle is actually visible (no-op near the top, and
        // mobile-only — same guard as the view-switch scroll).
        scrollToFirstBooks();
      });
    });

    // Any non-reading-order pick implies Grid; picking Reading Order implies
    // Volumes. The dropdown is the source of truth — sync the view to match,
    // then re-render. On mobile the panel auto-collapses after a pick so the
    // new results are visible.
    sortSelect.addEventListener('change', () => {
      if (sortSelect.value !== 'reading-order') lastGridSort = sortSelect.value;
      syncViewFromSort(); // pill/classes flip now; render yields below
      scheduleViewWork(() => {
        renderBooks();
        if (mobileView.matches) closeFilterPanel();
        // Changing the sort reorders the grid, so if the user has scrolled past
        // the first books, land at the new first book — same as the shuffle
        // button (no-op near the top, mobile-only via scrollToFirstBooks).
        scrollToFirstBooks();
      });
    });

    // Surprise me: open a random book from the ENTIRE library. Filters and
    // search are left exactly as they are — this is just a quick peek at a
    // book, not a view change.
    surpriseBtn.addEventListener('click', () => {
      if (!books.length) return;
      const pick = books[Math.floor(Math.random() * books.length)];
      openBookDetails(pick.id, surpriseBtn);
    });

    tagFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('.tag-filter-chip');
      if (!chip) return;
      const tag = chip.getAttribute('data-tag');
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }
      renderBooks();
      // Land at the new first book when a tag filter changes (both breakpoints).
      scrollToFirstBooks();
    });

    resetBtn.addEventListener('click', () => {
      if (confirm("Reset catalog to sample default dataset? (This will override current localStorage)")) {
        books = [...defaultBooksSeed];
        collapsedVolumes.clear();
        saveBooksToStorage(books);
        // After a reset, the library is back to a fresh known state — no export reminder.
        localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
        updateExportReminder();
        renderBooks();
      }
    });

    // Theme Switcher
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Resolve any color token (--bg-main, --img-bg-hover, …) to a hex.
    // Custom properties resolve instantly after a preset swap (only PAINTED
    // values lag), so this is safe to call right after applyThemeColors.
    function resolveTokenHex(name) {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      if (/^#[0-9a-f]{3,8}$/i.test(raw)) return raw;
      const oklchMatch = raw.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i);
      if (oklchMatch) {
        const L = parseFloat(oklchMatch[1]), C = parseFloat(oklchMatch[2]), H = parseFloat(oklchMatch[3]);
        const {r,g,b} = oklchToRgb(L,C,H);
        return rgbToHex(r,g,b);
      }
      const m = raw.match(/^hsl\(\s*([\d.]+)(?:deg)?\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*\)$/i);
      if (!m) return null;
      const h = parseFloat(m[1]) / 360, s = parseFloat(m[2]) / 100, l = parseFloat(m[3]) / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const hp = h * 6, x = c * (1 - Math.abs(hp % 2 - 1));
      let r = 0, g = 0, b = 0;
      if (hp < 1) { r = c; g = x; }
      else if (hp < 2) { r = x; g = c; }
      else if (hp < 3) { g = c; b = x; }
      else if (hp < 4) { g = x; b = c; }
      else if (hp < 5) { r = x; b = c; }
      else { r = c; b = x; }
      const m2 = l - c / 2;
      const to255 = v => Math.round((v + m2) * 255).toString(16).padStart(2, '0');
      return '#' + to255(r) + to255(g) + to255(b);
    }

    function resolveBgMainHex() {
      return resolveTokenHex('--bg-main');
    }

    function refreshCardHoverTint() {
      document.querySelectorAll('.book-card .cover-container').forEach(c => {
        const card = c.closest('.book-card');
        if (!card) return;
        const b = books.find(x => x.id === card.dataset.id);
        // Hover tint reads the resolved --img-bg-hover token (theme + accent
        // preset dependent), so it must refresh on theme changes.
        const tint = b && cardHoverTintHex(b);
        if (tint) c.style.setProperty('--card-hover-bg', tint);
        else c.style.removeProperty('--card-hover-bg');
        const a = b && resolveAdaptiveForBook(b);
        if (a) {
          const sh = cardShadowRgba(b, a);
          if(sh) c.style.setProperty('--card-shadow', sh);
          else c.style.removeProperty('--card-shadow');
        } else {
          c.style.removeProperty('--card-shadow');
        }
      });
    }

    // One-time migration: the old toggle auto-wrote 'theme' ('light'|'dark')
    // for every visitor. 'dark' was a deliberate choice → keep it as an
    // override; 'light' was just the old default → forget it (follow the
    // system/site setting). Deleting the legacy key makes this self-cleaning:
    // it no-ops on every load after the first.
    const legacyTheme = localStorage.getItem('theme');
    if (legacyTheme === 'dark') localStorage.setItem(THEME_MODE_KEY, 'dark');
    if (legacyTheme !== null) localStorage.removeItem('theme');

    // The active theme MODE: an explicit visitor choice (header toggle, per
    // browser) wins; otherwise the site.json default; otherwise follow the OS.
    function effectiveThemeMode() {
      const v = localStorage.getItem(THEME_MODE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
      return VALID_THEMES.includes(siteSettings.theme) ? siteSettings.theme : 'system';
    }

    // 'system' resolves to the OS preference live. The data-theme attribute
    // only ever holds the RESOLVED 'light'/'dark' — CSS and the adaptive
    // modal's "Match theme" mode read it, so it must never be 'system'.
    function systemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function resolvedTheme() {
      const mode = effectiveThemeMode();
      return mode !== 'system' ? mode : systemTheme();
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      // NOTE: no persistence here — the visitor's choice is written by the
      // toggle handler only, so system flips and site.json defaults never
      // overwrite the "follow system" mode.
      // Simplify a redundant override: when the visitor's explicit light/dark
      // agrees with what their OS already resolves to, it is visually
      // identical to following the system — downgrade it to 'system'. That
      // keeps the toggle a pure flip (every click changes the look; no dead
      // click when cycling back to the OS theme) and returns the visitor to
      // follow-system mode. Site defaults (no override) are left untouched.
      let mode = effectiveThemeMode();
      const override = localStorage.getItem(THEME_MODE_KEY);
      if ((override === 'light' || override === 'dark') && theme === systemTheme()) {
        localStorage.setItem(THEME_MODE_KEY, 'system');
        mode = 'system';
      }
      // Anti-flash paint hint for the NEXT boot: remember the resolved theme
      // ONLY when this paint was forced (visitor override or site default).
      // In system mode the hint is removed — the live matchMedia read at boot
      // is always fresher than a remembered value, so there is nothing to
      // hint about.
      if (mode === 'light' || mode === 'dark') localStorage.setItem(THEME_HINT_KEY, theme);
      else localStorage.removeItem(THEME_HINT_KEY);
      // Keep the Android status-bar color in sync with the current theme.
      // The color is DERIVED from the resolved --bg-main token (not hardcoded)
      // so accent presets that tint the background stay correct; falls back
      // to the original literals if the token can't be parsed.
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        const fallback = theme === 'light' ? '#fcfcfc' : '#161618';
        themeColorMeta.content = resolveBgMainHex() || fallback;
      }
      // Card hover tint is per-book inline --card-hover-bg (cardHoverTintHex
      // reads the resolved --img-bg-hover token, which changes with theme and
      // accent preset), so refresh it live without a full re-render.
      refreshCardHoverTint();
      // The icon previews the state a click will SWITCH TO (sun = light,
      // moon = dark, eclipse = back to system) — the same glyph the
      // destination state would show, so the button always advertises its
      // own action; the title/aria-label spell it out too. Re-query the icon
      // each time: lucide.createIcons() replaces the <i> with an <svg>, so a
      // cached reference would silently stop updating.
      const stateLabel = mode === 'system' ? 'System' : (mode === 'light' ? 'Light' : 'Dark');
      const nextLabel = mode === 'system' ? (theme === 'dark' ? 'Light' : 'Dark')
                      : mode === 'light' ? 'Dark' : 'System';
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.setAttribute('data-lucide', nextLabel === 'Light' ? 'sun' : nextLabel === 'Dark' ? 'moon' : 'eclipse');
      const label = 'Theme: ' + stateLabel + ' — click for ' + nextLabel;
      themeToggleBtn.title = label;
      themeToggleBtn.setAttribute('aria-label', label);
      if (window.lucide) lucide.createIcons();
    }

    // The toggle is a pure VISUAL flip (light ↔ dark) — every click changes
    // the look, in every OS state. applyTheme downgrades an override that
    // agrees with the OS back to 'system', so flipping back to your OS theme
    // silently returns you to follow-system mode (the eclipse icon marks the
    // pinned-away-from-OS state; there is no dead click anywhere in the
    // cycle).
    themeToggleBtn.addEventListener('click', () => {
      const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_MODE_KEY, next);
      applyTheme(next);
    });

    // Follow the OS live: while the mode is 'system', a dark-mode flip in the
    // OS re-applies immediately (hover tints + meta theme-color follow).
    const darkSchemeMQ = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemSchemeFlip = () => {
      if (effectiveThemeMode() === 'system') applyTheme(resolvedTheme());
    };
    if (darkSchemeMQ.addEventListener) darkSchemeMQ.addEventListener('change', onSystemSchemeFlip);
    else if (darkSchemeMQ.addListener) darkSchemeMQ.addListener(onSystemSchemeFlip);

    // Boot: apply the best early guess synchronously before first paint;
    // applySettings re-resolves once site.json lands. Guess order:
    //   1. explicit visitor override (light/dark) — always wins
    //   2. explicit 'system' choice — the live OS read IS the answer
    //   3. deploy-baked forced theme (the head script already painted it)
    //   4. paint hint from the last visit (only exists if that paint was forced)
    //   5. resolve the system preference live
    const bootOverride = localStorage.getItem(THEME_MODE_KEY);
    const bootHint = localStorage.getItem(THEME_HINT_KEY);
    const bootBaked = window.__BAKED_THEME;
    if (bootOverride === 'light' || bootOverride === 'dark') applyTheme(bootOverride);
    else if (bootOverride === 'system') applyTheme(resolvedTheme());
    else if (bootBaked === 'light' || bootBaked === 'dark') applyTheme(bootBaked);
    else if (bootHint === 'light' || bootHint === 'dark') applyTheme(bootHint);
    else applyTheme(resolvedTheme());

    // Edit / View Mode Toggle (local only — the switch is hidden on the
    // published site via body.site-public). Reflect the persisted/initial mode
    // on the segmented control, then wire the two segments to setViewOnly.
    const modeEditBtn = document.getElementById('mode-edit-btn');
    const modeViewBtn = document.getElementById('mode-view-btn');
    applyModeToggleState(); // sets .active AND the .is-view pill class
    if (modeEditBtn) {
      modeEditBtn.addEventListener('click', () => setViewOnly(false));
    }
    if (modeViewBtn) {
      modeViewBtn.addEventListener('click', () => setViewOnly(true));
    }

    // ===================== Site Settings (site.json) =====================
    // Owner-only config surfaced by the ⚙ Settings button in the edit toolbar.
    // Layering at startup: hardcoded defaults < fetched site.json < localStorage
    // working copy (localStorage only on local editing origins — visitors always
    // get whatever site.json says, so publishing new settings reaches them).
    // One Save applies immediately AND writes site.json, so there is no separate
    // export step and no reminder machinery for settings.

    function normalizeSiteSettings(raw) {
      const src = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
      let m = src.adaptiveDetailMode;
      // Migrate legacy 'light'/'dark' (pre 2026-08-31) → 'theme' (follow light/dark setting)
      if(m === 'light' || m === 'dark') m = 'theme';
      return {
        title: (typeof src.title === 'string' && src.title.trim()) ? src.title.trim() : DEFAULT_SETTINGS.title,
        defaultSort: VALID_SORTS.includes(src.defaultSort) ? src.defaultSort : DEFAULT_SETTINGS.defaultSort,
        accent: VALID_ACCENTS.includes(src.accent) ? src.accent : DEFAULT_SETTINGS.accent,
        theme: VALID_THEMES.includes(src.theme) ? src.theme : DEFAULT_SETTINGS.theme,
        adaptiveDetail: typeof src.adaptiveDetail === 'boolean' ? src.adaptiveDetail : DEFAULT_SETTINGS.adaptiveDetail,
        adaptiveDetailMode: VALID_ADAPTIVE_MODES.includes(m) ? m : DEFAULT_SETTINGS.adaptiveDetailMode,
        filterBarAlwaysVisible: typeof src.filterBarAlwaysVisible === 'boolean' ? src.filterBarAlwaysVisible : DEFAULT_SETTINGS.filterBarAlwaysVisible,
        // Deploy-time value: the link-preview description (Settings → Link
        // preview). Empty = the static default sentence committed in the head
        // OG block; scripts/inject-og.mjs only rewrites it when non-empty.
        ogDescription: typeof src.ogDescription === 'string' ? src.ogDescription.trim() : DEFAULT_SETTINGS.ogDescription,
        about: normalizeAbout(src.about)
      };
    }

    // The configured default sort — Clear-all and the filter badge compare
    // against THIS instead of the old hardcoded 'year-desc'.
    function effectiveDefaultSort() {
      return VALID_SORTS.includes(siteSettings.defaultSort) ? siteSettings.defaultSort : DEFAULT_SETTINGS.defaultSort;
    }

    // Apply settings to the live page: tab title, header h1, default sort (+ view).
    function applySettings(s) {
      siteSettings = normalizeSiteSettings(s);
      document.title = siteSettings.title;
      const h1 = document.getElementById('site-title');
      if (h1) h1.textContent = siteSettings.title; // textContent — no HTML injection
      applyThemeColors(siteSettings); // accent preset (also re-syncs meta theme-color)
      applyTheme(resolvedTheme()); // re-resolve now that site.json's theme default is known
      const def = effectiveDefaultSort();
      sortSelect.value = def;
      // lastGridSort must never hold 'reading-order': the Grid button restores
      // it, which would bounce straight back to Volumes.
      if (def !== 'reading-order') lastGridSort = def;
      syncViewFromSort(); // a 'reading-order' default boots into Volumes view
      applyFilterBarMode(); // always-visible vs tuck/reveal bar mode
    }

    // --- Accent preset engine ---
    // Generates :root / [data-theme="light"] override rules from the active
    // preset and injects them in a <style> AFTER the main stylesheet, so they
    // win specificity ties. Inline custom properties on <html> are NOT usable
    // here — they'd override BOTH theme blocks at once and break the toggle.
    // The 'ink' preset has empty overrides → the stylesheet text is emptied
    // and the code-defined defaults render untouched.
    let accentStyleEl = null;

    function applyThemeColors(s) {
      const preset = ACCENT_PRESETS[s.accent] || ACCENT_PRESETS[DEFAULT_SETTINGS.accent];
      if (!accentStyleEl) {
        accentStyleEl = document.createElement('style');
        accentStyleEl.id = 'accent-overrides';
        document.head.appendChild(accentStyleEl);
      }
      let css = '';
      const block = (selector, tokens) =>
        selector + '{' + Object.entries(tokens).map(([k, v]) => k + ':' + v).join(';') + '}';
      if (preset.dark && Object.keys(preset.dark).length) {
        css += block(':root', preset.dark);
        if (preset.light && Object.keys(preset.light).length) css += block('[data-theme="light"]', preset.light);
      }
      accentStyleEl.textContent = css;
      // --bg-main may have changed → re-sync the browser-chrome theme-color
      // (reads the resolved token, so it follows any preset automatically).
      applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    }

    // --- site.json file-handle persistence (same IndexedDB kv store as books.json/covers) ---
    async function loadSiteFileHandle() {
      try {
        const db = await openCoverDirDb();
        return await new Promise((resolve, reject) => {
          const get = db.transaction(COVER_DIR_STORE, 'readonly').objectStore(COVER_DIR_STORE).get(SITE_FILE_HANDLE_KEY);
          get.onsuccess = () => { db.close(); resolve(get.result || null); };
          get.onerror = () => { db.close(); reject(get.error); };
        });
      } catch { return null; }
    }

    async function saveSiteFileHandle(handle) {
      try {
        const db = await openCoverDirDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(COVER_DIR_STORE, 'readwrite');
          tx.objectStore(COVER_DIR_STORE).put(handle, SITE_FILE_HANDLE_KEY);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        db.close();
      } catch { /* best-effort; the picker will just appear next time */ }
    }

    // Hybrid write, mirrors writeBooksJsonFile minus the overwrite guard
    // (site.json is tiny, owner-only, and written only from here). Returns:
    //   'written'   — wrote the file via the persisted/picked handle
    //   'download'  — no FS API / picker or write failed (classic download)
    //   'cancelled' — user cancelled the picker (settings stay applied locally)
    async function writeSiteJsonFile(data) {
      function downloadSiteSettings() {
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url; link.download = 'site.json';
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return 'download';
      }
      if (!window.showOpenFilePicker) return downloadSiteSettings(); // Safari/Firefox

      let handle = await loadSiteFileHandle();
      if (handle) {
        try {
          const perm = await handle.queryPermission({ mode: 'readwrite' });
          if (perm !== 'granted' && await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
            handle = null; // denied → pick again below
          }
        } catch { handle = null; }
      }

      if (!handle) {
        try {
          const [picked] = await window.showOpenFilePicker({
            types: [{ description: 'site.json', accept: { 'application/json': ['.json'] } }],
            mode: 'readwrite'
          });
          handle = picked;
          saveSiteFileHandle(handle); // remember for next time
        } catch (err) {
          if (err && err.name === 'AbortError') return 'cancelled';
          console.warn('[library] site.json picker failed, falling back to download:', err);
          return downloadSiteSettings();
        }
      }

      try {
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return 'written';
      } catch (err) {
        console.warn('[library] could not write site.json via handle, falling back to download:', err);
        return downloadSiteSettings();
      }
    }

    // Startup loader — kicked off CONCURRENTLY with the catalog fetch in init()
    // (never sequential: site.json is ~100 bytes vs books.json's hundreds of KB,
    // so this always resolves first and adds no wall-clock time). Resolves the
    // merged settings: defaults < site.json < localStorage (local only).
    async function loadSiteSettings() {
      let merged = { ...DEFAULT_SETTINGS };
      try {
        const response = await fetch(SITE_FILE, { cache: 'no-store' });
        if (response.ok) {
          const parsed = await response.json();
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            merged = { ...merged, ...parsed };
          }
        }
      } catch (err) {
        console.warn('[library] site.json unavailable, using defaults/localStorage:', err);
      }
      // Visitors (isPublic) never read/write the working copy — their view is
      // exactly what site.json publishes. Only local editing origins keep a
      // localStorage layer (same split as the books catalog).
      const stored = !isPublic ? localStorage.getItem(SETTINGS_KEY) : null;
      if (stored) {
        try { merged = { ...merged, ...JSON.parse(stored) }; }
        catch (e) { console.warn('[library] invalid stored site settings, ignoring:', e); }
      } else if (!isPublic) {
        // First run on this browser: seed the working copy from what we resolved.
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSiteSettings(merged)));
      }
      return merged;
    }

    // --- Settings modal (clones the volume/stage modal skeleton) ---
    const settingsModal = document.getElementById('settings-modal');
    const settingsForm = document.getElementById('settings-form');
    const inputSiteTitle = document.getElementById('site-title-input');
    const inputSettingsSort = document.getElementById('settings-sort-input');
    const inputSettingsTheme = document.getElementById('settings-theme-input');
    const accentSwatchWrap = document.getElementById('accent-swatches');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal');
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const filterBarAlwaysToggle = document.getElementById('filter-bar-always-toggle');
    const ogDescInput = document.getElementById('settings-og-desc-input');
    const ogPickBtn = document.getElementById('settings-og-pick-btn');
    const ogPreview = document.getElementById('settings-og-preview');

    // Build the accent swatch radiogroup once from ACCENT_PRESETS. Real
    // <button>s → natively keyboard-operable (Tab + Enter/Space); role=radio +
    // aria-checked expose the single-select semantics to AT.
    if (accentSwatchWrap) {
      for (const id of VALID_ACCENTS) {
        const preset = ACCENT_PRESETS[id];
        if (!preset) continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'accent-swatch';
        btn.dataset.accent = id;
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', 'false');
        btn.title = preset.name;
        btn.setAttribute('aria-label', preset.name);
        btn.innerHTML = '<span class="swatch-dot" style="background:' + preset.swatch + '"></span>';
        accentSwatchWrap.appendChild(btn);
      }
      accentSwatchWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('.accent-swatch');
        if (!btn) return;
        accentSwatchWrap.querySelectorAll('.accent-swatch').forEach(b =>
          b.setAttribute('aria-checked', String(b === btn)));
      });
    }

    function selectedAccentFromUI() {
      const checked = accentSwatchWrap && accentSwatchWrap.querySelector('.accent-swatch[aria-checked="true"]');
      return (checked && VALID_ACCENTS.includes(checked.dataset.accent)) ? checked.dataset.accent : DEFAULT_SETTINGS.accent;
    }

    const adaptiveToggle = document.getElementById('adaptive-detail-toggle');
    const adaptiveModeGroup = document.getElementById('adaptive-mode-group');
    const adaptiveModeWrap = document.getElementById('adaptive-detail-mode');
    const adaptiveModeHint = document.getElementById('adaptive-mode-hint');
    const ADAPTIVE_MODE_HINTS = {
      auto: 'Picks light or dark text based on the cover color for best contrast.',
      theme: 'Uses your light/dark theme setting for text, regardless of cover.'
    };
    function selectedAdaptiveModeFromUI(){
      const v = adaptiveModeWrap ? adaptiveModeWrap.value : '';
      return VALID_ADAPTIVE_MODES.includes(v) ? v : DEFAULT_SETTINGS.adaptiveDetailMode;
    }
    function syncAdaptiveModeHint(){
      if(!adaptiveModeHint) return;
      const m = selectedAdaptiveModeFromUI();
      adaptiveModeHint.textContent = ADAPTIVE_MODE_HINTS[m] || '';
    }
    function isAdaptiveEnabled(){
      return adaptiveToggle ? adaptiveToggle.getAttribute('aria-checked') === 'true' : true;
    }
    function syncAdaptiveModeUI(){
      const on = isAdaptiveEnabled();
      if(adaptiveModeGroup) adaptiveModeGroup.style.opacity = on ? '1' : '0.45';
      if(adaptiveModeWrap){
        adaptiveModeWrap.disabled = !on;
      }
      syncAdaptiveModeHint();
    }
    if(adaptiveToggle) adaptiveToggle.addEventListener('click', () => {
      const on = adaptiveToggle.getAttribute('aria-checked') === 'true';
      adaptiveToggle.setAttribute('aria-checked', String(!on));
      syncAdaptiveModeUI();
    });
    if(filterBarAlwaysToggle) filterBarAlwaysToggle.addEventListener('click', () => {
      const on = filterBarAlwaysToggle.getAttribute('aria-checked') === 'true';
      filterBarAlwaysToggle.setAttribute('aria-checked', String(!on));
    });
    if(adaptiveModeWrap) adaptiveModeWrap.addEventListener('change', syncAdaptiveModeHint);

    // Best-effort thumb of the current og-card.jpg (same origin on localhost
    // and file://; 404/absent → thumb stays hidden). Cache-busted so a just-
    // written card shows up without a reload.
    function refreshOgCardPreview() {
      if (!ogPreview) return;
      const img = new Image();
      img.onload = () => { ogPreview.src = img.src; ogPreview.hidden = false; };
      img.onerror = () => { ogPreview.hidden = true; };
      img.src = OG_CARD_FILE + '?v=' + Date.now();
    }

    // The social-image pick is a side-action, not a form field: choosing a
    // file processes + writes og-card.jpg immediately (feedback via the
    // export-reminder bar), so Cancel on the modal can't undo a disk write —
    // same contract as the cover dropzone.
    if (ogPickBtn) ogPickBtn.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        try {
          const blob = await processOgImage(file);
          const result = await writeOgCardBlob(blob);
          if (result === 'written') {
            refreshOgCardPreview();
            showSiteSavedFeedback('Saved og-card.jpg — commit & push to publish it.');
          } else if (result === 'download') {
            showSiteNotice('og-card.jpg downloaded — move it into the repo root to publish.');
          }
          // 'cancelled' → no write, keep the previous card silently.
        } catch (err) {
          showSiteNotice(err && err.message ? err.message : 'Could not process that image.');
        }
      };
      fileInput.click();
    });

    function openSettingsModal() {
      if (viewOnly) return; // editing surface — never in view-only mode
      inputSiteTitle.value = siteSettings.title;
      inputSettingsSort.value = effectiveDefaultSort();
      if (inputSettingsTheme) inputSettingsTheme.value = siteSettings.theme;
      if (accentSwatchWrap) {
        accentSwatchWrap.querySelectorAll('.accent-swatch').forEach(b =>
          b.setAttribute('aria-checked', String(b.dataset.accent === siteSettings.accent)));
      }
      if(adaptiveToggle) adaptiveToggle.setAttribute('aria-checked', String(!!siteSettings.adaptiveDetail));
      if(filterBarAlwaysToggle) filterBarAlwaysToggle.setAttribute('aria-checked', String(siteSettings.filterBarAlwaysVisible === true));
      if(adaptiveModeWrap){
        const m = VALID_ADAPTIVE_MODES.includes(siteSettings.adaptiveDetailMode) ? siteSettings.adaptiveDetailMode : DEFAULT_SETTINGS.adaptiveDetailMode;
        adaptiveModeWrap.value = m;
      }
      if (ogDescInput) ogDescInput.value = siteSettings.ogDescription || '';
      refreshOgCardPreview();
      syncAdaptiveModeUI();
      settingsModal.classList.add('active');
    }

    function closeSettingsModal() {
      settingsModal.classList.remove('active');
    }

    if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);
    closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    cancelSettingsBtn.addEventListener('click', closeSettingsModal);

    // Backdrop dismissal only when the press STARTS on the overlay too — same
    // common-ancestor click rule as the edit/detail modals.
    let settingsOverlayPointerDown = false;
    settingsModal.addEventListener('mousedown', (e) => {
      settingsOverlayPointerDown = (e.target === settingsModal);
    });
    settingsModal.addEventListener('click', (e) => {
      if (settingsOverlayPointerDown && e.target === settingsModal) closeSettingsModal();
      settingsOverlayPointerDown = false;
    });

    // Escape closes (guarded on the active class so it coexists with the other
    // modals' document-level Escape handlers).
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
        closeSettingsModal();
      }
    });

    // Save: apply locally FIRST (visible even if the disk write fails), then
    // write site.json straight to disk when possible.
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const s = normalizeSiteSettings({
        ...siteSettings,
        title: inputSiteTitle.value,
        defaultSort: inputSettingsSort.value,
        accent: selectedAccentFromUI(),
        theme: inputSettingsTheme ? inputSettingsTheme.value : DEFAULT_SETTINGS.theme,
        adaptiveDetail: adaptiveToggle ? adaptiveToggle.getAttribute('aria-checked') === 'true' : DEFAULT_SETTINGS.adaptiveDetail,
        adaptiveDetailMode: selectedAdaptiveModeFromUI(),
        filterBarAlwaysVisible: filterBarAlwaysToggle ? filterBarAlwaysToggle.getAttribute('aria-checked') === 'true' : DEFAULT_SETTINGS.filterBarAlwaysVisible,
        ogDescription: ogDescInput ? ogDescInput.value : ''
      });
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
      applySettings(s);
      renderBooks(); // filter badge + Clear-all now reflect the new default
      closeSettingsModal();

      const result = await writeSiteJsonFile(JSON.stringify(s, null, 2));
      if (result === 'written') {
        showSiteSavedFeedback();
      } else if (result === 'cancelled') {
        showSiteNotice('Settings applied locally — site.json was not saved (picker cancelled). Save again to retry.');
      } else {
        showSiteNotice('Settings applied — site.json downloaded. Drop it into this folder to publish.');
      }
    });

    // Transient feedback after saving settings — reuses the #export-reminder bar
    // (same green/amber patterns as the books.json feedback), then restores the
    // correct books-export state via updateExportReminder().
    let siteSavedTimer = null;

    function restoreExportBar(iconName) {
      const reminder = document.getElementById('export-reminder');
      const messageEl = document.getElementById('export-reminder-message');
      const btn = document.getElementById('export-reminder-btn');
      if (!reminder || !messageEl) return;
      reminder.classList.remove('success', 'visible');
      const liveIcon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
      if (liveIcon) liveIcon.setAttribute('data-lucide', iconName || 'upload');
      messageEl.textContent = '';
      if (btn) btn.style.display = '';
      updateExportReminder(); // restore the correct books-export state/message
      if (window.lucide) lucide.createIcons();
    }

    function showSiteSavedFeedback(text) {
      const reminder = document.getElementById('export-reminder');
      const messageEl = document.getElementById('export-reminder-message');
      const btn = document.getElementById('export-reminder-btn');
      if (!reminder || !messageEl) return;
      const icon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
      clearTimeout(siteSavedTimer);
      reminder.classList.add('success', 'visible');
      if (icon) icon.setAttribute('data-lucide', 'circle-check');
      messageEl.textContent = text || 'Saved to site.json ✓';
      if (btn) btn.style.display = 'none';
      if (window.lucide) lucide.createIcons();
      siteSavedTimer = setTimeout(() => restoreExportBar('upload'), 2500);
    }

    function showSiteNotice(text) {
      const reminder = document.getElementById('export-reminder');
      const messageEl = document.getElementById('export-reminder-message');
      const btn = document.getElementById('export-reminder-btn');
      if (!reminder || !messageEl) return;
      const icon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
      clearTimeout(siteSavedTimer);
      reminder.classList.add('visible'); // amber style — NOT .success
      if (icon) icon.setAttribute('data-lucide', 'upload');
      messageEl.textContent = text;
      if (btn) btn.style.display = 'none';
      if (window.lucide) lucide.createIcons();
      siteSavedTimer = setTimeout(() => restoreExportBar('upload'), 3500);
    }

    // JSON Import / Export Logic — books.json is the source of truth for the public site.
    // Export writes straight to the on-disk books.json via a persisted File
    // System Access handle when available (Chrome/Edge); otherwise it falls back
    // to the classic download (Safari/Firefox, or when the write fails).
    async function exportJson() {
      if (!books.length) return alert("Catalog is empty.");
      const json = JSON.stringify(books, null, 2);
      const result = await writeBooksJsonFile(json);

      if (result === 'written') {
        // Anchor to the file's ACTUAL mtime (ms precision) so the newer-check
        // (0ms slack for handles) can't briefly flag our own write.
        try {
          const handle = await loadBooksFileHandle();
          const file = handle ? await handle.getFile() : null;
          localStorage.setItem(LAST_EXPORTED_KEY, file ? new Date(file.lastModified).toISOString() : new Date().toISOString());
        } catch {
          localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
        }
        updateExportReminder();
        showExportSavedFeedback();
        return;
      }

      if (result === 'cancelled') return; // user declined the overwrite guard

      // 'download' — classic path (no FS API, cancelled picker, or write failed).
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "books.json");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Record export time so the reminder knows changes are now saved to JSON.
      localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
      updateExportReminder();
    }

    exportJsonBtn.addEventListener('click', exportJson);

    // Export Reminder Logic
    function formatTimestamp(isoString) {
      if (!isoString) return null;
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }

    function updateExportReminder() {
      const reminder = document.getElementById('export-reminder');
      const messageEl = document.getElementById('export-reminder-message');
      if (!reminder || !messageEl) return;

      const lastModified = localStorage.getItem(LAST_MODIFIED_KEY);
      const lastExported = localStorage.getItem(LAST_EXPORTED_KEY);

      const needsExport = lastModified && (!lastExported || new Date(lastModified) > new Date(lastExported));
      if (!needsExport) {
        reminder.classList.remove('visible');
        return;
      }

      const modifiedLabel = formatTimestamp(lastModified);
      const exportedLabel = lastExported ? formatTimestamp(lastExported) : 'never';
      messageEl.innerHTML = `You modified your library on <span class="reminder-muted">${modifiedLabel}</span> — no JSON export since <span class="reminder-muted">${exportedLabel}</span>.`;
      reminder.classList.add('visible');
      if (window.lucide) lucide.createIcons();
    }

    document.getElementById('export-reminder-btn').addEventListener('click', exportJson);

    // Transient success feedback after writing books.json straight to disk.
    let exportSavedTimer = null;
    function showExportSavedFeedback() {
      const reminder = document.getElementById('export-reminder');
      const messageEl = document.getElementById('export-reminder-message');
      const btn = document.getElementById('export-reminder-btn');
      if (!reminder || !messageEl) return;
      const icon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');

      clearTimeout(exportSavedTimer);
      reminder.classList.add('success', 'visible');
      if (icon) icon.setAttribute('data-lucide', 'circle-check');
      messageEl.textContent = 'Saved to books.json ✓';
      if (btn) btn.style.display = 'none';
      if (window.lucide) lucide.createIcons();

      exportSavedTimer = setTimeout(() => {
        reminder.classList.remove('success', 'visible');
        const liveIcon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
        if (liveIcon) liveIcon.setAttribute('data-lucide', 'upload');
        messageEl.textContent = '';
        if (btn) btn.style.display = '';
        if (window.lucide) lucide.createIcons();
      }, 2500);
    }

    // Tracks whether the last freshness check actually compared a real mtime
    // (vs. failing/offline/no handle) — lets the Check for Updates button give
    // feedback only when it truly knows.
    let lastBooksCheckCompared = false;

    // Transient green "up to date" feedback when Check for Updates finds the
    // on-disk books.json is NOT newer and the local copy has no unsaved edits.
    let booksUpToDateTimer = null;
    function showBooksUpToDateFeedback() {
      const reminder = document.getElementById('books-newer-reminder');
      const messageEl = document.getElementById('books-newer-message');
      const btn = document.getElementById('books-newer-import-btn');
      if (!reminder || !messageEl) return;
      const icon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
      const original = messageEl.dataset.original || (messageEl.dataset.original = messageEl.textContent);

      clearTimeout(booksUpToDateTimer);
      reminder.classList.add('success', 'visible');
      if (icon) icon.setAttribute('data-lucide', 'circle-check');
      messageEl.textContent = 'books.json is up to date — no changes to import';
      if (btn) btn.style.display = 'none';
      if (window.lucide) lucide.createIcons();

      booksUpToDateTimer = setTimeout(() => {
        reminder.classList.remove('success', 'visible');
        const liveIcon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
        if (liveIcon) liveIcon.setAttribute('data-lucide', 'refresh-cw');
        messageEl.textContent = original;
        if (btn) btn.style.display = '';
        if (window.lucide) lucide.createIcons();
      }, 2500);
    }

    // Transient amber nudge when Check for Updates finds books.json is NOT
    // newer but the local copy HAS unsaved edits (browser is ahead of the file)
    // — the fix is Export JSON, not Import. Uses the default (non-success) style.
    let localAheadTimer = null;
    function showLocalAheadFeedback() {
      const reminder = document.getElementById('books-newer-reminder');
      const messageEl = document.getElementById('books-newer-message');
      const btn = document.getElementById('books-newer-import-btn');
      if (!reminder || !messageEl) return;
      const icon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
      const original = messageEl.dataset.original || (messageEl.dataset.original = messageEl.textContent);

      clearTimeout(localAheadTimer);
      reminder.classList.add('visible'); // default amber style — NOT .success
      if (icon) icon.setAttribute('data-lucide', 'upload');
      messageEl.textContent = 'books.json is unchanged, but your local copy has unsaved edits — use Export JSON to save them.';
      if (btn) btn.style.display = 'none';
      if (window.lucide) lucide.createIcons();

      localAheadTimer = setTimeout(() => {
        reminder.classList.remove('visible');
        const liveIcon = reminder.querySelector('.export-reminder-text i, .export-reminder-text svg');
        if (liveIcon) liveIcon.setAttribute('data-lucide', 'refresh-cw');
        messageEl.textContent = original;
        if (btn) btn.style.display = '';
        if (window.lucide) lucide.createIcons();
      }, 3000);
    }

    // Newer books.json Reminder — on local HTTP use, books.json on disk can be
    // newer than the browser copy (edited elsewhere, git pull, another machine).
    // Surface an "Import Now" banner so the user can pick up the newer catalog.
    function hasUnexportedChanges() {
      const lastModified = localStorage.getItem(LAST_MODIFIED_KEY);
      const lastExported = localStorage.getItem(LAST_EXPORTED_KEY);
      return !!(lastModified && (!lastExported || new Date(lastModified) > new Date(lastExported)));
    }

    // Shared import pipeline: applies a parsed books.json array to the app.
    // Used by both the manual file picker and the "newer books.json" reminder.
    // With confirmOnUnexported, warns before replacing unexported local edits.
    function importBooksArray(parsed, { confirmOnUnexported = false } = {}) {
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid books.json — expected a non-empty JSON array.");
      }
      if (confirmOnUnexported && hasUnexportedChanges()) {
        const ok = confirm(
          'You have local edits that were never exported to books.json.\n' +
          'Importing will REPLACE them with the imported file.\n\n' +
          'Click OK to overwrite your local edits, or Cancel to export them first.'
        );
        if (!ok) return false;
      }
      // Normalize reading orders on import too — a stale backup (pre-fix
      // export, old bkup/*.json) may carry gaps or duplicates; the one-time
      // migration flag won't fire again, so imports get the same heal.
      books = normalizeAllVolumeStageNumbers(normalizeAllReadingOrders(parsed.map(normalizeBook))); // ids are preserved from the file.
      saveBooksToStorage(books);
      // After importing books.json, the library matches an exported file — no reminder.
      localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
      updateExportReminder();
      renderBooks();
      return true;
    }

    // --- "Newer books.json" check (HTTP + file://) ---
    // HTTP (localhost): compare the Last-Modified header against the sync anchor.
    // file://: the browser blocks silent file reads, so we use the File System
    // Access API — pick books.json once (persisted handle in IndexedDB), then
    // re-read it on later opens while permission remains granted. The button
    // enables this on the first pick and re-checks on demand; on browsers
    // without showOpenFilePicker (Safari/Firefox) it falls back to a manual
    // file picker (no persistence, so it stays manual there).

    // books.json file-handle persistence — same IndexedDB kv store as covers.
    const BOOKS_FILE_HANDLE_KEY = 'booksJsonFileHandle';

    async function loadBooksFileHandle() {
      try {
        const db = await openCoverDirDb();
        return await new Promise((resolve, reject) => {
          const get = db.transaction(COVER_DIR_STORE, 'readonly').objectStore(COVER_DIR_STORE).get(BOOKS_FILE_HANDLE_KEY);
          get.onsuccess = () => { db.close(); resolve(get.result || null); };
          get.onerror = () => { db.close(); reject(get.error); };
        });
      } catch { return null; }
    }

    async function saveBooksFileHandle(handle) {
      try {
        const db = await openCoverDirDb();
        await new Promise((resolve, reject) => {
          const tx = db.transaction(COVER_DIR_STORE, 'readwrite');
          tx.objectStore(COVER_DIR_STORE).put(handle, BOOKS_FILE_HANDLE_KEY);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        db.close();
      } catch { /* best-effort; the picker will just appear next time */ }
    }

    // Pure comparison: is a books.json mtime newer than the localStorage sync
    // anchor? No DOM side effects — shared by the banner check and the export
    // overwrite guard. Returns true when remoteTime is strictly newer.
    function isNewerThanAnchor(remoteTime, source) {
      if (remoteTime == null) return false;
      const anchor = localStorage.getItem(LAST_EXPORTED_KEY) || localStorage.getItem(LAST_MODIFIED_KEY);
      if (!anchor) return false; // never synced — bootstrap sets this, so skip
      // +1s slack: HTTP Last-Modified is second-granularity GMT.
      const slack = source === 'http' ? 1000 : 0;
      return remoteTime > Date.parse(anchor) + slack;
    }

    // Compares a books.json mtime against the localStorage sync anchor and shows
    // the Import Now banner when the file is newer. Returns true if shown.
    function evaluateNewerThanAnchor(remoteTime, source) {
      if (remoteTime == null) return false;
      lastBooksCheckCompared = true; // got a real mtime to compare against
      if (!isNewerThanAnchor(remoteTime, source)) return false;
      const reminder = document.getElementById('books-newer-reminder');
      if (reminder) reminder.classList.add('visible');
      if (window.lucide) lucide.createIcons();
      return true;
    }

    // Runs the freshness check. On file://, uses the persisted books.json handle
    // (silently). Interactive checks can renew permission for that same file;
    // only a missing handle/file needs a new file picker.
    async function checkBooksJsonNewer({ interactive = false } = {}) {
      if (viewOnly) return false; // view mode is read-only — sync checks are an edit concern
      lastBooksCheckCompared = false; // fresh check — no "compared" state yet

      if (window.location.protocol === 'file:') {
        let handle = await loadBooksFileHandle();
        if (!handle && interactive && window.showOpenFilePicker) {
          try {
            const [picked] = await window.showOpenFilePicker({
              types: [{ description: 'books.json', accept: { 'application/json': ['.json'] } }]
            });
            handle = picked;
            await saveBooksFileHandle(handle); // enable automatic checks on later opens
          } catch (err) {
            if (err && err.name === 'AbortError') return false; // user cancelled
          }
        }
        if (!handle) return false;
        try {
          const permission = await handle.queryPermission({ mode: 'read' });
          if (permission !== 'granted') {
            if (!interactive) return false; // background checks must never prompt
            if (await handle.requestPermission({ mode: 'read' }) !== 'granted') return false;
          }
          const file = await handle.getFile();
          return evaluateNewerThanAnchor(file.lastModified, 'handle');
        } catch (err) {
          console.warn('[library] could not read books.json via saved handle:', err);
          // A moved/deleted file needs a replacement. Permission failures keep
          // the saved selection so a later click can request access again.
          if (err && err.name === 'NotFoundError' && interactive && window.showOpenFilePicker) {
            try {
              const [picked] = await window.showOpenFilePicker({
                types: [{ description: 'books.json', accept: { 'application/json': ['.json'] } }]
              });
              await saveBooksFileHandle(picked);
              const file = await picked.getFile();
              return evaluateNewerThanAnchor(file.lastModified, 'handle');
            } catch (err2) {
              if (err2 && err2.name === 'AbortError') return false;
            }
          }
          return false;
        }
      }

      // HTTP (localhost): fetch the Last-Modified header.
      try {
        const response = await fetch('books.json', { method: 'HEAD', cache: 'no-store' });
        const lm = response.headers.get('Last-Modified');
        const t = lm ? Date.parse(lm) : NaN;
        return evaluateNewerThanAnchor(isNaN(t) ? null : t, 'http');
      } catch (err) {
        console.warn('[library] could not compare books.json freshness (offline?):', err);
        return false;
      }
    }

    // Reads books.json content wherever we are (HTTP fetch, or the persisted
    // handle on file://) so the Import Now button works on both.
    async function readBooksJsonData() {
      if (window.location.protocol === 'file:') {
        const handle = await loadBooksFileHandle();
        if (!handle) return null;
        const file = await handle.getFile();
        return JSON.parse(await file.text());
      }
      const response = await fetch('books.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }

    // Hybrid export write: File System Access API writes straight into the
    // books.json the user picks (persisted handle), else returns 'download' so
    // exportJson can fall back to the classic save-download. Returns:
    //   'written'   — wrote the file via the handle
    //   'download'  — no FS API / user cancelled the picker / write failed
    //   'cancelled' — user declined the overwrite guard (do nothing)
    async function writeBooksJsonFile(data) {
      if (!window.showOpenFilePicker) return 'download'; // Safari/Firefox

      // Reuse the saved handle (from Check for Updates or a prior export) when
      // its readwrite permission is still granted.
      let handle = await loadBooksFileHandle();
      if (handle) {
        try {
          const perm = await handle.queryPermission({ mode: 'readwrite' });
          if (perm !== 'granted' && await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
            handle = null; // denied → pick again below
          }
        } catch { handle = null; }
      }

      if (!handle) {
        try {
          const [picked] = await window.showOpenFilePicker({
            types: [{ description: 'books.json', accept: { 'application/json': ['.json'] } }],
            mode: 'readwrite'
          });
          handle = picked;
          saveBooksFileHandle(handle); // remember for next time
        } catch (err) {
          if (err && err.name === 'AbortError') return 'download'; // user cancelled the picker
          return 'download';
        }
      }

      // Overwrite guard: if the on-disk file is newer than our sync anchor it
      // was edited elsewhere — warn before clobbering those changes.
      try {
        const file = await handle.getFile();
        if (isNewerThanAnchor(file.lastModified, 'handle')) {
          const timeLabel = formatTimestamp(new Date(file.lastModified).toISOString()) || 'recently';
          const ok = confirm(
            `books.json on disk was modified ${timeLabel} — after your last export.\n` +
            'Exporting will overwrite those changes.\n\n' +
            'Click OK to overwrite, or Cancel to keep the on-disk file.'
          );
          if (!ok) return 'cancelled';
        }
      } catch (err) {
        console.warn('[library] could not read on-disk books.json for the overwrite check:', err);
      }

      try {
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        return 'written';
      } catch (err) {
        console.warn('[library] could not write books.json via handle, falling back to download:', err);
        return 'download';
      }
    }

    document.getElementById('books-newer-import-btn').addEventListener('click', async () => {
      const reminder = document.getElementById('books-newer-reminder');
      try {
        const parsed = await readBooksJsonData();
        if (!parsed) {
          alert("Could not import books.json — pick it once via 'Check for Updates' first.");
          return;
        }
        const imported = importBooksArray(parsed, { confirmOnUnexported: true });
        if (imported && reminder) reminder.classList.remove('visible');
      } catch (err) {
        console.error('[library] import from books.json failed:', err);
        alert("Could not import books.json.");
      }
    });

    // "Check for Updates" button: enables the file:// handle on first pick and
    // re-checks on demand. Browsers without showOpenFilePicker (Safari/Firefox)
    // use a plain file picker — no handle persistence, manual only.
    const checkNewerBtn = document.getElementById('check-newer-btn');
    const booksCheckFileInput = document.getElementById('books-check-file-input');
    checkNewerBtn.addEventListener('click', async () => {
      if (window.location.protocol === 'file:' && !window.showOpenFilePicker) {
        booksCheckFileInput.click(); // universal fallback — feedback via change handler
        return;
      }
      const shown = await checkBooksJsonNewer({ interactive: true });
      // `shown` is true only when the Import Now banner was raised (file newer).
      // Otherwise, if we compared a real mtime, tell the user directionally:
      // unsaved local edits mean books.json is behind (→ export), else in sync.
      if (!shown && lastBooksCheckCompared) {
        if (hasUnexportedChanges()) {
          showLocalAheadFeedback();
        } else {
          showBooksUpToDateFeedback();
        }
      }
    });

    booksCheckFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const shown = evaluateNewerThanAnchor(file.lastModified, 'picked');
      e.target.value = ''; // allow re-picking the same file later
      if (!shown) {
        if (hasUnexportedChanges()) {
          showLocalAheadFeedback();
        } else {
          showBooksUpToDateFeedback();
        }
      }
    });

    // Import from books.json (the committed source of truth) — restores localStorage.
    importJsonBtn.addEventListener('click', () => jsonFileInput.click());

    jsonFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const parsed = JSON.parse(evt.target.result);
          const imported = importBooksArray(parsed, { confirmOnUnexported: true });
          if (imported) {
            alert(`Successfully imported ${books.length} books! Data saved to LocalStorage.`);
          }
        } catch (err) {
          console.error("Failed to parse JSON import:", err);
          alert("Could not read that file — it doesn't look like valid books.json.");
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // allow re-importing the same file later
    });

    // First-run file:// bootstrap — when a fresh open (no localStorage, no saved
    // handle) can't reach books.json, surface a banner asking the user to pick it
    // once. Visible in both Edit and View modes (it's not an editing control).
    const firstRunBanner = document.getElementById('first-run-banner');
    const firstRunPickBtn = document.getElementById('first-run-pick-btn');
    const firstRunFileInput = document.getElementById('books-firstrun-file-input');

    function showFirstRunBanner() {
      if (!firstRunBanner) return;
      firstRunBanner.classList.add('visible');
      if (window.lucide) lucide.createIcons();
    }

    function hideFirstRunBanner() {
      if (firstRunBanner) firstRunBanner.classList.remove('visible');
    }

    // Applies a parsed books.json array from the first-run pick. Seeds
    // localStorage DIRECTLY (bypasses saveBooksToStorage, which is viewOnly-gated
    // so it would silently no-op in View mode) — the bootstrap must persist
    // regardless of the current mode.
    function applyFirstRunData(data) {
      try {
        if (!Array.isArray(data) || data.length === 0) throw new Error('empty catalog');
        // A picked file may predate the reading-order/volume+stage-number
        // fixes — normalize all three on the way in.
        books = normalizeAllVolumeStageNumbers(normalizeAllReadingOrders(data.map(normalizeBook)));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        localStorage.setItem(LAST_EXPORTED_KEY, new Date().toISOString());
        hideFirstRunBanner();
        renderBooks();
        updateExportReminder();
      } catch (err) {
        console.error('[library] invalid books.json in first-run pick:', err);
        alert("Could not read that file — it doesn't look like valid books.json.");
      }
    }

    async function handleFirstRunPick() {
      if (window.showOpenFilePicker) {
        try {
          const [handle] = await window.showOpenFilePicker({
            types: [{ description: 'books.json', accept: { 'application/json': ['.json'] } }]
          });
          saveBooksFileHandle(handle); // enable silent loading on later opens
          const data = await readBooksJsonData();
          applyFirstRunData(data);
        } catch (err) {
          if (err && err.name === 'AbortError') return; // user cancelled — banner stays
          alert("Could not read that file — it doesn't look like valid books.json.");
        }
      } else {
        firstRunFileInput.click(); // Safari/Firefox fallback — change listener handles it
      }
    }

    if (firstRunPickBtn) firstRunPickBtn.addEventListener('click', handleFirstRunPick);
    if (firstRunFileInput) firstRunFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          applyFirstRunData(JSON.parse(evt.target.result));
        } catch (err) {
          alert("Could not read that file — it doesn't look like valid books.json.");
        }
      };
      reader.readAsText(file);
      e.target.value = ''; // allow re-picking the same file later
    });

    // Load the published catalog (books.json — the committed source of truth, staged
    // by the deploy workflow). Falls back to localStorage/seed when unreachable
    // (file:// or offline).
    async function loadCatalogFromRemote() {
      if (!isPublic) return false; // Local editing keeps using localStorage; only the public site loads books.json.
      try {
        const response = await fetch('books.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const parsed = await response.json();
        if (Array.isArray(parsed) && parsed.length > 0) {
          books = parsed.map(normalizeBook); // ids are already stable in books.json.
          return true; // init() renders ONCE, after site settings are applied
        }
      } catch (err) {
        console.warn('[library] books.json unavailable, using local data:', err);
      }
      return false;
    }

    // Initialize App — prefer the published books.json when reachable (public site),
    // otherwise fall back to localStorage/seed for local editing use.
    (async function init() {
      // Site settings load CONCURRENTLY with the catalog (perf: never awaited
      // sequentially — site.json is ~100 bytes vs books.json's hundreds of KB,
      // so it always resolves first and adds no wall-clock time). Applied
      // BEFORE the single render below so the grid paints once, already in the
      // configured default sort/view.
      const settingsReady = loadSiteSettings();
      const loadedRemote = await loadCatalogFromRemote();
      if (!loadedRemote) {
        books = await loadBooksFromStorage();
      }
      applySettings(await settingsReady);
      renderBooks();
      // Deep-link support: if the URL carries a #book=<id> hash, open that book's
      // detail modal once the catalog is rendered. openReadOnlyModal skips the
      // pushState because the hash already matches, so the browser's original
      // history entry is preserved.
      syncPublicRoute();
      if (!viewOnly) {
        updateExportReminder();
        checkBooksJsonNewer(); // fire-and-forget freshness check (HTTP or file:// handle)
      }
      // Mobile keeps the bar in natural flow — no flow-shim space needed.
    })();
