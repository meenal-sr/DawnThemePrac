# Component Structure — CollectionGrid

## Implementation decision

Swiper-based carousel via reuse of shared infrastructure:
- `js/components/carousel-swiper.js` (Custom Element `<carousel-swiper>`) — registered globally in `js/sections/global.js`
- `snippets/carousel-wrapper.liquid` — pre-renders tiles as swiper slides
- `snippets/homepage-collection-tile.liquid` — renders each tile

No custom JS, no custom SCSS. Section file is Liquid + Tailwind only.

## DOM Shape (authoritative)

```html
<section
  class="collection-grid tw-w-full ..."
  style="background-color: #f4f6f8;"
  data-section-type="collection-grid"
  data-section-id="{{ section.id }}"
>
  <div class="collection-grid__inner">

    <div class="collection-grid__header">
      <h2 class="collection-grid__heading">Shop By Category</h2>
      <a class="collection-grid__cta" href="/collections/all">View More</a>   <!-- if show_cta -->
    </div>

    <!-- Only when blocks.size > 0 -->
    <div class="collection-grid__carousel tw-relative" data-swiper-parent>

      <carousel-swiper id="carousel-{{ section.id }}" class="carousel collection-grid__carousel-inner">
        <script type="application/json">{ ...swiper config... }</script>
        <div class="swiper carousel__swiper" data-swiper-parent>
          <div class="swiper-wrapper carousel__wrapper">
            <div class="swiper-slide carousel__slide">
              <!-- rendered by snippets/homepage-collection-tile.liquid -->
            </div>
            <!-- ... one swiper-slide per block ... -->
          </div>
        </div>
      </carousel-swiper>

      <!-- Pre-existing prev/next buttons (swiper auto-binds via closest [data-swiper-parent]) -->
      <!-- Only when show_arrows=true -->
      <button
        type="button"
        class="carousel__nav-button carousel__nav-button--prev collection-grid__arrow collection-grid__arrow--prev tw-hidden md-small:tw-flex ..."
        aria-label="Previous slide"
      ><!-- chevron-left SVG --></button>

      <button
        type="button"
        class="carousel__nav-button carousel__nav-button--next collection-grid__arrow collection-grid__arrow--next tw-hidden md-small:tw-flex ..."
        aria-label="Next slide"
      ><!-- chevron-right SVG --></button>
    </div>

  </div>
</section>
```

---

## BEM Class List

| Class | Element | Purpose |
|---|---|---|
| `.collection-grid` | `<section>` | Section root |
| `.collection-grid__inner` | `<div>` | Max-width + flex-col stack |
| `.collection-grid__header` | `<div>` | Heading + CTA row |
| `.collection-grid__heading` | `<h2>` | Section heading |
| `.collection-grid__cta` | `<a>` | View More link (conditional) |
| `.collection-grid__carousel` | `<div>` | Relative wrapper — carries `data-swiper-parent` for button binding |
| `.collection-grid__carousel-inner` | `<carousel-swiper>` | Carousel component (via `carousel_class` param) |
| `.collection-grid__arrow--prev` | `<button>` | Prev button, styled per Figma |
| `.collection-grid__arrow--next` | `<button>` | Next button, styled per Figma |
| `.carousel__nav-button--prev` | `<button>` | Selector swiper uses to find prev button |
| `.carousel__nav-button--next` | `<button>` | Selector swiper uses to find next button |

Shared infrastructure classes (inside `<carousel-swiper>`):
- `.swiper` / `.swiper-wrapper` / `.swiper-slide` / `.carousel__swiper` / `.carousel__wrapper` / `.carousel__slide` — all owned by `snippets/carousel-wrapper.liquid`

---

## Data / State Attributes

| Attribute | Element | Values | Set by |
|---|---|---|---|
| `data-section-type` | `<section>` | `"collection-grid"` | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Liquid (static) |
| `data-swiper-parent` | `.collection-grid__carousel` + `.swiper` | (presence) | Liquid (static) — enables swiper to discover prev/next buttons |
| `disabled` | `.carousel__nav-button--prev/--next` | (presence) | Swiper JS — added when at start/end |
| `aria-disabled` | `.carousel__nav-button--prev/--next` | `"true"` / `"false"` | Swiper MutationObserver mirrors `disabled` |
| `tabindex` | `.carousel__nav-button--prev/--next` | `"0"` | Swiper keeps buttons focusable even when disabled |

Swiper handles all state transitions. Controller code lives in `js/components/carousel-swiper.js` — no per-section JS.

---

## Block Structure

| Field ID | Schema type | Default | Purpose |
|---|---|---|---|
| `image` | `image_picker` | — | Tile image (snippet contract) |
| `image_aspect_ratio` | `select` | `"1:1"` | Options `1:1` / `4:3` / `16:9` |
| `label` | `text` | — | Tile label |
| `link` | `url` | `"/collections/all"` | Tile anchor href |

Block type: `tile`. Min: 0. Max: 12.

---

## Schema Settings

| Setting ID | Type | Default | Purpose |
|---|---|---|---|
| `heading_text` | text | `Shop By Category` | Section heading |
| `cta_label` | text | `View More` | CTA label |
| `cta_url` | url | `/collections/all` | CTA href |
| `show_cta` | checkbox | `true` | Guard CTA anchor |
| `show_arrows` | checkbox | `true` | Guard prev/next buttons + `navigation_enabled` on carousel-wrapper |
| `background_color` | color | `#f4f6f8` | Section bg inline style |
| `section_font` | font_picker | `dm_sans_n7` | `font_face` + `--cg-font` variable |

---

## Carousel-wrapper parameters used

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

Slides-per-view driven by Figma: 6 tiles visible desktop, 4 at tablet, 2.2 at mobile (partial peek).

---

## Empty + conditional states

| State | Rendering |
|---|---|
| `show_cta=false` | `.collection-grid__cta` absent |
| `show_arrows=false` | Both `.carousel__nav-button--*` absent; `navigation_enabled: false` passed to carousel-wrapper |
| `section.blocks.size == 0` | `.collection-grid__carousel` entirely absent; header still renders |
| Arrow at start | `disabled` attr on prev → Tailwind `disabled:tw-opacity-40 disabled:tw-pointer-events-none` |
| Arrow at end | Same on next |
| Mobile (< 768px) | Both arrows `tw-hidden` — swiper uses swipe gestures |

---

## SCSS / Custom JS

None. Everything expressed via Tailwind utilities + Liquid. No `scss/sections/collection-grid.scss`, no `js/sections/collection-grid.js`.

Shared SCSS: `scss/components/carousel-wrapper.scss` (already in project, owned by shared infrastructure).

---

## CSS Custom Properties

| Property | Source | Usage |
|---|---|---|
| `--cg-font` | `section_font` via `font_face` filter | `.collection-grid__heading`, `.collection-grid__cta` `style="font-family: var(--cg-font)"` |

---

## JS Handoff

**No section-specific JS needed.** Swiper is registered globally in `js/sections/global.js`:
```js
customElements.define('carousel-swiper', CarouselSwiper);
```
Lifecycle: Custom Element `connectedCallback` runs on every mount (including `shopify:section:load` theme editor reloads) — swiper self-initializes. `disconnectedCallback` handles cleanup.

---

## DEVIATIONS from ui-plan.md

ui-plan.md originally proposed native-scroll + custom JS controller with `[data-track]`, `[data-arrow]`, and `data-state` attributes. Pivot per user instruction: reuse existing `<carousel-swiper>` + `snippets/carousel-wrapper.liquid`. No custom JS written.

Selector contract for tests:
- Section root: `[data-section-type="collection-grid"]`
- Heading: `.collection-grid__heading`
- CTA: `.collection-grid__cta`
- Prev/Next buttons: `.carousel__nav-button--prev` / `.carousel__nav-button--next`
- Disabled state: `disabled` attribute (set by swiper) + Tailwind `disabled:` variant
