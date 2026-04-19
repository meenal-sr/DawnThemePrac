# Architecture — collection-grid

## File plan

### Create
- `sections/collection-grid.liquid` — section shell, schema (section settings + `tile` block), renders `carousel-wrapper` with pre-rendered `homepage-collection-tile` slides joined by `::slider-limiter`.

### Do NOT create
- `js/sections/collection-grid.js` — NO. `<carousel-swiper>` already globally registered via `js/sections/global.js`.
- `scss/sections/collection-grid.scss` — NO. All styling via Tailwind utilities; Swiper CSS + pagination styles come from `scss/sections/common-imports.scss` + `scss/components/carousel-wrapper.scss` (global).

## Reuse

| Need | File | Call-site signature |
|---|---|---|
| Carousel shell + `<carousel-swiper>` custom element + arrow markup | `snippets/carousel-wrapper.liquid` | `{% render 'carousel-wrapper', section_id: section.id, slider_items: slider_items, mobile_slides_per_view: '2.2', tablet_slides_per_view: '3.2', desktop_slides_per_view: 6, desktop_space_between: 32, tablet_space_between: 32, mobile_space_between: 16, navigation_enabled: true, carousel_class: 'collection-grid__carousel' %}` — `slider_items` is a string of tile HTML chunks joined by `::slider-limiter`. |
| Tile card (image + label + link) | `snippets/homepage-collection-tile.liquid` | `{% render 'homepage-collection-tile', block: block %}` — **block type MUST be `tile`**; block settings MUST be: `image` (image_picker), `image_aspect_ratio` (select: `1:1` / `4:3` / `16:9`, default `1:1`), `label` (text), `link` (url). Snippet reads `block.id` + `block.shopify_attributes`. |
| Carousel JS behavior | `js/components/carousel-swiper.js` via `js/sections/global.js` | Auto — `<carousel-swiper>` custom element registered globally. No import needed in section. |
| Swiper base CSS | `scss/sections/common-imports.scss` (imports `pkg:swiper/css`, `/navigation`, `/pagination`) | Global — no action required. |

## Block decision (inherited from reuse)
Tiles MUST be Shopify theme blocks (type `tile`), NOT a section-setting list — `homepage-collection-tile.liquid` reads `block.settings.*` + `block.id` + `block.shopify_attributes`. Planner's section-setting hypothesis is overridden by reuse contract. Schema: one block type `tile`, `max_blocks: 12`, default preset = 6 `tile` blocks.

## Schema setting IDs (section settings — ui-plan.md owns types/defaults)
- `heading` (section heading text)
- `show_heading` (toggle)
- `view_more_label`
- `view_more_url` (default `/collections/all`)
- `show_view_more` (toggle)
- Padding top/bottom (optional range — ui-plan decides)
