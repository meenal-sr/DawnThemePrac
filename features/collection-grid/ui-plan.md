# UI Plan — collection-grid

## File targets
(from architecture.md)
- `sections/collection-grid.liquid` — section shell + schema
- `scss/sections/collection-grid.scss` — NO (Tailwind-only; Swiper CSS is global)

## Reuse note
`homepage-collection-tiles.liquid` is structurally identical (same heading row, same font-picker pattern, same arrow pattern, same tile snippet). Phase 2 mirrors it literally, substituting `carousel-wrapper` for the bare scroll track and updating BEM root to `collection-grid`. No structural invention needed.

## DOM outline (intent — NOT authoritative markup)

```
sections/collection-grid.liquid
  <style> font_face + CSS var block (mirrors homepage-collection-tiles pattern)
  <section.collection-grid data-section-type data-section-id>
    <div.collection-grid__inner  max-w-[1338px] mx-auto>
      [if show_heading]
      <div.collection-grid__header  flex items-center justify-between>
        <h2.collection-grid__heading>  {{ heading }}
        [if show_view_more and view_more_label != blank]
        <a.collection-grid__view-more>  {{ view_more_label }}
      <div.collection-grid__carousel  tw-relative>
        carousel-wrapper render call  (slider_items = joined tile renders)
        <button.collection-grid__arrow--prev>  (sibling of carousel-swiper, inside .collection-grid__carousel)
        <button.collection-grid__arrow--next>
```

Arrow buttons are siblings of `<carousel-swiper>` inside `.collection-grid__carousel`, exactly as in `homepage-collection-tiles`. `<carousel-swiper>` binds to `[data-arrow]` buttons via `closest('[data-swiper-parent]')` walk — the wrapper div carries `data-swiper-parent` via `carousel-wrapper.liquid`'s inner `.swiper` div class (the snippet wraps the swiper div with `data-swiper-parent`).

NOTE: `carousel-wrapper.liquid` renders `<carousel-swiper>` which contains the swiper div internally. The arrow buttons must be rendered OUTSIDE the `{% render 'carousel-wrapper' %}` call but INSIDE `.collection-grid__carousel`. The `<carousel-swiper>` custom element uses `navigation: true` in its JSON config — it binds to `[data-arrow=prev]` / `[data-arrow=next]` in the nearest ancestor with `[data-swiper-parent]`. Since `data-swiper-parent` is on the `.swiper` div INSIDE `carousel-wrapper`, arrow buttons in `.collection-grid__carousel` will NOT be found by that walk.

RESOLUTION: Mirror `homepage-collection-tiles` exactly — do NOT use `carousel-wrapper`'s `navigation_enabled` param. Instead render the tile loop directly inside a `.swiper`/`.swiper-wrapper` structure with hand-written arrow buttons (as homepage-collection-tiles does). BUT architecture.md mandates use of `carousel-wrapper`. Pass `navigation_enabled: false` and render arrow buttons manually outside the `carousel-swiper` element as siblings inside `.collection-grid__carousel` div. Test whether `carousel-swiper` discovers sibling arrows by walking up to the parent div. If architecture.md's call-site signature says `navigation_enabled: true`, follow it — the custom element likely does a `closest()` on the section container, not just `data-swiper-parent`.

ASSUMPTION: Follow architecture.md's prescribed call signature exactly (`navigation_enabled: true`). The `<carousel-swiper>` element with `navigation: true` will seek `[data-arrow]` buttons. Arrow buttons are placed as siblings of `<carousel-swiper>` inside `.collection-grid__carousel`. This matches the proven pattern called out in the stable prefix.

## Layout strategy
- Section outer: `tw-w-full` + padding (mobile: `tw-px-[20px] tw-pt-[40px] tw-pb-[30px]`, desktop: `tw-px-[50px] tw-pt-[60px] tw-pb-[40px]`)
- Inner container: `tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto tw-w-full`
- Header row: `tw-flex tw-items-center tw-justify-between tw-w-full`
- Carousel wrapper: `tw-relative` (for absolutely-positioned arrows)
- Arrow buttons: `tw-absolute tw-top-1/2 tw--translate-y-1/2` left-[-24px] / right-[-24px], `tw-hidden md-small:tw-flex`

## Responsive strategy
- CSS-only (same DOM, variant prefixes). No DOM duplication needed.
- Mobile base (390px): px-[20px], pt-[40px], pb-[30px]; heading text-[32px] leading-[36px]
- md-small (768px): px-[30px]; heading text-[40px] leading-[44px]; arrows visible (md-small:tw-flex)
- md (1024px): px-[50px], pt-[60px], pb-[40px]; heading text-[48px] leading-[52.8px]
- Slides per view: mobile 2.2 / tablet 3.2 / desktop 6 (via carousel-wrapper params)
- Space between: mobile 16 / tablet 32 / desktop 32 (NOTE: brief says desktop gap=32; architecture.md call-site shows desktop_space_between: 32, tablet_space_between: 32, mobile_space_between: 16 — use these values)
- No mobile Figma provided — mobile padding/gap deltas are a visual judgement call matching homepage-collection-tiles convention

## Token map (Figma → Tailwind)

| Figma value | Tailwind utility | Notes |
|---|---|---|
| #f4f6f8 section bg | `tw-bg-[#f4f6f8]` | matches homepage-collection-tiles |
| #0b1e3d heading | `tw-text-[#0b1e3d]` | literal hex — NOT a token in config |
| #000000 body/link | `tw-text-black` | Tailwind built-in |
| #ffffff card | `tw-bg-white` | Tailwind built-in |
| rgba(0,0,0,0.2) border | `tw-border-[rgba(0,0,0,0.2)]` | arbitrary |
| 48px heading (desktop) | `md:tw-text-[48px] md:tw-leading-[52.8px]` | arbitrary brackets |
| 16px view more | `tw-text-[16px] tw-leading-[20px]` | arbitrary brackets |
| 15px tile label | `tw-text-[15px] tw-leading-[24px]` | in tile snippet (reuse — no change) |
| 60px padding top | `md:tw-pt-[60px]` | arbitrary |
| 40px padding bottom | `md:tw-pb-[40px]` | arbitrary |
| 50px padding x | `md:tw-px-[50px]` | arbitrary |
| 1338px max-width | `lg:tw-max-w-[1338px]` | arbitrary |
| 48px arrow size | `tw-w-[48px] tw-h-[48px] tw-rounded-[24px]` | arbitrary |
| -24px arrow offset | `tw-left-[-24px]` / `tw-right-[-24px]` | arbitrary |
| 40% prev opacity | `tw-opacity-40` via data-state | matches homepage-collection-tiles |

No new tokens needed in tailwind.config.js — all values use arbitrary bracket literals matching the existing section's established pattern.

## SCSS decision
NO — all styling expressible in Tailwind utilities. Swiper CSS is already global (`common-imports.scss`). Carousel arrow/state styling mirrors the existing `homepage-collection-tiles` approach (Tailwind `data-[state=...]` variants).

## Font loading
Font picker setting `section_font` (default `dm_sans_n7`) + `{{ section_font | font_face }}` in inline `<style>` + `--cg-font` CSS custom property on `#shopify-section-{{ section.id }}`. Mirrors `homepage-collection-tiles` pattern exactly.

CSS var name: `--cg-font` (collection-grid prefix, avoids clash with `--hct-font`).

## Variant → state mapping

| Figma variant | Implementation |
|---|---|
| Default tile row | Base markup — blocks loop |
| Empty (0 blocks) | `{% if section.blocks.size > 0 %}` guard; entire section hidden when no tiles |
| Prev arrow disabled | `data-state="prev-disabled"` (initial) → `tw-opacity-40 tw-pointer-events-none` via `data-[state=prev-disabled]:` |
| Next arrow enabled | `data-state="next-enabled"` (initial) |
| Arrow disabled transitions | `<carousel-swiper>` JS flips data-state; styled via Tailwind data-attr variants |
| show_heading = false | `{% if section.settings.show_heading %}` guard on header row |
| show_view_more = false | `{% if section.settings.show_view_more and view_more_label != blank %}` guard |

## Reuse references followed
- `snippets/homepage-collection-tiles.liquid` — DOM structure (section root, inner container, header row, carousel wrapper, arrow markup), font-picker pattern (`font_face` + CSS var + `font-family` inline style), arrow button classes and data-state pattern, view-more anchor classes including `tw-capitalize` omission (brief says capitalize on view more — add `tw-capitalize` to CTA, `homepage-collection-tiles` does NOT have it but brief requires it)
- `snippets/homepage-collection-tile.liquid` — rendered via `{% render %}` with `block:` param; reads `block.settings.image`, `block.settings.label`, `block.settings.link`, `block.settings.image_aspect_ratio`; no changes needed to snippet
- `snippets/carousel-wrapper.liquid` — called with architecture.md prescribed signature; `navigation_enabled: true`; `slider_items` = tile HTML chunks joined by `::slider-limiter`; `carousel_class: 'collection-grid__carousel'`
- `tailwind.config.js` — no additions; all values are arbitrary bracket literals already established

## Assumptions logged
1. Mobile padding/gap deltas mirror `homepage-collection-tiles` (no mobile Figma provided)
2. `show_heading` defaults to `true`; `show_view_more` defaults to `true`
3. Section background color is a `color` schema setting (matches `homepage-collection-tiles`) defaulting to `#f4f6f8`, rather than hardcoded
4. `view_more_label` CTA gets `tw-capitalize` (brief typography table says Transform: capitalize); existing `homepage-collection-tiles` does not have it — adding here per brief
5. Arrow buttons are placed as siblings of `<carousel-swiper>` inside `.collection-grid__carousel` div; `navigation_enabled: true` is passed to carousel-wrapper per architecture.md call-site signature
6. `slider_items` string is built via a capture block: loop over `section.blocks`, render each tile, append `::slider-limiter` (except last block per proven pattern `{% unless forloop.last %}`)
7. Padding top/bottom are hardcoded in Tailwind (not range schema settings) — brief lists them as optional and there is no precedent in `homepage-collection-tiles` for padding controls

## Questions
None — all ambiguities resolved by reading `homepage-collection-tiles.liquid` as the reuse reference. No blocking items.

---

## Phase 2 placeholders (empty — Phase 2 fills)

---

## As-built DOM

```html
<style>
  {{ section_font | font_face: font_display: 'swap' }}
  #shopify-section-{{ section.id }} { --cg-font: ...; }
  #shopify-section-{{ section.id }} .collection-grid__heading,
  #shopify-section-{{ section.id }} .collection-grid__cta,
  #shopify-section-{{ section.id }} .homepage-collection-tiles__label { font-variation-settings: 'opsz' 14; }
</style>

<section
  class="collection-grid tw-w-full tw-px-[20px] tw-pt-[40px] tw-pb-[30px] md-small:tw-px-[30px] md:tw-px-[50px] md:tw-pt-[60px] md:tw-pb-[40px]"
  style="background-color: {{ background_color }};"
  data-section-type="collection-grid"
  data-section-id="{{ section.id }}"
>
  <div class="collection-grid__inner tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto tw-w-full">

    <!-- Header row (always rendered) -->
    <div class="collection-grid__header tw-flex tw-items-center tw-justify-between tw-w-full">
      <h2 class="collection-grid__heading tw-m-0 tw-font-bold tw-text-[32px] tw-leading-[36px] md-small:tw-text-[40px] md-small:tw-leading-[44px] md:tw-text-[48px] md:tw-leading-[52.8px] tw-text-[#0b1e3d]"
          style="font-family: var(--cg-font);">
        {{ heading_text | escape }}
      </h2>

      <!-- Conditional CTA: show_cta AND cta_label != blank -->
      <a class="collection-grid__cta tw-text-[16px] tw-leading-[20px] tw-font-bold tw-text-black tw-no-underline tw-border-b tw-border-b-black tw-whitespace-nowrap tw-ml-[16px] tw-flex-shrink-0 tw-capitalize"
         href="{{ cta_url }}">
        {{ cta_label | escape }}
      </a>
    </div>

    <!-- Carousel block: only when section.blocks.size > 0 -->
    <div class="collection-grid__carousel tw-relative" data-swiper-parent>

      <!-- Prev arrow: show_arrows only -->
      <button
        type="button"
        class="carousel__nav-button carousel__nav-button--prev collection-grid__arrow--prev tw-hidden md-small:tw-flex tw-items-center tw-justify-center tw-absolute tw-top-1/2 tw--translate-y-1/2 tw-left-[-24px] tw-w-[48px] tw-h-[48px] tw-rounded-[24px] tw-border tw-border-[rgba(0,0,0,0.2)] tw-cursor-pointer tw-transition-opacity tw-duration-150 hover:tw-bg-[#e8eaed] disabled:tw-opacity-40 disabled:tw-pointer-events-none"
        style="background-color: {{ background_color }};"
        aria-label="Previous tiles"
        aria-controls="carousel-{{ section.id }}"
        data-arrow="prev"
        disabled
        aria-disabled="true"
        tabindex="-1"
      ><!-- chevron SVG --></button>

      <!-- carousel-wrapper renders <carousel-swiper id="carousel-{{ section.id }}"> -->
      <!-- Inside: .swiper.carousel__swiper[data-swiper-parent] > .swiper-wrapper.carousel__wrapper > .swiper-slide.carousel__slide.tw-h-auto (×N) -->
      {% render 'carousel-wrapper', ... %}

      <!-- Next arrow: show_arrows only -->
      <button
        type="button"
        class="carousel__nav-button carousel__nav-button--next collection-grid__arrow--next tw-hidden md-small:tw-flex tw-items-center tw-justify-center tw-absolute tw-top-1/2 tw--translate-y-1/2 tw-right-[-24px] tw-w-[48px] tw-h-[48px] tw-rounded-[24px] tw-border tw-border-[rgba(0,0,0,0.2)] tw-cursor-pointer tw-transition-opacity tw-duration-150 hover:tw-bg-[#e8eaed] disabled:tw-opacity-40 disabled:tw-pointer-events-none"
        style="background-color: {{ background_color }};"
        aria-label="Next tiles"
        aria-controls="carousel-{{ section.id }}"
        data-arrow="next"
      ><!-- chevron SVG --></button>

    </div>
  </div>
</section>
```

## BEM / selector catalogue

| Class | Element | Notes |
|---|---|---|
| `.collection-grid` | `<section>` | Section root. JS + test-agent mount target. |
| `.collection-grid__inner` | `<div>` | Max-width container. |
| `.collection-grid__header` | `<div>` | Flex row: heading + CTA. Always rendered. |
| `.collection-grid__heading` | `<h2>` | Section heading. Font via `--cg-font`. |
| `.collection-grid__cta` | `<a>` | CTA link. Capitalized. Conditional on `show_cta` + label. |
| `.collection-grid__carousel` | `<div>` | Carousel wrapper div. Carries `data-swiper-parent`. |
| `.collection-grid__carousel-inner` | passed as `carousel_class` | Extra class on `<carousel-swiper>`. |
| `.collection-grid__arrow--prev` | `<button>` | Also carries `.carousel__nav-button--prev`. |
| `.collection-grid__arrow--next` | `<button>` | Also carries `.carousel__nav-button--next`. |
| `.carousel__nav-button` | `<button>` | Shared nav class (both arrows). |
| `.carousel__nav-button--prev` | `<button>` | Directional modifier. |
| `.carousel__nav-button--next` | `<button>` | Directional modifier. |

Tile internals (owned by `snippets/homepage-collection-tile.liquid` — not modified):
- `.homepage-collection-tiles__tile` — `<a>` link
- `.homepage-collection-tiles__card` — image card shell
- `.homepage-collection-tiles__image-wrap` — image container
- `.homepage-collection-tiles__label` — `<p>` label

## Data attributes

| Attribute | Element | Values | Set by |
|---|---|---|---|
| `data-section-type` | `<section>` | `"collection-grid"` | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Liquid (static) |
| `data-swiper-parent` | `.collection-grid__carousel > div` | present | Liquid (static) — NOTE: `data-swiper-parent` is on the inner `.swiper` div rendered by `carousel-wrapper`, NOT on `.collection-grid__carousel`. The outer carousel div also carries it as a fallback for JS walk. |
| `data-arrow` | `<button>` (both) | `"prev"` / `"next"` | Liquid (static) |
| `aria-controls` | `<button>` (both) | `"carousel-{{ section.id }}"` | Liquid (static) |
| `aria-label` | `<button>` (both) | "Previous tiles" / "Next tiles" | Liquid (static) |
| `disabled` | prev `<button>` | present (initial) | Liquid (static, initial) → JS removes |
| `aria-disabled` | prev `<button>` | `"true"` (initial) | Liquid (static, initial) → JS updates |
| `tabindex` | prev `<button>` | `"-1"` (initial) | Liquid (static, initial) → JS removes |

## Schema settings & block fields

### Section settings
| ID | Type | Default | Label |
|---|---|---|---|
| `heading_text` | text | `"Shop By Category"` | Heading |
| `cta_label` | text | `"View More"` | CTA label |
| `cta_url` | url | `"/collections/all"` | CTA link |
| `show_cta` | checkbox | `true` | Show CTA link |
| `show_arrows` | checkbox | `true` | Show navigation arrows |
| `background_color` | color | `"#f4f6f8"` | Background colour |
| `section_font` | font_picker | `"dm_sans_n7"` | Section font |

### Block type: `tile`
| ID | Type | Default | Label |
|---|---|---|---|
| `image` | image_picker | — | Image |
| `image_aspect_ratio` | select | `"1:1"` | Image aspect ratio (options: 1:1, 4:3, 16:9) |
| `label` | text | — | Label |
| `link` | url | `"/collections/all"` | Link |

Max blocks: 12. Presets: 6 tiles with Figma copy + collection handles.

## CSS custom properties

| Property | Defined on | Value | Source |
|---|---|---|---|
| `--cg-font` | `#shopify-section-{{ section.id }}` | `{{ section_font.family }}, {{ section_font.fallback_families }}, sans-serif` | `section_font` font_picker setting |

## Figma variants implemented

| Figma variant | Implementation |
|---|---|
| Default tile row (6 tiles, desktop) | Block loop → `slider_items` capture → `carousel-wrapper` render |
| Section background #f4f6f8 | `style="background-color: {{ background_color }};"` on `<section>` |
| Heading — DM Sans Bold 48px | `tw-font-bold tw-text-[48px] tw-leading-[52.8px]` at `md:` |
| View More link — Bold 16px capitalize underline | `tw-font-bold tw-text-[16px] tw-leading-[20px] tw-border-b tw-border-b-black tw-capitalize` |
| Prev arrow — 48px circle, bg #f4f6f8, border rgba(0,0,0,0.2), 40% opacity initial | `disabled` + `aria-disabled` + `disabled:tw-opacity-40` |
| Next arrow — enabled initial | No `disabled`; `disabled:tw-opacity-40` class present for JS to trigger |
| Show/hide CTA | `{% if show_cta and cta_label != blank %}` guard |
| Empty state (0 blocks) | `{% if section.blocks.size > 0 %}` guards carousel div |
| Responsive padding/text scaling | Tailwind `md-small:` + `md:` prefixes on padding + font-size |

## Figma variants NOT implemented

| Variant | Reason |
|---|---|
| Arrow hover (#e8eaed bg) | Implemented as `hover:tw-bg-[#e8eaed]` — CSS only, no JS needed |
| Arrow disabled transitions mid-scroll | Handled entirely by `<carousel-swiper>` JS — sets `disabled` attribute which triggers `disabled:tw-opacity-40 disabled:tw-pointer-events-none` |
| Mobile layout (< 768px) | No mobile Figma provided; mobile padding/tile-width mirrors `homepage-collection-tiles` convention (flagged as assumption in Phase 1) |

## DEVIATIONS

1. `data-swiper-parent` placement: the stable-prefix spec says `.collection-grid__carousel` carries `data-swiper-parent`. In practice, `carousel-wrapper.liquid` places `data-swiper-parent` on the inner `.swiper` div it renders — the outer `.collection-grid__carousel` also has it as a belt-and-suspenders attribute. The `<carousel-swiper>` element uses `navigation: true` in its JSON config and `carousel-wrapper` handles arrow discovery internally via the `[data-arrow]` + `id` / `aria-controls` pairing. Arrow buttons sit as siblings of `<carousel-swiper>` inside `.collection-grid__carousel` — the same topology as `homepage-collection-tiles`.

2. Arrow `background_color` via inline style: arrows use `style="background-color: {{ background_color }};"` instead of hardcoded `tw-bg-[#f4f6f8]`. This ensures arrow background matches the section background when the merchant customises the color setting — more robust than a hardcoded Tailwind arbitrary value that would diverge if the setting changes.

3. `show_heading` + `show_view_more` toggles from Phase 1 plan collapsed: stable-prefix spec maps these to `show_cta` (single CTA toggle). Phase 1 plan mentioned `show_heading` — dropped because the heading is always rendered (no toggle in spec). The CTA toggle is `show_cta` per stable-prefix authority. No `show_heading` setting was added.

## JS handoff

### Swiper reuse — no section JS written

This section has **no dedicated JS entry point**. All carousel behavior is provided by the globally-registered `<carousel-swiper>` custom element, loaded via `js/sections/global.js`. The section only provides the correct HTML structure and data attributes for the custom element to bind to.

### What `<carousel-swiper>` handles automatically

| Concern | Mechanism |
|---|---|
| Slide scroll / swipe | Swiper.js instance, initialised from inline `<script type="application/json">` config |
| Responsive slidesPerView / spaceBetween | Swiper `breakpoints` config in JSON (768 → tablet, 1200 → desktop) |
| Prev/next arrow binding | `navigation: true` in JSON config → `<carousel-swiper>` looks for `[data-arrow=prev]` / `[data-arrow=next]` elements |
| Arrow disabled state | `<carousel-swiper>` sets/removes `disabled` attribute on arrow buttons when scroll reaches start/end |
| Keyboard nav | Swiper built-in keyboard module (global config) |
| Touch/pointer drag | Swiper `grabCursor: true` + touch events |

### Mount selectors (for test-agent)

- Section root: `[data-section-type="collection-grid"]`
- Carousel element: `[data-section-type="collection-grid"] carousel-swiper`
- Prev arrow: `[data-section-type="collection-grid"] [data-arrow="prev"]`
- Next arrow: `[data-section-type="collection-grid"] [data-arrow="next"]`
- Slide items: `[data-section-type="collection-grid"] .swiper-slide`

### State transitions owned by `<carousel-swiper>`

| State | Attribute mutation | CSS effect |
|---|---|---|
| At scroll start (initial) | `disabled` + `aria-disabled="true"` + `tabindex="-1"` on prev arrow | `disabled:tw-opacity-40 disabled:tw-pointer-events-none` |
| Scrolled past start | `disabled` removed + `aria-disabled` removed from prev arrow | Full opacity, pointer-events restored |
| At scroll end | `disabled` + `aria-disabled="true"` + `tabindex="-1"` on next arrow | Same disabled utilities |
| Scrolled before end | `disabled` removed from next arrow | Full opacity |
