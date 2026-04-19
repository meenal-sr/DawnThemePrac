# payment-banner — Test Scenarios

Relevant authoring rules:
- Four projects: mobile 390 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: skip — not required per brief §5.
- yarn playwright:test ... --reporter=list.

---

## Section under test
- Type: `page`
- URL helper: `sectionTestUrl('page')`
- Template: `templates/page.test.json`
- Section selector: `[data-section-type="payment-banner"]`
- Section root BEM: `.payment-banner`

---

## Required template content

A-1 assertion validates these keys are populated in `templates/page.test.json → sections.payment-banner.settings`:
- `heading` (text, non-blank)
- `subheading` (textarea, non-blank)
- `card_1_title` (text, non-blank)
- `card_1_body` (textarea, non-blank)
- `card_1_cta_label` (text, non-blank)
- `card_1_cta_link` (url, non-blank)
- `card_2_title` (text, non-blank)
- `card_2_body` (textarea, non-blank)
- `card_2_cta_label` (text, non-blank)
- `card_2_cta_link` (url, non-blank)

Optional image_pickers left blank intentionally to exercise fallback behavior (cyan #6bc4e8 for card-2 mobile, beige #f2f0f1 for card-1).

---

## A — Content completeness

Single assertion: template has non-blank values for every key in "Required template content" above.

---

## B — Typography + color parity (mobile + desktop)

### B-1 [mobile]: Intro heading typography
- Selector: `.payment-banner__heading`
- Font-size: 28px
- Line-height: 33.6px
- Font-weight: bold (700)
- Color: #000000
- Margin: 0

### B-2 [mobile]: Intro subhead typography
- Selector: `.payment-banner__subhead`
- Font-size: 15px
- Line-height: 24px
- Font-weight: normal (400)
- Color: #515151
- Margin: 0

### B-3 [desktop]: Intro heading typography
- Project: desktop 1440
- Selector: `.payment-banner__heading`
- Font-size: 48px
- Line-height: 52.8px
- Font-weight: bold (700)
- Color: #0b1e3d
- Margin: 0

### B-4 [desktop]: Intro subhead typography
- Project: desktop 1440
- Selector: `.payment-banner__subhead`
- Font-size: 16px
- Line-height: 20px
- Font-weight: 500 (medium)
- Color: #666
- Margin: 0

### B-5 [mobile]: Card 1 title typography
- Selector: `.payment-banner-card-1-mobile__title`
- Font-size: 28px
- Line-height: 33.6px
- Font-weight: bold (700)
- Color: #000000
- Margin: 0

### B-6 [mobile]: Card 1 body typography
- Selector: `.payment-banner-card-1-mobile__body`
- Font-size: 15px
- Line-height: 24px
- Font-weight: 600 (semibold)
- Color: #515151
- Margin: 0

### B-7 [mobile]: Card 1 CTA label typography
- Selector: `.payment-banner-card-1-mobile__cta`
- Font-size: 15px
- Line-height: 30px
- Font-weight: bold (700)
- Color: #ffffff (white)
- Background: #027db3
- Height: 48px

### B-8 [desktop]: Card 1 eyebrow typography (desktop only)
- Project: desktop 1440
- Selector: `.payment-banner-card-1-desktop__eyebrow`
- Font-size: 13px
- Line-height: 20px
- Font-weight: bold (700)
- Color: #000000
- Text-transform: uppercase
- Margin: 0

### B-9 [desktop]: Card 1 title typography
- Project: desktop 1440
- Selector: `.payment-banner-card-1-desktop__title`
- Font-size: 48px
- Line-height: 52.3px
- Font-weight: bold (700)
- Color: #0b1e3d
- Margin: 0

### B-10 [desktop]: Card 1 body typography
- Project: desktop 1440
- Selector: `.payment-banner-card-1-desktop__body`
- Font-size: 16px
- Line-height: 20px
- Font-weight: normal (400)
- Color: #666
- Margin: 0

### B-11 [desktop]: Card 1 CTA label typography
- Project: desktop 1440
- Selector: `.payment-banner-card-1-desktop__cta`
- Font-size: 16px
- Line-height: 28px
- Font-weight: bold (700)
- Color: #f4f6f8
- Background: #027db3
- Border: 1px solid #f4f6f8
- Height: 48px

### B-12 [mobile]: Card 2 title typography
- Selector: `.payment-banner-card-2-mobile__title`
- Font-size: 28px
- Line-height: 33.6px
- Font-weight: bold (700)
- Color: #ffffff
- Margin: 0

### B-13 [mobile]: Card 2 body typography
- Selector: `.payment-banner-card-2-mobile__body`
- Font-size: 15px
- Line-height: 24px
- Font-weight: 600 (semibold)
- Color: #ffffff
- Margin: 0

### B-14 [mobile]: Card 2 CTA label typography
- Selector: `.payment-banner-card-2-mobile__cta`
- Font-size: 15px
- Line-height: 30px
- Font-weight: bold (700)
- Color: #000000
- Background: #f4f6f8
- Height: 48px

### B-15 [desktop]: Card 2 title typography
- Project: desktop 1440
- Selector: `.payment-banner-card-2-desktop__title`
- Font-size: 48px
- Line-height: 52.3px
- Font-weight: bold (700)
- Color: #f4f6f8
- Margin: 0

### B-16 [desktop]: Card 2 body typography
- Project: desktop 1440
- Selector: `.payment-banner-card-2-desktop__body`
- Font-size: 16px
- Line-height: 20px
- Font-weight: normal (400)
- Color: #f4f6f8
- Margin: 0

### B-17 [desktop]: Card 2 CTA label typography
- Project: desktop 1440
- Selector: `.payment-banner-card-2-desktop__cta`
- Font-size: 16px
- Line-height: 28px
- Font-weight: bold (700)
- Color: #000000
- Background: #f4f6f8
- Border: 1px solid #f4f6f8
- Height: 38px

---

## C — Layout integrity (tablet 768 + tablet-lg 1280)

NOTE: Section is designed for 390px (mobile) and 1440px (desktop). Intermediate breakpoints (768, 1280) are not design targets. Cards use fixed pixel widths that may overflow at these intermediate viewports. Structural assertions focus on dual-DOM toggle behavior.

### C-1 [tablet]: Dual-DOM state (mobile card 1 still visible)
- Project: tablet 768
- At this breakpoint, `md:` (1024px) breakpoint not yet reached
- `.payment-banner-card-1-mobile` should be visible (display computed !== 'none')
- `.payment-banner-card-1-desktop` should be hidden (display computed === 'none')

### C-2 [tablet-lg]: Dual-DOM state (desktop card 1 visible)
- Project: tablet-lg 1280
- At this breakpoint, `md:` (1024px) breakpoint is active
- `.payment-banner-card-1-mobile` should be hidden (display computed === 'none')
- `.payment-banner-card-1-desktop` should be visible (display computed !== 'none')

---

## D — Live screenshots (mobile + desktop)

### D-1: Save mobile live screenshot
- Project: mobile 390
- Selector: `[data-section-type="payment-banner"]`
- Filename: `live-mobile.png`
- Via `saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-mobile')`

### D-2: Save desktop live screenshot
- Project: desktop 1440
- Selector: `[data-section-type="payment-banner"]`
- Filename: `live-desktop.png`
- Via `saveScreenshot(page, SECTION_SELECTOR, SECTION, 'live-desktop')`

---

## E — Content placement parity (mobile + desktop)

### E-1 [desktop]: Card 1 eyebrow is visible (exists in desktop DOM)
- Project: desktop 1440
- Selector: `.payment-banner-card-1-desktop__eyebrow`
- Assert element is visible (getComputedStyle.display !== 'none')

### E-2 [mobile]: Card 1 eyebrow is not in mobile DOM
- Project: mobile 390
- Query `.payment-banner-card-1-mobile__eyebrow`
- Assert no element found (mobile snippet does not include eyebrow)

### E-3 [desktop]: Card 1 content container fits within card boundary
- Project: desktop 1440
- Selector: `.payment-banner-card-1-desktop`
- Assert `el.offsetWidth` === 920 (fixed desktop width per design)
- Assert `el.offsetHeight` === 573 (fixed desktop height per design)

### E-4 [mobile]: Card 1 content container height constrained
- Project: mobile 390
- Selector: `.payment-banner-card-1-mobile`
- Assert `el.offsetHeight` > 0 (content drives height, not fixed)

### E-5 [desktop]: Card 2 content container fits within card boundary
- Project: desktop 1440
- Selector: `.payment-banner-card-2-desktop`
- Assert `el.offsetWidth` === 390 (fixed desktop width per design)
- Assert `el.offsetHeight` === 573 (fixed desktop height per design)

### E-6 [mobile]: Card 2 content container height constrained
- Project: mobile 390
- Selector: `.payment-banner-card-2-mobile`
- Assert `el.offsetHeight` > 0 (content drives height)

### E-7 [desktop]: Section padding matches design spec
- Project: desktop 1440
- Selector: `[data-section-type="payment-banner"]`
- Compute getComputedStyle for padding-top, padding-bottom, padding-left
- Assert padding-top ≈ 60px
- Assert padding-bottom ≈ 40px
- Assert padding-left ≈ 50px
- Assert padding-right ≈ 50px

### E-8 [mobile]: Section padding matches design spec
- Project: mobile 390
- Selector: `[data-section-type="payment-banner"]`
- Assert padding-top ≈ 30px
- Assert padding-left ≈ 16px
- Assert padding-right ≈ 16px

---

## Design content reference

From `figma-context.md`:

| Field | Value |
|---|---|
| `heading` | `Easy Monthly Payments` |
| `subheading` | `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` |
| `card_1_eyebrow` | `MEMBER PRICING UNLOCKED` |
| `card_1_title` | `Prices Too Low to Show Publicly` |
| `card_1_body` | `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` |
| `card_1_cta_label` | `Learn More` |
| `card_2_title` | `Flexible Payments, Made Easy` |
| `card_2_body` | `Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options.` |
| `card_2_cta_label` | `Learn More` |

---

## Test runner checklist

- yarn playwright:test features/payment-banner/payment-banner.spec.js --reporter=list
- live-mobile.png + live-desktop.png produced in features/payment-banner/qa/
- a11y-skipped.marker produced in features/payment-banner/qa/
- maxFailures: 1 active in playwright.config.js

---

## Questions

None. All design values extracted from figma-context.md. Dual-DOM toggle confirmed per ui-plan.md Phase 2. Desktop card dimensions (920×573, 390×573), mobile card dimensions (358×409, 370×409), section padding, typography / color per breakpoint all confirmed.
