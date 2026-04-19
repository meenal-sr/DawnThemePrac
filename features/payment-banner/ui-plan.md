# UI Plan — payment-banner

> Single source of truth for this section's UI. Two-phase document — Phase 1 = intent, Phase 2 = as-built + JS handoff.

## Intent (Phase 1)

Decorative two-card marketing section promoting Member Pricing (card 1) and Lease-to-Own Financing (card 2) side-by-side on desktop, stacked on mobile. No JS. All interactivity limited to two native anchor CTAs (one per card). Desktop and mobile diverge at HIGH level — card-2 background flips from cyan+bars+logos-panel to full-cover image, card-1 eyebrow exists only on desktop, CTA heights differ, and typography scales/colors shift — warranting dual-DOM per card toggled at `md:` (1024px). Cards are structurally fixed (not blocks); schema is flat section settings (13 settings). Inline decorative elements (SVG vector, colored bars) are code, not merchant-uploadable assets.

---

## File targets

From `architecture.md`:

| Action | Path | Note |
|---|---|---|
| CREATE | `sections/payment-banner.liquid` | Section wrapper + flat schema + intro + dual-DOM card wrappers |
| CREATE | `snippets/payment-banner-card-1-desktop.liquid` | Card 1 desktop DOM |
| CREATE | `snippets/payment-banner-card-1-mobile.liquid` | Card 1 mobile DOM |
| CREATE | `snippets/payment-banner-card-2-desktop.liquid` | Card 2 desktop DOM |
| CREATE | `snippets/payment-banner-card-2-mobile.liquid` | Card 2 mobile DOM |
| APPEND | `templates/page.test.json` | Add payment-banner section entry |
| SKIP | `js/sections/payment-banner.js` | JS=NO |
| SKIP | `scss/sections/payment-banner.scss` | SCSS=NO (see below) |

**SCSS decision: NO.** All styling expressible via Tailwind arbitrary-value utilities + inline `<style>` scoped to `#shopify-section-{{ section.id }}` for any Tailwind-inexpressible values (following `promo-test.liquid` precedent). No keyframes, no `::before`/`::after` that Tailwind's `before:`/`after:` cannot handle, no `:has()`/`:where()`, no complex combinators. The card-2 mobile mask-image/rounded-overflow is `tw-rounded-[8px] tw-overflow-hidden` — no SCSS needed.

---

## Layout strategy

### Section shell
- `<section>` with `data-section-type="payment-banner"` + `data-section-id`
- Mobile: `tw-bg-white tw-py-[30px] tw-px-[16px]`
- Desktop (`md-small:` 768px): padding shifts. Desktop spec says top 60 / bottom 40 / horizontal 50: `md-small:tw-pt-[60px] md-small:tw-pb-[40px] md-small:tw-px-[50px]`
- Inline `<style>` block at top (following promo-test pattern) for any values that can't be expressed inline

### Inner container
- `<div class="payment-banner__inner tw-max-w-[1340px] tw-mx-auto tw-flex tw-flex-col tw-gap-[24px]">`

### Intro block
- `<div class="payment-banner__intro tw-flex tw-flex-col tw-gap-[8px] md-small:tw-gap-[12px] md-small:tw-max-w-[591px]">`
- H2: mobile `tw-text-[28px] tw-leading-[33.6px] tw-font-bold tw-text-[#000000]`; desktop (md-small:) `md-small:tw-text-[48px] md-small:tw-leading-[52.8px] md-small:tw-text-[#0b1e3d]`
- Subhead `<p>`: single `subheading` setting (copy is identical desktop/mobile, only size/weight/color differs); mobile `tw-text-[15px] tw-leading-[24px] tw-font-normal tw-text-[#515151]`; desktop `md-small:tw-text-[16px] md-small:tw-leading-[20px] md-small:tw-font-medium md-small:tw-text-[#666]`

### Card row (desktop) / stack (mobile)
- Wrapper div: `payment-banner__cards`
- Mobile: `tw-flex tw-flex-col tw-gap-[20px]`
- Desktop (md-small:): `md-small:tw-flex md-small:tw-flex-row md-small:tw-gap-[30px] md-small:tw-items-center`

### Dual-DOM per card
Following `sections/promo-test.liquid` lines 82–90:
```
<div class="tw-hidden md:tw-block">
  {%- render 'payment-banner-card-1-desktop', ... -%}
</div>
<div class="md:tw-hidden">
  {%- render 'payment-banner-card-1-mobile', ... -%}
</div>
```
Same pattern for card 2.

### Card 1 desktop structure
- Outer: `<div>` `920×573` — `tw-relative tw-overflow-hidden tw-rounded-[16px] tw-bg-[#f2f0f1] md-small:tw-w-[920px] md-small:tw-h-[573px]`
- Content block: `tw-absolute tw-left-[40px] tw-top-[40px] tw-w-[420px] tw-flex tw-flex-col tw-gap-[32px]`; inner text stack `tw-flex tw-flex-col tw-gap-[16px]`
- Decorative SVG vector (437×216): `tw-absolute tw-top-0 tw-right-0 aria-hidden="true" role="presentation"`
- Product image (519×402): positioned right of content; rendered via `shopify-responsive-image`
- Callout image (254×100): top-right area; rendered via `shopify-responsive-image`
- CTA pill: `<a>` or `<div role="presentation">` wrapper → `<span>` pill — `tw-bg-[#027db3] tw-border tw-border-[#f4f6f8] tw-h-[48px] tw-px-[33px] tw-rounded-full tw-max-w-[280px] tw-inline-flex tw-items-center tw-justify-center`

### Card 1 mobile structure
- Outer: `tw-relative tw-overflow-hidden tw-rounded-[8px] tw-bg-[#f2f0f1]` (no fixed height — content drives)
- No eyebrow
- Product image rendered behind content; decorative SVG rotated -165° (inline `transform: rotate(-165deg)`)
- Content: `tw-px-[20px] tw-py-[30px] tw-flex tw-flex-col tw-gap-[12px] tw-w-[309px]`
- Title: `tw-text-[28px] tw-leading-[33.6px] tw-font-bold tw-text-[#000000]`
- Body: `tw-text-[15px] tw-leading-[24px] tw-font-semibold tw-text-[#515151]`
- CTA pill: `tw-bg-[#027db3] tw-h-[48px] tw-px-[31.8px] tw-rounded-full tw-max-w-[318.4px]`

### Card 2 desktop structure
- Outer: `tw-relative tw-overflow-hidden tw-rounded-[16px] tw-bg-white md-small:tw-w-[390px] md-small:tw-h-[573px]`
- Inner cyan bg div: `tw-absolute tw-inset-0 tw-bg-[#6bc4e8]`
- Decorative bars (right edge, aria-hidden):
  - Dark-blue bar: `tw-absolute tw-right-0 tw-top-0 tw-w-[21px] tw-h-[400px] tw-bg-[#0033a1]`
  - Orange bar: `tw-absolute tw-right-0 tw-bottom-0 tw-w-[21px] tw-h-[178px] tw-bg-[#f75200]`
- Logos panel (white, bottom-left): `tw-absolute tw-bottom-0 tw-left-0 tw-w-[369px] tw-h-[173px] tw-bg-white tw-border tw-border-[#6bc4e8] tw-rounded-bl-[8px]` — contains `card_2_logos_image` (298×79, centered)
- Content block: `tw-absolute tw-left-[40px] tw-top-[40px] tw-w-[300px] tw-flex tw-flex-col tw-gap-[32px]`; inner stack `tw-gap-[12px]`
- CTA pill: `tw-bg-[#f4f6f8] tw-border tw-border-[#f4f6f8] tw-h-[38px] tw-px-[21px] tw-rounded-full`

### Card 2 mobile structure
- Outer: `tw-relative tw-overflow-hidden tw-rounded-[8px] tw-bg-[#6bc4e8]` (cyan fallback when image blank)
- Full-cover bg image via `shopify-responsive-image` with `tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover`
- Content: `tw-relative tw-z-10 tw-px-[20px] tw-py-[30px] tw-flex tw-flex-col tw-gap-[12px] tw-w-[316px]`
- CTA pill: `tw-bg-[#f4f6f8] tw-h-[48px] tw-px-[31.8px] tw-rounded-full tw-max-w-[318.4px]`

---

## Responsive strategy

- **Base (mobile-first):** Section vertical-stack layout, mobile typography/colors/padding
- **`md-small:` (768px):** Section padding shifts to desktop spec (60/40/50); intro H2 and subhead scale to desktop typography/color; cards row switches to horizontal flex
- **`md:` (1024px):** Dual-DOM toggle. `tw-hidden md:tw-block` shows desktop snippet; `md:tw-hidden` hides mobile snippet. This is the structural breakpoint — desktop card dimensions, eyebrow, card-2 bg treatment, CTA heights all live in the per-breakpoint snippets
- No `max-*:` variants used anywhere. Strictly mobile-first

**Note:** Section padding and intro typography scale at `md-small:` (768px). The dual-DOM card swap fires at `md:` (1024px). These are two distinct breakpoints for two distinct concerns — following the promo-test pattern.

---

## Token map (Figma → Tailwind)

All Figma color values are arbitrary — none exist in `tailwind.config.js` `theme.extend.colors`. Use arbitrary value syntax throughout.

| Figma value | Tailwind utility | In tailwind.config.js? | Notes |
|---|---|---|---|
| `#0b1e3d` (desktop H2, card-1 title) | `tw-text-[#0b1e3d]` | NO — arbitrary | |
| `#666` (desktop subhead, card-1 body) | `tw-text-[#666]` | NO — arbitrary | |
| `#515151` (mobile subhead, card-1 body mobile) | `tw-text-[#515151]` | NO — arbitrary | |
| `#000000` (mobile H2, card-1 title mobile, eyebrow) | `tw-text-black` | YES (Tailwind built-in) | |
| `#ffffff` (card-2 mobile text) | `tw-text-white` | YES (Tailwind built-in) | |
| `#f4f6f8` (card-1 CTA label, card-2 bg-button + border) | `tw-bg-[#f4f6f8]` / `tw-text-[#f4f6f8]` | NO — arbitrary | |
| `#f2f0f1` (card-1 bg) | `tw-bg-[#f2f0f1]` | NO — arbitrary | |
| `#6bc4e8` (card-2 desktop inner bg, mobile fallback) | `tw-bg-[#6bc4e8]` / `tw-border-[#6bc4e8]` | NO — arbitrary | |
| `#0033a1` (decorative dark-blue bar) | `tw-bg-[#0033a1]` | NO — arbitrary | |
| `#f75200` (decorative orange bar) | `tw-bg-[#f75200]` | NO — arbitrary | |
| `#027db3` (card-1 CTA bg) | `tw-bg-[#027db3]` | NO — arbitrary | |
| `radius/2xl: 16px` | `tw-rounded-[16px]` | NO (config has `xl: 12px` and `full`) — arbitrary | |
| `radius/lg: 8px` | `tw-rounded-[8px]` / `tw-rounded-bl-[8px]` | NO — arbitrary | |
| `radius/100px` (pills) | `tw-rounded-full` | YES (`full: 9999px`) | |
| 48px H2 desktop | `md-small:tw-text-[48px]` | NO — arbitrary | |
| 28px H2 mobile | `tw-text-[28px]` | NO — arbitrary | |
| gap 24px (section) | `tw-gap-[24px]` | YES (spacing `6: 24px`) → `tw-gap-6` | Use token |
| gap 20px (card stack mobile) | `tw-gap-[20px]` | YES (spacing `5: 20px`) → `tw-gap-5` | Use token |
| gap 30px (card row desktop) | `md-small:tw-gap-[30px]` | NO — arbitrary | |
| gap 32px (content block) | `tw-gap-[32px]` | YES (spacing `8: 32px`) → `tw-gap-8` | Use token |
| gap 12px (inner text stack) | `tw-gap-[12px]` | NO — arbitrary | |
| gap 16px (desktop card-1 inner) | `tw-gap-[16px]` | YES (spacing `4: 16px`) → `tw-gap-4` | Use token |
| gap 8px (intro mobile) | `tw-gap-[8px]` | YES (spacing `2: 8px`) → `tw-gap-2` | Use token |
| gap 12px (intro desktop) | `md-small:tw-gap-[12px]` | NO — arbitrary | |

No new tokens need to be added to `tailwind.config.js`. All Figma colors are project-specific with no established token names — arbitrary values are correct.

---

## SCSS decision

**NO.** All styling is achievable with Tailwind arbitrary-value utilities. The inline `<style>` scoped to `#shopify-section-{{ section.id }}` (following `promo-test.liquid` precedent) covers any escape cases (e.g., the SVG `transform: rotate(-165deg)` on mobile card-1 could be `tw-rotate-[-165deg]` in Tailwind, but if it can't, the scoped inline style handles it). No keyframes, no `::before`/`::after`, no `:has()`/`:where()`, no library overrides. SCSS file not created.

---

## Font loading

DM Sans (Bold / Medium / Regular / SemiBold) assumed globally loaded in `layout/theme.liquid`. No section-local font injection. `font-optical-sizing: auto` with `opsz: 14` — no action needed in section markup.

---

## Variant → state mapping

| Variant | Trigger | Implementation |
|---|---|---|
| Default | All fields populated | Full render per figma-context.md |
| Blank eyebrow | `card_1_eyebrow == blank` | Liquid `{%- if card_1_eyebrow != blank -%}` guard on desktop snippet. Mobile snippet omits eyebrow entirely (no guard needed). |
| Blank cta_link (card 1 or 2) | `card_X_cta_link == blank` | Anchor-vs-div pattern from promo-test: `{% if cta_link != blank %}<a href="{{ cta_link }}">{% else %}<div role="presentation">{% endif %}` + matching close tag |
| Blank cta_label (card 1 or 2) | `card_X_cta_label == blank` | `{%- if cta_label != blank -%}` guard wraps entire pill span — no empty pill rendered |
| Blank card_1_product_image | image_picker empty | `{%- if card_1_product_image != blank -%}` guard around the shopify-responsive-image render call |
| Blank card_1_callout_image | image_picker empty | Same guard pattern. Inline decorative SVG still renders (it's code, not schema). |
| Blank card_2_logos_image | image_picker empty | Guard around logos image inside white panel. White panel shell still renders. |
| Blank card_2_mobile_bg_image | image_picker empty | Outer div keeps `tw-bg-[#6bc4e8]` as fallback. `{%- if card_2_mobile_bg_image != blank -%}` guard around the image render. Text is still readable on cyan fallback. |

All variants are Liquid conditionals — no JS states.

---

## Reuse references followed

| Reference | File | Convention lifted |
|---|---|---|
| Dual-DOM card toggle at `md:` | `sections/promo-test.liquid` lines 82–90 | `<div class="tw-hidden md:tw-block">{% render 'card-desktop' %}</div>` + `<div class="md:tw-hidden">{% render 'card-mobile' %}</div>` |
| Anchor-vs-div CTA wrapper (blank cta_link) | `snippets/promo-test-card-desktop.liquid` lines 29–40, 87–91 | `{% if cta_link != blank %}<a href=... focus-visible ring>{% else %}<div role="presentation">{% endif %}` + mirrored close |
| Inline `<span>` pill (no nested `<a>`) | `snippets/promo-test-card-desktop.liquid` lines 79–83 | `<span class="tw-inline-flex tw-items-center tw-justify-center tw-h-[Npx] tw-px-[Npx] tw-rounded-full ...">{{ cta_label }}</span>` |
| Focus-visible ring utility | `snippets/promo-test-card-desktop.liquid` line 32 | `focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[<color>]` |
| Scoped inline `<style>` | `sections/promo-test.liquid` lines 21–44, `sections/hero-banner.liquid` lines 19–47 | `<style>#shopify-section-{{ section.id }} .payment-banner__X { ... }</style>` |
| shopify-responsive-image snippet | `snippets/shopify-responsive-image.liquid` | All 4 image_picker slots rendered with `image_id`, `image_aspect_ratio`, `image_class`, `wrapper_class`, `crop` params |

---

## Questions

1. **Decorative SVG vector path (card 1, 437×216, upper-right)** — `figma-context.md` names it as "decorative SVG vector" but does not provide the actual path data. Should Phase 2 inline the exact Figma vector path (requires main to extract from Figma MCP), or build a geometric approximation from visible shape in `qa/figma-desktop.png`? **Recommendation:** geometric approximation using simple `<path>` or `<polygon>` elements derived from the PNG — visual-qa will flag if inadequate. Main decision needed.

2. **Focus ring color** — Cards sit on three different backgrounds (cream `#f2f0f1`, cyan `#6bc4e8`, full-cover image). A single focus color is needed for all CTAs. `figma-context.md` shows `#027db3` as the primary brand blue and `#0033a1` as the dark navy. **Recommendation:** `#0033a1` (dark navy) — sufficient contrast on cream and cyan backgrounds, and visible on most marketing images. Confirm or override.

3. **Card 1 mobile: decorative SVG rotated -165°** — `figma-context.md` (mobile §, line 88) says the SVG is present on mobile but rotated -165°. Is this the same SVG shape as desktop (just rotated), or a different/simplified shape for mobile? If same shape, the inline `<style>` scoped block handles `transform: rotate(-165deg)`. Confirm same SVG path applies.

4. **shopify-responsive-image aspect ratios (hardcoded per slot)** — `brief.md §3.6` says "ui-agent hardcodes container proportions." Planned hardcoded ratios from Figma geometry: card-1 product image `519×402 → ~1.29`, card-1 callout `254×100 → 2.54`, card-2 logos `298×79 → ~3.77`, card-2 mobile-bg derived from card height `408.89/370.4 → ~1.10`. Confirm approach is correct, or specify different ratios.

---

## As-built DOM (Phase 2)

Annotated tree — BEM classes, data-attrs, aria attrs. Both breakpoints documented inline.

```html
<!-- sections/payment-banner.liquid -->
<section
  class="payment-banner tw-bg-white tw-py-[30px] tw-px-[16px]
         md-small:tw-pt-[60px] md-small:tw-pb-[40px] md-small:tw-px-[50px]"
  data-section-type="payment-banner"
  data-section-id="{{ section.id }}"
>
  <div class="payment-banner__inner tw-max-w-[1340px] tw-mx-auto tw-flex tw-flex-col tw-gap-[24px]">

    <!-- Intro -->
    <div class="payment-banner__intro tw-flex tw-flex-col tw-gap-2
                md-small:tw-gap-[12px] md-small:tw-max-w-[591px]">
      <h2 class="payment-banner__heading tw-text-[28px] tw-leading-[33.6px] tw-font-bold tw-text-black
                 md-small:tw-text-[48px] md-small:tw-leading-[52.8px] md-small:tw-text-[#0b1e3d] tw-m-0">
        {{ heading }}
      </h2>
      <p class="payment-banner__subhead tw-text-[15px] tw-leading-[24px] tw-font-normal tw-text-[#515151]
                md-small:tw-text-[16px] md-small:tw-leading-[20px] md-small:tw-font-medium md-small:tw-text-[#666] tw-m-0">
        {{ subheading | newline_to_br }}
      </p>
    </div>

    <!-- Card row -->
    <div class="payment-banner__cards tw-flex tw-flex-col tw-gap-5 tw-items-center
                md-small:tw-flex-row md-small:tw-gap-[30px] md-small:tw-items-center">

      <!-- Card 1 desktop toggle -->
      <div class="tw-hidden md:tw-block">
        <!-- snippets/payment-banner-card-1-desktop.liquid -->
        <a|div class="payment-banner-card-1-desktop tw-relative tw-overflow-hidden tw-rounded-[16px]
                      tw-block tw-w-[920px] tw-h-[573px] tw-bg-[#f2f0f1] tw-no-underline
                      focus-visible:tw-outline focus-visible:tw-outline-2
                      focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]"
          aria-label="{{ title }}">    <!-- <div role="presentation"> when cta_link blank -->
          <!-- bg image (absolute fill) -->
          <!-- shopify-responsive-image wrapper: tw-w-full tw-h-full tw-absolute tw-inset-0 -->
          <div class="payment-banner-card-1-desktop__content tw-absolute tw-left-[40px] tw-top-[40px]
                      tw-w-[420px] tw-flex tw-flex-col tw-gap-8">
            <div class="payment-banner-card-1-desktop__text tw-flex tw-flex-col tw-gap-4">
              <!-- if eyebrow != blank -->
              <p class="payment-banner-card-1-desktop__eyebrow tw-text-[13px] tw-leading-[20px]
                        tw-font-bold tw-text-black tw-uppercase tw-m-0">MEMBER PRICING UNLOCKED</p>
              <h3 class="payment-banner-card-1-desktop__title tw-text-[48px] tw-leading-[52.3px]
                         tw-font-bold tw-text-[#0b1e3d] tw-max-w-[411px] tw-m-0">{{ title }}</h3>
              <p class="payment-banner-card-1-desktop__body tw-text-[16px] tw-leading-[20px]
                        tw-font-normal tw-text-[#666] tw-m-0">{{ body }}</p>
            </div>
            <span class="payment-banner-card-1-desktop__cta tw-inline-flex tw-items-center
                         tw-justify-center tw-bg-[#027db3] tw-border tw-border-[#f4f6f8]
                         tw-h-[48px] tw-px-[33px] tw-rounded-full tw-max-w-[280px]
                         tw-text-[16px] tw-leading-[28px] tw-font-bold tw-text-[#f4f6f8]
                         tw-capitalize tw-whitespace-nowrap">Learn More</span>
          </div>
        </a|div>
      </div>

      <!-- Card 1 mobile toggle -->
      <div class="md:tw-hidden">
        <!-- snippets/payment-banner-card-1-mobile.liquid -->
        <a|div class="payment-banner-card-1-mobile tw-relative tw-overflow-hidden tw-rounded-[8px]
                      tw-block tw-w-[358px] tw-h-[409px] tw-bg-[#f2f0f1] tw-no-underline
                      focus-visible:tw-outline focus-visible:tw-outline-2
                      focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]"
          aria-label="{{ title }}">
          <!-- bg image (absolute fill) -->
          <div class="payment-banner-card-1-mobile__content tw-absolute tw-inset-0
                      tw-px-[20px] tw-py-[30px] tw-flex tw-flex-col tw-gap-[12px] tw-w-[309px]">
            <h3 class="payment-banner-card-1-mobile__title tw-text-[28px] tw-leading-[33.6px]
                       tw-font-bold tw-text-black tw-m-0">{{ title }}</h3>
            <p class="payment-banner-card-1-mobile__body tw-text-[15px] tw-leading-[24px]
                      tw-font-semibold tw-text-[#515151] tw-m-0">{{ body }}</p>
            <span class="payment-banner-card-1-mobile__cta tw-inline-flex tw-items-center
                         tw-justify-center tw-bg-[#027db3] tw-h-[48px] tw-px-[31.8px]
                         tw-rounded-full tw-max-w-[318px] tw-text-[15px] tw-leading-[30px]
                         tw-font-bold tw-text-white tw-capitalize tw-whitespace-nowrap">Learn More</span>
          </div>
        </a|div>
      </div>

      <!-- Card 2 desktop toggle -->
      <div class="tw-hidden md:tw-block">
        <!-- snippets/payment-banner-card-2-desktop.liquid -->
        <a|div class="payment-banner-card-2-desktop tw-relative tw-overflow-hidden tw-rounded-[16px]
                      tw-block tw-w-[390px] tw-h-[573px] tw-no-underline
                      focus-visible:tw-outline focus-visible:tw-outline-2
                      focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]"
          aria-label="{{ title }}">
          <!-- cyan bg layer -->
          <div class="tw-absolute tw-inset-0 tw-bg-[#6bc4e8]" aria-hidden="true"></div>
          <!-- dark-blue bar -->
          <div class="tw-absolute tw-left-[369px] tw-top-0 tw-w-[21px] tw-h-[400px] tw-bg-[#0033a1]" aria-hidden="true"></div>
          <!-- orange bar -->
          <div class="tw-absolute tw-left-[369px] tw-top-[400px] tw-w-[21px] tw-h-[178px] tw-bg-[#f75200]" aria-hidden="true"></div>
          <!-- logos panel (if logos_image != blank) -->
          <div class="payment-banner-card-2-desktop__logos-panel tw-absolute tw-left-0 tw-top-[400px]
                      tw-w-[369px] tw-h-[173px] tw-bg-white tw-border tw-border-[#6bc4e8]
                      tw-rounded-bl-[8px] tw-overflow-hidden tw-flex tw-items-center tw-justify-center">
            <!-- shopify-responsive-image: wrapper tw-w-[298px] tw-h-[79px] -->
          </div>
          <div class="payment-banner-card-2-desktop__content tw-absolute tw-left-[40px] tw-top-[40px]
                      tw-w-[300px] tw-flex tw-flex-col tw-gap-8">
            <div class="payment-banner-card-2-desktop__text tw-flex tw-flex-col tw-gap-[12px]">
              <h3 class="payment-banner-card-2-desktop__title tw-text-[48px] tw-leading-[52.3px]
                         tw-font-bold tw-text-[#f4f6f8] tw-m-0">{{ title }}</h3>
              <p class="payment-banner-card-2-desktop__body tw-text-[16px] tw-leading-[20px]
                        tw-font-normal tw-text-[#f4f6f8] tw-m-0">{{ body }}</p>
            </div>
            <span class="payment-banner-card-2-desktop__cta tw-inline-flex tw-items-center
                         tw-justify-center tw-bg-[#f4f6f8] tw-border tw-border-[#f4f6f8]
                         tw-h-[38px] tw-px-[21px] tw-rounded-full tw-text-[16px] tw-leading-[28px]
                         tw-font-bold tw-text-black tw-capitalize tw-whitespace-nowrap">Learn More</span>
          </div>
        </a|div>
      </div>

      <!-- Card 2 mobile toggle -->
      <div class="md:tw-hidden">
        <!-- snippets/payment-banner-card-2-mobile.liquid -->
        <a|div class="payment-banner-card-2-mobile tw-relative tw-overflow-hidden tw-rounded-[8px]
                      tw-block tw-w-[370px] tw-h-[409px] tw-bg-[#6bc4e8] tw-no-underline
                      focus-visible:tw-outline focus-visible:tw-outline-2
                      focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]"
          aria-label="{{ title }}">
          <!-- bg image (absolute fill); cyan tw-bg-[#6bc4e8] fallback on outer -->
          <div class="payment-banner-card-2-mobile__content tw-absolute tw-inset-0
                      tw-px-[20px] tw-py-[30px] tw-flex tw-flex-col tw-gap-[12px] tw-w-[316px]">
            <h3 class="payment-banner-card-2-mobile__title tw-text-[28px] tw-leading-[33.6px]
                       tw-font-bold tw-text-white tw-m-0">{{ title }}</h3>
            <p class="payment-banner-card-2-mobile__body tw-text-[15px] tw-leading-[24px]
                      tw-font-semibold tw-text-white tw-m-0">{{ body }}</p>
            <span class="payment-banner-card-2-mobile__cta tw-inline-flex tw-items-center
                         tw-justify-center tw-bg-[#f4f6f8] tw-h-[48px] tw-px-[31.8px]
                         tw-rounded-full tw-max-w-[318px] tw-text-[15px] tw-leading-[30px]
                         tw-font-bold tw-text-black tw-capitalize tw-whitespace-nowrap">Learn More</span>
          </div>
        </a|div>
      </div>

    </div>
  </div>
</section>
```

## BEM / selector catalogue

| Selector | Element | File | Purpose |
|---|---|---|---|
| `[data-section-type="payment-banner"]` | `<section>` | section | JS mount selector / section root |
| `.payment-banner` | `<section>` | section | Section root BEM block |
| `.payment-banner__inner` | `<div>` | section | Max-width centering container |
| `.payment-banner__intro` | `<div>` | section | Heading + subhead wrapper |
| `.payment-banner__heading` | `<h2>` | section | Section H2 |
| `.payment-banner__subhead` | `<p>` | section | Section subheading |
| `.payment-banner__cards` | `<div>` | section | Card row / stack container |
| `.payment-banner-card-1-desktop` | `<a>` or `<div>` | card-1-desktop | Card 1 desktop outer (link or presentation) |
| `.payment-banner-card-1-desktop__content` | `<div>` | card-1-desktop | Absolute content overlay |
| `.payment-banner-card-1-desktop__text` | `<div>` | card-1-desktop | Eyebrow + title + body flex stack |
| `.payment-banner-card-1-desktop__eyebrow` | `<p>` | card-1-desktop | Eyebrow label (desktop only, conditional) |
| `.payment-banner-card-1-desktop__title` | `<h3>` | card-1-desktop | Card 1 desktop title |
| `.payment-banner-card-1-desktop__body` | `<p>` | card-1-desktop | Card 1 desktop body |
| `.payment-banner-card-1-desktop__cta` | `<span>` | card-1-desktop | CTA pill |
| `.payment-banner-card-1-mobile` | `<a>` or `<div>` | card-1-mobile | Card 1 mobile outer |
| `.payment-banner-card-1-mobile__content` | `<div>` | card-1-mobile | Absolute content overlay |
| `.payment-banner-card-1-mobile__title` | `<h3>` | card-1-mobile | Card 1 mobile title |
| `.payment-banner-card-1-mobile__body` | `<p>` | card-1-mobile | Card 1 mobile body |
| `.payment-banner-card-1-mobile__cta` | `<span>` | card-1-mobile | CTA pill |
| `.payment-banner-card-2-desktop` | `<a>` or `<div>` | card-2-desktop | Card 2 desktop outer |
| `.payment-banner-card-2-desktop__logos-panel` | `<div>` | card-2-desktop | White logos panel (conditional) |
| `.payment-banner-card-2-desktop__content` | `<div>` | card-2-desktop | Absolute content overlay |
| `.payment-banner-card-2-desktop__text` | `<div>` | card-2-desktop | Title + body flex stack |
| `.payment-banner-card-2-desktop__title` | `<h3>` | card-2-desktop | Card 2 desktop title |
| `.payment-banner-card-2-desktop__body` | `<p>` | card-2-desktop | Card 2 desktop body |
| `.payment-banner-card-2-desktop__cta` | `<span>` | card-2-desktop | CTA pill (h=38px) |
| `.payment-banner-card-2-mobile` | `<a>` or `<div>` | card-2-mobile | Card 2 mobile outer |
| `.payment-banner-card-2-mobile__content` | `<div>` | card-2-mobile | Absolute content overlay |
| `.payment-banner-card-2-mobile__title` | `<h3>` | card-2-mobile | Card 2 mobile title |
| `.payment-banner-card-2-mobile__body` | `<p>` | card-2-mobile | Card 2 mobile body |
| `.payment-banner-card-2-mobile__cta` | `<span>` | card-2-mobile | CTA pill (h=48px) |

## Data attributes

| Attribute | Element | Values | Meaning | Set by |
|---|---|---|---|---|
| `data-section-type` | `<section>` | `"payment-banner"` | JS/test mount selector | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Unique section instance ID | Liquid (static) |

No dynamic `data-state` attributes. Section has no JS.

## Schema settings & block fields

### Section settings

| ID | Type | Default | Purpose |
|---|---|---|---|
| `heading` | text | `Easy Monthly Payments` | Intro H2 |
| `subheading` | textarea | `Affordable monthly payments made simple.\nGet instant decisions...` | Intro subhead (single setting, mobile-first, desktop styles via breakpoint utilities) |
| `card_1_eyebrow` | text | `MEMBER PRICING UNLOCKED` | Desktop-only eyebrow. Leave blank to hide. Mobile never renders. |
| `card_1_title` | text | `Prices Too Low to Show Publicly` | Card 1 headline |
| `card_1_body` | textarea | `Due to manufacturer restrictions...` | Card 1 body |
| `card_1_cta_label` | text | `Learn More` | Card 1 CTA text |
| `card_1_cta_link` | url | `/collections/all` | Card 1 CTA href. Blank → `<div role="presentation">` |
| `card_1_desktop_bg_image` | image_picker | — | Card 1 desktop composite bg (product+callout+decor baked in). Blank → `#f2f0f1` solid. |
| `card_1_mobile_bg_image` | image_picker | — | Card 1 mobile composite bg. Blank → `#f2f0f1` solid. |
| `card_2_title` | text | `Flexible Payments, Made Easy` | Card 2 headline |
| `card_2_body` | textarea | `Get approved for lease-to-own financing...` | Card 2 body |
| `card_2_cta_label` | text | `Learn More` | Card 2 CTA text |
| `card_2_cta_link` | url | `/collections/all` | Card 2 CTA href. Blank → `<div role="presentation">` |
| `card_2_logos_image` | image_picker | — | Partner logos (desktop only, inside white panel). Blank → logos panel hidden. |
| `card_2_mobile_bg_image` | image_picker | — | Card 2 full-cover mobile bg. Blank → `#6bc4e8` cyan solid fallback. |

No blocks. Flat schema only.

### Schema settings the test template must populate

| Setting ID | Type | Recommended test value |
|---|---|---|
| `heading` | text | `Easy Monthly Payments` |
| `subheading` | textarea | `Affordable monthly payments made simple.\nGet instant decisions and upgrade your comfort without paying upfront.` |
| `card_1_title` | text | `Prices Too Low to Show Publicly` |
| `card_1_body` | textarea | `Due to manufacturer restrictions, we can't advertise these wholesale rates. Add any system to your cart to instantly reveal your true price.` |
| `card_1_cta_label` | text | `Learn More` |
| `card_1_cta_link` | url | `/collections/all` |
| `card_2_title` | text | `Flexible Payments, Made Easy` |
| `card_2_body` | textarea | `Get approved for lease-to-own financing with no credit needed.\nQuick application, instant decisions, and flexible payment options.` |
| `card_2_cta_label` | text | `Learn More` |
| `card_2_cta_link` | url | `/collections/all` |

Image pickers left blank in test template — fallback bg colors (#f2f0f1 / #6bc4e8) exercise the fallback path.

## CSS custom properties

None. No inline `<style>` block was required — all values expressible via Tailwind arbitrary utilities. The section does not emit any `--token-name` custom properties.

## Figma variants implemented

| Variant | How implemented |
|---|---|
| Desktop layout (2 cards side-by-side) | `tw-hidden md:tw-block` / `md:tw-hidden` dual-DOM toggle. Desktop snippets rendered at md: (1024px). |
| Mobile layout (vertical stack) | Base CSS (mobile-first). Mobile snippets default-visible, hidden at md:. |
| Card 1 desktop — composite bg image | `card_1_desktop_bg_image` image_picker → `shopify-responsive-image` absolute fill. Blank → `#f2f0f1` bg-class fallback. |
| Card 1 desktop — eyebrow (desktop only) | `{% if eyebrow != blank %}` guard in `payment-banner-card-1-desktop.liquid`. |
| Card 1 desktop — text overlay (left 40 / top 40, w 420) | Absolute positioned content div with Figma pixel values. |
| Card 1 desktop — CTA pill (h=48, brand blue) | `<span>` pill inside outer `<a>`. bg `#027db3`, border `#f4f6f8`, h 48px. |
| Card 1 mobile — composite bg image | `card_1_mobile_bg_image` image_picker → absolute fill. Blank → `#f2f0f1`. |
| Card 1 mobile — no eyebrow | Mobile snippet has no eyebrow element at all. |
| Card 1 mobile — text overlay (px 20 / py 30, w 309) | Absolute inset-0 content div. |
| Card 1 mobile — CTA pill (h=48, brand blue, white text) | `<span>` pill. bg `#027db3`, text white, h 48px. |
| Card 2 desktop — cyan bg | `tw-absolute tw-inset-0 tw-bg-[#6bc4e8]` div. |
| Card 2 desktop — dark-blue + orange vertical bars | Inline absolute divs, `aria-hidden="true"`. |
| Card 2 desktop — white logos panel (w 369 h 173, bottom-left) | Conditional on `logos_image != blank`. `tw-rounded-bl-[8px]`. |
| Card 2 desktop — CTA pill (h=38, bg #f4f6f8, text black) | h 38px per Figma spec (shorter than card-1). |
| Card 2 mobile — full-cover bg image | `card_2_mobile_bg_image` image_picker → absolute fill. Blank → `#6bc4e8` bg-class fallback. |
| Card 2 mobile — CTA pill (h=48, bg #f4f6f8, text black) | h 48px (full mobile height). |
| Blank cta_link → div fallback | `{% if cta_link != blank %}<a>{% else %}<div role="presentation">{% endif %}` in all 4 snippets. |
| Focus-visible ring (#027db3) | `focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]` on all `<a>` wrappers. |
| Section padding responsive delta | Mobile `py-30 px-16`; desktop `md-small: pt-60 pb-40 px-50`. |
| Intro H2 responsive delta | Mobile 28/33.6 black; desktop md-small: 48/52.8 `#0b1e3d`. |
| Intro subhead responsive delta | Mobile 15/24 Regular `#515151`; desktop md-small: 16/20 Medium `#666`. |

## Figma variants NOT implemented

| Variant | Reason |
|---|---|
| Decorative SVG vector (card 1 desktop, 437×216 upper-right) | Q1 resolution: card 1 is bg image + text overlay only. Entire composite (product, callout, SVG) is baked into the merchant-uploaded `card_1_desktop_bg_image`. No inline SVG in code. |
| Decorative SVG vector (card 1 mobile, rotated -165°) | Same Q1 / Q3 resolution: mobile card 1 is also bg image + text overlay. SVG baked into `card_1_mobile_bg_image`. |
| Separate product image picker (card 1 desktop/mobile) | Q1 resolution: product shot is part of composite bg image. One image_picker per breakpoint, not separate fields. |
| Separate callout image picker (card 1) | Q1 resolution: callout is baked into composite bg. |

## DEVIATIONS

1. **Card 1 schema collapsed.** Phase 1 planned separate `card_1_product_image`, `card_1_callout_image`, and inline SVG per Q1 resolution (user directive). Implementation uses two image_pickers (`card_1_desktop_bg_image`, `card_1_mobile_bg_image`) as composite bg only. Text overlays on top. No inline SVG in code.

2. **No inline `<style>` block.** Phase 1 planned a scoped inline `<style>` following promo-test precedent. At implementation time, no Tailwind-inexpressible CSS was needed. Block omitted. SCSS decision remains NO.

3. **Card 1 desktop/mobile fixed pixel widths/heights.** Phase 1 noted `tw-w-[920px]` / `tw-h-[573px]` for card 1 desktop, `tw-w-[358px]` / `tw-h-[409px]` for mobile. These Figma pixel values are used as-built — they set the card's actual rendered dimensions. Merchant content fits within these constraints.

4. **Dual-DOM toggle breakpoint.** Dual-DOM fires at `md:` (1024px) per promo-test precedent and Phase 1 plan. Section padding and intro typography scale at `md-small:` (768px). Confirmed — no deviation.

5. **Card 2 logos panel conditional.** If `card_2_logos_image` is blank the entire logos panel div is suppressed (`{% if logos_image != blank %}`). Phase 1 noted "white panel shell still renders" — implementation corrects this to fully suppress the panel when no image is uploaded, since an empty white block at bottom-left is visually incorrect.

6. **Subheading — single setting.** Phase 1 and promo-test use separate `subheading_desktop` + `subheading_mobile` settings. Per Q1 resolved schema, a single `subheading` textarea is used with breakpoint utility overrides for typography/color. Copy is identical across breakpoints per figma-context.md.

## JS handoff

**Section JS: NONE.** Static display section. All interactivity limited to two native `<a>` anchor clicks (one per card). No custom elements, no event contracts, no fetches, no state machine, no `data-state` transitions.

js-agent: this section is complete — no further JS work needed.
