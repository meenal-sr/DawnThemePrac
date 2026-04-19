# Architecture — collection-grid

## Codebase scan summary

A near-identical section already exists in the theme: `sections/homepage-collection-tiles.liquid` + `snippets/homepage-collection-tile.liquid`. It implements the same header + tile-row + prev/next arrow shell described in brief.md — but with NO JavaScript. Arrow `data-state` is hard-coded in Liquid (`prev-disabled` / `next-enabled` never update). Brief demands JS=YES: prev/next click advances scroll, disabled state toggles per `scrolled-start|middle|end`, keyboard operable.

This architecture creates a new `collection-grid` section that reuses the existing `homepage-collection-tile` snippet verbatim and adds the JS controller the older section lacks. The old `homepage-collection-tiles` section stays untouched (no regression to its consumers).

## File plan

### Create
- `sections/collection-grid.liquid` — new section: header (heading + CTA) + carousel frame + prev/next arrows. Renders tile blocks via existing snippet. Includes `data-section-type="collection-grid"` hook for JS.
- `js/sections/collection-grid.js` — webpack entry. Scroll controller: reads `[data-track]`, binds prev/next click, updates arrow `data-state` + `aria-disabled` on scroll/resize per `scrolled-start|middle|end`, keyboard operable (Enter/Space on arrows — already native button behaviour + visible focus ring via Tailwind focus-visible utilities chosen by ui-agent).
- `scss/sections/collection-grid.scss` — **TBD by ui-agent** (decide in ui-plan.md per escape-hatch rules). Likely needed ONLY to hide the scrollbar on the track (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`), which Tailwind cannot express. Ui-agent confirms necessity.

### Reuse (existing)
| Need | File | How |
|---|---|---|
| Tile card (image + label + link, aspect-ratio select) | `snippets/homepage-collection-tile.liquid` | `{% render 'homepage-collection-tile', block: block %}` — already renders exactly the tile spec in brief (166x166 image desktop, card radius-16, px-21/py-18, gap-23 label, 208px tile width). Block type must be named `tile` with settings `image`, `image_aspect_ratio`, `label`, `link` (matches existing snippet's expectations). |
| Responsive image rendering | `snippets/shopify-responsive-image.liquid` | Already rendered inside `homepage-collection-tile.liquid`. Not called directly by `collection-grid.liquid`. |
| CarouselSwiper custom element | `js/components/carousel-swiper.js` + `js/sections/global.js` (registers `<carousel-swiper>`) | NOT reused. Swiper-based and brings full Swiper dependency + built-in prev/next that do not emit `scrolled-start|middle|end` states the brief describes. Brief = native horizontal-scroll carousel with scroll-snap/`scrollBy` — lighter. `js/sections/collection-grid.js` implements its own scroll controller. |
| Carousel wrapper snippet | `snippets/carousel-wrapper.liquid` | NOT reused. It wraps `<carousel-swiper>`; brief uses native scroll, not Swiper. |
| Tailwind tokens (colors `ah-navy`, `slate`; spacing 1/2/4/5/6/8/10/14/20; radius `xl`/`full`; breakpoints `small`/`md-small`/`md`/`lg`/`2xl`) | `tailwind.config.js` | Apply classes directly. Raw hex from brief (`#f4f6f8`, `#0b1e3d`, `rgba(0,0,0,0.2)`) not in theme tokens — ui-agent uses bracketed arbitrary values per existing section precedent. |

### Shared with other sections (page mode)
N/A — this feature is a single section build, not a page sprint.

## Reuse precedence notes

- **Block type name**: MUST be `tile` (matches `homepage-collection-tile.liquid`'s reads of `block.settings.image`, `block.settings.label`, `block.settings.link`, `block.settings.image_aspect_ratio`). Brief lists settings `image` / `label` / `url` — ui-agent MUST name the url setting `link` (not `url`) to satisfy the snippet contract. Flag in schema.
- **Aspect-ratio setting**: The snippet requires `block.settings.image_aspect_ratio` (options `1:1` / `4:3` / `16:9`). Brief does not list this setting explicitly. Ui-agent adds it to block schema with default `1:1` to satisfy the reused snippet; test-template populates it.
- **Track + arrow class naming**: Existing section uses `homepage-collection-tiles__*` BEM. New section uses `collection-grid__*` BEM. JS hook is `data-section-type="collection-grid"` + `[data-track]` + `[data-arrow="prev"]` + `[data-arrow="next"]` — structural selectors, not class-based, so BEM rename does not break JS.
- **Arrow disabled-state contract**: `data-state="prev-disabled" | "next-disabled"` toggled by JS; Tailwind `data-[state=prev-disabled]:tw-opacity-40` + `data-[state=prev-disabled]:tw-pointer-events-none` pattern already proven in existing section — ui-agent inherits the utility pattern.
- **Scrollbar hide**: SCSS escape hatch at `.collection-grid__track { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }` mirrors `scss/sections/homepage-collection-tiles.scss`. Ui-agent confirms in ui-plan.md.
- **url default**: `/collections/all` — matches brief + Shopify schema validation rule (url settings reject `#` as default).
- **Font**: Brief specifies DM Sans. Existing section uses `font_picker` setting with default `dm_sans_n7` + `{{ section_font | font_face }}` inline style. Ui-agent decides whether to add a font_picker or hard-code via `style="font-family: 'DM Sans', sans-serif"` — out of architect scope.
- **Empty state**: Brief requires "zero-block empty state handled". Existing section does not handle empty state. Ui-agent adds fallback when `section.blocks.size == 0`.
- **CTA visibility**: Brief adds `show_cta` + `show_arrows` toggles that existing section does not have. Ui-agent wires `{% if section.settings.show_cta %}` + `{% if section.settings.show_arrows %}` guards.

## Cross-section contracts

N/A (single section, no events emitted or listened).

## Token / pattern audit

- **Tokens usable directly from `tailwind.config.js`**:
  - Colors: `tw-text-[#0b1e3d]` via bracket (no matching token; `ah-navy` = `#092846` is close but not identical — do NOT substitute, ui-agent uses bracket literal per brief hex)
  - Spacing: `tw-gap-8` (32px, matches brief header-to-tiles gap), `tw-px-5` (20px), `tw-pt-10` (40px), `tw-pb-10` (40px desktop pb). Most brief spacings (60/50/23/21/18/166/208/214/48) are not in token scale — ui-agent uses bracketed literals (`tw-pt-[60px]` etc.), matching existing section precedent.
  - Breakpoints: `md-small:` (768px), `md:` (1024px), `lg:` (1280px) all available.
  - Radius: `tw-rounded-full` for 48px circle (`tw-rounded-[24px]` alternative — existing section uses `tw-rounded-[24px]`). Card radius 16 is `tw-rounded-[16px]` (no token match — `xl` = 12px).
- **Gaps (tokens ui-agent MAY suggest adding, not required)**:
  - `#f4f6f8` section bg recurs (brief + existing section). Candidate `neutral-bg-50` token. Ui-agent decides whether to add or use bracket literal.
  - `#0b1e3d` heading navy is NOT the same as `ah-navy` `#092846`. Brief explicitly flags the mismatch. Ui-agent uses bracketed literal.

## Open questions

None — all blockers resolved by reuse decisions above. Ui-agent begins Phase 1 against:
- Reuse the existing `homepage-collection-tile.liquid` snippet verbatim.
- Create `sections/collection-grid.liquid` + `js/sections/collection-grid.js`.
- Decide SCSS necessity in ui-plan.md (expected: scrollbar-hide only).
- Rename brief's block `url` setting → `link` to satisfy snippet contract.
- Add block `image_aspect_ratio` setting (default `1:1`) to satisfy snippet contract.
