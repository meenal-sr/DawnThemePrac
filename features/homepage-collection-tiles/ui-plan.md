# UI Plan — homepage-collection-tiles

## File targets

From `architecture.md` → Create:

| File | Status |
|---|---|
| `sections/homepage-collection-tiles.liquid` | CREATE |
| `snippets/homepage-collection-tile.liquid` | CREATE |
| `js/sections/homepage-collection-tiles.js` | CREATE (js-agent) |
| `scss/sections/homepage-collection-tiles.scss` | CREATE — YES (see SCSS decision below) |

---

## DOM outline (intent only)

### `sections/homepage-collection-tiles.liquid`

```
<section data-section-type="homepage-collection-tiles" class="homepage-collection-tiles ...bg/padding classes...">
  {% liquid block — assign all variables %}

  <div class="homepage-collection-tiles__inner ...flex-col gap...">

    <!-- Header row -->
    <div class="homepage-collection-tiles__header ...flex items-center justify-between w-full...">
      <h2 class="homepage-collection-tiles__heading ...font/color/size classes...">
        {{ heading }}
      </h2>
      <a class="homepage-collection-tiles__view-more ...text/border-b classes..." href="{{ view_more_link }}">
        {{ view_more_label }}
      </a>
    </div>

    <!-- Carousel row — contains track + arrows -->
    <div class="homepage-collection-tiles__carousel tw-relative">

      <!-- Scroll track -->
      <div class="homepage-collection-tiles__track tw-flex tw-overflow-x-auto ...gap/scroll-snap/scrollbar-hide...">
        {% for block in section.blocks %}
          {% render 'homepage-collection-tile', block: block %}
        {% endfor %}
      </div>

      <!-- Prev arrow (hidden mobile, visible md-small+) -->
      <button
        type="button"
        class="homepage-collection-tiles__arrow homepage-collection-tiles__arrow--prev tw-hidden md-small:tw-flex ...size/bg/border/radius/position classes..."
        aria-label="Previous tiles"
        data-state="prev-disabled"
      >
        {% render 'icon-chevron-left' %} {# SVG via asset_url — js-agent / architect to confirm icon name #}
      </button>

      <!-- Next arrow (hidden mobile, visible md-small+) -->
      <button
        type="button"
        class="homepage-collection-tiles__arrow homepage-collection-tiles__arrow--next tw-hidden md-small:tw-flex ...size/bg/border/radius/position classes..."
        aria-label="Next tiles"
        data-state="next-enabled"
      >
        {% render 'icon-chevron-right' %}
      </button>

    </div>
  </div>

  {% schema %}…{% endschema %}
</section>
```

Key notes:
- All Liquid variables assigned at top in a single `{% liquid %}` block.
- Section background applied via inline style `style="background-color: {{ section.settings.background_color }}"` — merchant-controlled color.
- Arrow initial `data-state` values baked into markup; JS overwrites on mount + scroll.
- Track: `tw-overflow-x-auto` + scrollbar-hide class (from SCSS escape hatch). No `overflow: hidden` on carousel row — arrows protrude ±24px outside track edges.
- Carousel row uses `tw-relative` so absolute arrows position against it, NOT the section root.

### `snippets/homepage-collection-tile.liquid`

```
<a class="homepage-collection-tile tw-flex-none tw-flex tw-flex-col tw-gap-[23px] tw-w-[160px] md-small:tw-w-[180px] md:tw-w-[208px] tw-no-underline"
   href="{{ block.settings.link }}"
   {{ block.shopify_attributes }}>

  <!-- Card shell -->
  <div class="homepage-collection-tile__card tw-bg-white tw-rounded-[16px] tw-overflow-hidden tw-px-[18px] tw-py-[21px] tw-flex tw-items-center tw-justify-center">
    {% render 'shopify-responsive-image',
       image: block.settings.image,
       image_id: block.id,
       image_aspect_ratio: 1,
       image_class: 'tw-w-full tw-h-full tw-object-cover',
       wrapper_class: 'tw-w-full tw-h-full',
       fill: true
    %}
  </div>

  <!-- Label -->
  <p class="homepage-collection-tile__label tw-text-[15px] tw-leading-[24px] tw-font-medium tw-text-black tw-text-center tw-m-0">
    {{ block.settings.label }}
  </p>

</a>
```

Key notes:
- Entire tile is a single `<a>` — card + label both inside, fully clickable.
- `tw-flex-none` prevents track flex from shrinking tiles below their declared width.
- Width is responsive per pre-resolved answer: 160px base / 180px md-small / 208px md+.
- Image rendered via `shopify-responsive-image`, `image_aspect_ratio: 1` enforces square crop.
- Label `<p>` not `<span>` — block-level, centers cleanly.

---

## Layout strategy

### Section container
- `tw-flex tw-flex-col` — vertical stack of header row + carousel row.
- Padding: `tw-pt-[60px] tw-pb-[40px] tw-px-[50px]` (Figma exact — all arbitrary brackets).
- Background: inline style from `section.settings.background_color`.
- Max width: Figma shows inner container `w-[1338px]` inside a `1440px` section. Implement as `tw-max-w-[1338px] tw-mx-auto tw-w-full` on the inner `__inner` div, NOT a hard `w-` constraint. Let the section root be full-width.
- Gap between header row and carousel row: `tw-gap-[32px]`.

### Header row
- `tw-flex tw-items-center tw-justify-between tw-w-full` — heading on left, View More on right.
- Heading: `tw-flex-1` so it fills available space without forcing View More to wrap.

### Carousel row (`__carousel`)
- `tw-relative tw-overflow-visible` — arrows sit absolutely at ±24px outside track edge; overflow-visible ensures they're not clipped.
- The TRACK (`__track`) gets `tw-overflow-x-auto` + scrollbar-hide class.
- No explicit height on carousel row — track height is driven by tile height (card + gap + label).

### Arrows
- `tw-absolute tw-top-1/2 tw--translate-y-1/2` — vertically centered on carousel row.
- Prev: `tw-left-[-24px]` (overlapping section padding territory).
- Next: `tw-right-[-24px]`.
- Size: `tw-w-[48px] tw-h-[48px]`.
- Shape: `tw-rounded-[24px]` (full circle at 48px diameter).
- Background: `tw-bg-[#f4f6f8]` (matches section bg — arrows blend into it visually).
- Border: `tw-border tw-border-[rgba(0,0,0,0.2)]`.
- Display: `tw-hidden md-small:tw-flex tw-items-center tw-justify-center` — hidden mobile, flex-centered md-small+.

### Arrow disabled state
- `data-state="prev-disabled"` → `data-[state=prev-disabled]:tw-opacity-40 data-[state=prev-disabled]:tw-pointer-events-none data-[state=prev-disabled]:tw-cursor-default`
- `data-state="next-disabled"` → same opacity/pointer-events pattern.
- `aria-disabled` + `tabindex` written by JS when state changes (not in markup — JS-agent's responsibility).

### Tile flex layout
- Track: `tw-flex tw-gap-x-[...] tw-overflow-x-auto tw-scroll-smooth`.
- Column gap: Figma says `justify-between` (variable gap). For a scrollable track, `justify-between` is wrong — tiles should have a fixed gap so they don't expand to fill the track. Use `tw-gap-x-[20px]` as the inter-tile gap (close to Figma visual spacing at 6 tiles in 1338px container: `(1338 - 6*208) / 5 ≈ 19.6px`). This keeps pixel-perfect fidelity at design width.
- Each tile `tw-flex-none` — no shrink/grow.

---

## Responsive strategy

Mobile-first, CSS-only (same DOM, breakpoint prefixes). No DOM duplication needed — only tile width and heading size change across breakpoints.

### Per-element breakpoint table

| Element | Base (375px) | small (390px) | md-small (768px) | md (1024px) | lg (1280px) |
|---|---|---|---|---|---|
| Section padding-x | `tw-px-[20px]` | — | `tw-md-small:px-[32px]` | `md:tw-px-[50px]` | — |
| Heading font size | `tw-text-[32px]` | — | `md-small:tw-text-[40px]` | `md:tw-text-[48px]` | — |
| Heading line-height | `tw-leading-[36px]` | — | `md-small:tw-leading-[44px]` | `md:tw-leading-[52.8px]` | — |
| Tile width | `tw-w-[160px]` | — | `md-small:tw-w-[180px]` | `md:tw-w-[208px]` | — |
| Arrow visibility | `tw-hidden` | — | `md-small:tw-flex` | — | — |
| Inner container max-w | `tw-max-w-full` | — | — | — | `lg:tw-max-w-[1338px]` |

Notes:
- Section padding-x scales up progressively to avoid cramped mobile view.
- Tile width drives how many tiles are partially visible on mobile (160px tiles + 20px gaps in ~335px track width = ~2.1 tiles visible — partial reveal cues scroll).
- No horizontal scrollbar shown on any breakpoint (scrollbar-hide SCSS).
- Arrow hidden base→md-small; `tw-hidden md-small:tw-flex` on each arrow.

---

## Token map

All Figma values mapped to their Tailwind expression. No new tokens added to `tailwind.config.js`.

| Figma value | Tailwind utility | Source |
|---|---|---|
| `#f4f6f8` section bg | `tw-bg-[#f4f6f8]` via inline style from `background_color` setting | arbitrary (no token) |
| `#0b1e3d` heading color | `tw-text-[#0b1e3d]` | arbitrary — differs ~2 RGB steps from `heading-text` (#092846); use literal |
| `#ffffff` card bg | `tw-bg-white` | Tailwind core |
| `#000000` label + view-more color | `tw-text-black` | Tailwind core |
| `rgba(0,0,0,0.2)` arrow border | `tw-border-[rgba(0,0,0,0.2)]` | arbitrary |
| `#f4f6f8` arrow bg | `tw-bg-[#f4f6f8]` | arbitrary |
| 48px font: DM Sans Bold | loaded via `section_font` font_picker + `font_face` + CSS custom property | font-picker mechanism |
| 48px heading size | `tw-text-[48px]` | arbitrary |
| 52.8px heading line-height | `tw-leading-[52.8px]` | arbitrary |
| 16px view-more size | `tw-text-[16px]` | arbitrary |
| 20px view-more line-height | `tw-leading-[20px]` | arbitrary |
| 15px label size | `tw-text-[15px]` | arbitrary |
| 24px label line-height | `tw-leading-[24px]` | arbitrary |
| 700 bold weight | `tw-font-bold` | Tailwind core |
| 500 medium weight | `tw-font-medium` | Tailwind core |
| 60px section padding-top | `tw-pt-[60px]` | arbitrary |
| 40px section padding-bottom | `tw-pb-[40px]` | arbitrary |
| 50px section padding-x (desktop) | `md:tw-px-[50px]` | arbitrary |
| 32px header→carousel gap | `tw-gap-[32px]` | arbitrary (`spacing.8` = 32px exists — use `tw-gap-8`) |
| 23px tile card→label gap | `tw-gap-[23px]` | arbitrary |
| 18px card padding-x | `tw-px-[18px]` | arbitrary |
| 21px card padding-y | `tw-py-[21px]` | arbitrary |
| 208px tile width (desktop) | `md:tw-w-[208px]` | arbitrary |
| 16px card border-radius | `tw-rounded-[16px]` | arbitrary |
| 24px arrow border-radius | `tw-rounded-[24px]` | arbitrary |
| 48×48px arrow size | `tw-w-[48px] tw-h-[48px]` | arbitrary |
| 20×20px arrow icon size | `tw-w-[20px] tw-h-[20px]` (on SVG element) | arbitrary |
| prev arrow disabled opacity 40% | `data-[state=prev-disabled]:tw-opacity-40` | arbitrary variant |
| 1px view-more bottom border | `tw-border-b tw-border-b-black` | Tailwind core |
| 1338px inner container max-width | `lg:tw-max-w-[1338px]` | arbitrary |

Note on `tw-gap-8`: spacing key `8` = 32px per `tailwind.config.js` — this is a safe scale token. Used for the header→carousel gap.

---

## SCSS decision

**YES** — `scss/sections/homepage-collection-tiles.scss` must be created.

Escape-hatch rules satisfied:
1. **`::-webkit-scrollbar` pseudo-element** — hide native scrollbar on the tile track. Tailwind has no utility for this; requires `scrollbar-width: none` (Firefox) + `::-webkit-scrollbar { display: none }` (Chrome/Safari). This is a pseudo-element rule that Tailwind's `before:`/`after:` variants cannot express.
2. **Build requirement** — `scss/sections/common-imports.scss` already `@import`s `./homepage-collection-tiles.scss`. File must exist or the SCSS build breaks.

SCSS content (minimal — only the escape-hatch rules):
```scss
.homepage-collection-tiles__track {
  scrollbar-width: none; // Firefox
  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Edge
  }
}
```

No other styles go in SCSS — all other styling expressed via Tailwind utilities.

---

## Font loading mechanism (Option B — pre-resolved)

1. Section schema includes a `font_picker` setting: key `section_font`, default `dm_sans_n7` (DM Sans, weight 700).
2. Section Liquid outputs `{{ section.settings.section_font | font_face }}` in a `<style>` block at the top of the section.
3. CSS custom property scoped to the section: `--hct-font: {{ section.settings.section_font | font_family }}`.
4. Heading element: `style="font-family: var(--hct-font);"` via inline style attribute (section-scoped, not a global class).
5. View More label uses `tw-font-bold` — DM Sans bold available if merchant keeps default font.
6. Tile label uses `tw-font-medium` — weight 500. DM Sans medium available via font_face output.

Note: font_face filter outputs the `@font-face` declaration. Font must be loaded for all three weights (400/500/700) used — the `dm_sans_n7` font_picker default only guarantees 700. If 500 is not preloaded, browser may faux-bold or fall back. Flag as a note for js-agent / test-agent — no schema change needed from ui-agent, this is a font loading edge case.

---

## Variant → state mapping

| Figma variant / state | Implementation |
|---|---|
| Default (next-enabled, prev-disabled) | Baked into markup as initial `data-state` on each arrow |
| Prev disabled | `data-state="prev-disabled"` → `data-[state=prev-disabled]:tw-opacity-40` + `data-[state=prev-disabled]:tw-pointer-events-none` |
| Prev enabled | `data-state="prev-enabled"` → no visual modifier (full opacity, interactive) |
| Next disabled | `data-state="next-disabled"` → `data-[state=next-disabled]:tw-opacity-40` + `data-[state=next-disabled]:tw-pointer-events-none` |
| Next enabled | `data-state="next-enabled"` → no visual modifier |
| Arrow hover | `hover:tw-bg-[#e8eaed]` — slight darkening on hover (inferred; not in Figma spec, reasonable UX) |
| Mobile (< md-small) | Same DOM, arrows `tw-hidden`, tile width 160px, native touch scroll |
| Tablet md-small (768px) | Arrows appear `md-small:tw-flex`, tile width 180px |
| Desktop md+ (1024px+) | Arrows always visible, tile width 208px, full heading size |

---

## Reuse references followed

| Reuse item | File | Convention lifted |
|---|---|---|
| Responsive tile image | `snippets/shopify-responsive-image.liquid` | Called via `{% render %}` with `image_aspect_ratio: 1` for square. `image_id: block.id` for uniqueness. `fill: true` for object-cover. |
| BEM class convention | `sections/hero-banner.liquid` (observed pattern per architecture.md) | `homepage-collection-tiles__*` prefix on all section-level elements. BEM classes are JS/a11y hooks only — no visual rules inside BEM in SCSS. |
| Tailwind arbitrary bracket convention | `memory/feedback_tailwind_arbitrary_vs_scale.md` | All Figma px literals in brackets. No scale shortcuts unless verified to match px value. |
| Single image_picker per tile | `memory/feedback_ui_image_fields.md` + architecture.md reuse note 2 | No desktop/mobile/aspect triplet. One `image` picker per tile block. |
| data-section-type attribute | architecture.md reuse note 8 | `data-section-type="homepage-collection-tiles"` on root `<section>`. |

---

## Questions

None. All design decisions pre-resolved. Build may proceed to Phase 2.
