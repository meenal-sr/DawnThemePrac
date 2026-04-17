# Hero Banner — Test Scenarios

Relevant authoring rules:
- Four projects: `mobile` 375 / `tablet` 768 / `tablet-lg` 1280 / `desktop` 1440.
- Strict assertions only at `mobile` + `desktop`. `tablet` + `tablet-lg` assert layout integrity only.
- Pixelmatch screenshots saved at `mobile` + `desktop` only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never `toHaveText()` on merchant-editable copy.
- A11y: `skip` (matches brief). Write `qa/a11y-skipped.marker` at module top level; do NOT import `@axe-core/playwright`; do NOT emit a11y tests.
- Runner: `yarn playwright:test features/hero-banner/ui.spec.js --reporter=list`.

---

## Section under test

| Field | Value |
|---|---|
| Template type | `page` |
| URL helper | `sectionTestUrl('page')` — resolves to `GLOBAL_PAGE_PATH + '?view=test'` (template `page.test`) |
| Template file | `templates/page.test.json` |
| Section selector | `[data-section-type="hero-banner"]` |
| Design ref (desktop 1440) | `qa/figma-desktop.png` |
| Design ref (mobile 375) | none provided — mobile values below are INFERRED from the brief's Constraints and assumptions |

Element selectors (scoped under the section root):
- `.hero-banner__eyebrow` — eyebrow `<p>`
- `.hero-banner__heading` — `<h1>`
- `.hero-banner__subhead` — subhead richtext container `<div>`
- `.hero-banner__cta` — CTA `<a>`
- `.hero-banner__content` — outer content container `<div>` (relative + padding)
- `.hero-banner__content-inner` — inner stack (`max-w-[460px]`, E-5 target)

---

## Required template content

Every setting below must be non-blank in `templates/page.test.json → sections.hero-banner.settings`. A-1 inlines this list.

- `eyebrow_text`
- `heading_text`
- `subheading_text`
- `cta_label`
- `cta_link`
- `background_image`
- `foreground_image`
- `logo_image`
- `text_color`
- `cta_bg_color`
- `cta_text_color`
- `overlay_opacity`
- `heading_font`
- `body_font`

---

## A — Content completeness

| # | Assertion | Failure message |
|---|---|---|
| A1 | `loadTemplate('page').sections['hero-banner'].settings` has non-blank values for every key in "Required template content" | `Missing required content in templates/page.test.json → sections.hero-banner.settings: <keys>. Populate every design-required setting before running the spec.` |

A-1 is the FIRST test in `ui.spec.js`. Unscoped (runs on all projects, but the first project's failure aborts the run under `maxFailures: 1`). Do NOT wrap in `test.skip` — content completeness must be verified regardless of viewport.

---

## B — Typography + color parity (mobile 375 + desktop 1440)

Each row below is an assertion the spec must emit. Every test block is scoped with `test.skip(testInfo.project.name !== '<bp>', 'Runs only in <bp> project')`. Use `requireElement(page, selector)` to locate each element, then read computed style via `evaluate(el => getComputedStyle(el).<prop>)`. Tolerances: font-size ±0.5px, line-height ±1px, color exact match on the normalized rgb triplet, opacity ±0.05.

### Desktop 1440 — strict Figma values

| # | Element | Property | Target | Source |
|---|---|---|---|---|
| B1  | `.hero-banner__eyebrow` | `font-size` | `16px` | Figma |
| B2  | `.hero-banner__eyebrow` | `line-height` | `25px` | Figma |
| B3  | `.hero-banner__eyebrow` | `font-weight` | `500` | Figma |
| B4  | `.hero-banner__eyebrow` | `text-transform` | `uppercase` | Figma |
| B5  | `.hero-banner__eyebrow` | `color` | `rgb(255, 255, 255)` | Figma |
| B6  | `.hero-banner__heading` | `font-size` | `60px` | Figma |
| B7  | `.hero-banner__heading` | `line-height` | `66px` | Figma |
| B8  | `.hero-banner__heading` | `font-weight` | `700` | Figma |
| B9  | `.hero-banner__heading` | `color` | `rgb(255, 255, 255)` | Figma |
| B10 | `.hero-banner__subhead` | `font-size` | `15.9px` (accept `15.4`–`16.4`) | Figma |
| B11 | `.hero-banner__subhead` | `line-height` | `24.9px` (±1px) | Figma |
| B12 | `.hero-banner__subhead` | `font-weight` | `500` | Figma |
| B13 | `.hero-banner__subhead` | `color` | `rgb(255, 255, 255)` | Figma |
| B14 | `.hero-banner__subhead` | `opacity` | `0.7` (±0.05) | Figma (70% alpha on white) |
| B15 | `.hero-banner__cta` | `font-size` | `16px` | Figma |
| B16 | `.hero-banner__cta` | `line-height` | `28px` | Figma |
| B17 | `.hero-banner__cta` | `font-weight` | `700` | Figma |
| B18 | `.hero-banner__cta` | `text-transform` | `capitalize` | Figma |
| B19 | `.hero-banner__cta` | `color` | `rgb(255, 255, 255)` | Figma (CTA text token) |
| B20 | `.hero-banner__cta` | `background-color` | `rgb(2, 125, 179)` | Figma `#027db3` |
| B21 | `.hero-banner__cta` | pill border-radius | `border-top-left-radius` AND `border-bottom-left-radius` both `>= 100px` | Figma `100px` |

### Mobile 375 — inferred values (wider tolerances; mark as inferred in spec comments)

Brief has no mobile Figma node — these values are planner's inference from the desktop frame.

| # | Element | Property | Target | Tolerance / note |
|---|---|---|---|---|
| B22 | `.hero-banner__heading` | `font-size` | `32px` | ±1px — INFERRED |
| B23 | `.hero-banner__heading` | `font-weight` | `700` | exact |
| B24 | `.hero-banner__heading` | `color` | `rgb(255, 255, 255)` | exact |
| B25 | `.hero-banner__eyebrow` | `font-size` | `16px` | exact — brief says same as desktop |
| B26 | `.hero-banner__eyebrow` | `text-transform` | `uppercase` | exact |
| B27 | `.hero-banner__eyebrow` | `color` | `rgb(255, 255, 255)` | exact |
| B28 | `.hero-banner__subhead` | `font-size` | range `[14, 16]px` | wide — INFERRED |
| B29 | `.hero-banner__subhead` | `color` | `rgb(255, 255, 255)` | exact |
| B30 | `.hero-banner__subhead` | `opacity` | `0.7` (±0.05) | exact |
| B31 | `.hero-banner__cta` | `font-size` | `16px` | exact — brief says same as desktop |
| B32 | `.hero-banner__cta` | `background-color` | `rgb(2, 125, 179)` | exact |
| B33 | `.hero-banner__cta` | `color` | `rgb(255, 255, 255)` | exact |

Authoring note for test-agent: group B1–B21 into one `desktop`-scoped `test(...)` block and B22–B33 into one `mobile`-scoped block. Each block must begin with the `test.skip(...)` project guard.

---

## C — Layout integrity (tablet 768 + tablet-lg 1280)

Structural only. No typography. Scoped with `test.skip(testInfo.project.name !== '<bp>', …)` against `tablet` and `tablet-lg`.

| # | Assertion | Selector(s) | Rule |
|---|---|---|---|
| C1 | No horizontal scroll on `<html>` | `document.documentElement` | `scrollWidth <= clientWidth + 1` (1px rounding slack) |
| C2 | No horizontal scroll on section root | `[data-section-type="hero-banner"]` | `scrollWidth <= clientWidth + 1` |
| C3 | Content container fits viewport width | `.hero-banner__content` | bounding box `x >= 0` and `x + width <= viewport.width` |
| C4 | Eyebrow + heading do not vertically overlap | `.hero-banner__eyebrow`, `.hero-banner__heading` | eyebrow `bottom <=` heading `top` (strict stack) |
| C5 | Heading + subhead do not vertically overlap | `.hero-banner__heading`, `.hero-banner__subhead` | heading `bottom <=` subhead `top` |
| C6 | Subhead + CTA do not vertically overlap | `.hero-banner__subhead`, `.hero-banner__cta` | subhead `bottom <=` CTA `top` |

Implementation note: the test template is fully populated in Step 8, so all four text elements are always present at test time. `requireElement` will fail fast with `element not found: <selector>` if any regress out of the DOM — intentional signal.

---

## D — Live screenshots (mobile 375 + desktop 1440)

Each block scoped to a single project via `test.skip(testInfo.project.name !== '<bp>', …)`. Save the section-root screenshot for pixelmatch consumption by visual-qa-agent.

| # | Project | Output path | Target |
|---|---|---|---|
| D1 | `mobile` | `features/hero-banner/qa/live-mobile.png` | `page.locator('[data-section-type="hero-banner"]').first()` — element screenshot, `fullPage: false` |
| D2 | `desktop` | `features/hero-banner/qa/live-desktop.png` | same locator, element screenshot, `fullPage: false` |

Pre-screenshot sequence:
1. `await page.goto(sectionTestUrl('page'), { waitUntil: 'domcontentloaded' })` — never `networkidle`.
2. `await sectionRoot.waitFor({ state: 'visible', timeout: 10_000 })`.
3. Optionally `await page.waitForFunction(() => document.fonts?.ready)` so DM Sans is swapped in before capture.
4. `await sectionRoot.screenshot({ path: '...' })`.

---

## E — Content placement (mobile 375 + desktop 1440)

Structural guardrails that catch layout shifts pixelmatch may miss when the test template has blank image_picker fields. Each test scoped via `test.skip(testInfo.project.name !== '<bp>', …)`.

Line-count helper (inline in spec):
```js
const lineCount = (el) => {
  const lh = parseFloat(getComputedStyle(el).lineHeight);
  return Math.round(el.offsetHeight / lh);
};
```

### Desktop 1440 — Figma-derived

| # | Element | Property | Target | Tolerance |
|---|---|---|---|---|
| E1 | `.hero-banner__heading` | wrapped lines | `2` ("Unlock Exclusive" / "Savings") | exact |
| E2 | `.hero-banner__subhead` | wrapped lines | `2` | exact |
| E3 | `.hero-banner__eyebrow` | wrapped lines | `1` | exact |
| E4 | `.hero-banner__cta` | wrapped lines | `1` | exact |
| E5 | `.hero-banner__content-inner` | `offsetWidth` | `≤ 462` (Figma 460 + 2px tolerance) | max |

### Mobile 375 — inferred (no Figma node)

| # | Element | Property | Target | Tolerance |
|---|---|---|---|---|
| E6 | `.hero-banner__heading` | wrapped lines | `≥2` (inferred — heading should wrap at mobile width) | min |

**No padding/margin/gap assertions in Group E.** Spacing is achievable via padding, margin, gap, flex/grid spacing, transforms, or parent spacing — asserting specific `padding-*` values is implementation-specific and rejects equivalent-visual refactors. Line counts + content-width constrain the layout envelope enough to catch real shifts; pixelmatch catches the rest.

Assertion pattern (line count):
```js
const lines = await heading.evaluate(lineCount);
expect(lines).toBe(2);
```

Assertion pattern (content width):
```js
const width = await content.evaluate(el => el.offsetWidth);
expect(width).toBeLessThanOrEqual(940);
```

---

## Design content reference

**Reference only — NOT test assertions.** Populates `templates/page.test.json` (Step 8) and provides truth values for visual-qa-agent grading.

### Copy (from Figma)
- Eyebrow: `NEW ARRIVALS`
- Heading: `Unlock Exclusive Savings`
- Subhead: `Get contractor pricing on top-rated systems. Add to cart to see your price.` (wrapped `<p>…</p>` for richtext)
- CTA label: `Shop Now`
- CTA link: `/collections/all` (test fixture target)

### Typography (desktop, from Figma)
- Eyebrow: DM Sans Medium, 16 / 25, weight 500, uppercase, white
- Heading: DM Sans Bold, 60 / 66, weight 700, white
- Subhead: DM Sans Medium, 15.9 / 24.9, weight 500, white @ opacity 0.7
- CTA: DM Sans Bold, 16 / 28, weight 700, capitalize, bg `#027db3`, text white, border-radius 100 (pill)

### Frame
- Size 1340 × 480, border-radius 10, overflow hidden
- Gradient overlay: `linear-gradient(to right, #000 50%, rgba(102,102,102,0) 100%)` at opacity 0.5
- Background fallback: `#f0efeb` solid

### Mobile (INFERRED — no Figma node)
- Heading 32px
- Eyebrow 16px, CTA 16px (same as desktop)
- Subhead 14–15px
- Foreground and logo hidden below 768px

### Schema defaults used for template population
- `text_color` `#ffffff`
- `cta_bg_color` `#027db3`
- `cta_text_color` `#ffffff`
- `overlay_opacity` `50`
- `heading_font` `dm_sans_n7` (DM Sans Bold)
- `body_font` `dm_sans_n5` (DM Sans Medium)
- `background_image`, `foreground_image`, `logo_image` — BLANK. No uploaded assets available in test store. Rendered branch: solid `#f0efeb` background fallback; foreground and logo omitted. Mobile pixelmatch is informational only per brief.

---

## Test runner checklist

- `yarn playwright:test features/hero-banner/ui.spec.js --reporter=list`
- On non-zero exit → `pkill -f playwright-mcp-server` before any follow-up action
- Artifacts produced by this run:
  - `features/hero-banner/qa/live-mobile.png` (D1)
  - `features/hero-banner/qa/live-desktop.png` (D2)
  - `features/hero-banner/qa/a11y-skipped.marker` (brief says `Accessibility: skip`)
- `maxFailures: 1` active — first failure aborts the whole run
- Template `templates/page.test.json` fully populated per Step 8 so every rendered text branch matches the pixelmatch reference
