# essential-section — Test Scenarios

Authoring rules:
- Four projects: mobile 390 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. Tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: **required** — match brief.
- `yarn playwright:test ... --reporter=list`.

## Section under test

- **Type:** page
- **URL helper:** `sectionTestUrl('page')`
- **Template:** `templates/page.test.json`
- **Section entry key:** `essential-section-test`
- **Section selector:** `[data-section-type="essential-section"]`
- **Section DOM:** `sections/essential-section.liquid` + `snippets/essential-section-card.liquid`

## Required template content

Template must populate (all non-blank):
- Section settings: `heading_text`, `description_text`, `button_label`, `button_link`, `background_color`, `section_font`
- Block count: minimum 3 `card` blocks (per Figma preset: SEER2 / HVAC Rebates / New Refrigerant Updates)
- Each card block settings (non-blank): `title`, `body`, `link_label`, `link_url` (icon optional)

## A — Content completeness

Single assertion: template has non-blank values for all above keys.

**Test ID:** `A-1: Content completeness — required template settings populated`

Verify:
1. Section settings keys exist + non-blank: `heading_text`, `description_text`, `button_label`, `button_link`, `background_color`, `section_font`
2. Block count = 3 (minimum per preset)
3. Each of the 3 cards (by `block_order`) has non-blank: `title`, `body`, `link_label`, `link_url`
4. Fail fast with enumerated missing keys on first run

## B — Typography + color parity (mobile 390 + desktop 1440) — manual-debug

**Test series:**
- `B-1 [mobile]: Heading typography — mobile` — heading `.essential-section__heading` at 390w
  - font-size: 28px ± 1
  - line-height: 33.6px ± 0.5
  - font-weight: 700 (bold)
  - color: `rgb(0, 0, 0)` (#000)
- `B-2 [desktop]: Heading typography — desktop` — heading `.essential-section__heading` at 1440w
  - font-size: 48px ± 1
  - line-height: 52.8px ± 0.5
  - font-weight: 700
  - color: `rgb(11, 30, 61)` (#0b1e3d)
- `B-3 [mobile]: Description typography — mobile` — `.essential-section__description` at 390w
  - font-size: 15px ± 1
  - line-height: 24px ± 0.5
  - font-weight: 400 (regular)
  - color: `rgb(0, 0, 0)` (#000)
- `B-4 [desktop]: Description typography — desktop` — `.essential-section__description` at 1440w
  - font-size: 16px ± 1
  - line-height: 20px ± 0.5
  - font-weight: 500 (medium)
  - color: `rgb(102, 102, 102)` (#666)
- `B-5 [mobile]: Button typography — mobile` — `.essential-section__button` at 390w
  - font-size: 15px ± 1
  - line-height: 30px ± 1
  - font-weight: 700
  - color: `rgb(255, 255, 255)` (#fff)
  - background-color: `rgb(2, 125, 179)` (#027db3)
  - border-radius: 100px
- `B-6 [desktop]: Button typography — desktop` — `.essential-section__button` at 1440w
  - font-size: 16px ± 1
  - line-height: ≥ 20px
  - font-weight: 700
  - color: `rgb(244, 246, 248)` (#f4f6f8)
  - background-color: `rgb(2, 125, 179)` (#027db3)
  - border-radius: 100px
- `B-7 [mobile]: Card title typography — mobile` — `.essential-section__card-title` at 390w
  - font-size: 16px ± 1
  - line-height: 26px ± 0.5
  - font-weight: 700
  - color: `rgb(0, 0, 0)` (#000)
- `B-8 [desktop]: Card title typography — desktop` — `.essential-section__card-title` at 1440w
  - font-size: 20px ± 1
  - line-height: 28px ± 0.5
  - font-weight: 700
  - color: `rgb(0, 0, 0)` (#000)
- `B-9 [mobile]: Card body typography — mobile` — `.essential-section__card-body` at 390w
  - font-size: 15px ± 1
  - line-height: 24px ± 0.5
  - font-weight: 400
  - color: `rgb(102, 102, 102)` (#666)
- `B-10 [desktop]: Card body typography — desktop` — `.essential-section__card-body` at 1440w
  - font-size: 16px ± 1
  - line-height: 20px ± 0.5
  - font-weight: 500
  - color: `rgb(102, 102, 102)` (#666)
- `B-11 [mobile]: Card link typography — mobile` — `.essential-section__card-link` at 390w
  - font-size: 15px ± 1
  - line-height: 20px ± 0.5
  - font-weight: 500
  - color: `rgb(0, 0, 0)` (#000)
  - text-decoration: underline
- `B-12 [desktop]: Card link typography — desktop` — `.essential-section__card-link` at 1440w
  - font-size: 16px ± 1
  - line-height: 20px ± 0.5
  - font-weight: 500
  - color: `rgb(0, 0, 0)` (#000)
  - text-decoration: underline
- `B-13 [mobile]: Card background color — mobile` — `.essential-section__card` at 390w
  - background-color: `rgb(255, 255, 255)` (#fff)
  - border-radius: 8px (±1)
- `B-14 [desktop]: Card background color + radius — desktop` — `.essential-section__card` at 1440w
  - background-color: `rgb(255, 255, 255)` (#fff)
  - border-radius: 12px (±1)
- `B-15 [desktop]: Section background color — desktop` — `[data-section-type="essential-section"]` at 1440w
  - background-color: `rgb(244, 246, 248)` (#f4f6f8)

## C — Layout integrity (tablet 768 + tablet-lg 1280) — manual-debug

**Test series:**
- `C-1 [tablet]: No horizontal scroll on page` — at 768w, document.documentElement.scrollWidth ≤ window.innerWidth
- `C-2 [tablet]: Section container fits viewport width` — at 768w, section offsetWidth ≤ 768
- `C-3 [tablet-lg]: No horizontal scroll on page` — at 1280w, document.documentElement.scrollWidth ≤ window.innerWidth
- `C-4 [tablet-lg]: Section container fits viewport width` — at 1280w, section offsetWidth ≤ 1280
- `C-5 [tablet]: CTA block stacked above cards` — at 768w, `.essential-section__inner` flexDirection = column
- `C-6 [tablet-lg]: CTA block left, cards right in row` — at 1280w, `.essential-section__inner` flexDirection = row
- `C-7 [mobile]: Card count = 3` — at 390w, `.essential-section__card` element count = 3
- `C-8 [desktop]: Card count = 3` — at 1440w, `.essential-section__card` element count = 3

## D — Live screenshots (mobile 390 + desktop 1440) — pipeline-executed

**Test series:**
- `D-1: Save mobile live screenshot` — capture `qa/live-mobile.png` (390×844 viewport, scoped to `[data-section-type="essential-section"]`)
- `D-2: Save desktop live screenshot` — capture `qa/live-desktop.png` (1440×900 viewport, scoped to `[data-section-type="essential-section"]`)

Both via `saveScreenshot(page, SECTION_SELECTOR, 'essential-section', 'live-<project>')`.

## E — Content placement (mobile 390 + desktop 1440) — manual-debug

**Test series:**
- `E-1 [mobile]: Button appears below description at mobile` — `.essential-section__header` offsetHeight > 100px (stacked, not inline)
- `E-2 [desktop]: CTA block is left column at desktop` — `.essential-section__header` offsetWidth ≤ 305px
- `E-3 [mobile]: Cards carousel visible with 2.x cards per viewport` — `.essential-section__carousel` offsetWidth ≈ 358px (full-width minus padding)
- `E-4 [desktop]: Cards row has 3 cards side-by-side` — `.swiper-slide:nth-child(1) .essential-section__card` + `:nth-child(2)` + `:nth-child(3)` all visible, no wrap
- `E-5 [mobile]: Carousel arrows hidden on mobile` — `.carousel__nav-button--prev` + `.carousel__nav-button--next` display = none
- `E-6 [desktop]: Carousel arrows visible (or auto-disabled if 3 cards lock boundaries)` — arrows have `display: flex` OR `display: block` (not none)
- `E-7 [mobile]: Card width approximately 265px` — `.swiper-slide .essential-section__card` offsetWidth ≈ 265 (±5)
- `E-8 [desktop]: Card width approximately 306px` — `.swiper-slide .essential-section__card` offsetWidth ≈ 306 (±5)
- `E-9 [mobile]: Inner container full-width` — `.essential-section__inner` offsetWidth ≤ 390
- `E-10 [desktop]: Inner container max-width 1340px` — `.essential-section__inner` offsetWidth ≤ 1340

## Design content reference

**Section copy (from figma-context.md):**
- Heading: `HVAC Essentials`
- Description: `Understand efficiency standards, incentives, and new refrigerant changes so you can make a confident, informed HVAC purchase.`
- Button label: `Learn More`

**Cards (3 preset, from figma-context.md §Copy):**

| Card | Title | Body | Link Label |
|---|---|---|---|
| 1 | `What is SEER2?` | `Learn how SEER2 ratings affect energy efficiency, performance, and your long-term energy costs.` | `Learn More` |
| 2 | `HVAC Rebates` | `See what local incentives may be available when upgrading to high-efficiency systems.` | `Learn More` |
| 3 | `New Refrigerant Updates` | `Understand the transition to R32 and R454B refrigerants and what it means for your system.` | `Learn More` |

## Test runner checklist

- `yarn playwright:test features/essential-section/essential-section.spec.js --reporter=list`
- Live screenshots: `features/essential-section/qa/live-mobile.png` + `qa/live-desktop.png`
- A11y JSON: `features/essential-section/qa/a11y-mobile.json`, `qa/a11y-tablet.json`, `qa/a11y-tablet-lg.json`, `qa/a11y-desktop.json`
- `maxFailures: 1` ensures A-1 gate fails fast before D-group incomplete screenshots

## Questions

None at this time. Brief and figma-context fully specified DOM, typography, colors, spacing, and all variants.
