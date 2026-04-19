# Brief — collection-grid

## What & why
- **Feature name:** collection-grid
- **Purpose:** Merchant-configurable horizontal carousel of category tiles linking to collection (or any) URLs. Sits on page templates as a category browse row above/below other marketing sections.
- **Figma references:** Desktop: node `5654:4305`
- **Template type:** `page`
- **Accessibility:** `required` — user-facing navigation row, must meet WCAG 2.1 AA (heading order, link labels, keyboard focus, arrow button labels).
- **Render context:** Shopify section, added via theme editor on page templates.
- **JS needed:** NO — carousel behavior provided by existing global `<carousel-swiper>` custom element (pre-decided reuse).

## Reuse (pre-decided with human, architect to confirm)
- `snippets/carousel-wrapper.liquid` — carousel shell with prev/next arrow markup + `<carousel-swiper>` wiring
- `snippets/homepage-collection-tile.liquid` — individual tile (image + label + link)
- `<carousel-swiper>` — global custom element already shipped in the theme; handles scroll, arrow state, and responsive behavior
- Because reuse is pre-decided, no new JS entry is required. Architect confirms the snippet signatures match the tile data shape described below.

## Variants and blocks
- **Single variant.** All 6 tiles in Figma are the same visual template (image on top, label below, white card). No block-level variants.
- **Blocks:** None authored by planner. Tiles are driven by section settings (repeatable structure owned by section), not theme blocks, because:
  - Reuse contract expects tiles to come from section settings fed into `homepage-collection-tile.liquid`
  - All tiles share one visual template — no per-tile variation worth block-level editor UX
  - Architect may convert to blocks if the reuse snippet signature demands it; flag in `architecture.md` if so.
- **Section schema owns:**
  - Section heading text (default: `Shop By Category`)
  - "View More" link label (default: `View More`)
  - "View More" link URL (default: `/collections/all`)
  - Show/hide "View More" link (boolean)
  - Show/hide section heading row (boolean)
  - Tile list — each tile has: image, label, link URL
  - Default tile count: 6 (matches Figma)
  - Min 1 tile, max reasonable cap (e.g. 12) — architect confirms cap
  - Optional: top padding, bottom padding range controls if merchant-configurability is desired

## Data
- **Data sources:** `section.settings` only. No page/product/collection context consumed. No metafields. No fetch calls.
- **Liquid objects accessed:** `section.settings.<setting_id>` for heading, view-more label, view-more URL, visibility toggles, tile array entries (image, label, url).
- **Merchant-configurable settings (types):**
  - Heading — `text`
  - Show heading row — `checkbox`
  - View More label — `text`
  - View More URL — `url` (default `/collections/all`)
  - Show View More — `checkbox`
  - Per-tile image — `image_picker`
  - Per-tile label — `text`
  - Per-tile link — `url`

## Behaviour contract
- **States:**
  - Default — full tile row rendered, arrows visible when overflow present
  - Empty — no tiles configured → entire section hidden (or placeholder, architect to decide fallback)
  - Overflow state managed by `<carousel-swiper>` — arrows enable/disable based on scroll position (behavior owned by the custom element, not re-implemented here)
- **JS-controlled vs Liquid:**
  - Carousel scroll, arrow state, keyboard nav → `<carousel-swiper>` global (JS)
  - Heading visibility, View More visibility, tile list rendering → Liquid conditionals on section settings
- **Events emitted / listened to:** None new. All behavior lives inside `<carousel-swiper>`; this section does not add custom events.
- **API calls:** None.

## Accessibility requirements
- Heading is `<h2>` (page-level `<h1>` lives elsewhere on the page template).
- Prev/next arrow buttons have descriptive `aria-label` (e.g. "Previous tiles" / "Next tiles") and correct disabled state semantics — owned by `carousel-wrapper` snippet.
- Each tile is a single focusable link containing image + label; label text is the accessible name.
- "View More" link is a real `<a>` with visible label; URL default `/collections/all`.
- Focus order: heading → view more link → tile 1 → tile 2 → … → prev arrow → next arrow (final order confirmed by ui-agent against reuse snippet).
- Color contrast: label `#000` on `#fff` card; heading `#0b1e3d` on `#f4f6f8` section bg — both exceed AA.

## Responsive intent (Figma delta note)
- Figma supplied desktop node only (`5654:4305`). No mobile frame provided.
- Visual intent: horizontal scrolling row of fixed-width tiles on all breakpoints. On smaller viewports the row simply shows fewer tiles at once and relies on horizontal scroll/swipe; arrow controls remain available on pointer devices.
- Inner max-width 1338 caps the content area on wide desktop; outer section padding follows Figma values on desktop. UI-agent determines the mobile padding/gap deltas as a visual judgement call since no mobile design was provided — flag as an assumption in `ui-plan.md` and request Figma mobile if merchant asks for fidelity.

## Design content reference

### Copy (verbatim from Figma — use as default values in schema)
- **Section heading:** `Shop By Category`
- **Utility link label:** `View More`
- **Tile labels (in order, 6 tiles):**
  1. `Indoor Air Quality`
  2. `Split Systems`
  3. `Packaged Terminal Systems`
  4. `Scratch and Dent`
  5. `Portable Ac System`
  6. `HVAC Parts - Accessories`

### Typography
| Element | Family | Weight | Size (px) | Line-height | Letter-spacing | Transform |
|---|---|---|---|---|---|---|
| Section heading (h2) | DM Sans | Bold (700) | 48 | 52.8 | — | none |
| View More link | DM Sans | Bold (700) | 16 | 20 | — | capitalize |
| Tile label | DM Sans | Medium (500) | 15 | 24 | — | none |

### Colors
| Token | Hex / rgba | Usage |
|---|---|---|
| Section background | `#f4f6f8` | Outer section surface + arrow fill |
| Heading text | `#0b1e3d` | h2 |
| Body / link / label text | `#000000` | View More + tile label |
| Card surface | `#ffffff` | Tile card background |
| Arrow border | `rgba(0, 0, 0, 0.2)` | Prev/next button stroke |
| Prev arrow opacity | 40% | Prev button resting state (matches Figma) |
| View More underline | `#000000`, 1px | Bottom border under View More label |

### Spacing / sizing (from Figma, desktop)
| Property | Value (px) |
|---|---|
| Section padding top | 60 |
| Section padding bottom | 40 |
| Section padding left/right | 50 |
| Inner max-width | 1338 |
| Column gap (heading row ↔ tile row, tile ↔ tile) | 32 |
| Tile padding x | 18 |
| Tile padding y | 21 |
| Tile image box | 166 × 166 (object-cover) |
| Tile image → label gap | 23 |
| Tile corner radius | 16 |
| Arrow size | 48 (circle, radius 24) |
| Prev arrow offset from track | -24 left |
| Next arrow offset from track | -24 right |

## Constraints and assumptions
- **Assumption — block vs section-setting tile list:** planner chose section-settings-driven tiles (not theme blocks) to match the pre-decided reuse contract of `homepage-collection-tile.liquid`. Architect may switch to repeatable blocks if the reuse snippet already expects a block loop; call it out in `architecture.md`.
- **Assumption — no mobile Figma:** only desktop frame provided. Mobile padding/gap/tile-size deltas are a ui-agent visual call. If the merchant or design later provides a mobile frame, revisit `ui-plan.md`.
- **Assumption — tile cap:** default 6, max 12 proposed. Architect confirms against any real-world merchant need.
- **Assumption — empty state:** zero configured tiles → hide entire section. Confirm with merchant if a placeholder is preferred.
- **Performance:** tile images should be lazy-loaded and use Shopify image_url transforms at reasonable sizes (166 × 166 display, 2x retina). UI-agent owns the exact `image_tag` call.
- **JS:** NO new JS is written for this section. All interactivity comes from the existing `<carousel-swiper>` custom element via `carousel-wrapper.liquid`.

## Downstream hand-off notes
- **Architect** — confirm reuse snippet signatures; decide whether tiles map to blocks or section-setting list; assign file paths; document any cross-section contract if `<carousel-swiper>` consumes shared attributes.
- **UI-agent Phase 1** — produce `ui-plan.md` covering DOM outline inside `carousel-wrapper`, Tailwind token map for spacing/typography/color values above, responsive strategy (since no mobile Figma), font loading for DM Sans.
- **UI-agent Phase 2** — Liquid + Tailwind + as-built `component-structure.md` with authoritative selectors and state contract.
- **Test-agent** — pulls the Design content reference block above to assert typography/color/copy at design breakpoints.
