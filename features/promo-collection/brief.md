# brief.md — promo-collection

## Intent
Horizontal "Shop By Category" slider placed on the Home / Landing page. Merchant-managed collection tiles (image + label + link) surface top category entry points above the fold. Desktop shows 6 tiles spread evenly inside a 1338px frame with prev/next arrows; mobile degrades to a native horizontal overflow scroll (no arrows) with 140px cards. Purpose: drive category-level navigation at the top of the funnel. Audience: storefront shoppers; configurable by merchants in the theme editor.

Figma dev annotations on the mobile frame explicitly label this section **"Theme Section: Collection List Slider"** with per-block label **"Collection Tile:"** and **"Collection Image:"**. Schema + block naming mirror these semantics.

## Design reference
- **Canonical design data** — `features/promo-collection/figma-context.md` (typography px values, hex colors, spacing, cross-breakpoint deltas, copy, dev annotations, interactions). Use verbatim. Do not re-derive.
- **Figma URLs**
  - Desktop 1440w: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-4305 (node `5654:4305`)
  - Mobile 390w: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-52452 (node `5654:52452`)
- **Reference PNGs**
  - `features/promo-collection/qa/figma-desktop.png`
  - `features/promo-collection/qa/figma-mobile.png`
- **Divergence:** MEDIUM — heading size, card radius, card padding, image size, and arrow visibility all diverge between desktop and mobile. Header is row on desktop, column on mobile.
- **Dual-DOM directive:** NO — single DOM. Base utilities = mobile (140px tiles, no arrows, overflow scroll). `md:` and `md-small:` overrides flip to desktop layout (208px tiles, visible arrows, 1338px inner frame). Dual-DOM not warranted — shared tile snippet handles both breakpoints via responsive utilities (precedent: `homepage-collection-tile.liquid`).

## Schema plan
- **Template type:** `page` (APPEND new section to shared `templates/page.test.json`)
- **Render context:** section (standalone, theme-editor configurable)
- **Tag:** `section`
- **Data sources:** `section.settings` + `block.settings` ONLY. No product, collection, metafield, or fetch.

### Section settings
| id | type | default | purpose |
|---|---|---|---|
| `heading_text` | text | `Shop By Category` | h2 heading |
| `view_more_label` | text | `View More` | Right-aligned (desktop) / below-heading (mobile) link label. If blank, link suppresses. |
| `view_more_link` | url | `/collections/all` | Link target |
| `background_color` | color | `#f4f6f8` | Section wrapper bg |
| `section_font` | font_picker | `dm_sans_n7` | DM Sans variable — used for all typography in section |

### Block: `tile`
| id | type | default | purpose |
|---|---|---|---|
| `image` | image_picker | — | Category hero image. Blank → neutral `#e8eaed` placeholder square. |
| `image_aspect_ratio` | select (`1:1` / `4:3` / `16:9`) | `1:1` | Passed to `shopify-responsive-image` as numeric ratio |
| `label` | text | — | Tile label (centered beneath card) |
| `link` | url | `/collections/all` | Tile `<a>` href |

- `max_blocks: 12`
- **Preset** name `Promo Collection List` with 6 default blocks mirroring the Figma copy (see §Copy). `enabled_on: templates: ["page", "index"]`.

### Schema JSON sketch
```jsonc
{
  "name": "Promo Collection List",
  "tag": "section",
  "class": "promo-collection-section",
  "settings": [
    { "type": "text", "id": "heading_text", "label": "Heading", "default": "Shop By Category" },
    { "type": "text", "id": "view_more_label", "label": "View More label", "default": "View More" },
    { "type": "url", "id": "view_more_link", "label": "View More link", "default": "/collections/all" },
    { "type": "color", "id": "background_color", "label": "Background colour", "default": "#f4f6f8" },
    { "type": "font_picker", "id": "section_font", "label": "Section font", "default": "dm_sans_n7" }
  ],
  "blocks": [
    {
      "type": "tile",
      "name": "Collection Tile",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Image" },
        { "type": "select", "id": "image_aspect_ratio", "label": "Image aspect ratio",
          "options": [
            { "value": "1:1",  "label": "1:1 (Square)" },
            { "value": "4:3",  "label": "4:3" },
            { "value": "16:9", "label": "16:9" }
          ],
          "default": "1:1"
        },
        { "type": "text", "id": "label", "label": "Label" },
        { "type": "url", "id": "link", "label": "Link", "default": "/collections/all" }
      ]
    }
  ],
  "max_blocks": 12,
  "presets": [
    { "name": "Promo Collection List", "blocks": [ /* 6 default tiles per §Copy */ ] }
  ],
  "enabled_on": { "templates": ["page", "index"] }
}
```

## File plan

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/promo-collection.liquid` | New section; Liquid + Tailwind-only layout. Wraps heading row + horizontal tile track + desktop prev/next arrow buttons. Scoped BEM class `promo-collection` + `data-section-type="promo-collection"`. |
| CREATE | `snippets/promo-collection-tile.liquid` | Tile block snippet — BEM `promo-collection__tile` + `__card` + `__image-wrap` + `__label`. Routes image through `snippets/shopify-responsive-image.liquid`. |
| APPEND | `templates/page.test.json` | test-agent appends new section entry `promo-collection-test` (type `promo-collection`) with 6+ default blocks and updates the `order` array. DO NOT create `templates/promo-collection.test.json`. |
| REUSE | `snippets/shopify-responsive-image.liquid` | Canonical responsive image pipeline. Called directly (mirroring `homepage-collection-tile.liquid` precedent — which skips the `image.liquid` wrapper because the tile image lives inside a fixed-size `image-wrap` div, not a breakpoint-flex layout). Render signature: `{% render 'shopify-responsive-image', image: tile_image, image_id: block.id, image_aspect_ratio: <numeric>, image_class: 'tw-w-full tw-h-full tw-object-cover', wrapper_class: 'tw-w-full tw-h-full', fill: true %}`. |
| SKIP | `snippets/image.liquid` | Not used — `homepage-collection-tile.liquid` precedent shows tile images bypass the `image.liquid` full/icon wrapper in favor of direct `shopify-responsive-image` render inside a fixed-dimension div. No separate desktop/mobile picker needed (single image per tile). |
| REUSE (via inline) | `<carousel-swiper>` custom element + Swiper.js | Section inlines a `<carousel-swiper>` with its own JSON config (skipping the `carousel-wrapper.liquid` snippet — that snippet's nav support is thin; we want custom-positioned Figma-style arrows on both sides of the track, absolute-positioned, which `carousel-wrapper.liquid`'s auto-generated buttons don't provide). Custom arrow markup placed inside the `<carousel-swiper>` using `.carousel__nav-button--prev/--next` classes — the component's `connectedCallback` finds them and wires Swiper navigation. |
| SKIP | `snippets/heading.liquid` / `subheading.liquid` / `button.liquid` | Not used — heading is a single semantic `<h2>` styled via Tailwind; view-more is an inline `<a>` with underline; no button component fit. Precedent: `homepage-collection-tiles.liquid` inlines the same pattern. |
| SKIP | `js/sections/promo-collection.js` | JS decision = **NO** (§JavaScript decision updated) — no per-section JS entry. Global `<carousel-swiper>` (already registered via `js/sections/global.js`) handles all slider + navigation behaviour. |
| SKIP | `scss/sections/promo-collection.scss` | Not expected. Tailwind covers all styles. Inline `<style>` scoped via `#shopify-section-{{ section.id }}` handles the `font_face` + CSS-variable pattern (precedent: `homepage-collection-tiles.liquid`). Escalate only if ui-agent hits a Tailwind limitation. |

No `assets/promo-collection-*.png` — imagery flows through `image_picker` block settings.

## Reuse scan

| Need | File | Fitness | Recommendation | Notes |
|---|---|---|---|---|
| Horizontal scrolling tile track with arrows | `sections/homepage-collection-tiles.liquid` | **Strong — 1:1 match** | **ADAPT — duplicate as `promo-collection.liquid`** | User intake explicitly chose "Build new section as-is". Do NOT re-use the existing section. Copy the structure; re-scope BEM to `promo-collection__*` and update `data-section-type`. See §DEVIATIONS for rationale. |
| Per-tile card markup (white rounded card + image + label) | `snippets/homepage-collection-tile.liquid` | Strong | **ADAPT — duplicate as `promo-collection-tile.liquid`** | Same reasoning as above. Keep the BEM rename consistent (`promo-collection__tile` / `__card` / `__image-wrap` / `__label`). |
| Responsive image with aspect-ratio padding + srcset | `snippets/shopify-responsive-image.liquid` | Strong | **REUSE** | Direct render (not via `image.liquid`). Pass `image_aspect_ratio` as numeric (1, 1.333, 1.778 per select value). |
| Image wrapper (desktop/mobile picker, full/icon layout) | `snippets/image.liquid` | Partial | **SKIP** | Tile has ONE image per block (not breakpoint-specific), placed inside a fixed-dimension `image-wrap`. `image.liquid`'s `full` layout forces separate desktop+mobile markup — overkill. Follow `homepage-collection-tile.liquid` precedent and call `shopify-responsive-image` directly. |
| Carousel / Swiper wrapper | `snippets/carousel-wrapper.liquid` | Partial | **SKIP** | Swiper is heavy for a 6-item scroller. Desktop uses scroll-snap + arrow buttons that scroll the track programmatically. Mobile uses native overflow scroll. No slide-per-view math needed (tiles are fixed-width, track width variable). `homepage-collection-tiles` precedent confirms. |
| Reusable heading / subheading / button components | `snippets/heading.liquid`, `snippets/subheading.liquid`, `snippets/button.liquid` | Partial | **SKIP** | Typography here is bespoke enough (DM Sans variable-font `opsz 14`, specific px values for desktop vs mobile) that inline Tailwind + scoped `<style>` is cleaner. `homepage-collection-tiles` precedent confirms. |
| Custom element for carousel | `js/components/carousel-swiper.js` | Partial | **SKIP** | Coupled to `<carousel-swiper>` / `carousel-wrapper.liquid`. Since we're not using Swiper, this component doesn't apply. Arrow-button scroll logic goes in a small per-section JS entry. |
| Tailwind tokens | `tailwind.config.js` | — | **REUSE**, but note sparse | Project defines `small/md-small/md/lg/2xl` breakpoints (use verbatim) and `slate-100/200/400` for neutrals. Hex values for bg (`#f4f6f8`), heading (`#0b1e3d`), arrow border (`rgba(0,0,0,0.2)`) are NOT tokenized — use arbitrary-value utilities (`tw-bg-[#f4f6f8]`) per precedent. Spacing uses `tw-*-[NNpx]` arbitrary values for tile-specific values not in the scale. |

### Call signatures (REUSE entries)

**`shopify-responsive-image`** (called from tile snippet):
```liquid
{% render 'shopify-responsive-image',
   image: tile_image,
   image_id: block.id,
   image_aspect_ratio: tile_aspect_ratio,   {# 1 | 1.333 | 1.778 #}
   image_class: 'tw-w-full tw-h-full tw-object-cover',
   wrapper_class: 'tw-w-full tw-h-full',
   fill: true
%}
```

## Variants & states

| Variant / state | Trigger | Behavior |
|---|---|---|
| 6-tile default | Preset on add | Tiles 1–6 spread `justify-between` across 1338px desktop frame; horizontal scroll on mobile. |
| <6 tiles | Fewer blocks | Flex layout: tiles left-align, empty space on right. Arrow nav still logically enabled/disabled based on overflow. |
| >6 tiles (up to `max_blocks: 12`) | More blocks | Overflow forces horizontal scroll on desktop too (not just mobile). Next arrow stays enabled until scroll-end. |
| Mobile (<768px) | Viewport | Arrows hidden. Native scroll. Heading + view-more stack column. |
| Desktop (≥768px / `md-small:`) | Viewport | Arrows visible. Heading + view-more row. |
| Tile `image` blank | `block.settings.image == blank` | Render neutral `#e8eaed tw-rounded-[8px]` filler inside `image-wrap`. Tile remains clickable. Match `homepage-collection-tile.liquid` precedent. |
| `label` blank | `block.settings.label == blank` | Label paragraph suppressed (no empty `<p>`). |
| `link` blank | `block.settings.link == blank` | Anchor `href="#"` fallback (Shopify `url` default prevents full blank). |
| `view_more_label` blank | Section setting empty | Suppress entire `<a>` — no underline artifact, no trailing space. |
| Arrow prev at scroll-x = 0 | Desktop only | `data-state="prev-disabled"` + `aria-disabled="true"` + `tabindex="-1"` + `opacity-40` + pointer-events-none. |
| Arrow next at scroll-x = max | Desktop only | `data-state="next-disabled"` + same affordances. |
| Both arrows disabled | Track fits without overflow | Both arrows show disabled state (or ui-agent may choose to hide — decide at implementation; document in As-built DOM). |

## A11y
- **Mode:** required (user-facing nav surface under WCAG 2.1 AA).
- **Heading hierarchy:** `<h2>` for section heading. No `<h3>` (tile labels are `<p>` under an `<a>`; label is accessible via link text).
- **Link text:** tile `<a>` wraps image + label — label `<p>` provides accessible name. No redundant `aria-label` on the `<a>`.
- **Arrow buttons:** `<button type="button">`, `aria-label="Previous tiles"` / `aria-label="Next tiles"`, `aria-disabled="true"` + `tabindex="-1"` when at scroll endpoint. Icon SVG marked `aria-hidden="true"`.
- **Alt text fallback chain:** `{{ image.alt }}` via `shopify-responsive-image` → empty string if blank (Shopify default). Tile's link text (label) carries the nav semantics.
- **Focus-visible:** tile `<a>` and arrow `<button>` must show clear focus ring — rely on browser default or explicit `focus-visible:tw-ring-2 focus-visible:tw-ring-black` (ui-agent decides).
- **Decorative arrow SVG:** `aria-hidden="true"`.
- **Reduced motion:** if arrow click triggers smooth scroll, check `prefers-reduced-motion: reduce` and fall back to instant `scrollTo({ left, behavior: 'auto' })` when set.
- **Keyboard:** tiles reachable via Tab (they're anchors). Arrow buttons reachable via Tab. Disabled arrow removed from tab order via `tabindex="-1"`.

## JavaScript decision
**NO** — uses global `<carousel-swiper>` custom element (registered in `js/sections/global.js`, backed by `js/components/carousel-swiper.js` + Swiper.js).

Rationale: `<carousel-swiper>` already handles horizontal scroll, `slidesPerView: 'auto'`, nav-button binding (reads `.carousel__nav-button--prev/--next` from DOM and wires Swiper navigation → browser-native `disabled` attribute + Swiper `.swiper-button-disabled` class — the component's MutationObserver then syncs `aria-disabled` + `tabindex`), keyboard + a11y modules, `prefers-reduced-motion` via Swiper's built-in reduced-motion handling, and responsive breakpoints via the inline JSON config.

No per-section JS entry file. No `js/sections/promo-collection.js`. Everything inline in the section markup + global custom element.

Pivot note: original planner output specified JS=YES with a custom arrow-scroll entry file. User directive during implementation flipped to reuse `<carousel-swiper>` per project convention (see `reference_new_theme.md` — "Implement as a reusable Web Component (custom element) configured via inline JSON. Any section gets a carousel by adding the element — no per-section JS required."). Documented in §DEVIATIONS #5.

## Copy
Ground truth in `features/promo-collection/figma-context.md` § "Copy (ground truth)". ui-agent pastes exact strings into schema defaults + preset blocks — do NOT paraphrase.

Summary (reference only — figma-context is authoritative):
- Heading: `Shop By Category`
- View-more label: `View More`
- Tile labels (6, ordered): `Indoor Air Quality`, `Split Systems`, `Packaged Terminal Systems`, `Scratch and Dent`, `Portable Ac System`, `HVAC Parts - Accessories`

## Success criteria
- Visual match at 390w (mobile) and 1440w (desktop) per `qa/figma-*.png` references, validated via pixelmatch in visual-qa-agent.
- Typography px values match figma-context.md within ±1px (heading 48/52.8 desktop, 28/33.6 mobile; label 15/24 desktop, 13.5/21.6 mobile; view-more 16/20 desktop, 15/24 mobile).
- Color hex values match exactly (bg `#f4f6f8`, heading `#0b1e3d` desktop / `#000` mobile, card `#fff`, arrow border `rgba(0,0,0,0.2)`).
- Card radius 16px desktop / 8px mobile; image size 166×166 desktop / 140×140 mobile; card padding matches desktop (`px-[21px] py-[18px]` per `homepage-collection-tile` precedent, mirroring figma-context values `px-18 py-21`).
- Schema editable in theme editor: all section + block settings appear with correct defaults; adding / removing / reordering blocks works.
- Blank-field variants degrade gracefully (no dead links, no broken-image icons, no empty pills, no empty `<p>` tags).
- Copy matches figma-context.md verbatim.
- Semantic HTML: one `<section>`, one `<h2>`, tile `<a>` with `<p>` label, arrow `<button>`s with `aria-label`.
- Desktop arrow prev/next correctly toggle disabled state at scroll endpoints.
- Mobile hides arrows, native overflow scroll works with touch.

## Constraints
- **Template type:** `page` (APPEND to shared `templates/page.test.json` — never a per-feature test JSON).
- **Data scope:** section + block settings only. No product / collection / metafield / fetch.
- **Framework:** Liquid + Tailwind (`tw-` prefix mandatory) + one scoped `<style>` block for `font_face` + CSS variable. No SCSS expected.
- **Breakpoints:** base = mobile; `md-small:` (768px) + `md:` (1024px) + `lg:` (1280px) + `2xl:` (1550px) overrides for desktop. Arrows visible from `md-small:` up per `homepage-collection-tiles` precedent.
- **Font loading:** DM Sans via `{{ section_font | font_face }}` inside scoped `<style>` — DO NOT assume DM Sans is globally preloaded. Use CSS variable `--pcl-font` scoped to `#shopify-section-{{ section.id }}`.
- **Imagery:** `image_picker` schema setting per block. NEVER export Figma tile imagery to `/assets/`. Blank image → neutral `#e8eaed` placeholder.
- **Cross-section contracts:** none. No events emitted or consumed.
- **Webpack entry:** `js/sections/promo-collection.js` becomes a new entry point auto-registered by webpack's glob. Shared code (if any) imports via `JsComponents/*` alias — but this section's JS should be self-contained (~50 lines) and stay inline in the entry file.
- **Performance:** no Swiper import; scripts already deferred globally. Arrow scroll logic uses `requestAnimationFrame`-throttled scroll listener to avoid jank.
- **Theme push:** do NOT run `yarn deploy` / `shopify theme push`. `yarn start` watcher handles sync.

## DEVIATIONS
1. **Intentional duplication of `sections/homepage-collection-tiles.liquid` + `snippets/homepage-collection-tile.liquid`.** User explicitly chose "Build new section as-is" during intake. A 1:1 near-identical section already ships (`homepage-collection-tiles`). Creating `promo-collection.liquid` + `promo-collection-tile.liquid` duplicates that code intentionally — NOT a defect, NOT a refactor candidate. Reason (human-stated): semantic separation per Figma annotation ("Theme Section: Collection List Slider") and independent merchant editability. visual-qa-agent + code-reviewer MUST NOT flag this duplication as an issue.
2. **No layout-level Figma divergences planned at this stage.** ui-agent may add entries here if implementation reveals one (e.g. if DM Sans `opsz 14` can't be loaded variably and a static weight substitute is needed).

## As-built DOM

### Section root (`sections/promo-collection.liquid`)

```html
<section
  class="promo-collection tw-w-full tw-px-[16px] tw-pt-[30px] tw-pb-[30px] md-small:tw-px-[30px] md:tw-px-[50px] md:tw-pt-[60px] md:tw-pb-[40px]"
  style="background-color: {{ background_color }};"
  data-section-type="promo-collection"
  data-section-id="{{ section.id }}"
>
  <div class="promo-collection__inner tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto tw-w-full">

    <!-- Header row -->
    <div class="promo-collection__header tw-flex tw-flex-col tw-items-start tw-w-full md-small:tw-flex-row md-small:tw-items-center md-small:tw-justify-between">
      <h2 class="promo-collection__heading tw-m-0 tw-font-bold tw-text-[28px] tw-leading-[33.6px] tw-text-black md:tw-text-[48px] md:tw-leading-[52.8px] md:tw-text-[#0b1e3d]"
          style="font-family: var(--pcl-font);">
        {{ heading_text }}
      </h2>

      <!-- Conditionally rendered; suppressed if view_more_label is blank -->
      <a class="promo-collection__view-more tw-text-[15px] tw-leading-[24px] tw-pt-[12px] md-small:tw-pt-0 md:tw-text-[16px] md:tw-leading-[20px] tw-font-bold tw-text-black tw-no-underline tw-border-b tw-border-b-black tw-pb-[2px] tw-whitespace-nowrap md-small:tw-ml-[16px] md-small:tw-flex-shrink-0 tw-capitalize focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-black"
         href="{{ view_more_link }}"
         style="font-family: var(--pcl-font);">
        {{ view_more_label }}
      </a>
    </div>

    <!-- Carousel wrapper -->
    <div class="promo-collection__carousel tw-relative">

      <!-- Scroll track — JS reads/scrolls this -->
      <div class="promo-collection__track tw-flex tw-overflow-x-auto tw-gap-[8px] md-small:tw-gap-[16px] md:tw-gap-[20px] tw-scroll-smooth"
           data-track
           style="touch-action: manipulation; overscroll-behavior: contain; -ms-overflow-style: none; scrollbar-width: none;">
        <!-- Tile snippets rendered here (see tile DOM below) -->
      </div>

      <!-- Prev arrow — starts disabled at scroll-left=0 -->
      <button type="button"
              class="promo-collection__arrow promo-collection__arrow--prev tw-hidden md-small:tw-flex tw-items-center tw-justify-center tw-absolute tw-top-1/2 tw--translate-y-1/2 tw-left-[-24px] tw-w-[48px] tw-h-[48px] tw-rounded-[24px] tw-bg-[#f4f6f8] tw-border tw-border-[rgba(0,0,0,0.2)] tw-cursor-pointer tw-transition-opacity tw-duration-150 hover:tw-bg-[#e8eaed] data-[state=prev-disabled]:tw-opacity-40 data-[state=prev-disabled]:tw-pointer-events-none data-[state=prev-disabled]:tw-cursor-default focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-black"
              aria-label="Previous tiles"
              data-arrow="prev"
              data-state="prev-disabled"
              aria-disabled="true"
              tabindex="-1">
        <svg class="tw-w-[20px] tw-h-[20px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Next arrow — starts enabled -->
      <button type="button"
              class="promo-collection__arrow promo-collection__arrow--next tw-hidden md-small:tw-flex tw-items-center tw-justify-center tw-absolute tw-top-1/2 tw--translate-y-1/2 tw-right-[-24px] tw-w-[48px] tw-h-[48px] tw-rounded-[24px] tw-bg-[#f4f6f8] tw-border tw-border-[rgba(0,0,0,0.2)] tw-cursor-pointer tw-transition-opacity tw-duration-150 hover:tw-bg-[#e8eaed] data-[state=next-disabled]:tw-opacity-40 data-[state=next-disabled]:tw-pointer-events-none data-[state=next-disabled]:tw-cursor-default focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-black"
              aria-label="Next tiles"
              data-arrow="next"
              data-state="next-enabled">
        <svg class="tw-w-[20px] tw-h-[20px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</section>
```

### Tile snippet (`snippets/promo-collection-tile.liquid`)

```html
<a class="promo-collection__tile tw-flex-none tw-flex tw-flex-col tw-gap-[12px] md:tw-gap-[23px] tw-w-[140px] md:tw-w-[208px] tw-no-underline tw-text-black focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-black"
   href="{{ tile_link }}"
   {{ block.shopify_attributes }}>

  <div class="promo-collection__card tw-bg-white tw-rounded-[8px] md:tw-rounded-[16px] md:tw-px-[18px] md:tw-py-[21px] tw-flex tw-items-center tw-justify-center tw-overflow-hidden">
    <div class="promo-collection__image-wrap tw-relative tw-w-[140px] tw-h-[140px] md:tw-w-[166px] md:tw-h-[166px]">
      <!-- If image set: shopify-responsive-image snippet -->
      <!-- If image blank: <div class="tw-w-full tw-h-full tw-bg-[#e8eaed] tw-rounded-[8px]"></div> -->
    </div>
  </div>

  <!-- Suppressed entirely if label is blank -->
  <p class="promo-collection__label tw-m-0 tw-text-[13.5px] tw-leading-[21.6px] md:tw-text-[15px] md:tw-leading-[24px] tw-font-medium tw-text-black tw-text-center tw-min-w-0 tw-break-words">
    {{ tile_label }}
  </p>
</a>
```

## Selector catalogue

| Selector | Element | Purpose |
|---|---|---|
| `[data-section-type="promo-collection"]` | `<section>` | Section root / JS mount |
| `.promo-collection__inner` | `<div>` | Max-width inner frame (1338px at lg:) |
| `.promo-collection__header` | `<div>` | Heading + view-more row |
| `.promo-collection__heading` | `<h2>` | Section heading |
| `.promo-collection__view-more` | `<a>` | View More anchor (conditional) |
| `.promo-collection__carousel` | `<div>` | Relative wrapper for track + arrows |
| `[data-track]` | `<div>` | Horizontal scroll track — JS scrolls this |
| `.promo-collection__track` | `<div>` | Same element as `[data-track]` |
| `.promo-collection__arrow` | `<button>` | Arrow button (both prev + next) |
| `.promo-collection__arrow--prev` | `<button>` | Previous arrow |
| `.promo-collection__arrow--next` | `<button>` | Next arrow |
| `[data-arrow="prev"]` | `<button>` | JS click handler target — prev |
| `[data-arrow="next"]` | `<button>` | JS click handler target — next |
| `[data-state="prev-disabled"]` | `<button>` | Prev disabled state — CSS opacity via Tailwind data-attr variant |
| `[data-state="prev-enabled"]` | `<button>` | Prev enabled state |
| `[data-state="next-disabled"]` | `<button>` | Next disabled state |
| `[data-state="next-enabled"]` | `<button>` | Next enabled state |
| `.promo-collection__tile` | `<a>` | Individual tile anchor (in snippet) |
| `.promo-collection__card` | `<div>` | White rounded card shell |
| `.promo-collection__image-wrap` | `<div>` | Fixed-dimension image container |
| `.promo-collection__label` | `<p>` | Tile label text (conditional) |

## Data attributes

| Attribute | Element | Values | Meaning | Set by |
|---|---|---|---|---|
| `data-section-type` | `<section>` | `"promo-collection"` | JS mount selector | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Unique section ID | Liquid (static) |
| `data-track` | `<div>` | — (presence-only) | JS scroll target | Liquid (static) |
| `data-arrow` | `<button>` | `"prev"` / `"next"` | Which arrow button | Liquid (static) |
| `data-state` | `<button>` | `"prev-disabled"` / `"prev-enabled"` / `"next-disabled"` / `"next-enabled"` | Arrow enabled/disabled state; drives CSS via Tailwind data-attr variants | Liquid initial; JS updates |
| `aria-disabled` | `<button>` | `"true"` / `"false"` | Accessibility disabled state (mirrors data-state) | Liquid initial; JS updates |
| `tabindex` | `<button>` | `"-1"` (disabled) / removed (enabled) | Removes disabled arrows from tab order | Liquid initial; JS updates |

## Schema settings (final)

```json
{
  "name": "Promo Collection List",
  "tag": "section",
  "class": "promo-collection-section",
  "settings": [
    { "type": "text", "id": "heading_text", "label": "Heading", "default": "Shop By Category" },
    { "type": "text", "id": "view_more_label", "label": "View More label", "default": "View More" },
    { "type": "url", "id": "view_more_link", "label": "View More link", "default": "/collections/all" },
    { "type": "color", "id": "background_color", "label": "Background colour", "default": "#f4f6f8" },
    { "type": "font_picker", "id": "section_font", "label": "Section font", "default": "dm_sans_n7" }
  ],
  "blocks": [
    {
      "type": "tile",
      "name": "Collection Tile",
      "settings": [
        { "type": "image_picker", "id": "image", "label": "Image" },
        {
          "type": "select",
          "id": "image_aspect_ratio",
          "label": "Image aspect ratio",
          "options": [
            { "value": "1:1", "label": "1:1 (Square)" },
            { "value": "4:3", "label": "4:3" },
            { "value": "16:9", "label": "16:9" }
          ],
          "default": "1:1"
        },
        { "type": "text", "id": "label", "label": "Label" },
        { "type": "url", "id": "link", "label": "Link", "default": "/collections/all" }
      ]
    }
  ],
  "max_blocks": 12,
  "presets": [
    {
      "name": "Promo Collection List",
      "blocks": [
        { "type": "tile", "settings": { "label": "Indoor Air Quality", "link": "/collections/indoor-air-quality", "image_aspect_ratio": "1:1" } },
        { "type": "tile", "settings": { "label": "Split Systems", "link": "/collections/split-systems", "image_aspect_ratio": "1:1" } },
        { "type": "tile", "settings": { "label": "Packaged Terminal Systems", "link": "/collections/packaged-terminal-systems", "image_aspect_ratio": "1:1" } },
        { "type": "tile", "settings": { "label": "Scratch and Dent", "link": "/collections/scratch-and-dent", "image_aspect_ratio": "1:1" } },
        { "type": "tile", "settings": { "label": "Portable Ac System", "link": "/collections/portable-ac", "image_aspect_ratio": "1:1" } },
        { "type": "tile", "settings": { "label": "HVAC Parts - Accessories", "link": "/collections/hvac-parts-accessories", "image_aspect_ratio": "1:1" } }
      ]
    }
  ],
  "enabled_on": { "templates": ["page", "index"] }
}
```

Main populates test blocks via `templates/page.test.json` APPEND per test-fixture rule.

## CSS custom properties

| Property | Scope | Value | Purpose |
|---|---|---|---|
| `--pcl-font` | `#shopify-section-{{ section.id }}` | `{{ section_font.family }}, {{ section_font.fallback_families }}, sans-serif` | DM Sans family string used via `font-family: var(--pcl-font)` on heading + view-more |

`font-variation-settings: 'opsz' 14` applied via scoped `<style>` rule targeting `.promo-collection__heading`, `.promo-collection__view-more`, `.promo-collection__label`.

## Figma variants implemented

- **Mobile (390w):** single DOM, base utilities — 140px tiles, column header, overflow-x scroll, no arrows visible (`tw-hidden md-small:tw-flex` hides them).
- **Desktop (1440w / md-small: + md: + lg: overrides):** arrows shown, 208px tiles, row header, 1338px max-width inner frame, justify-between spread via `tw-flex` + `tw-gap`.
- Both breakpoints in single DOM — no dual-DOM branching required per brief §Design reference.
- Blank image → `#e8eaed` placeholder square. Blank label → `<p>` suppressed. Blank view-more-label → `<a>` suppressed entirely. Arrow prev starts disabled.

## Figma variants NOT implemented

- Hover card lift state — not documented in Figma. Brief §Interactions notes "not documented". No hover transform applied. Hover on arrows uses `hover:tw-bg-[#e8eaed]` (background tint only, matches arrow button BG pattern from precedent).

## DEVIATIONS

1. **Intentional duplication of `sections/homepage-collection-tiles.liquid` + `snippets/homepage-collection-tile.liquid`.** User explicitly chose "Build new section as-is" during intake. A 1:1 near-identical section already ships. Creating `promo-collection.liquid` + `promo-collection-tile.liquid` duplicates intentionally — NOT a defect, NOT a refactor candidate. visual-qa-agent + code-reviewer MUST NOT flag.
2. **Mobile card radius:** Figma specifies `rounded-[8px]` for mobile tile card but shows no explicit inner padding at mobile (image fills card). Implemented as `tw-rounded-[8px] md:tw-rounded-[16px]` on `__card` with padding only at `md:` (`md:tw-px-[18px] md:tw-py-[21px]`). At mobile the image-wrap size (140×140) equals the card interior — card appears as rounded container with no visual gap, matching Figma mobile screenshot.
3. **Tile gap image→label:** Mobile gap set to `tw-gap-[12px]` (figma-context `12px`); desktop `md:tw-gap-[23px]` (figma-context `23px`). Precedent snippet uses `tw-gap-[23px]` desktop-only; added mobile-specific gap to match figma-context cross-breakpoint delta table.
4. **Scrollbar hidden:** N/A after carousel-swiper pivot — Swiper's `.swiper-wrapper` uses `transform` to shift slides rather than overflow scroll; no scrollbar rendered. Original custom-scroll scrollbar hack (`scrollbar-width: none`) removed.
5. **Carousel pivot — YES → NO JS:** Original planner decision specified a custom per-section JS entry (`js/sections/promo-collection.js`) to manage overflow-x scroll + arrow button state. User directive during implementation flipped the approach to reuse the project's established `<carousel-swiper>` custom element (Swiper.js-backed, registered globally in `js/sections/global.js`). `snippets/carousel-wrapper.liquid` NOT used — section inlines its own `<carousel-swiper>` + JSON config + custom `.carousel__nav-button--prev/--next` arrow markup so arrows can be absolute-positioned on the sides per Figma. §JavaScript decision flipped YES → NO. §JS handoff rewritten to document the Swiper-driven behaviour. §File plan `js/sections/promo-collection.js` row changed from "js-agent will flip to CREATE" → "SKIP permanently". Swiper is already a project dependency (`package.json` → `"swiper": "^12.1.2"`) so no new install. As-built DOM still accurate except `[data-track]` no longer exists (Swiper uses `.swiper-wrapper` internally) and `data-state` attributes on arrows no longer exist (Swiper uses browser-native `disabled` attribute). Code-reviewer + visual-qa-agent MUST treat this pivot as the intended design.

## JS handoff

**Section JS: NONE.** `<carousel-swiper>` custom element (registered globally in `js/sections/global.js` via `js/components/carousel-swiper.js`) handles every behavior. No `js/sections/promo-collection.js` file. No per-section JavaScript entry.

- **Custom element mount:** the `<carousel-swiper id="carousel-promo-collection-{{ section.id }}" class="promo-collection__carousel carousel">` wrapper inside the section. The component's `connectedCallback` runs on `DOMContentLoaded`.
- **Swiper config source:** inline `<script type="application/json">` inside the `<carousel-swiper>` element (`slidesPerView: 'auto'`, `spaceBetween: 8` base with `768: 16` + `1024: 20` breakpoint overrides, `navigation: true`, `grabCursor: true`).
- **Arrow binding:** Pre-rendered arrow `<button>`s inside the `<carousel-swiper>` carry class `.carousel__nav-button--prev` / `.carousel__nav-button--next`. The component's `connectedCallback` finds them and passes `{ prevEl, nextEl }` to Swiper's Navigation module. Swiper then handles click, disabled state (`disabled` attribute + `.swiper-button-disabled` class). Component's MutationObserver syncs `aria-disabled` + `tabindex`.
- **Keyboard, a11y, reduced-motion:** Swiper's `Keyboard` + `A11y` modules enabled globally. `prefers-reduced-motion` handled natively by Swiper.
- **Mobile:** arrows hidden via `tw-hidden md-small:tw-flex` — clicks impossible, swipe-to-scroll continues to work via `grabCursor` + touch.
- **DOM state invariants** (set by component, not our code):
  - At first slide: prev button gets `disabled` attribute + `.swiper-button-disabled` class → CSS `disabled:tw-opacity-40 disabled:tw-pointer-events-none` handles visual state. Component adds `aria-disabled="true"` + `tabindex="0"` (Swiper doesn't remove from tab order — the MutationObserver keeps them reachable but marked disabled).
  - At last slide: next button same.
  - Between: `aria-disabled="false"`, no `disabled` attribute.
- **No events emitted, none listened to.**
- **No data-state attributes on arrow buttons** — the earlier plan's `data-state="prev-disabled"` / `"next-enabled"` attributes are NOT present. Swiper uses browser-native `disabled` attribute + its own `.swiper-button-disabled` CSS class. If any test/spec relied on `data-state`, update it to check `button.disabled` or the `.swiper-button-disabled` class.

## Success criteria for downstream agents
- **ui-agent:** Read `brief.md` + `figma-context.md` + precedent files (`sections/homepage-collection-tiles.liquid`, `snippets/homepage-collection-tile.liquid`). Produce `sections/promo-collection.liquid` + `snippets/promo-collection-tile.liquid` with BEM class `promo-collection__*` and `data-section-type="promo-collection"`. Append `## As-built DOM`, `## Selector catalogue`, `## Data attributes`, `## Schema settings (final)`, `## DEVIATIONS`, and a `## JS handoff` **stub** (selectors + expected behavior only — js-agent fills the impl) to the bottom of this brief.
- **test-agent (ui-only mode):** APPEND a new entry keyed `promo-collection-test` to `templates/page.test.json` `sections` + add to `order` array. Write `features/promo-collection/test-scenarios.md` + `features/promo-collection/promo-collection.spec.js`. Cover: mobile+desktop+large viewports, arrow disabled states, blank-field variants, schema editability.
- **visual-qa-agent:** Diff `qa/figma-desktop.png` vs `qa/live-desktop.png` and `qa/figma-mobile.png` vs `qa/live-mobile.png` via pixelmatch; write `qa/visual-qa-report.md`. Treat the intentional-duplication DEVIATION above as PRE-APPROVED; any other visual mismatch is a defect unless documented in brief §DEVIATIONS.
- **js-agent (conditional, JS=YES):** Read `## As-built DOM` + `## Selector catalogue` + `## JS handoff` stub. Write `js/sections/promo-collection.js`. Replace `## JS handoff` stub with full impl details.
