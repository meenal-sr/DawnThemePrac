# collection-grid — brief

## What & why

**Feature name:** collection-grid

**Purpose:** Merchant-configurable row of category tiles on page templates. Each tile is an image + label + link. Row acts as a horizontal carousel when tile count exceeds viewport capacity. Fully data-driven from section settings — no product/collection/metafield dependencies. Gives merchants a reusable "Shop By Category" module they can drop on any page and point at any URL.

**Figma references:**
- Desktop: node 5654:4305
- Mobile: not provided by main — treat desktop-first; ui-agent to flag any mobile-delta questions in ui-plan.md

**Template type:** `page`

**Accessibility:** `required` — user-facing navigational module with interactive carousel controls. WCAG 2.1 AA applies (keyboard reachable prev/next, visible focus, alt text on tile images, semantic heading, disabled-state announced).

## Variants and blocks

Single visual variant. Every tile is the same shape — image + label + link. No style-level tile variation in Figma.

**Structure decision:** Section + repeatable block. Section owns header row + carousel frame + global controls. Block owns one tile's content.

**Section-level settings (macro layout / global):**
- Heading text (section header, left-aligned)
- "View More" CTA label
- "View More" CTA URL
- Option to show/hide the View More link
- Option to show/hide prev/next arrows (in case merchant sets few enough tiles that carousel is unnecessary)

**Block-level settings (per-tile content):**
- Tile image (single image picker — one asset per tile)
- Tile label (text)
- Tile link URL

Block type: one type, `tile`. No conditional tile variants. Minimum 0 blocks, sensible max (e.g. 12) — let architect/ui-agent finalise max in schema.

## Data

**Data sources:** Section settings + block settings ONLY. No page/product/collection context. No metafields. No fetch calls.

**Liquid objects accessed:**
- `section.settings.heading`
- `section.settings.cta_label`
- `section.settings.cta_url`
- `section.settings.show_cta`
- `section.settings.show_arrows`
- `section.blocks` (iterated)
- Per block: `block.settings.image`, `block.settings.label`, `block.settings.url`

**Merchant-configurable values:**

Section settings:
- `heading` — text — default "Shop By Category"
- `cta_label` — text — default "View More"
- `cta_url` — url — default `/collections/all`
- `show_cta` — checkbox — default true
- `show_arrows` — checkbox — default true

Block settings (`tile` block):
- `image` — image_picker
- `label` — text
- `url` — url — default `/collections/all`

## Behaviour contract

**States:**
- `data-state="idle"` — default, tiles visible, prev arrow may be disabled
- `data-state="scrolled-start"` — at scroll origin, prev control in disabled visual state (40% opacity, non-interactive)
- `data-state="scrolled-middle"` — both arrows active
- `data-state="scrolled-end"` — at scroll terminus, next control in disabled visual state

State is JS-controlled — driven by scroll position of the tile row. Liquid renders initial `scrolled-start` markup; JS transitions.

**Interactions:**
- Clicking prev advances the tile row toward the start by one step
- Clicking next advances toward the end by one step
- Keyboard: prev/next buttons are focusable and operable via Enter/Space
- Tile click navigates to the tile's URL

**JS events emitted:** none required for v1 (self-contained module).

**JS events listened to:** none.

**API calls:** none.

**JS needed:** YES — carousel scroll control, prev/next interaction, disabled-state toggling based on scroll position, resize recalculation.

## Reuse hints (informational — architect confirms)

None provided by human. Planner noticed no existing carousel/tile snippets in session context. Architect to scan `snippets/` and `js/components/` for any existing horizontal-scroll controller, tile card, or arrow-button snippet before greenfielding.

## Constraints and assumptions

**Constraints:**
- All content merchant-driven — no hardcoded tile data in Liquid
- `cta_url` and per-block `url` schema defaults must be `/collections/all` (Shopify url-type hard constraint)
- Section must render gracefully with zero blocks (empty state — no carousel controls, optionally suppress header or show header only)
- Must remain keyboard + screen-reader operable (a11y=required)

**Assumptions:**
- Mobile behaviour not specified by Figma/main — assumed the same carousel pattern applies with fewer tiles visible per viewport; ui-agent to confirm the breakpoint deltas during ui-plan.md
- Figma screenshot shows 6 tiles; actual merchant count is variable — design must not break at 1, 2, 3, many
- Heading colour `#0b1e3d` is visually adjacent to existing token `ah-navy #092846`; ui-agent to decide whether to use the token or the exact Figma hex

## Design content reference

Captured verbatim from Figma for downstream test-agent population.

**Header:**
- Heading text: `Shop By Category`
- CTA label: `View More`
- CTA URL: merchant-configured (default `/collections/all`)

**Tiles (6 shown in Figma — use as dummy seed for test template):**
1. Label: `Indoor Air Quality`
2. Label: `Split Systems`
3. Label: `Packaged Terminal Systems`
4. Label: `Scratch and Dent`
5. Label: `Portable Ac System`
6. Label: `HVAC Parts - Accessories`

**Typography tokens (Figma-measured):**

| Element | Family | Weight | Size | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|---|
| Heading | DM Sans | Bold | 48px | 52.8px | default | #0b1e3d (≈ ah-navy) |
| View More CTA | DM Sans | Bold | 16px | 20px | default | #000 (capitalized, 1px underline via bottom border) |
| Tile label | DM Sans | Medium | 15px | 24px | default | #000 |

**Color tokens (Figma-measured):**
- Section background: `#f4f6f8` (light gray)
- Tile card background: `#ffffff`
- Heading text: `#0b1e3d`
- CTA / tile label text: `#000000`
- Prev/Next button background: `#f4f6f8`
- Prev/Next button border: `rgba(0, 0, 0, 0.2)`
- Prev arrow disabled opacity: 40%

**Spacing (Figma-measured, desktop):**
- Section padding: 60px top, 40px bottom, 50px horizontal
- Inner max width: 1338px
- Gap between header row and tiles row: 32px
- Tile card padding: 18px horizontal, 21px vertical
- Tile card corner radius: 16px
- Inner image: 166 x 166px, object-cover
- Gap between tile card and label: 23px
- Tile column width: 208–214px (varies with content)
- Prev/Next button: 48px circle, 24px radius, 20px icon
- Prev/Next position: absolute, -24px horizontal offset from tile row, vertically centered on tile card
