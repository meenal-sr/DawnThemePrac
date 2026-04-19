# figma-context.md — promo-collection

Canonical design data. Main prefetched from Figma. Do NOT prescribe DOM structure; ui-agent decides.

## Figma sources

| Breakpoint | URL | Node ID | Reference PNG |
|---|---|---|---|
| Desktop 1440w | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-4305 | `5654:4305` | `qa/figma-desktop.png` |
| Mobile 390w | https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-52452 | `5654:52452` | `qa/figma-mobile.png` |

## Figma variables

| Token | Value | Notes |
|---|---|---|
| `radius/2xl` | `16px` | Desktop tile card corners |
| `radius/lg` | `8px` | Mobile tile card + image corners |

No color or typography variables surfaced — use raw hex/px values below.

## Colors

| Role | Hex | Used |
|---|---|---|
| Section background | `#f4f6f8` | Desktop + mobile section wrapper |
| Tile card background | `#ffffff` | Desktop + mobile |
| Heading (desktop) | `#0b1e3d` | Desktop h2 only |
| Heading (mobile) | `#000000` | Mobile h2 |
| Label + View-more | `#000000` | Both breakpoints |
| Arrow button border | `rgba(0,0,0,0.2)` | Desktop arrows only |
| Arrow button BG | `#f4f6f8` | Desktop arrows only |

## Typography

Font family across all text: **DM Sans**, variable-font `opsz 14`.

### Desktop (1440w)

| Element | Size / Line-height | Weight | Color | Transform |
|---|---|---|---|---|
| Heading "Shop By Category" | 48 / 52.8 | Bold 700 | `#0b1e3d` | — |
| "View More" link | 16 / 20 | Bold 700 | `#000` | capitalize, 1px black underline gap `pb-[2px]` |
| Tile label | 15 / 24 | Medium 500 | `#000` | text-center |

### Mobile (390w)

| Element | Size / Line-height | Weight | Color | Transform |
|---|---|---|---|---|
| Heading "Shop By Category" | 28 / 33.6 | Bold 700 | `#000` | — |
| "View More" link | 15 / 24 | Bold 700 | `#000` | capitalize, 1px black underline gap `pb-[2px]` |
| Tile label | 13.5 / 21.6 | Medium 500 | `#000` | text-center |

## Spacing + layout

### Desktop (1440w)

| Region | Value |
|---|---|
| Section `px` / `py` | `pl/pr 50` / `pt 60 pb 40` |
| Section BG | `#f4f6f8` |
| Inner frame width | `1338px` fixed |
| Inner stack gap | `32px` (between header row + tiles row) |
| Header row alignment | flex items-center, heading grows to fill, "View More" right-aligned |
| Tiles row | `flex items-center justify-between w-full` — 6 tiles spread across 1338px |
| Tile width | 5 tiles 208px, 1 tile 214px — effectively ~208px each; justify-between auto-gaps |
| Tile inner gap (image → label) | `23px` |
| Tile card | `bg-white rounded-[16px] px-[18px] py-[21px]` — centers image |
| Tile image | `166×166px`, object-cover absolute inset-0 |
| Nav arrows | `48×48px` circle (`rounded-[24px]`), `bg-[#f4f6f8]` `border-[rgba(0,0,0,0.2)]` |
| Arrow position | `top 50% translate-y-[-50%]`, `left -24px` (prev), `right -24px` (next) |
| Arrow icon | 20px chevron SVG |
| Prev disabled state | `opacity-40`, pointer disabled |

### Mobile (390w)

| Region | Value |
|---|---|
| Section `px` / `py` | `pl/pr 16` / `pt/pb 30` |
| Section BG | `#f4f6f8` |
| Header padding-bottom | `24.2px` (below view-more group) |
| Heading → View-more gap | `pt 12` |
| Slider container | `overflow-x-auto` on full width, inner `px-[16px]` |
| Tile width | `140px` |
| Tile gap | `8px` |
| Tile card | `aspect-1:1 bg-white rounded-[8px]` |
| Tile image | `140×140px` absolute, `rounded-[8px]` |
| Tile inner gap (image → label) | `12px` |
| Label wrap | 2-line possible (e.g. "HVAC Parts -\nAccessories") |
| Nav arrows | **none on mobile** — horizontal scroll only |

## Cross-breakpoint deltas

| Axis | Desktop | Mobile |
|---|---|---|
| Layout | 6 tiles spread via `justify-between` in 1338px frame | Single-row horizontal scroll, fixed 140px tiles |
| Card radius | 16px | 8px |
| Card image size | 166×166 | 140×140 |
| Card padding | `px-18 py-21` around image | no extra padding — image fills card |
| Header orientation | Row (heading + view-more inline) | Column (heading above view-more) |
| Heading size | 48/52.8 | 28/33.6 |
| View-more size | 16/20 | 15/24 |
| Label size | 15/24 | 13.5/21.6 |
| Nav arrows | Yes (both ends, left faded) | No |

## Copy (ground truth)

**Heading:** `Shop By Category`
**View-more label:** `View More` (desktop) / `View more` (mobile — lowercase second word). Treat as `View More` canonical; capitalize via CSS.

**Tile labels (6 categories, order as in Figma desktop):**
1. Indoor Air Quality
2. Split Systems
3. Packaged Terminal Systems
4. Scratch and Dent
5. Portable Ac System
6. HVAC Parts - Accessories

Mobile frame shows only 3 tiles visible (HVAC Parts - Accessories, Portable Ac System, Packaged Systems truncated) — this is just what fits on mobile-slider at scroll-position 0; not a different set.

## Dev annotations

Mobile frame includes Figma annotations:
- Outer scroll container: **"Theme Section: Collection List Slider"** — "Customization: 1. Increasing the card size. 2. Keep the font style same/default."
- Tile: **"Collection Tile:"**
- Tile image: **"Collection Image:"**

Planner MUST respect these. Schema + block naming should align with "Collection List Slider" / "Collection Tile" semantics.

## Imagery

Per binding rule in user memory (`feedback_never_export_figma_assets`): NEVER auto-export the Figma tile images into `/assets/`. Use `image_picker` schema settings per-tile (block) — merchant uploads their own category images.

## Interactions

- Desktop: arrow buttons advance/rewind horizontal slider. Prev starts disabled (at left edge).
- Mobile: native horizontal scroll. No arrows. No pagination dots shown in Figma.
- Both: tiles are clickable — link to collection page.
- Hover states: not documented in Figma. Main recommends subtle card lift or nothing — planner decides.
