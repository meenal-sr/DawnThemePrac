# Architecture — promo-test

## 1. File plan

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/promo-test.liquid` | Section entry. Renders intro (heading + subhead) + single `carousel-swiper` instance wrapping all card blocks. Dual-DOM card content (desktop overlay vs mobile stacked) still lives inside swiper slides. Computes `navigation_enabled = section.blocks.size > 3` passed to carousel-wrapper. Declares schema (section settings + `card` block). |
| CREATE | `snippets/promo-test-card-desktop.liquid` | Desktop card partial (rendered into a swiper slide, hidden via `md-small:tw-block` classes on mobile): content-over-image with gradient overlay + absolutely-positioned title/description/pill-label block. Single `<a>` wrapping everything (brief §5 — no nested interactives). |
| CREATE | `snippets/promo-test-card-mobile.liquid` | Mobile card partial (rendered into a swiper slide, hidden on desktop): image on top (rounded 10px) + below-image text block (black copy on white). Same single `<a>` contract. |
| APPEND | `templates/page.test.json` | Test-agent APPENDS a `promo-test` section entry + updates `order` array. Shared page-template fixture — do NOT create per-feature test template file. Additional state fixtures (e.g. 4-block nav-on) as extra section keys in the same file (e.g. `promo-test-4blocks`). |
| REUSE | `snippets/carousel-wrapper.liquid` | Swiper wrapper — accepts `slider_items` (pre-rendered slide HTML joined by `::slider-limiter`), `mobile_slides_per_view`, `tablet_slides_per_view`, `desktop_slides_per_view`, `navigation_enabled`, `show_progress`, `progress_color`. Desktop behaviour: if `navigation_enabled=true`, carousel-swiper custom element auto-injects prev/next SVG arrows. Progress bar visibility controlled via section-scoped CSS (see SCSS decision below). |
| REUSE | `js/components/carousel-swiper.js` | Custom element (`<carousel-swiper>`) registered via `js/components/ui-components.js`. Reads config from child `<script type="application/json">`. No section-specific JS entry needed. Uses activeIndex-based `progressBarSelector` progress (discrete per-slide, NOT continuous `scrollLeft`) — accepted trade-off for reusing the shared component. |
| REUSE | `scss/components/carousel-wrapper.scss` | Pagination / progress bar styling already defined — loaded globally. No edit. |
| REUSE | `snippets/shopify-responsive-image.liquid` | Responsive image rendering in both card variants. |
| REUSE | `js/sections/global.js` | No edit — carousel-swiper custom element registers globally, works on first DOM insertion. |
| REUSE | `tailwind.config.js` screens + `tw-rounded-xl` (12px, matches `radius/xl`) | No edit. |
| SKIP — not created | `js/sections/promo-test.js` | DECISION: no section-specific JS. carousel-swiper custom element handles scroll, progress, navigation, a11y. |
| SKIP — not created | `scss/sections/promo-test.scss` | DECISION: inline `<style>` block scoped to `#shopify-section-{{ section.id }}` inside the Liquid — covers (a) hiding the progress-bar wrapper on desktop when nav-enabled (`md-small:tw-hidden` class on the `carousel-progress` div, applied via a Tailwind wrapper), (b) any residual scrollbar-hide. Matches `hero-banner.liquid` precedent. |

## 2. Reuse scan results

| Candidate | Path | Fitness | Recommendation |
|---|---|---|---|
| Section pattern — horizontal card strip with native `overflow-x-auto` + hidden scrollbar | `sections/homepage-collection-tiles.liquid` + `snippets/homepage-collection-tile.liquid` | **strong (as reference pattern)** | **Adapt pattern, do not render.** Lift: (a) `#shopify-section-{{ section.id }}` `<style>` block for `font_picker` + CSS var scoping, (b) `data-section-type` + `data-section-id` outer attributes, (c) mobile track `tw-flex tw-overflow-x-auto tw-gap-... tw-scroll-smooth` + `data-*` hook, (d) hidden-scrollbar via `scrollbar-width: none` (inline `<style>` scoped by section id). Do NOT render `homepage-collection-tile` — its card shape (rounded white card, centered icon + label below) does not match promo-test design (full-bleed image with gradient overlay, absolute text on desktop). |
| Section pattern — carousel via swiper custom element | `sections/collection-grid.liquid` + `snippets/carousel-wrapper.liquid` + `js/components/carousel-swiper.js` | **strong — chosen** | **Reuse (human directive).** Single `<carousel-swiper>` instance for both breakpoints. slidesPerView: mobile `1.2`, tablet `2.5`, desktop `3`. Navigation arrows auto-inject on desktop when `navigation_enabled=true` (computed as `section.blocks.size > 3`). Progress bar shown on mobile always; hidden on desktop via `md-small:tw-hidden` wrapper class. Trade-off: `progressBarSelector` is activeIndex-based (discrete per-slide), not continuous `scrollLeft` — visually close enough to Figma intent and saves authoring a duplicate progress system. |
| Snippet — responsive image | `snippets/shopify-responsive-image.liquid` | **strong** | **Reuse.** Call signature: `{% render 'shopify-responsive-image', image: block.settings.image, image_id: block.id, image_aspect_ratio: 1, image_alt: alt_fallback, image_class: 'tw-w-full tw-h-full tw-object-cover', wrapper_class: 'tw-w-full tw-h-full', crop: true %}`. Note: snippet expects `image_aspect_ratio` as a Number (`1` for square), not a string. |
| Snippet — heading | `snippets/heading.liquid` | **none** | **Skip.** Variants don't match the exact typography (desktop 48/52.8 Bold `#0b1e3d`, mobile 28/33.6 Bold `#000`). Precedent `homepage-collection-tiles.liquid` inlines its H2 directly — follow that. |
| Snippet — subheading | `snippets/subheading.liquid` | **none** | **Skip.** Variants don't match design (DM Sans Medium 16/20 `#666`). Inline. |
| Snippet — button / CTA | `snippets/button.liquid` | **none (by design)** | **Skip.** Brief §5 mandates single `<a>` per card — no nested interactives. Card-pill is a visual element inside the outer anchor, not its own button/link. Inline a `<span>` styled as the pill. |
| Snippet — carousel wrapper | `snippets/carousel-wrapper.liquid` | **strong** | **Reuse.** Call with `slider_items` (each slide = `{% render 'promo-test-card-desktop' %}` + `{% render 'promo-test-card-mobile' %}` joined; slide CSS toggles visibility). Flags: `show_progress: true`, `progress_color: 'tw-bg-black'`, `navigation_enabled: section.blocks.size > 3`, `mobile_slides_per_view: '1.2'`, `tablet_slides_per_view: '2.5'`, `desktop_slides_per_view: '3'`. ui-agent tunes exact values during Phase 1. |
| JS — section-JS entry | — | **n/a** | **Skipped.** carousel-swiper custom element is self-initializing on DOM insertion. No `js/sections/promo-test.js` required. |
| Helper — `data-migrate-section` / `data-append-section` | `js/components/migrate-section.js` | **irrelevant** | **Skip.** Used for section teleportation — not applicable here. |

## 3. Cross-section contracts

**None — self-contained.** Per brief §6: no events emitted, no events listened for, no fetch, no cart behaviour. Section is navigational only (anchor clicks → browser navigation).

## 4. Open questions

None blocking. Post-human-directive updates (2026-04-19):
- Reuse `<carousel-swiper>` custom element + `snippets/carousel-wrapper.liquid` for both breakpoints (reversal of original architect "skip" recommendation — human prefers shared-component reuse).
- Desktop navigation arrows enabled only when `section.blocks.size > 3` (computed in Liquid, passed as `navigation_enabled`). Arrows hidden on mobile via CSS (`tw-hidden md-small:tw-flex` wrapper).
- Mobile progress bar shown always; desktop progress bar hidden via `md-small:tw-hidden` wrapper.
- Dual-DOM card content retained (`promo-test-card-desktop.liquid` + `promo-test-card-mobile.liquid`) — swiper slide = a wrapper div containing both card variants with Tailwind visibility toggles.
- No section-specific JS entry (`js/sections/promo-test.js` dropped from file plan).
