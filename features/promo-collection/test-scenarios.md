# promo-collection — Test Scenarios

Relevant authoring rules:
- Four projects: mobile 390 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: required — brief §A11y says WCAG 2.1 AA.
- yarn playwright:test ... --reporter=list.

## Section under test
- Type: `page`
- URL helper: `sectionTestUrl('page')`
- Template: `templates/page.test.json`
- Section selector: `[data-section-type="promo-collection"]`

## Required template content
- `heading_text` (section setting): `"Shop By Category"`
- `view_more_label` (section setting): `"View More"`
- `view_more_link` (section setting): `/collections/all`
- `background_color` (section setting): `#f4f6f8`
- `section_font` (section setting): `dm_sans_n7`
- `blocks` (tile array): exactly 6 tiles with labels: `["Indoor Air Quality", "Split Systems", "Packaged Terminal Systems", "Scratch and Dent", "Portable Ac System", "HVAC Parts - Accessories"]`
- Each tile `link` (default): `/collections/all`

## A — Content completeness
Single assertion: template has non-blank values for every key in "Required template content".

## B — Typography + color parity (mobile + desktop)

### Mobile 390w
| Element | Font-size | Line-height | Weight | Color | Notes |
|---|---|---|---|---|
| `.promo-collection__heading` | 28 | 33.6 | 700 | #000 | DM Sans opsz 14 |
| `.promo-collection__view-more` | 15 | 24 | 700 | #000 | DM Sans opsz 14 |
| `.promo-collection__label` (tile label) | 13.5 | 21.6 | 500 | #000 | DM Sans opsz 14, text-center |
| Section background | — | — | — | #f4f6f8 | Inline style |
| Tile card background | — | — | — | #ffffff | White |

### Desktop 1440w
| Element | Font-size | Line-height | Weight | Color | Notes |
|---|---|---|---|---|
| `.promo-collection__heading` | 48 | 52.8 | 700 | #0b1e3d | DM Sans opsz 14 |
| `.promo-collection__view-more` | 16 | 20 | 700 | #000 | DM Sans opsz 14 |
| `.promo-collection__label` (tile label) | 15 | 24 | 500 | #000 | DM Sans opsz 14, text-center |
| Section background | — | — | — | #f4f6f8 | Inline style |
| Tile card background | — | — | — | #ffffff | White |
| Arrow button border | — | — | — | rgba(0,0,0,0.2) | Stroke on arrow SVG |
| Arrow button BG | — | — | — | #f4f6f8 | Button bg |

## C — Layout integrity (tablet 768 + tablet-lg 1280)

### Tablet 768w
- No horizontal scroll on page
- Section container `offsetWidth` ≤ 768
- Track `[data-track]` fits within viewport; no overflow-x scroll (native overflow hidden or scroll-snap ensures visible tiles)
- Arrows hidden: `[data-arrow="prev"]` and `[data-arrow="next"]` have `display: none` (via `tw-hidden md-small:tw-flex`)

### Tablet-lg 1280w
- No horizontal scroll on page
- Section container `offsetWidth` ≤ 1280
- Inner frame (`.promo-collection__inner`) respects `lg:tw-max-w-[1338px]` constraint; computed `max-width` ≈ 1280 (viewport limit applies before lg: max-width)
- Arrows visible: `[data-arrow="prev"]` and `[data-arrow="next"]` have `display: flex` (viewport ≥ md-small 768px)
- Prev arrow initial state: `data-state="prev-disabled"`, `aria-disabled="true"`, `tabindex="-1"`
- Next arrow initial state: `data-state="next-enabled"`, `aria-disabled="false"`

## D — Live screenshots (mobile + desktop)

### Mobile 390w
- Viewport: 390×844
- Selector: `[data-section-type="promo-collection"]`
- File: `features/promo-collection/qa/live-mobile.png`
- Captured via `saveScreenshot(page, selector, sectionName, 'live-mobile')`

### Desktop 1440w
- Viewport: 1440×900
- Selector: `[data-section-type="promo-collection"]`
- File: `features/promo-collection/qa/live-desktop.png`
- Captured via `saveScreenshot(page, selector, sectionName, 'live-desktop')`

## E — Content placement (mobile + desktop)

### Mobile 390w
- Heading renders above view-more (column layout): `.promo-collection__header` has flex-col on base
- View-more link positioned below heading with gap `pt-[12px]` (from figma-context)
- Each of 6 tiles renders as clickable link with label beneath image
- Tile card radius: `tw-rounded-[8px]`
- Tile image size: 140×140px (from figma-context `tw-w-[140px] tw-h-[140px]`)
- Tile label gap from image: 12px (from figma-context `tw-gap-[12px]`)
- Arrows NOT visible (test will count `display: none` computed style)
- Scroll track width = viewport width (no visible scrollbar) — rendered as native overflow-x-auto

### Desktop 1440w
- Heading and view-more on same row: `.promo-collection__header` has `md-small:tw-flex-row md-small:tw-items-center md-small:tw-justify-between`
- Inner frame constrained: `.promo-collection__inner` has `lg:tw-max-w-[1338px]` (computed max-width at lg breakpoint)
- 6 tiles visible (or 5 + 1 wider if justify-between spread) — count `.promo-collection__tile` = 6
- Tile card radius: `tw-rounded-[16px]`
- Tile image size: 166×166px (from figma-context `md:tw-w-[166px] md:tw-h-[166px]`)
- Tile label gap from image: 23px (from figma-context `md:tw-gap-[23px]`)
- Arrows visible with `display: flex`: prev at left with initial state `prev-disabled`, next at right with state `next-enabled`
- Arrow size: 48×48px (from figma-context; implicit from BEM + data-attr + CSS)

## A11y Scan
- Brief §A11y = required (WCAG 2.1 AA).
- Scan scope: `[data-section-type="promo-collection"]` only.
- Tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`.
- Violations written to `features/promo-collection/qa/a11y-<project>.json` per project.
- Fail on `impact === 'critical'` or `impact === 'serious'`; log moderate/minor without failing.
- One a11y test per Playwright project (mobile, tablet, tablet-lg, desktop).

## Design content reference

From `figma-context.md`:
- **Heading:** `Shop By Category`
- **View-more label:** `View More` (capitalize via CSS if needed)
- **Tile labels (in order):**
  1. `Indoor Air Quality`
  2. `Split Systems`
  3. `Packaged Terminal Systems`
  4. `Scratch and Dent`
  5. `Portable Ac System`
  6. `HVAC Parts - Accessories`

## Test runner checklist
- `yarn playwright:test features/promo-collection/promo-collection.spec.js --reporter=list`
- A-1 content-completeness runs first; fails fast if template incomplete
- D-1 + D-2 screenshots produce `qa/live-mobile.png` + `qa/live-desktop.png`
- A11y tests produce `qa/a11y-mobile.json`, `qa/a11y-tablet.json`, `qa/a11y-tablet-lg.json`, `qa/a11y-desktop.json`
- B / C / E tests authored but not run in pipeline; available for manual debug: `yarn playwright:test ... --grep "B-|C-|E-"`
- maxFailures: 1 active (any failure aborts run)

## Questions
None blocking at this stage. Schema, copy, selectors, and breakpoint behavior are clear from brief + figma-context.
