# brief.md — payment-banner

## Intent
Decorative marketing section for page template. Intro (H2 + subhead) above two structurally-distinct promo cards: Card 1 "Member Pricing Unlocked" with composite bg image + text overlay, Card 2 "Flexible Financing" with cyan inner + decorative vertical bars + white logos panel on desktop, full-cover merchant bg image on mobile. Section stands alone — no merchandising data, no cross-section contracts.

## Design reference
- Canonical values: `features/payment-banner/figma-context.md` (do NOT duplicate values here)
- Desktop PNG: `features/payment-banner/qa/figma-desktop.png` (1440w)
- Mobile PNG: `features/payment-banner/qa/figma-mobile.png` (390w)
- Nodes: desktop `5654:6312`, mobile `5654:53417` (file key `g3gxO3mhrniJOYTHNmotAu`)
- **Divergence: HIGH** — DOM + visual treatment differ per card. Dual-DOM per card at `md:` (1024). Ui-agent must build desktop + mobile as separate snippets; toggle via `tw-hidden md:tw-block` / `md:tw-hidden` on wrappers (mirrors `promo-test.liquid` precedent).

## Schema plan
Flat section settings. No blocks — two cards are structurally different and fixed (not merchant-reorderable / not repeatable).

| ID | Type | Label | Notes |
|---|---|---|---|
| `heading` | text | Section Heading | H2, default `Easy Monthly Payments` |
| `subheading` | textarea | Section Subheading | default per figma-context Copy table; supports newline |
| `card_1_eyebrow` | text | Card 1 Eyebrow (desktop only) | default `MEMBER PRICING UNLOCKED`; blank hides |
| `card_1_title` | text | Card 1 Title | default `Prices Too Low to Show Publicly` |
| `card_1_body` | textarea | Card 1 Body | default per figma-context |
| `card_1_cta_label` | text | Card 1 CTA Label | default `Learn More` |
| `card_1_cta_link` | url | Card 1 CTA Link | blank → render as non-interactive `<div>` |
| `card_1_desktop_bg_image` | image_picker | Card 1 Desktop Background | composite (product + callout + decorative SVG baked in by merchant) |
| `card_1_mobile_bg_image` | image_picker | Card 1 Mobile Background | composite mobile variant |
| `card_2_title` | text | Card 2 Title | default `Flexible Payments, Made Easy` |
| `card_2_body` | textarea | Card 2 Body | default per figma-context |
| `card_2_cta_label` | text | Card 2 CTA Label | default `Learn More` |
| `card_2_cta_link` | url | Card 2 CTA Link | blank → render as non-interactive `<div>` |
| `card_2_logos_image` | image_picker | Card 2 Partner Logos (desktop only) | renders inside white panel bottom-left of desktop card 2; blank → hide panel OR render empty panel (ui-agent decides) |
| `card_2_mobile_bg_image` | image_picker | Card 2 Mobile Full-Cover Background | mobile-only full-card bg image |

Inline decorations NOT in schema (hard-coded visual treatment of desktop card 2):
- Cyan inner layer `#6bc4e8`
- Vertical bars `#0033a1` + `#f75200` (decorative)
- White logos panel chrome (border + bottom-left radius 8)

## File plan

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/payment-banner.liquid` | Section entry: intro + dual-DOM wrappers per card + schema + section-scoped `<style>` |
| CREATE | `snippets/payment-banner-card-1-desktop.liquid` | Card 1 desktop: composite bg image + absolute-positioned text overlay (eyebrow + title + body + pill CTA, height 48) |
| CREATE | `snippets/payment-banner-card-1-mobile.liquid` | Card 1 mobile: composite bg image + text overlay (no eyebrow, title + body + pill CTA height 48) |
| CREATE | `snippets/payment-banner-card-2-desktop.liquid` | Card 2 desktop: cyan inner + decorative bars + white logos panel + absolute-positioned text overlay (title + body + pill CTA height 38) |
| CREATE | `snippets/payment-banner-card-2-mobile.liquid` | Card 2 mobile: full-cover merchant bg image + text overlay (title + body + pill CTA height 48) |
| APPEND | `templates/page.test.json` | Add `payment-banner` section to existing shared page test template (alongside `collection-grid-test`, `promo-test`); also append to `order` array |
| REUSE | `snippets/shopify-responsive-image.liquid` | Responsive image rendering with srcset + lazyload for all 4 image_picker fields |
| SKIP | `js/sections/payment-banner.js` | JS=NO (see JavaScript decision) |
| SKIP | `scss/sections/payment-banner.scss` | Section-scoped `<style>` block inline in liquid (mirrors `promo-test` precedent); escalate to SCSS only if ui-agent hits a limitation |

## Reuse scan

| Candidate | Fit | Recommendation |
|---|---|---|
| `sections/promo-test.liquid` | Structural precedent: intro block with dual-subhead, scoped `<style>` for cross-breakpoint bg overrides, section wrapper + inner max-width, schema shape. | REFERENCE pattern — do not render, but mirror structure |
| `snippets/promo-test-card-desktop.liquid` | Precedent for: anchor/div fallback when `cta_link == blank`, `role="presentation"` branch, focus-visible ring (`focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]`), absolute text overlay over image, inline `<span>` pill CTA (not nested anchor), composite image via `shopify-responsive-image` with `image_aspect_ratio` float. | MIRROR pattern for all 4 card snippets |
| `snippets/promo-test-card-mobile.liquid` | Precedent for mobile card content pattern (text + pill). | MIRROR for card 1 mobile (text-overlay variant differs — card 1 mobile uses overlay, not image-above-text) |
| `snippets/shopify-responsive-image.liquid` | Takes `image`, `image_id`, `image_aspect_ratio` (float), `image_alt`, `image_class`, `wrapper_class`, `crop: true`. Handles srcset + lazyload. | REUSE for all 4 image_picker fields (`card_1_desktop_bg_image`, `card_1_mobile_bg_image`, `card_2_logos_image`, `card_2_mobile_bg_image`) |
| `snippets/image.liquid` | Full/icon layout wrapper; already uses `tw-hidden md:tw-block` / `tw-block md:tw-hidden` dual-DOM pattern with `shopify-responsive-image` inside. | NOT IDEAL here — we need absolute-positioned text overlays; `image.liquid` produces a div-only structure without the overlay scaffolding. Use `shopify-responsive-image` directly inside our card snippets instead. |
| `sections/hero-banner.liquid` | Precedent for inline-style-scoped approach (already read via main context). | REFERENCE if ui-agent needs additional scoped-style idioms |
| `snippets/button.liquid` | Potentially produces anchor markup. | REJECT — CTAs are inline `<span>` pills inside the card `<a>` to avoid nested anchors (matches `promo-test` card precedent) |
| `snippets/heading.liquid` / `subheading.liquid` | Generic heading components. | REJECT — bespoke sizes (48/52.8, 28/33.6) + specific color per breakpoint don't match these helpers; inline Tailwind is cleaner |

## Variants

| Variant | Trigger | Behavior |
|---|---|---|
| Default | all fields populated, both cta_links present | Renders anchors; all copy + images shown |
| Blank eyebrow | `card_1_eyebrow == blank` | Eyebrow `<p>` omitted on desktop; mobile unaffected (never renders) |
| Blank cta_link | `card_X_cta_link == blank` | Card wrapper renders as `<div role="presentation">` instead of `<a>`; pill still renders as inline `<span>` for visual parity |
| Blank cta_label | `card_X_cta_label == blank` | Pill `<span>` omitted; card remains clickable if link present |
| Blank card_1 image_pickers | either desktop or mobile composite blank | Fallback solid `#f2f0f1` (card-1 bg from figma) with overlay content still rendered; ui-agent decides exact fallback markup |
| Blank card_2 logos_image | desktop only | Logos panel chrome still renders (border + radius) with empty interior — or panel hides entirely; ui-agent decides |
| Blank card_2 mobile bg | mobile only | Fallback solid cyan `#6bc4e8` (matching desktop inner) with overlay content still rendered |

## A11y
- **Mode: skip** (decorative marketing section; manual baseline only — no axe gate)
- Baseline:
  - `<h2>` for section heading; `<h3>` for each card title
  - Eyebrow rendered as `<p>` or `<span>` (NOT a heading — it's a label above the H3)
  - Single `<a>` per card wrapping full card content (when `cta_link` present); otherwise `<div role="presentation">`
  - Inline `<span>` pill CTA inside card anchor (never nested `<a>`)
  - `aria-label` on card anchor = card title (`block.settings.cardX_title | escape`)
  - Decorative SVG bars + logos panel chrome + gradient overlays marked `aria-hidden="true"`
  - Partner logos image requires meaningful `alt` (e.g. merchant-uploaded alt OR fallback "Financing partner logos")
  - Composite bg images treated as decorative (`alt=""`) when text is rendered in DOM as overlay — all critical copy is in liquid text nodes, not baked into the image. Ui-agent confirms.
  - Focus-visible ring on card anchors: 2px offset, color `#027db3` (matches promo-test precedent)
  - Color contrast baseline checks: `#f4f6f8` on `#027db3` (card 1 CTA), `#000` on `#f4f6f8` (card 2 CTA), `#fff` on cyan `#6bc4e8` (card 2 mobile title needs visual QA verification since cyan+white borderline)

## JavaScript decision
**NO** — section is fully static:
- No state machine, no interactive toggles
- Two anchor CTAs are native link navigation
- No fetch, no API, no client-side data
- No cross-section events
- No animations beyond CSS-native hover/focus

Skip `js/sections/payment-banner.js`. Test-agent skips functional + integration specs; only UI spec.

## Copy
Reference `features/payment-banner/figma-context.md` "Copy table" section. Do NOT duplicate here. Test-agent sources ground-truth strings from that table.

## Success criteria
- Visual match to Figma at both breakpoints (pixelmatch threshold TBD by visual-qa-agent)
- Schema editable in theme customizer — merchant can override every heading, body, CTA label, CTA link, and image
- `card_X_cta_link` blank → renders non-interactive `<div role="presentation">` (anchor NOT rendered with empty `href`)
- `card_1_eyebrow` blank → eyebrow `<p>` omitted from desktop DOM
- Dual-DOM swap clean at `md:` (1024px) — desktop snippet + mobile snippet never both visible; no layout shift at breakpoint boundary
- Copy matches figma-context Copy table exactly (spacing, punctuation, newlines)
- DM Sans applied globally (from theme); no local font load required
- Section passes `shopify-dev-mcp.validate_theme` (main-invoked after ui-agent)

## Constraints
- Template: `page` (standalone — not embedded in product/collection)
- Render context: section (theme editor, merchant-draggable)
- No cross-section events — isolated
- DM Sans assumed globally loaded from theme font stack (confirm with ui-agent; no `font_picker` setting)
- Decorative color bars (`#0033a1`, `#f75200`) on desktop card 2 are NOT merchant-editable — they're brand-fixed visual treatment
- Cyan inner `#6bc4e8` on desktop card 2 is NOT merchant-editable
- Partner logos panel chrome (border, radius, dimensions) NOT merchant-editable — only the logos image is merchant-uploaded
- Assumption: merchant uploads composite images (card 1 desktop+mobile + card 2 mobile) with product + callout + decorative SVG baked in — we do NOT render separate product/callout layers
- Assumption: section-scoped inline `<style>` is sufficient; ui-agent escalates to `scss/sections/payment-banner.scss` ONLY if Tailwind + inline style cannot express a required CSS rule

---

## As-built DOM

### Desktop (md: 1024px+)

```html
<section class="payment-banner ..." data-section-type="payment-banner" data-section-id="...">
  <div class="payment-banner__inner tw-max-w-[1340px] tw-mx-auto tw-flex tw-flex-col tw-gap-[24px]">

    <!-- Intro -->
    <div class="payment-banner__intro tw-flex tw-flex-col tw-gap-[8px] md:tw-gap-[12px] md:tw-max-w-[591px]">
      <h2 class="payment-banner__heading ...">Easy Monthly Payments</h2>
      <p class="payment-banner__subhead ...">Affordable monthly payments made simple.<br>Get instant...</p>
    </div>

    <!-- Card row -->
    <div class="payment-banner__card-row tw-flex tw-flex-col tw-gap-[20px] tw-items-center md:tw-flex-row md:tw-gap-[30px] md:tw-items-start">

      <!-- Card 1 desktop wrapper (visible md:+) -->
      <div class="payment-banner__card-1-wrap tw-hidden md:tw-block">
        <!-- snippets/payment-banner-card-1-desktop.liquid -->
        <a class="payment-banner-card-1 payment-banner-card-1--desktop tw-relative tw-overflow-hidden tw-rounded-2xl tw-block tw-w-[920px] tw-h-[573px] tw-bg-[#f2f0f1] ..." aria-label="Prices Too Low...">
          <!-- shopify-responsive-image (absolute fill, decorative alt="") -->
          <div class="payment-banner-card-1__content tw-absolute tw-left-[40px] tw-top-[40px] tw-w-[420px] tw-flex tw-flex-col tw-gap-[32px]">
            <div class="payment-banner-card-1__text tw-flex tw-flex-col tw-gap-[16px]">
              <p class="payment-banner-card-1__eyebrow ...">MEMBER PRICING UNLOCKED</p>  <!-- omitted if blank -->
              <h3 class="payment-banner-card-1__title tw-w-[411px] ...">Prices Too Low to Show Publicly</h3>
              <p class="payment-banner-card-1__body ...">Due to manufacturer...</p>
            </div>
            <span class="payment-banner-card-1__cta ...">Learn More</span>
          </div>
        </a>
      </div>

      <!-- Card 1 mobile wrapper (hidden md:+) -->
      <div class="payment-banner__card-1-wrap--mobile md:tw-hidden">
        <!-- snippets/payment-banner-card-1-mobile.liquid — not rendered desktop -->
      </div>

      <!-- Card 2 desktop wrapper (visible md:+) -->
      <div class="payment-banner__card-2-wrap tw-hidden md:tw-block">
        <!-- snippets/payment-banner-card-2-desktop.liquid -->
        <a class="payment-banner-card-2 payment-banner-card-2--desktop tw-relative tw-overflow-hidden tw-rounded-2xl tw-block tw-w-[390px] tw-h-[573px] ..." aria-label="Flexible Payments...">
          <div class="payment-banner-card-2__cyan tw-absolute tw-inset-0 tw-bg-[#6bc4e8]" aria-hidden="true"></div>
          <div class="payment-banner-card-2__bar-blue tw-absolute tw-top-0 tw-left-[369px] tw-w-[21px] tw-h-[400px] tw-bg-[#0033a1]" aria-hidden="true"></div>
          <div class="payment-banner-card-2__bar-orange tw-absolute tw-top-[400px] tw-left-[369px] tw-w-[21px] tw-h-[178px] tw-bg-[#f75200]" aria-hidden="true"></div>
          <div class="payment-banner-card-2__logos-panel tw-absolute tw-left-0 tw-top-[400px] tw-w-[369px] tw-h-[173px] tw-bg-white tw-border tw-border-[#6bc4e8] tw-rounded-bl-lg tw-overflow-hidden tw-flex tw-items-center tw-justify-center" aria-hidden="true">
            <!-- shopify-responsive-image logos at 298×79 (if logos_image present) -->
          </div>
          <div class="payment-banner-card-2__content tw-absolute tw-left-[40px] tw-top-[40px] tw-w-[300px] tw-flex tw-flex-col tw-gap-[32px]">
            <div class="payment-banner-card-2__text tw-flex tw-flex-col tw-gap-[12px]">
              <h3 class="payment-banner-card-2__title ...">Flexible Payments, Made Easy</h3>
              <p class="payment-banner-card-2__body ...">Get approved for...</p>
            </div>
            <span class="payment-banner-card-2__cta tw-h-[38px] ...">Learn More</span>
          </div>
        </a>
      </div>

      <!-- Card 2 mobile wrapper (hidden md:+) -->
      <div class="payment-banner__card-2-wrap--mobile md:tw-hidden">
        <!-- snippets/payment-banner-card-2-mobile.liquid — not rendered desktop -->
      </div>

    </div>
  </div>
</section>
```

### Mobile (base, below md: 1024px)
Card 1 mobile snippet: `tw-w-[358px] tw-h-[409px] tw-rounded-lg` — overlay anchored bottom-left (bottom-30/left-20), no eyebrow, body font-semibold text-[#515151].
Card 2 mobile snippet: `tw-w-[370px] tw-h-[409px] tw-rounded-lg` — cyan fallback bg, overlay anchored bottom-left, white text, pill h-48.

---

## Selector catalogue

| Selector | Element | Purpose |
|---|---|---|
| `[data-section-type="payment-banner"]` | `<section>` | Section root / JS mount |
| `.payment-banner__inner` | `<div>` | Max-width centering container |
| `.payment-banner__intro` | `<div>` | Intro text group |
| `.payment-banner__heading` | `<h2>` | Section heading |
| `.payment-banner__subhead` | `<p>` | Section subheading |
| `.payment-banner__card-row` | `<div>` | Card flex row |
| `.payment-banner__card-1-wrap` | `<div>` | Desktop card 1 wrapper (tw-hidden md:tw-block) |
| `.payment-banner__card-1-wrap--mobile` | `<div>` | Mobile card 1 wrapper (md:tw-hidden) |
| `.payment-banner__card-2-wrap` | `<div>` | Desktop card 2 wrapper (tw-hidden md:tw-block) |
| `.payment-banner__card-2-wrap--mobile` | `<div>` | Mobile card 2 wrapper (md:tw-hidden) |
| `.payment-banner-card-1` | `<a>` or `<div>` | Card 1 root |
| `.payment-banner-card-1--desktop` | `<a>` or `<div>` | Card 1 desktop variant |
| `.payment-banner-card-1--mobile` | `<a>` or `<div>` | Card 1 mobile variant |
| `.payment-banner-card-1__content` | `<div>` | Card 1 text overlay container |
| `.payment-banner-card-1__text` | `<div>` | Card 1 text stack |
| `.payment-banner-card-1__eyebrow` | `<p>` | Card 1 eyebrow label (desktop only, conditional) |
| `.payment-banner-card-1__title` | `<h3>` | Card 1 heading |
| `.payment-banner-card-1__body` | `<p>` | Card 1 body copy |
| `.payment-banner-card-1__cta` | `<span>` | Card 1 pill CTA |
| `.payment-banner-card-2` | `<a>` or `<div>` | Card 2 root |
| `.payment-banner-card-2--desktop` | `<a>` or `<div>` | Card 2 desktop variant |
| `.payment-banner-card-2--mobile` | `<a>` or `<div>` | Card 2 mobile variant |
| `.payment-banner-card-2__cyan` | `<div>` | Card 2 cyan bg layer (aria-hidden) |
| `.payment-banner-card-2__bar-blue` | `<div>` | Card 2 dark-blue decorative bar (aria-hidden) |
| `.payment-banner-card-2__bar-orange` | `<div>` | Card 2 orange decorative bar (aria-hidden) |
| `.payment-banner-card-2__logos-panel` | `<div>` | Card 2 white logos panel (aria-hidden) |
| `.payment-banner-card-2__content` | `<div>` | Card 2 text overlay container |
| `.payment-banner-card-2__text` | `<div>` | Card 2 text stack |
| `.payment-banner-card-2__title` | `<h3>` | Card 2 heading |
| `.payment-banner-card-2__body` | `<p>` | Card 2 body copy |
| `.payment-banner-card-2__cta` | `<span>` | Card 2 pill CTA |

---

## Data attributes

| Attribute | Element | Values | Meaning | Set by |
|---|---|---|---|---|
| `data-section-type` | `<section>` | `"payment-banner"` | Section identity / JS mount selector | Liquid (static) |
| `data-section-id` | `<section>` | Shopify section ID | Instance isolation | Liquid (static) |

No JS-dynamic `data-state` attributes. Section is fully static.

---

## Schema settings (final)

### Section settings
| ID | Type | Default | Purpose |
|---|---|---|---|
| `heading` | text | `Easy Monthly Payments` | H2 section heading |
| `subheading` | textarea | `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` | Section subheading (supports newline_to_br) |
| `card_1_eyebrow` | text | `MEMBER PRICING UNLOCKED` | Desktop-only eyebrow; blank = omit |
| `card_1_title` | text | `Prices Too Low to Show Publicly` | Card 1 H3 |
| `card_1_body` | textarea | `Due to manufacturer restrictions...` | Card 1 body |
| `card_1_cta_label` | text | `Learn More` | Card 1 pill label; blank = omit pill |
| `card_1_cta_link` | url | `/collections/all` | Card 1 link; blank = div role="presentation" |
| `card_1_desktop_bg_image` | image_picker | — | Card 1 desktop composite bg (decorative) |
| `card_1_mobile_bg_image` | image_picker | — | Card 1 mobile composite bg (decorative) |
| `card_2_title` | text | `Flexible Payments, Made Easy` | Card 2 H3 |
| `card_2_body` | textarea | `Get approved for lease-to-own...` | Card 2 body |
| `card_2_cta_label` | text | `Learn More` | Card 2 pill label; blank = omit pill |
| `card_2_cta_link` | url | `/collections/all` | Card 2 link; blank = div role="presentation" |
| `card_2_logos_image` | image_picker | — | Card 2 partner logos (desktop logos panel only) |
| `card_2_mobile_bg_image` | image_picker | — | Card 2 mobile full-cover bg (decorative) |

### Schema settings the test template must populate
| Setting ID | Type | Recommended test value |
|---|---|---|
| `heading` | text | `Easy Monthly Payments` |
| `subheading` | textarea | `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` |
| `card_1_eyebrow` | text | `MEMBER PRICING UNLOCKED` |
| `card_1_title` | text | `Prices Too Low to Show Publicly` |
| `card_1_body` | textarea | `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` |
| `card_1_cta_label` | text | `Learn More` |
| `card_1_cta_link` | url | `/collections/all` |
| `card_2_title` | text | `Flexible Payments, Made Easy` |
| `card_2_body` | textarea | `Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options.` |
| `card_2_cta_label` | text | `Learn More` |
| `card_2_cta_link` | url | `/collections/all` |

---

## CSS custom properties

None. All tokens expressed as Tailwind arbitrary values; no CSS custom properties authored in this section.

---

## Figma variants implemented

| Variant | Implementation |
|---|---|
| Default (all fields populated) | Full anchors, all copy, pill CTAs rendered |
| Blank eyebrow (`card_1_eyebrow == blank`) | `{%- if card_1_eyebrow != blank -%}` gate — eyebrow `<p>` omitted from desktop DOM |
| Blank cta_link | `{%- if cta_link != blank -%}` → renders `<div role="presentation">` instead of `<a>` |
| Blank cta_label | `{%- if cta_label != blank -%}` gate — pill `<span>` omitted |
| Blank card_1 bg image | Fallback `<div class="tw-absolute tw-inset-0 tw-bg-[#f2f0f1]">` — outer bg color provides same appearance |
| Blank card_2 logos_image | Logos panel chrome (border + radius) still renders; interior empty |
| Blank card_2 mobile bg | Outer `tw-bg-[#6bc4e8]` provides solid cyan fallback (no image rendered) |
| Dual-DOM breakpoint toggle | `tw-hidden md:tw-block` / `md:tw-hidden` on wrapper divs — never both visible |

---

## Figma variants NOT implemented

None — all brief variants implemented.

---

## DEVIATIONS

- Content overlay on mobile cards anchored bottom-left (`tw-absolute tw-left-[20px] tw-bottom-[30px]`) rather than top-left — Figma mobile shows text stacked at bottom of card where image pushes content down; this ensures content stays in viewport at fixed card height.
- Card widths rounded to integer px (`tw-w-[358px]`, `tw-w-[370px]`) from Figma's sub-pixel values (358.4, 370.4) — sub-pixel CSS widths have no rendering effect.
- Card heights rounded to integer px (`tw-h-[409px]`) from Figma's 408.89 — same rationale.
- Card 1 mobile pill `px-[32px]` used (Figma: 31.8px, rounded to nearest integer for CSS clarity).
- Card 2 mobile pill `px-[32px]` used (Figma: 31.8px, same rationale).
- No inline `<style>` block required — all visual treatment expressible via Tailwind arbitrary values (including decorative bars via absolute positioning with Tailwind utilities). SCSS skipped per brief.

---

## JS handoff

**Section JS: NONE.** Section is fully static. All interactivity via native `<a>` anchor navigation. No custom elements, no event contracts, no fetches, no state machine. test-agent: no functional or integration specs needed (brief §JavaScript decision = NO).
