# homepage-collection-tiles — Brief

## What & why

**Feature name:** `homepage-collection-tiles`

**Purpose:** Allow merchants to redirect visitors to any page URL via visual category tiles. Improves conversion by surfacing key product categories as clickable image + label cards in a horizontally scrollable carousel.

**Figma reference:**
- File key: `g3gxO3mhrniJOYTHNmotAu`
- Node ID: `5654:4305`
- Screenshot: `features/homepage-collection-tiles/qa/figma-default.png`

**Template type:** `page`

**Accessibility:** `skip`

---

## Variants and blocks

### Section (one instance)
No distinct visual variants — single layout. No conditional branching needed.

**Section schema settings (macro layout + global copy):**

| Setting key | Type | Purpose |
|---|---|---|
| `heading` | text | "Shop By Category" heading above the tile row |
| `view_more_label` | text | Label for the "View More" tab link (default: "View More") |
| `view_more_link` | url | Destination URL for the "View More" tab link |
| `background_color` | color | Section background (design: `#f4f6f8`) |

### Block type: `tile`

Each tile is an independent Theme Block. Merchant adds/removes/reorders tiles via the theme editor. Architect decides the snippet path.

**Block schema settings (per tile):**

| Setting key | Type | Purpose |
|---|---|---|
| `image` | image_picker | Tile image (square, design shows 166×166 display size) |
| `label` | text | Category label below the card (e.g. "Indoor Air Quality") |
| `link` | url | Destination URL when tile is clicked |

No variant-specific settings — all tiles share the same visual treatment.

---

## Data

**Data sources:** `section.settings` + block settings only. No Shopify collection references. No metafields. No fetch calls.

**Liquid objects accessed:**

- `section.settings.heading` — heading text
- `section.settings.view_more_label` — CTA tab label
- `section.settings.view_more_link` — CTA tab URL
- `section.settings.background_color` — section background color
- `section.blocks` — loop to render each tile block
- Per block: `block.settings.image`, `block.settings.label`, `block.settings.link`
- `block.shopify_attributes` — for theme editor targeting

---

## Behaviour contract

### States

| State | Trigger | Control |
|---|---|---|
| `data-state="prev-disabled"` on prev arrow | Carousel at leftmost scroll position | JS-controlled |
| `data-state="prev-enabled"` on prev arrow | Carousel scrolled right of start | JS-controlled |
| `data-state="next-disabled"` on next arrow | Carousel at rightmost scroll position | JS-controlled |
| `data-state="next-enabled"` on next arrow | Carousel has more tiles to the right | JS-controlled |

Initial state from Figma: prev arrow is disabled (opacity 40%), next arrow is enabled.

### Arrow behavior
- Prev arrow: scrolls carousel left by one tile group width on click
- Next arrow: scrolls carousel right by one tile group width on click
- Arrows reflect scroll boundaries — disabled state applied when scroll limit reached

### JS needed: YES

**Events emitted:** none

**Events listened to:** none

**API calls:** none

---

## Breakpoint deltas

No mobile Figma frame provided. Planner proposal based on desktop design intent:

| Breakpoint | Tile count visible | Arrow visibility | Touch scroll |
|---|---|---|---|
| Desktop (1440px) | 6 tiles (full row) | Arrows visible | — |
| Tablet-lg (1280px) | ~4–5 tiles | Arrows visible | — |
| Tablet (768px) | ~3–4 tiles | Arrows visible | — |
| Mobile (375px) | ~2–2.5 tiles (partial reveal cues scroll) | Arrows hidden | Native horizontal scroll |

Breakpoint delta decisions (DOM, responsive mechanism) owned by ui-agent.

---

## Reuse hints

None identified. No existing sections or snippets match this pattern.

---

## Constraints and assumptions

- **No collection data** — tile destinations are merchant-configured URLs, not Shopify collection handles. Merchant is responsible for keeping links valid.
- **Arrow absolute positioning** — design shows arrows overlapping the section edge (±24px outside tile row). ui-agent decides container overflow handling.
- **Image aspect** — design shows 166×166 square images. ui-agent decides aspect-ratio enforcement (image_picker returns variable-dimension assets).
- **Tile count** — design shows 6 tiles. Schema does not enforce a max; merchant can add more. Carousel scroll handles overflow.
- **Assumption: mobile arrows hidden** — design provides no mobile frame. Hiding arrows on mobile and relying on native touch scroll is a safe default consistent with common carousel patterns.
- **Assumption: background_color default `#f4f6f8`** — taken directly from Figma section background. Merchant can override via color picker.

---

## Design content reference

Reference only — for test template population and visual QA. NOT test assertions.

### Copy
- Section heading: `Shop By Category`
- View more label: `View More`
- View more link: `/collections/all`

### Tiles (in order)
| # | Label | Suggested link |
|---|---|---|
| 1 | Indoor Air Quality | `/collections/indoor-air-quality` |
| 2 | Split Systems | `/collections/split-systems` |
| 3 | Packaged Terminal Systems | `/collections/packaged-terminal-systems` |
| 4 | Scratch and Dent | `/collections/scratch-and-dent` |
| 5 | Portable Ac System | `/collections/portable-ac` |
| 6 | HVAC Parts - Accessories | `/collections/hvac-parts-accessories` |

### Typography tokens (from Figma)
| Element | Font | Size | Line height | Weight | Color |
|---|---|---|---|---|---|
| Section heading | DM Sans | 48px | 52.8px | Bold (700) | `#0b1e3d` |
| View More link | DM Sans | 16px | 20px | Bold (700) | `#000000` |
| Tile label | DM Sans | 15px | 24px | Medium (500) | `#000000` |

### Color tokens (from Figma)
| Role | Value |
|---|---|
| Section background | `#f4f6f8` |
| Tile card background | `#ffffff` |
| Tile card border-radius | 16px |
| Arrow button background | `#f4f6f8` |
| Arrow button border | `rgba(0,0,0,0.2)` 1px |
| Arrow button border-radius | 24px |
| Arrow button size | 48×48px |
| Arrow icon size | 20×20px |
| Prev arrow opacity (disabled) | 40% |

### Spacing (from Figma, px — token decisions owned by ui-agent)
| Zone | Value |
|---|---|
| Section padding top | 60px |
| Section padding bottom | 40px |
| Section padding horizontal | 50px |
| Inner container gap (heading row → tile row) | 32px |
| Tile column gap | flex justify-between (variable) |
| Within tile column (card → label gap) | 23px |
| Tile card padding | 18px vertical × 21px horizontal |
| Tile image display size | 166×166px |
| Tile card width (design) | 208–214px |
