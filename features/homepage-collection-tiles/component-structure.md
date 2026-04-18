# Component Structure — HomepageCollectionTiles

## DOM Shape

```
<section.homepage-collection-tiles
  data-section-type="homepage-collection-tiles"
  data-section-id="{{ section.id }}"
  style="background-color: {{ background_color }}">

  <div.homepage-collection-tiles__inner>

    <div.homepage-collection-tiles__header>
      <h2.homepage-collection-tiles__heading style="font-family: var(--hct-font);">
        {{ heading_text }}
      </h2>
      <a.homepage-collection-tiles__view-more href="{{ view_more_link }}">
        {{ view_more_label }}
      </a>
    </div>

    <div.homepage-collection-tiles__carousel tw-relative>

      <div.homepage-collection-tiles__track
        data-track>
        <!-- {% render 'homepage-collection-tile', block: block %} for each tile block -->
      </div>

      <button.homepage-collection-tiles__arrow.homepage-collection-tiles__arrow--prev
        type="button"
        aria-label="Previous tiles"
        data-arrow="prev"
        data-state="prev-disabled"
        aria-disabled="true"
        tabindex="-1">
        <!-- chevron-left SVG inline -->
      </button>

      <button.homepage-collection-tiles__arrow.homepage-collection-tiles__arrow--next
        type="button"
        aria-label="Next tiles"
        data-arrow="next"
        data-state="next-enabled">
        <!-- chevron-right SVG inline -->
      </button>

    </div>
  </div>
</section>
```

### Tile snippet (`snippets/homepage-collection-tile.liquid`)

```
<a.homepage-collection-tiles__tile
  href="{{ tile_link }}"
  {{ block.shopify_attributes }}>

  <div.homepage-collection-tiles__card>
    <div.homepage-collection-tiles__image-wrap tw-relative>
      {% render 'shopify-responsive-image', ... %}
      <!-- fallback: <div.tw-bg-[#e8eaed]> when image blank -->
    </div>
  </div>

  <p.homepage-collection-tiles__label>
    {{ tile_label }}
  </p>

</a>
```

---

## BEM Class List

| Class | Element | Role |
|---|---|---|
| `homepage-collection-tiles` | `<section>` | Section root — background, padding |
| `homepage-collection-tiles__inner` | `<div>` | Max-width constrained inner container |
| `homepage-collection-tiles__header` | `<div>` | Header row — flex row: heading + view-more |
| `homepage-collection-tiles__heading` | `<h2>` | Section heading, font-family via CSS custom property |
| `homepage-collection-tiles__view-more` | `<a>` | "View More" text link |
| `homepage-collection-tiles__carousel` | `<div>` | Relative container for track + absolutely positioned arrows |
| `homepage-collection-tiles__track` | `<div>` | Horizontal scroll container, JS mount target |
| `homepage-collection-tiles__arrow` | `<button>` | Shared arrow button class |
| `homepage-collection-tiles__arrow--prev` | `<button>` | Prev arrow — JS mount target |
| `homepage-collection-tiles__arrow--next` | `<button>` | Next arrow — JS mount target |
| `homepage-collection-tiles__tile` | `<a>` | Tile root (in snippet) — entire tile is clickable |
| `homepage-collection-tiles__card` | `<div>` | White rounded card shell |
| `homepage-collection-tiles__image-wrap` | `<div>` | `tw-relative` wrapper required by shopify-responsive-image (injects `position: absolute` on img) |
| `homepage-collection-tiles__label` | `<p>` | Category label below card |

---

## Data-State Attributes

| Element | Attribute | Values | Set by | Visual effect |
|---|---|---|---|---|
| `[data-arrow="prev"]` | `data-state` | `prev-disabled` | Markup (initial) / JS | `tw-opacity-40`, `tw-pointer-events-none` |
| `[data-arrow="prev"]` | `data-state` | `prev-enabled` | JS (on scroll) | Full opacity, interactive |
| `[data-arrow="next"]` | `data-state` | `next-enabled` | Markup (initial) / JS | Full opacity, interactive |
| `[data-arrow="next"]` | `data-state` | `next-disabled` | JS (on scroll) | `tw-opacity-40`, `tw-pointer-events-none` |
| `[data-arrow="prev"]` | `aria-disabled` | `"true"` / `"false"` | Markup (initial) / JS | Accessibility state |
| `[data-arrow="prev"]` | `tabindex` | `"-1"` / `"0"` | Markup (initial) / JS | Focus management |

Initial markup: prev `data-state="prev-disabled"` (carousel at leftmost), next `data-state="next-enabled"`.

---

## Block Structure

### Block type: `tile`

| Setting ID | Type | Default | Purpose |
|---|---|---|---|
| `image` | `image_picker` | — | Tile image |
| `image_aspect_ratio` | `select` | `1:1` | Aspect enforcement: `1:1`→1, `4:3`→1.333, `16:9`→1.778 |
| `label` | `text` | — | Category label text |
| `link` | `url` | — | Tile destination URL |

---

## Liquid Variables

| Variable | Source | Used in |
|---|---|---|
| `heading_text` | `section.settings.heading_text` | `<h2>` |
| `view_more_label` | `section.settings.view_more_label` | `<a>` view-more |
| `view_more_link` | `section.settings.view_more_link` | `<a>` href |
| `background_color` | `section.settings.background_color` | inline style on `<section>` |
| `section_font` | `section.settings.section_font` | `font_face` filter + `--hct-font` CSS custom property |
| `tile_image` | `block.settings.image` | passed to `shopify-responsive-image` |
| `tile_label` | `block.settings.label` | `<p>` label + `image_alt` fallback |
| `tile_link` | `block.settings.link` | `<a>` href |
| `tile_aspect_setting` | `block.settings.image_aspect_ratio` | drives `tile_aspect_ratio` numeric |
| `tile_aspect_ratio` | Computed via `if/elsif` in snippet `{% liquid %}` block | passed to `shopify-responsive-image` as `image_aspect_ratio` |
| `block.shopify_attributes` | Shopify | on tile `<a>` for theme editor targeting |
| `block.id` | Shopify | passed as `image_id` to `shopify-responsive-image` |

---

## Schema Settings — Test Template Must Populate

| Setting ID | Value to populate |
|---|---|
| `heading_text` | `Shop By Category` |
| `view_more_label` | `View More` |
| `view_more_link` | `/collections/all` |
| `background_color` | `#f4f6f8` |
| `section_font` | `dm_sans_n7` |

### Per block (6 preset blocks):

| Block # | `label` | `link` | `image_aspect_ratio` |
|---|---|---|---|
| 1 | `Indoor Air Quality` | `/collections/indoor-air-quality` | `1:1` |
| 2 | `Split Systems` | `/collections/split-systems` | `1:1` |
| 3 | `Packaged Terminal Systems` | `/collections/packaged-terminal-systems` | `1:1` |
| 4 | `Scratch and Dent` | `/collections/scratch-and-dent` | `1:1` |
| 5 | `Portable Ac System` | `/collections/portable-ac` | `1:1` |
| 6 | `HVAC Parts - Accessories` | `/collections/hvac-parts-accessories` | `1:1` |

Images: manually upload via theme editor for visual QA; not scriptable via template JSON.

---

## Token Additions

None. All tokens expressed via Tailwind arbitrary brackets or existing utilities. `tailwind.config.js` unchanged.

---

## SCSS Output

File: `scss/sections/homepage-collection-tiles.scss`

Contents: scrollbar-hide escape hatch only.
- `.homepage-collection-tiles__track { scrollbar-width: none; }` — Firefox
- `.homepage-collection-tiles__track::-webkit-scrollbar { display: none; }` — Chrome/Safari/Edge

No other CSS in SCSS. All other styling via Tailwind utilities.

---

## CSS Custom Properties Used

| Property | Value source | Applied to |
|---|---|---|
| `--hct-font` | `{{ section_font.family }}, {{ section_font.fallback_families }}, sans-serif` | `#shopify-section-{{ section.id }}` |

Used in `<h2>` via `style="font-family: var(--hct-font);"`.

---

## Figma Variants Implemented

| Figma state | Implementation |
|---|---|
| Default (prev-disabled, next-enabled) | Baked into markup as initial `data-state` on each arrow |
| Prev arrow disabled (opacity 40%) | `data-[state=prev-disabled]:tw-opacity-40` + `tw-pointer-events-none` on prev button |
| Next arrow disabled (opacity 40%) | `data-[state=next-disabled]:tw-opacity-40` + `tw-pointer-events-none` on next button |
| Arrow hover | `hover:tw-bg-[#e8eaed]` — slight darken, not in spec but inferred for UX |
| Mobile tile scroll (arrows hidden) | `tw-hidden md-small:tw-flex` on both arrows; native overflow-x scroll on track |
| Responsive tile width | 160px base → 180px md-small → 208px md |
| Responsive heading size | 32px base → 40px md-small → 48px md |
| Image fallback (blank) | `<div class="tw-bg-[#e8eaed]">` placeholder when `tile_image == blank` |

---

## Figma Variants NOT Implemented

| Variant | Reason |
|---|---|
| `aria-disabled` / `tabindex` toggling on scroll | JS-agent responsibility — initial values only in markup |
| Scroll-snap alignment per tile | Not specified in brief; omitted to keep native scroll simple |

---

## JS Handoff Notes

Mount selector: `[data-section-type="homepage-collection-tiles"]`

Per section instance, query:
- `[data-track]` — scroll container
- `[data-arrow="prev"]` — prev button
- `[data-arrow="next"]` — next button

Required behavior:
1. On mount: check if track overflows. If no overflow, set `data-state="next-disabled"` on next arrow immediately. Always start with prev `data-state="prev-disabled"`.
2. Arrow click (`data-arrow="prev"`): `track.scrollBy({ left: -scrollAmount, behavior: 'smooth' })` where `scrollAmount` is one tile width + gap, or `track.clientWidth`.
3. Arrow click (`data-arrow="next"`): `track.scrollBy({ left: +scrollAmount, behavior: 'smooth' })`.
4. `scroll` event on track (debounced/throttled): recompute boundaries.
   - `scrollLeft === 0` → prev `data-state="prev-disabled"`, `aria-disabled="true"`, `tabindex="-1"`.
   - `scrollLeft + clientWidth >= scrollWidth - 2` (2px tolerance) → next `data-state="next-disabled"`.
   - Otherwise → `*-enabled`, `aria-disabled="false"`, `tabindex="0"`.
5. `resize` observer on track: rerun boundary check.

State transitions JS must write to DOM:
- `[data-arrow="prev"].dataset.state` = `"prev-disabled"` | `"prev-enabled"`
- `[data-arrow="next"].dataset.state` = `"next-disabled"` | `"next-enabled"`
- `[data-arrow="prev"].ariaDisabled` + `[data-arrow="prev"].tabIndex` (accessibility)
- `[data-arrow="next"].ariaDisabled` + `[data-arrow="next"].tabIndex`

No events emitted. No events consumed. No external API calls.

Font note: `dm_sans_n7` font_picker default loads DM Sans weight 700 only. If weight 500 (tile labels) is not preloaded by `font_face` output, browser may faux-bold. Test visually; may need weight 500 variant loaded separately or via a second `font_picker` setting.

---

## Questions

None.
