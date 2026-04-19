# UI Plan — collection-grid

> Single source of truth for this section's UI. Supersedes former `component-structure.md` + `component-api.md`.
> Written in two phases by ui-agent, with a JS API section appended by js-agent (or noted as delegated to shared component).

---

## Intent (Phase 1)

Merchant-configurable horizontal tile carousel on `page` templates. Each tile: image + label + URL — all merchant-driven via section settings + repeatable `tile` block. Heading + optional "View More" CTA above the carousel. Prev/Next controls flanking the carousel at ±24px offset.

### Reuse references followed

- `snippets/homepage-collection-tile.liquid` — tile card rendering (card shell + image + label anchor)
- `snippets/carousel-wrapper.liquid` — swiper scaffolding (slides + script JSON + nav button hooks)
- `js/components/carousel-swiper.js` — `<carousel-swiper>` Custom Element, registered globally in `js/sections/global.js`

No new `js/sections/collection-grid.js`. No new `scss/sections/collection-grid.scss`.

### Delta additions (vs. `homepage-collection-tiles`)

- `show_cta` checkbox (default true) — guards CTA anchor
- `show_arrows` checkbox (default true) — guards prev/next buttons + `navigation_enabled` param
- Empty-state guard: `{% if section.blocks.size > 0 %}` wraps carousel
- Schema settings renamed: `cta_label` / `cta_url` / `show_cta` / `show_arrows`

### File targets

- `sections/collection-grid.liquid` — create
- `templates/page.test.json` — populate section entry `collection-grid-test` with 8 tile blocks
- `features/collection-grid/ui-plan.md` — this file (two phases + JS delegation note)

---

## Layout strategy

- Section root: `tw-w-full` + responsive padding — background via inline style from color setting
- Inner: `tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto`
- Header row: `tw-flex tw-items-center tw-justify-between` — heading `tw-flex-1`, CTA `tw-flex-shrink-0 tw-ml-[16px]`
- CTA underline: `tw-border-b tw-border-b-black` (1px bottom border, not `text-decoration`)
- Carousel: `tw-relative` wrapper carries `data-swiper-parent` so swiper discovers external prev/next buttons
- Arrows: `tw-absolute tw-top-1/2 tw--translate-y-1/2 tw-left-[-24px]` (prev) / `tw-right-[-24px]` (next), hidden below `md-small` via `tw-hidden md-small:tw-flex`
- Empty state: when 0 blocks, entire carousel wrapper absent; header still renders

### Responsive deltas (mirrors existing homepage-collection-tiles section exactly)

| Property | Mobile | md-small (768) | md (1024) | lg (1280) |
|---|---|---|---|---|
| Section `px` | `tw-px-[20px]` | `md-small:tw-px-[30px]` | `md:tw-px-[50px]` | — |
| Section `pt` | `tw-pt-[40px]` | — | `md:tw-pt-[60px]` | — |
| Section `pb` | `tw-pb-[30px]` | — | `md:tw-pb-[40px]` | — |
| Heading | `tw-text-[32px] tw-leading-[36px]` | `md-small:tw-text-[40px] md-small:tw-leading-[44px]` | `md:tw-text-[48px] md:tw-leading-[52.8px]` | — |
| Inner max-w | `tw-max-w-full` | — | — | `lg:tw-max-w-[1338px]` |
| Arrows visible | `tw-hidden` | `md-small:tw-flex` | — | — |
| Track gap | `tw-gap-[16px]` | `md-small:tw-gap-[20px]` | — | `lg:tw-gap-[18px]` |

Mobile Figma node not provided — responsive strategy inherited from the existing sibling section (authoritative reuse precedent).

---

## Token map (Figma → Tailwind)

| Figma value | Tailwind utility | Notes |
|---|---|---|
| `#f4f6f8` bg | inline `style="background-color: {{ background_color }};"` | color schema setting; default `#f4f6f8` |
| `#0b1e3d` heading | `tw-text-[#0b1e3d]` | NOT `ah-navy` (#092846 differs) |
| `#000` CTA/label | `tw-text-black` | — |
| `48 / 52.8` heading (md+) | `tw-text-[48px] tw-leading-[52.8px]` | bracket literals |
| `16 / 20` CTA | `tw-text-[16px] tw-leading-[20px]` | — |
| `15 / 24` tile label | inside tile snippet | already correct |
| Header→tiles 32px | `tw-gap-8` | scale match |
| Inner `1338px` | `lg:tw-max-w-[1338px]` | bracket |
| Section pt/pb/px | `md:tw-pt-[60px] md:tw-pb-[40px] md:tw-px-[50px]` | brackets |
| Arrow border rgba(0,0,0,0.2) | `tw-border-[rgba(0,0,0,0.2)]` | bracket |
| Arrow 48px / 24 radius | `tw-w-[48px] tw-h-[48px] tw-rounded-[24px]` | brackets |
| Arrow disabled 40% | `disabled:tw-opacity-40 disabled:tw-pointer-events-none` | Swiper sets `disabled` attr on prev/next |
| Arrow hover bg | `hover:tw-bg-[#e8eaed]` | — |
| CTA capitalize | `tw-capitalize` | — |

No new tokens in `tailwind.config.js`.

---

## SCSS decision

**NO** — all styling via Tailwind utilities. Scrollbar-hide is not needed because the track is controlled by swiper (hidden natively via swiper's own styles).

Swiper's bundle CSS is imported once globally via `scss/sections/common-imports.scss` → `@import 'pkg:swiper/css/bundle';` (resolved by `sass.NodePackageImporter` configured in `webpack.config.js`).

---

## Font loading

`font_picker` setting `section_font` (default `dm_sans_n7`). Inline `<style>` tag emits `{{ section_font | font_face: font_display: 'swap' }}` + `--cg-font` CSS variable scoped to `#shopify-section-{{ section.id }}`. Applied to `.collection-grid__heading`, `.collection-grid__cta`, and tile label (via snippet propagation).

Mirrors the existing `homepage-collection-tiles` font loading pattern verbatim.

---

## Variant → state mapping

| Variant | Implementation |
|---|---|
| Default / idle | Base markup |
| `show_cta=false` | CTA anchor absent from DOM |
| `show_arrows=false` | Both arrow buttons absent; `navigation_enabled: false` passed to carousel-wrapper |
| Empty (0 blocks) | Carousel wrapper absent; header row renders normally |
| Prev disabled (at start) | Swiper sets `disabled` attribute — `disabled:tw-opacity-40 disabled:tw-pointer-events-none` applies. MutationObserver in `carousel-swiper.js` mirrors `disabled` → `aria-disabled`. |
| Next disabled (at end) | Same pattern on next button |
| Arrow hover | `hover:tw-bg-[#e8eaed]` |
| Mobile | Arrows hidden via `tw-hidden md-small:tw-flex` — swipe gestures only |

---

## Questions

None resolved or deferred.

Note: mobile Figma node was not supplied; responsive strategy inherited from `sections/homepage-collection-tiles.liquid` (authoritative reuse precedent). Not a blocker.

---

## As-built DOM (Phase 2)

```html
<style>
  {{ section_font | font_face: font_display: 'swap' }}
  #shopify-section-{{ section.id }} {
    --cg-font: {{ section_font.family }}, {{ section_font.fallback_families }}, sans-serif;
  }
</style>

<section
  class="collection-grid tw-w-full tw-px-[20px] tw-pt-[40px] tw-pb-[30px] md-small:tw-px-[30px] md:tw-px-[50px] md:tw-pt-[60px] md:tw-pb-[40px]"
  style="background-color: {{ background_color }};"
  data-section-type="collection-grid"
  data-section-id="{{ section.id }}"
>
  <div class="collection-grid__inner tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto tw-w-full">

    <div class="collection-grid__header tw-flex tw-items-center tw-justify-between tw-w-full">
      <h2 class="collection-grid__heading ...">{{ heading_text | escape }}</h2>
      {%- if show_cta -%}
        <a class="collection-grid__cta ..." href="{{ cta_url }}">{{ cta_label | escape }}</a>
      {%- endif -%}
    </div>

    {%- if section.blocks.size > 0 -%}
      <div class="collection-grid__carousel tw-relative" data-swiper-parent>
        <carousel-swiper id="carousel-{{ section.id }}" class="carousel collection-grid__carousel-inner">
          <script type="application/json">{...swiper config...}</script>
          <div class="swiper carousel__swiper" data-swiper-parent>
            <div class="swiper-wrapper carousel__wrapper">
              <div class="swiper-slide carousel__slide">
                {% render 'homepage-collection-tile', block: block %}
              </div>
              <!-- one per block -->
            </div>
          </div>
        </carousel-swiper>

        {%- if show_arrows -%}
          <button class="carousel__nav-button--prev collection-grid__arrow--prev ..." aria-label="Previous slide">…</button>
          <button class="carousel__nav-button--next collection-grid__arrow--next ..." aria-label="Next slide">…</button>
        {%- endif -%}
      </div>
    {%- endif -%}

  </div>
</section>
```

### BEM / selector catalogue (authoritative for tests)

| Selector | Element | Purpose |
|---|---|---|
| `[data-section-type="collection-grid"]` | `<section>` | Section root / mount |
| `.collection-grid__inner` | `<div>` | Max-width + flex column |
| `.collection-grid__header` | `<div>` | Heading + CTA row |
| `.collection-grid__heading` | `<h2>` | Section heading |
| `.collection-grid__cta` | `<a>` | View More link (conditional) |
| `.collection-grid__carousel` | `<div>` | `data-swiper-parent` wrapper |
| `.collection-grid__carousel-inner` | `<carousel-swiper>` | Forwarded via `carousel_class` |
| `.carousel__nav-button--prev` | `<button>` | Swiper binds prev here |
| `.carousel__nav-button--next` | `<button>` | Swiper binds next here |
| `.homepage-collection-tiles__tile` | `<a>` | Tile anchor (from snippet) |
| `.swiper-slide` | `<div>` | Slide wrapper (from snippet infra) |

### Data attributes

| Attribute | Element | Values | Set by |
|---|---|---|---|
| `data-section-type` | `<section>` | `"collection-grid"` | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Liquid (static) |
| `data-swiper-parent` | `.collection-grid__carousel` | (presence) | Liquid (static) |
| `disabled` | arrow buttons | (presence) | Swiper JS |
| `aria-disabled` | arrow buttons | `"true"` / `"false"` | MutationObserver in `carousel-swiper.js` mirrors `disabled` |

### Schema settings & block fields

Section settings:

| ID | Type | Default |
|---|---|---|
| `heading_text` | text | `Shop By Category` |
| `cta_label` | text | `View More` |
| `cta_url` | url | `/collections/all` |
| `show_cta` | checkbox | `true` |
| `show_arrows` | checkbox | `true` |
| `background_color` | color | `#f4f6f8` |
| `section_font` | font_picker | `dm_sans_n7` |

Block type `tile` settings:

| ID | Type | Default |
|---|---|---|
| `image` | image_picker | — |
| `image_aspect_ratio` | select (`1:1` / `4:3` / `16:9`) | `1:1` |
| `label` | text | — |
| `link` | url | `/collections/all` |

Block type: `tile`. Min `0`. Max `12`.

### CSS custom properties

| Property | Source | Usage |
|---|---|---|
| `--cg-font` | `section_font | font_face` | `.collection-grid__heading`, `.collection-grid__cta`, `.homepage-collection-tiles__label` |

---

## JS handoff

**No section-specific JS.** All carousel behavior delegated to shared `<carousel-swiper>` Custom Element:

| Concern | Owner |
|---|---|
| Mount / unmount lifecycle | `carousel-swiper` Custom Element `connectedCallback` / `disconnectedCallback` — auto-fires on `shopify:section:load/unload` |
| Prev / Next click → scroll | Swiper core (`slidePrev` / `slideNext`) |
| Keyboard (arrow keys in viewport) | Swiper `Keyboard` module |
| Touch / drag | Swiper core |
| Reduced motion | Swiper respects `prefers-reduced-motion: reduce` natively |
| `disabled` attribute on arrows | Swiper core on `isBeginning` / `isEnd` |
| `aria-disabled` mirror | `MutationObserver` inside `carousel-swiper.js` |
| Resize recalc | Swiper's internal resize handling |

Configuration passed to the shared infrastructure (single source — repeated here only for quick reference):

```liquid
{% render 'carousel-wrapper',
  section_id: section.id,
  slider_items: slider_items,
  navigation_enabled: show_arrows,
  mobile_slides_per_view: 2.2,
  tablet_slides_per_view: 4,
  desktop_slides_per_view: 6,
  mobile_space_between: 16,
  tablet_space_between: 20,
  desktop_space_between: 18,
  carousel_class: 'collection-grid__carousel-inner'
%}
```

No custom events emitted or listened at the section boundary.

---

## DEVIATIONS from original plan

1. Original Phase 1 proposed a native-scroll carousel with custom JS (`js/sections/collection-grid.js`) using `[data-track]` + `[data-arrow]` + `data-state` attributes. Pivoted mid-build per user instruction → reuse `<carousel-swiper>` + `snippets/carousel-wrapper.liquid`. Custom controller removed; selector contract updated to use `.carousel__nav-button--prev/--next` + `disabled` attribute.
2. Test template block count increased from 6 → 8 so desktop swiper (`slidesPerView: 6`) has something to scroll, exposing the `disabled` state of prev/next for visual + assertion parity with the Figma.
3. `scss/sections/common-imports.scss` updated to `@import 'pkg:swiper/css/bundle';` + `webpack.config.js` added `sass.NodePackageImporter()` so `pkg:` prefix resolves swiper CSS from `node_modules` through sass package exports.
