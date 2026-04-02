# CLAUDE.md — Philtrum LEAF Website

## Project Overview

**Philtrum LEAF** is the marketing/product website for Philtrum's continuous sensing wearable platform. It is a pure static site (HTML/CSS/JavaScript, no build tools or dependencies) hosted on Netlify at [www.philtrum.io](https://www.philtrum.io/).

The site showcases the LEAF (Leaf Early Access Foundation) wearable device and captures pilot access requests via a two-step form.

---

## Repository Structure

```
fuzzy-octo-Leaf/
├── index.html          # Main landing page
├── about.html          # About/company page
├── CNAME               # Netlify domain: www.philtrum.io
├── _headers            # Netlify security headers (CSP, HSTS, etc.)
├── .gitignore
├── css/
│   ├── styles.css      # Main stylesheet (design tokens, all page components)
│   └── about.css       # About-page-specific styles
├── js/
│   ├── script.js       # Main page interactions and animations
│   └── about.js        # About page interactions
└── assets/
    ├── favicon.png     # 256×256 transparent favicon
    ├── logo.png        # 594×594 primary logo (transparent)
    └── logo.jpg        # 594×594 logo variant
```

---

## Technology Stack

- **HTML5** — Semantic markup; no templating engine
- **CSS3** — Vanilla CSS with custom properties; no preprocessors (Sass/Less)
- **JavaScript** — Vanilla ES6+; no frameworks, no npm, no build step
- **Hosting** — Netlify (static, auto-deployed from main branch)
- **Form backend** — [formsubmit.co](https://formsubmit.co) (posts to info@philtrum.io)
- **Fonts** — Google Fonts (Fraunces, Plus Jakarta Sans, JetBrains Mono)

**There is no package.json, no build pipeline, and no transpilation.** Files are served exactly as they exist in the repository.

---

## Development Workflow

### Local Development

Open files directly in a browser — no dev server required:

```bash
open index.html
open about.html
```

For a closer approximation to production (correct MIME types, CSP headers):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

### Making Changes

1. Edit HTML, CSS, or JS files directly
2. Refresh the browser to preview
3. Test at multiple viewport widths (mobile: ≤560px, tablet: ≤980px, desktop)
4. Commit and push to `main` — Netlify deploys automatically

### No Linting or Testing

There is no linter, formatter, or automated test suite. Code quality is maintained by convention.

---

## Deployment

- **Platform**: Netlify
- **Trigger**: Any push to `main` deploys immediately
- **Domain**: www.philtrum.io (CNAME)
- **Headers**: Defined in `_headers` (applied by Netlify at the edge)

---

## Design System

### Color Tokens (CSS custom properties in `styles.css`)

| Token | Value | Usage |
|---|---|---|
| `--c-base` | `#F1F0EC` | Page background |
| `--c-text` | `#1B1E1B` | Primary text |
| `--c-text-2` | `#4A514A` | Secondary text |
| `--c-primary` | `#266B43` | Chlorophyll green — CTA, links, accents |
| `--c-secondary` | `#196666` | Teal — supporting accents |
| `--c-accent` | `#C97850` | Amber/rust — highlights |

### Typography

| Role | Font | Weight |
|---|---|---|
| Display / headings | Fraunces (serif) | 300 |
| Body | Plus Jakarta Sans | 300, 400 |
| Labels / captions | JetBrains Mono | 400 |

Responsive font sizes use `clamp()` throughout.

### Organic / Biological Aesthetic

The design language is inspired by biology:
- `--r-leaf: 4px 18px 16px 6px` — organic border-radius used on cards and chips
- Animated membrane rings, vein SVG paths, plume sweeps
- Green palette (chlorophyll), off-white base, amber accents

---

## CSS Conventions

- **Custom properties** for all design tokens — never hardcode colors, font sizes, or spacing
- **BEM-like naming**: component prefix + element (e.g., `site-nav`, `nav-logo`, `hero-copy`)
- **Responsive breakpoints**: 980px (tablet), 560px (mobile) — use `max-width` media queries
- **Fluid sizing**: use `clamp(min, fluid, max)` for font-size and spacing instead of fixed breakpoint overrides where possible
- **Section headers** in CSS files use `/* === SECTION NAME === */` delimiters for navigation
- Keep component styles in `styles.css`; only about-page-specific styles go in `about.css`

### Key CSS Classes

| Class | Purpose |
|---|---|
| `.rev` | Scroll-reveal trigger — JS adds `.vis` when element enters viewport |
| `.mem` | Sections with membrane background animations |
| `.vp` / `.vb` | SVG vein paths — animated via stroke-dasharray |
| `.site-nav` | Fixed navigation bar with scroll-progress indicator |

---

## JavaScript Conventions

- **Vanilla ES6+** — `const`/`let`, arrow functions, template literals, destructuring
- **No external libraries** — do not add npm packages or CDN scripts
- **IntersectionObserver** for scroll-triggered animations and active nav states (not scroll event listeners)
- **requestAnimationFrame** for all frame-by-frame animations
- **Passive listeners** for scroll events (`{ passive: true }`)
- **Defensive DOM checks** — always guard with `if (element)` before manipulating
- **Section comments** mark logical blocks: `// --- SCROLL REVEAL ---`

### Key Patterns

**Scroll Reveal** (both pages):
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1 });
document.querySelectorAll('.rev').forEach(el => observer.observe(el));
```

**Respecting reduced-motion**:
```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

**Form stepper** (index.html / script.js): 2-step form with field validation, session storage for success state, posts to formsubmit.co.

---

## HTML Conventions

- **Semantic elements**: `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- **ARIA attributes**: `aria-label`, `aria-expanded`, `aria-hidden`, `aria-current`, `aria-invalid`, `aria-live`
- **Data attributes** for component state: `data-step`, `data-section`
- **Inline SVG** for animated diagrams (membrane, vein paths, loop diagram)
- **Section comments**: `<!-- NAV -->`, `<!-- HERO -->`, etc. for orientation in large files
- **Skip-to-content link** at top of `<body>` for keyboard navigation
- Scripts loaded with `defer` at end of `<body>`

---

## Security

The site enforces a strict Content Security Policy (CSP) defined in both `_headers` (Netlify) and a `<meta>` tag in each HTML file. The two must stay in sync.

**Allowed sources summary:**

| Directive | Allowed |
|---|---|
| `script-src` | `'self'` + sha256 hash of inline script only |
| `style-src` | `'self'` + fonts.googleapis.com |
| `font-src` | `'self'` + fonts.gstatic.com |
| `form-action` | `'self'` + formsubmit.co |
| `img-src` | `'self'` + data: + https: |
| `connect-src` | `'self'` |
| `object-src` | `'none'` |

**If you add an inline `<script>`**, you must update the `sha256-...` hash in both `_headers` and the CSP meta tag, or move the code to an external `.js` file in `/js/`.

**If you add a new external resource** (font, image CDN, analytics, etc.), you must update the relevant CSP directive in both places.

---

## Pages

### `index.html` — Landing Page

Sections (in order):
1. `#hero` — Hero with animated membrane illustration
2. `#signals` — Sense / Understand / Respond tile grid
3. `#response` — Animated SVG signal-flow loop diagram
4. `#comfort` — Use-case cards (Wellness, Workplace, Health Research)
5. `#platform` — Platform readiness / evidence package
6. `#privacy` — Positioning chips (Continuous, Private by design, etc.)
7. `#cta` — Two-step access request form

### `about.html` — Company Page

Sections (in order):
1. Hero — Company mission
2. `#who` — What they build / how they operate
3. `#mission` — Three mission pillars
4. `#principles` — Four design principles
5. `#roadmap` — Now / Next / Then timeline

---

## Animations

The site contains several distinct animation systems:

| System | File | Description |
|---|---|---|
| Scroll reveal | `script.js`, `about.js` | IntersectionObserver adds `.vis` to `.rev` elements |
| Vein drawing | `script.js` | SVG stroke-dasharray animated in sequence on load |
| Loop diagram | `script.js` | Signal dot follows bezier path via `getPointAtLength()`, 3400ms cycle |
| Node breathing | `script.js` | Membrane rings pulse via rAF |
| Signal pulse | `script.js` | Respond node activates on dot arrival |
| CSS keyframes | `styles.css` | `mem-orbit`, `mem-drift`, `plume-sweep`, `roadmap-scan`, `phase-pulse`, etc. |

When editing animations, always check `prefers-reduced-motion` support.

---

## Gitignore

The following are intentionally excluded from version control:

```
.DS_Store
leaf-website_2.html
private/
LEAF_Investor_Brief.html
```

Do not commit files in `private/` or investor-facing HTML files.

---

## Common Tasks

### Add a new section to a page
1. Add HTML with appropriate semantic element and a `<!-- SECTION NAME -->` comment
2. Add `.rev` to elements that should animate in on scroll
3. Style in `styles.css` (or `about.css` for about-page-only styles)
4. Update navigation anchor links if the section is linkable

### Change brand copy
- Edit text directly in the HTML files
- Keep headings in Fraunces, body in Plus Jakarta Sans (enforced by CSS classes)

### Update form fields
- Edit `index.html` around the `#cta` section
- Update validation logic in `script.js` (look for the `// --- FORM STEPPER ---` section)
- Keep the `_honey` honeypot field — do not remove it

### Add a new page
1. Copy the `<head>` block and `<nav>` from an existing page
2. Link the correct CSS files (`styles.css` is shared; create a new CSS file for page-specific styles)
3. Create a matching JS file for page-specific interactions
4. Copy the scroll-reveal and nav-active observer boilerplate from `about.js`
5. Update CSP if any new external resources are needed

### Update security headers
Edit `_headers` and the matching `<meta http-equiv="Content-Security-Policy">` tag in **each** HTML file together. They must stay in sync.
