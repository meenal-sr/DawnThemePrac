# payment-banner — Test Scenarios

Relevant authoring rules:
- Four projects: mobile 375 / tablet 768 / tablet-lg 1280 / desktop 1440.
- Strict assertions only at mobile + desktop. tablet + tablet-lg assert layout integrity only.
- Pixelmatch screenshots saved at mobile + desktop only.
- No standalone presence group, no conditional-rendering tests, no console-error observer.
- No content-string assertions — never toHaveText().
- A11y: skip — write `qa/a11y-skipped.marker` at module load, no axe import.
- yarn playwright:test ... --reporter=list.

## Section under test
- Type: `page`
- URL helper: `sectionTestUrl('page')`
- Template: `templates/page.test.json` → section `payment-banner`
- Section selector: `[data-section-type="payment-banner"]`

## Required template content
Test template MUST have non-blank values for:
- `heading`
- `subheading`
- `card_1_title`
- `card_1_body`
- `card_1_cta_label`
- `card_1_cta_link`
- `card_2_title`
- `card_2_body`
- `card_2_cta_label`
- `card_2_cta_link`

Card 1 eyebrow (`card_1_eyebrow`) is optional — blank is valid and exercises the "desktop only" hide path. Image_pickers (`card_1_desktop_bg_image`, `card_1_mobile_bg_image`, `card_2_logos_image`, `card_2_mobile_bg_image`) are intentionally blank to test fallback color rendering.

## A — Content completeness (pipeline-executed)
Single assertion: template has non-blank values for every key in "Required template content" above.

## B — Typography + color parity (manual-debug, mobile + desktop)
### Mobile (375px viewport)
- H2 `.payment-banner__heading`: `28px` font-size, `33.6px` line-height, `bold` weight, `#000` (black) color
- Subhead `.payment-banner__subhead`: `15px` font-size, `24px` line-height, `normal` weight, `#515151` color
- Card 1 title `.payment-banner-card-1__title`: `28px`, `33.6px`, bold, `#000`
- Card 1 body `.payment-banner-card-1__body`: `15px`, `24px`, `600` (semibold) weight, `#515151`
- Card 1 pill CTA `.payment-banner-card-1__cta`: `15px`, `30px`, bold, white `#fff`
- Card 2 title `.payment-banner-card-2__title`: `28px`, `33.6px`, bold, white `#fff`
- Card 2 body `.payment-banner-card-2__body`: `15px`, `24px`, `600` (semibold) weight, white `#fff`
- Card 2 pill CTA `.payment-banner-card-2__cta`: `15px`, `30px`, bold, black `#000`

### Desktop (1440px viewport)
- H2 `.payment-banner__heading`: `48px` font-size, `52.8px` line-height, bold, `#0b1e3d`
- Subhead `.payment-banner__subhead`: `16px`, `20px`, `500` (medium) weight, `#666`
- Card 1 title `.payment-banner-card-1__title`: `48px`, `52.3px`, bold, `#0b1e3d`
- Card 1 body `.payment-banner-card-1__body`: `16px`, `20px`, `400` (normal) weight, `#666`
- Card 1 eyebrow `.payment-banner-card-1__eyebrow` (desktop only): `13px`, `20px`, bold, `#000`, uppercase transform
- Card 1 pill CTA `.payment-banner-card-1__cta`: `16px`, `28px`, bold, `#f4f6f8`
- Card 2 title `.payment-banner-card-2__title`: `48px`, `52.3px`, bold, `#f4f6f8`
- Card 2 body `.payment-banner-card-2__body`: `16px`, `20px`, `400` (normal) weight, `#f4f6f8`
- Card 2 pill CTA `.payment-banner-card-2__cta`: `16px`, `28px`, bold, black `#000`

### Button height delta
- Card 1 CTA pill: mobile `48px` height → desktop `48px` height (consistent)
- Card 2 CTA pill: mobile `48px` height → desktop `38px` height (SMALLER desktop — distinctive)

## C — Layout integrity (manual-debug, tablet + tablet-lg)
### Tablet (768px)
- No horizontal scroll
- Section container + cards fit viewport width (358w card 1 + 20px gap + 370w card 2 + padding = 768 max)
- Mobile card DOM visible (`.payment-banner__card-1-wrap--mobile`, `.payment-banner__card-2-wrap--mobile` computed `display` = block)
- Desktop card DOM hidden (`.payment-banner__card-1-wrap`, `.payment-banner__card-2-wrap` computed `display` = none)

### Tablet-lg (1280px)
- No horizontal scroll
- Section container fits viewport width
- Desktop card DOM visible (computed `display` = block)
- Mobile card DOM hidden (computed `display` = none)

## D — Live screenshots (pipeline-executed, mobile + desktop)
- `live-mobile.png` at 390px viewport via `saveScreenshot(page, SECTION_SELECTOR, 'payment-banner', 'live-mobile')`
- `live-desktop.png` at 1440px viewport via `saveScreenshot(page, SECTION_SELECTOR, 'payment-banner', 'live-desktop')`

## E — Content placement (manual-debug, mobile + desktop)
### Mobile (390px)
- Card 1 eyebrow NOT visible — neither `.payment-banner-card-1__eyebrow` present in DOM nor computed `display: none`. Mobile snippet never renders eyebrow per schema.
- Card 2 decorative bars NOT visible — `.payment-banner-card-2__bar-blue` + `.payment-banner-card-2__bar-orange` + `.payment-banner-card-2__logos-panel` not present in mobile DOM. Mobile snippet full-cover bg image only.
- Card 1 pill height: `48px` (measured via `el.offsetHeight`)
- Card 2 pill height: `48px` (measured via `el.offsetHeight`)
- Section padding: verify computed padding-top/padding-bottom/padding-left/padding-right on section root = `30px` (top), `30px` (bottom), `16px` (left/right)

### Desktop (1440px)
- Card 1 eyebrow visible: `.payment-banner-card-1__eyebrow` computed `display` ≠ none (text visible, uppercase)
- Card 2 decorative bars visible: `.payment-banner-card-2__bar-blue` + `.payment-banner-card-2__bar-orange` + `.payment-banner-card-2__logos-panel` present in DOM
- Card 1 pill height: `48px`
- Card 2 pill height: `38px` (distinctive — smaller than card 1)
- Section padding: computed padding-top/padding-bottom/padding-left/padding-right on section root = `60px` (top), `50px` (bottom), `40px` (left/right)
- Intro max-width: `.payment-banner__intro` computed `max-width` = `591px`

## Design content reference
Sourced from `features/payment-banner/figma-context.md`:
- Heading: `Easy Monthly Payments`
- Subheading: `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.`
- Card 1 eyebrow: `MEMBER PRICING UNLOCKED`
- Card 1 title: `Prices Too Low to Show Publicly`
- Card 1 body: `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.`
- Card 1 CTA label: `Learn More`
- Card 2 title: `Flexible Payments, Made Easy`
- Card 2 body: `Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options.`
- Card 2 CTA label: `Learn More`

## Test runner checklist
- yarn playwright:test features/payment-banner/*.spec.js --grep "^(A-|D-)" --reporter=list
- live-mobile.png + live-desktop.png produced in `features/payment-banner/qa/`
- a11y-skipped.marker produced in `features/payment-banner/qa/`
- maxFailures: 1 active in playwright.config.js

## Questions
None — brief and ui-plan fully specified.
