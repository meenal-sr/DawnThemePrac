# promo-test — Test Scenarios

Authoritative test contract for the promo-test section. Playwright spec translates each scenario directly into a test block.

---

## Authoring rules (enforced)
- Four projects: mobile 375 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions (typography, color, content) only at design breakpoints: mobile 375 + desktop 1440.
- Layout-integrity checks (no h-scroll, no overlap, container width) only at intermediates: tablet 768 + tablet-lg 1280.
- Live screenshots saved at mobile 375 + desktop 1440 only via `saveScreenshot(page, selector, 'promo-test', 'live-<bp>')`.
- Pixelmatch compares `qa/figma-<bp>.png` (design reference) vs `qa/live-<bp>.png` (rendered) at mobile + desktop only.
- No standalone presence group (section root, heading, CTA href validation).
- No conditional-rendering tests — test template fully populated; negative branch never exercised.
- No console-error observer.
- No content-string assertions (`toHaveText()`) — content from template.
- No hover/focus/active state tests — pure CSS, pixelmatch territory.
- A11y mode: **skip** — brief §5 says "no dedicated axe scan." Write a11y-skipped.marker at module load.

---

## Section under test

**Type:** Page template section  
**Section ID (DOM):** `data-section-type="promo-test"`  
**Section selector:** `[data-section-type="promo-test"]`  
**URL helper:** `sectionTestUrl('page')`  
**Template:** `templates/promo-test-page.test.json` — schema populated at ui-agent Phase 2  

---

## Required template content

Fixture must populate every design-required setting before tests run:

### Section settings
- `heading` — non-blank text (heading display + test-template population validation)
- `subheading_desktop` — non-blank textarea (visible at 768px+)
- `subheading_mobile` — non-blank textarea (visible <768px)

### Block settings (minimum 3 blocks required)
- Block 1 (`card-1`): `title`, `description`, `cta_label`, `cta_link` all non-blank
- Block 2 (`card-2`): `title`, `description`, `cta_label`, `cta_link` all non-blank
- Block 3 (`card-3`): `title`, `description`, `cta_label`, `cta_link` all non-blank

**Rationale:** Figma shows 3 cards default. Below 3 blocks, carousel rendering changes (no nav arrows). At 3+, nav arrows conditional. Template must populate 3 blocks to match design source of truth.

---

## A — Content completeness (fixture validation)

**Single assertion:** Template `sections.promo-test.settings` has non-blank values for every key in "Required template content". Test fails fast if ANY required setting is missing or empty, with detailed enumeration of missing keys + fix instruction.

Runs FIRST (gate all other tests under `maxFailures: 1`). No screenshot, no layout check — pure template validation.

---

## B — Typography + color parity (mobile 375 + desktop 1440)

Rendered computed styles match Figma ground truth (from `figma-context.md`).

### B-1 [mobile]: Section heading typography
- Element: `.promo-test__heading` (`<h2>`)
- Breakpoint: mobile 375
- Assertions:
  - `font-size: 28px` (computed)
  - `line-height: 33.6px` (computed)
  - `font-weight: 700` (computed, Bold)
  - `color: #000000` (computed)

### B-2 [desktop]: Section heading typography
- Element: `.promo-test__heading` (`<h2>`)
- Breakpoint: desktop 1440
- Assertions:
  - `font-size: 48px` (computed)
  - `line-height: 52.8px` (computed)
  - `font-weight: 700` (computed, Bold)
  - `color: #0b1e3d` (computed)

### B-3 [mobile]: Subhead typography
- Element: `.promo-test__subhead--mobile` (`<p>`)
- Breakpoint: mobile 375
- Assertions:
  - `font-size: 16px` (computed)
  - `line-height: 20px` (computed)
  - `font-weight: 500` (computed, Medium)
  - `color: #666666` (computed)
  - Visible (display !== none)

### B-4 [desktop]: Subhead typography
- Element: `.promo-test__subhead--desktop` (`<p>`)
- Breakpoint: desktop 1440
- Assertions:
  - `font-size: 16px` (computed)
  - `line-height: 20px` (computed)
  - `font-weight: 500` (computed, Medium)
  - `color: #666666` (computed)
  - Visible (display !== none)

### B-5 [mobile]: Desktop subhead is hidden
- Element: `.promo-test__subhead--desktop` (`<p>`)
- Breakpoint: mobile 375
- Assertion: `display: none` (hidden via `tw-hidden`)

### B-6 [desktop]: Mobile subhead is hidden
- Element: `.promo-test__subhead--mobile` (`<p>`)
- Breakpoint: desktop 1440
- Assertion: `display: none` (hidden via `md-small:tw-hidden`)

### B-7 [mobile]: Desktop card snippet is hidden
- Element: `.promo-test-card--desktop`
- Breakpoint: mobile 375
- Assertion: `display: none` (hidden via `tw-hidden md:tw-block`)

### B-8 [desktop]: Mobile card snippet is hidden
- Element: `.promo-test-card--mobile`
- Breakpoint: desktop 1440
- Assertion: `display: none` (hidden via `md:tw-hidden`)

### B-9 [mobile]: Card title (mobile) typography
- Element: `.promo-test-card--mobile .promo-test-card__title` (`<h3>`)
- Breakpoint: mobile 375
- Assertions:
  - `font-size: 19.6px` (computed)
  - `line-height: 26.6px` (computed)
  - `font-weight: 700` (computed, Bold)
  - `color: #000000` (computed)

### B-10 [desktop]: Card title (desktop) typography
- Element: `.promo-test-card--desktop .promo-test-card__title` (`<h3>`)
- Breakpoint: desktop 1440
- Assertions:
  - `font-size: 24px` (computed)
  - `line-height: 28px` (computed)
  - `font-weight: 700` (computed, Bold)
  - `color: #f4f6f8` (computed)

### B-11 [mobile]: Card description (mobile) typography
- Element: `.promo-test-card--mobile .promo-test-card__description` (`<p>`)
- Breakpoint: mobile 375
- Assertions:
  - `font-size: 15px` (computed)
  - `line-height: 24px` (computed)
  - `font-weight: 600` (computed, SemiBold)
  - `color: #515151` (computed)

### B-12 [desktop]: Card description (desktop) typography
- Element: `.promo-test-card--desktop .promo-test-card__description` (`<p>`)
- Breakpoint: desktop 1440
- Assertions:
  - `font-size: 16px` (computed)
  - `line-height: 20px` (computed)
  - `font-weight: 500` (computed, Medium)
  - `color: #eaeaea` (computed)

### B-13 [mobile]: CTA label (mobile) typography
- Element: `.promo-test-card--mobile .promo-test-card__cta` (`<span>`)
- Breakpoint: mobile 375
- Assertions:
  - `font-size: 15px` (computed)
  - `line-height: 30px` (computed)
  - `font-weight: 700` (computed, Bold)
  - `color: #ffffff` (computed)
  - `background-color: #027db3` (computed)

### B-14 [desktop]: CTA label (desktop) typography
- Element: `.promo-test-card--desktop .promo-test-card__cta` (`<span>`)
- Breakpoint: desktop 1440
- Assertions:
  - `font-size: 16px` (computed)
  - `line-height: 28px` (computed)
  - `font-weight: 700` (computed, Bold)
  - `color: #f4f6f8` (computed)
  - `background-color: #027db3` (computed)

### B-15 [mobile]: Progress bar visible
- Element: `.carousel-progress`
- Breakpoint: mobile 375
- Assertion: `display !== none` (not hidden)

### B-16 [desktop]: Progress bar hidden
- Element: `.carousel-progress`
- Breakpoint: desktop 1440
- Assertion: `display: none` (hidden via inline `<style>` @media rule)

---

## C — Layout integrity (tablet 768 + tablet-lg 1280)

Structural checks only (no typography).

### C-1 [tablet]: No horizontal scroll
- Viewport: tablet 768
- Assertion: `page.evaluate(() => document.body.scrollWidth <= window.innerWidth)` returns true

### C-2 [tablet-lg]: No horizontal scroll
- Viewport: tablet-lg 1280
- Assertion: `page.evaluate(() => document.body.scrollWidth <= window.innerWidth)` returns true

### C-3 [tablet]: Content container within viewport
- Element: `.promo-test__inner`
- Viewport: tablet 768
- Assertion: `el.offsetWidth <= 768` (max-width constraint not exceeded)

### C-4 [tablet-lg]: Content container within viewport
- Element: `.promo-test__inner`
- Viewport: tablet-lg 1280
- Assertion: `el.offsetWidth <= 1280` (max-width constraint not exceeded)

---

## D — Live screenshots (mobile 375 + desktop 1440)

Visual reference for pixelmatch comparison vs `qa/figma-<bp>.png`.

### D-1: Save mobile live screenshot
- Viewport: mobile 375
- Selector: `[data-section-type="promo-test"]`
- Output: `features/promo-test/qa/live-mobile.png`
- Via: `saveScreenshot(page, '[data-section-type="promo-test"]', 'promo-test', 'live-mobile')`

### D-2: Save desktop live screenshot
- Viewport: desktop 1440
- Selector: `[data-section-type="promo-test"]`
- Output: `features/promo-test/qa/live-desktop.png`
- Via: `saveScreenshot(page, '[data-section-type="promo-test"]', 'promo-test', 'live-desktop')`

---

## E — Content placement parity (mobile 375 + desktop 1440)

Multi-line text wrapping + content container width assertions. Omit if design has no multi-line text or no content-width worth pinning.

### E-1 [mobile]: Card description line count
- Element: `.promo-test-card--mobile .promo-test-card__description` (first card)
- Breakpoint: mobile 375
- Assertion: `Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight))` ≥ 2 (multi-line confirmed)

### E-2 [desktop]: Card description line count
- Element: `.promo-test-card--desktop .promo-test-card__description` (first card)
- Breakpoint: desktop 1440
- Assertion: `Math.round(el.offsetHeight / parseFloat(getComputedStyle(el).lineHeight))` ≥ 2 (multi-line confirmed)

### E-3 [mobile]: Section container max-width respected
- Element: `.promo-test__inner`
- Breakpoint: mobile 375
- Assertion: `el.offsetWidth ≤ 599` (no max-width constraint at mobile, but assert actual width doesn't exceed section padding-derived max)

### E-4 [desktop]: Section container max-width respected
- Element: `.promo-test__inner`
- Breakpoint: desktop 1440
- Assertion: `el.offsetWidth ≤ 1340` (from Figma inner wrapper constraint)

---

## A11y decisions

**Mode: skip** — brief §5 specifies no dedicated axe scan. Write `features/promo-test/qa/a11y-skipped.marker` at module load.

Basic semantic HTML structure enforced by dom structure (no dedicated a11y assertions):
- `<h2>` heading present (validated via Group A fixture check)
- Card anchors render as `<a>` or `<div role="presentation">` (per cta_link presence)
- `<img>` alt text fallback chain enforced by `shopify-responsive-image` snippet

---

## Design content reference (from figma-context.md)

Provided for test-template populate step + visual QA reference.

### Copy table (test-agent ground truth)

| Field | Value |
|---|---|
| `heading` | `Not Sure What You Need?` |
| `subheading_desktop_line_1` | `Choose your system type and we'll guide you to the best options.` |
| `subheading_desktop_line_2` | `Quick, simple, and tailored to your space.` |
| `subheading_mobile_line_1` | `Shop top HVAC systems with limited-time pricing applied at checkout.` |
| `subheading_mobile_line_2` | `Fresh discounts, seasonal savings, and our best offers of the year.` |
| `card_1_title` | `Split System` |
| `card_1_description` | `A traditional central air system with indoor and outdoor units. Ideal for whole-home or multi-room cooling using ductwork.` |
| `card_2_title` | `Mini-Split System` |
| `card_2_description` | `Flexible, energy-efficient cooling with wall-mounted indoor units. Perfect for single rooms, additions, or homes without ducts.` |
| `card_3_title` | `Packaged Unit` |
| `card_3_description` | `All-in-one heating and cooling system installed outside the home. Perfect for homes with limited indoor space.` |
| `card_cta_label` | `Explore` |

---

## Test runner checklist

- Run: `yarn playwright:test features/promo-test/promo-test.spec.js --reporter=list`
- Artifacts produced:
  - `qa/live-mobile.png` + `qa/live-desktop.png` (visual reference)
  - `qa/a11y-skipped.marker` (a11y gate)
- All four projects (mobile 375 / tablet 768 / tablet-lg 1280 / desktop 1440) execute per `playwright.config.js` grep filters
- `maxFailures: 1` active — first failure aborts run

---

## Questions

None blocking. ui-plan.md Phase 2 is complete and addresses all scenarios.
