# collection-grid — Test Scenarios

Relevant authoring rules:
- Four projects: mobile 375 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: required — per brief.
- yarn playwright:test ... --reporter=list.

## Section under test
- Type: `page`
- URL helper: `sectionTestUrl('page')`
- Template: `page.test.json`
- Section selector: `[data-section-type="collection-grid"]`

## Required template content
- Section settings:
  - `heading_text` — non-blank text (default: "Shop By Category")
  - `cta_label` — non-blank text (default: "View More")
  - `cta_url` — non-blank URL (default: "/collections/all")
  - `show_cta` — boolean (default: true)
  - `show_arrows` — boolean (default: true)
  - `background_color` — color (default: "#f4f6f8")
  - `section_font` — font_picker (default: "dm_sans_n7")
- Block type `tile` — minimum 3 blocks (to test carousel non-empty state); 8 total pre-set as per brief tile labels:
  - Block 1: image (placeholder or blank), label: "Indoor Air Quality", link: "/collections/all"
  - Block 2: image (placeholder or blank), label: "Split Systems", link: "/collections/all"
  - Block 3: image (placeholder or blank), label: "Packaged Terminal Systems", link: "/collections/all"
  - Block 4: image (placeholder or blank), label: "Scratch and Dent", link: "/collections/all"
  - Block 5: image (placeholder or blank), label: "Portable Ac System", link: "/collections/all"
  - Block 6: image (placeholder or blank), label: "HVAC Parts - Accessories", link: "/collections/all"
  - Block 7: image (placeholder or blank), label: "Thermostats", link: "/collections/all"
  - Block 8: image (placeholder or blank), label: "Mini Splits", link: "/collections/all"

## A — Content completeness
Single assertion: template has non-blank values for every key in "Required template content".
Fails fast under `maxFailures: 1` with enumeration of missing keys.

## B — Typography + color parity (mobile 375 + desktop 1440)
Scope to SECTION_SELECTOR. No inferred properties — only columns from brief typography table.

### B-1 [mobile]: Heading typography
- Element: `.collection-grid__heading`
- Computed styles:
  - font-size: `32px`
  - line-height: `36px`
  - font-weight: `700`
  - color: `rgb(11, 30, 61)` (hex #0b1e3d)
  - text-transform: `none`

### B-2 [mobile]: CTA typography + styling
- Element: `.collection-grid__cta`
- Computed styles:
  - font-size: `16px`
  - line-height: `20px`
  - font-weight: `700`
  - color: `rgb(0, 0, 0)` (hex #000000)
  - text-transform: `capitalize` (Figma specifies Transform: capitalize)
  - border-bottom: `1px solid rgb(0, 0, 0)` (black underline)

### B-3 [desktop]: Heading typography
- Element: `.collection-grid__heading`
- Computed styles:
  - font-size: `48px`
  - line-height: `52.8px`
  - font-weight: `700`
  - color: `rgb(11, 30, 61)` (hex #0b1e3d)
  - text-transform: `none`

### B-4 [desktop]: CTA typography + styling
- Element: `.collection-grid__cta`
- Computed styles:
  - font-size: `16px`
  - line-height: `20px`
  - font-weight: `700`
  - color: `rgb(0, 0, 0)`
  - text-transform: `capitalize`
  - border-bottom: `1px solid rgb(0, 0, 0)`

### B-5 [mobile + desktop]: Section background color
- Element: `[data-section-type="collection-grid"]`
- Computed styles:
  - background-color: `rgb(244, 246, 248)` (hex #f4f6f8)

### B-6 [mobile + desktop]: Prev arrow initial state (disabled)
- Element: `.carousel__nav-button--prev` (or `.collection-grid__arrow--prev`)
- Assertion: `disabled` attribute exists AND computed opacity = `0.4`
- Wait pattern: `page.waitForFunction()` with timeout 5000ms to ensure disabled state set + CSS applied

## C — Layout integrity (tablet 768 + tablet-lg 1280)
Structural checks only — no typography, no padding/margin/gap assertions.

### C-1 [tablet + tablet-lg]: No horizontal scroll
- Element: `[data-section-type="collection-grid"]`
- Assertion: `viewport.width >= locator.boundingBox().width + window.scrollX` at start of test

### C-2 [tablet + tablet-lg]: Carousel slides fit within container (visual check)
- Element: `.carousel__wrapper` (swiper-wrapper)
- Assertion: swiper-wrapper width ≤ carousel viewport width (no layout thrash)

## D — Live screenshots (mobile 375 + desktop 1440)
### D-1 [mobile]: Save mobile live screenshot
- Call: `saveScreenshot(page, '[data-section-type="collection-grid"]', 'collection-grid', 'live-mobile')`
- Scope: section root only
- Wait: all images loaded via `waitForSectionImages(page, SECTION_SELECTOR)`

### D-2 [desktop]: Save desktop live screenshot
- Call: `saveScreenshot(page, '[data-section-type="collection-grid"]', 'collection-grid', 'live-desktop')`
- Scope: section root only
- Wait: all images loaded via `waitForSectionImages(page, SECTION_SELECTOR)`

## E — Content placement (mobile 375 + desktop 1440)
Line counts (multi-line detection), content-container max-width parity.

### E-1 [mobile]: Heading line count
- Element: `.collection-grid__heading`
- Assertion: `Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight)) >= 1` (heading may wrap on mobile due to viewport width)

### E-2 [desktop]: Heading wraps to 2 lines max
- Element: `.collection-grid__heading`
- Assertion: `Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight)) <= 2`

### E-3 [mobile + desktop]: Content container max-width
- Element: `.collection-grid__inner`
- Assertion: `el.offsetWidth <= 1338` (Figma max-width from brief)

### E-4 [mobile + desktop]: CTA does not wrap
- Element: `.collection-grid__cta`
- Assertion: `Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight)) === 1`

## A11y — WCAG 2.1 AA scans (mobile 375 + desktop 1440)

### A11y-1 [mobile]: Axe scan at mobile 375
- Tool: `@axe-core/playwright` AxeBuilder
- Scope: `[data-section-type="collection-grid"]` only
- Tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`
- Write results: `features/collection-grid/qa/a11y-mobile.json`
- Fail on: `impact === 'critical' || impact === 'serious'`
- Log: moderate/minor without failing

### A11y-2 [desktop]: Axe scan at desktop 1440
- Tool: `@axe-core/playwright` AxeBuilder
- Scope: `[data-section-type="collection-grid"]` only
- Tags: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`
- Write results: `features/collection-grid/qa/a11y-desktop.json`
- Fail on: `impact === 'critical' || impact === 'serious'`
- Log: moderate/minor without failing

## Design content reference
Pulled directly from brief.md Design content reference section:

### Copy
- Section heading: `Shop By Category`
- CTA label: `View More`
- Tile labels (8 tiles, in order):
  1. `Indoor Air Quality`
  2. `Split Systems`
  3. `Packaged Terminal Systems`
  4. `Scratch and Dent`
  5. `Portable Ac System`
  6. `HVAC Parts - Accessories`
  7. `Thermostats`
  8. `Mini Splits`

### Typography (design breakpoints only: mobile 375, desktop 1440)
| Element | Family | Weight | Size (px) | Line-height (px) | Transform |
|---|---|---|---|---|---|
| Section heading (h2) | DM Sans | 700 | 48 | 52.8 | none |
| View More link (CTA) | DM Sans | 700 | 16 | 20 | capitalize |
| Tile label | DM Sans | 500 | 15 | 24 | none |

### Colors
| Token | Hex / rgba | Usage |
|---|---|---|
| Section background | `#f4f6f8` | Outer section surface + arrow fill |
| Heading text | `#0b1e3d` | h2 color |
| Body / link / label text | `#000000` | CTA + tile label |
| Card surface | `#ffffff` | Tile card background |
| Arrow border | `rgba(0, 0, 0, 0.2)` | Prev/next button stroke |
| Prev arrow opacity (initial disabled) | 0.4 | Prev button at scroll start |

## Test runner checklist
- yarn playwright:test features/collection-grid/collection-grid.spec.js --reporter=list
- live-mobile.png + live-desktop.png produced in qa/
- a11y-mobile.json + a11y-desktop.json produced in qa/
- maxFailures: 1 active — first failure aborts run
- No console.error observers, no presence assertions, no hover/focus tests, no content-string assertions

## Questions
None — all ambiguities resolved via brief + ui-plan.md. No blocking items.
