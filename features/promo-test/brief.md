# brief.md — promo-test

## 1. Intent

Merchant-configurable promo banner section that presents three tiled "card" links to steer page visitors toward custom landing pages (e.g. system-type education pages). Rendered as a Shopify section the merchant drops into any `page` template via theme editor. Customers scan the heading + subheading intro, then tap a card to navigate to the configured destination. Each card has an image, title, description, and a pill CTA. The section is purely navigational — no product/collection data, no fetch, no cart behavior.

## 2. Design reference

Design source of truth: `features/promo-test/figma-context.md`. Do NOT re-inline values here — reference that file.

| Breakpoint | Node ID | Reference PNG |
|---|---|---|
| Desktop | `5654:6240` | `features/promo-test/qa/figma-desktop.png` |
| Mobile  | `5654:53324` | `features/promo-test/qa/figma-mobile.png` |

**Divergence flag — HIGH.** Per cross-breakpoint delta table in `figma-context.md`:
- Desktop: content absolutely positioned OVER image, dark gradient, white text, gray section bg
- Mobile: image on top, content BELOW on white bg, black text, horizontal scroll carousel with progress indicator
- Subhead copy also differs between breakpoints

**ui-agent directive:** plan dual-DOM branches toggled via `hidden md:block` / `md-small:hidden` rather than fighting a single DOM with overrides. Mobile-first authoring per project convention. Document the dual-DOM choice in `ui-plan.md` Phase 2 DEVIATIONS.

## 3. Schema plan

### Section-level settings (macro: intro copy + layout toggles)

| Key | Type | Default | Notes |
|---|---|---|---|
| `heading` | `text` | `Not Sure What You Need?` | H2, rendered both breakpoints |
| `subheading_desktop` | `textarea` | desktop copy from `figma-context.md` copy table | Shown on `md-small:` and up |
| `subheading_mobile` | `textarea` | mobile copy from `figma-context.md` copy table | Shown below `md-small:` |

**Subhead strategy — justification:** two separate settings rather than one shared. Desktop subhead frames the choice ("Choose your system type…"), mobile subhead markets savings ("Shop top HVAC systems with limited-time pricing…"). They communicate different intent. A single field forces the merchant to compromise. Two fields respect design intent and cost nothing at runtime (the hidden branch just doesn't render its copy). If merchant wants parity, they paste the same string in both.

### Block type: `card` (repeatable)

| Key | Type | Default | Notes |
|---|---|---|---|
| `desktop_image` | `image_picker` | — | Desktop variant, used by `promo-test-card-desktop` snippet |
| `desktop_aspect_ratio` | `range` (0.5–2.5, step 0.1) | `1` | Square matches Figma; merchant can override for portrait/landscape |
| `mobile_image` | `image_picker` | — | Mobile variant; falls back to `desktop_image` if blank |
| `mobile_aspect_ratio` | `range` (0.5–2.5, step 0.1) | `1` | |
| `image_alt` | `text` | — | Shared alt text; falls back to `image.alt` set in Shopify media library, then `title` |
| `title` | `text` | card 1 = `Split System`, card 2 = `Mini-Split System`, card 3 = `Packaged Unit` | Per copy table |
| `description` | `textarea` | per copy table in `figma-context.md` | |
| `cta_label` | `text` | `Explore` | Same label both breakpoints |
| `cta_link` | `url` | `/collections/all` | No link = render card as non-interactive `<div role="presentation">` |

### Block counts

- **Default block count:** `3` (matches Figma)
- **`max_blocks`:** `6` — sensible cap. Desktop row layout shows 3 evenly; >3 would wrap or overflow. Mobile carousel can accept more gracefully. Capping at 6 prevents merchant abuse without being punitive. Architect can adjust based on grid plan.
- **`min_blocks`:** not enforced via schema (Shopify doesn't support); rely on merchant discipline.

## 4. Variants

Only one visual variant per breakpoint (desktop overlay / mobile stacked). No merchant-facing variant toggle in schema. Card count variability (1–6 blocks) is the only structural variance — layout adapts via the shared `<carousel-swiper>` instance:
- **Desktop (≥ `md-small`)**: `slidesPerView: 3`, `spaceBetween: 40`. When `blocks.size ≤ 3` → swiper is inert (can't slide), navigation arrows hidden. When `blocks.size > 3` → navigation arrows auto-inject + enable. Progress bar hidden on desktop regardless.
- **Mobile (< `md-small`)**: `slidesPerView: 1.2`, `spaceBetween: 12`, freeMode off, snap to slide. Progress bar visible always (activeIndex-based, discrete per-slide steps). No navigation arrows.

States:
- **Default** — cards present, images loaded
- **Empty image** — block has no `image` set; ui-agent decides visual (skeleton / solid bg fallback / hide card)
- **No `cta_link`** — card renders as non-interactive (no anchor), or renders as anchor with `#` — ui-agent decides
- **Zero blocks** — section renders heading + subheading only, no card row (no empty-state copy needed for MVP)

No hover state specified in Figma for desktop; ui-agent may add subtle hover (scale/brightness) per `web-design-guidelines` but keep it conservative.

## 5. Accessibility decisions

- **Heading level:** `<h2>` for the merchant-authored heading. Page sections under a main `<h1>` should use `h2`.
- **Card as link:** use `<a href="{cta_link}">` wrapping the whole card (image + text + visible CTA). The inner CTA visual is a styled span inside the anchor — NOT a nested `<button>`. Single focusable element per card. Avoid nested interactive elements (a11y violation).
- **Focus state:** visible focus ring on the anchor (Tailwind `focus-visible:` utilities). ui-agent picks ring color; web-design-guidelines skill will inform.
- **Alt text:** use `image_alt` block setting if supplied, else fall back to `block.settings.image.alt`, else fall back to `block.settings.title` (title is descriptive enough). Never output empty alt unless image is decorative — in this section images ARE content, so alt is required.
- **Color contrast sanity check:**
  - Desktop white text `#f4f6f8` / `#eaeaea` over dark gradient end `rgba(0,0,0,0.8)` → compliant at the bottom-half of card where text sits (gradient ensures ~80% darkness under text). Flag: verify in visual-qa that the gradient start/midpoint don't starve contrast at the top of the text block.
  - Mobile black text `#000` / `#515151` on white bg → compliant.
  - CTA button `#027db3` bg with white label → contrast ratio ≈ 4.7:1, borderline AA for 16px Bold (passes). Acceptable.
- **Tab order:** natural DOM order — heading (not focusable) → subhead (not focusable) → card 1 → card 2 → card 3. Card anchors receive focus in order.
- **A11y mode:** `skip` (no dedicated axe scan). This is a marketing presentation section with no form inputs, ARIA roles, or complex state. Standard semantic HTML suffices. test-agent will NOT run axe.

## 6. JavaScript decision

**Section-specific JS needed: NO.** Reuse `<carousel-swiper>` custom element (registered globally via `js/components/ui-components.js`) — it handles scroll, pagination, navigation, keyboard, and a11y.

Section Liquid wraps cards in `snippets/carousel-wrapper.liquid`, passes config via child `<script type="application/json">`. No section-specific entry file (`js/sections/promo-test.js` is NOT created).

### Swiper config (decided in this brief; ui-agent tunes exact values in Phase 1)

- `mobile_slides_per_view`: `1.2` (peek-next card pattern)
- `tablet_slides_per_view`: `2.5`
- `desktop_slides_per_view`: `3` (static row when block count ≤ 3)
- `mobile_space_between`: `12` (matches Figma)
- `desktop_space_between`: `40` (matches Figma)
- `navigation_enabled`: `section.blocks.size > 3` (arrows only when there is more to scroll)
- `show_progress`: `true` (progress bar element rendered at snippet level)
- `progress_color`: `tw-bg-black` (matches Figma mobile)
- `freeMode`: `false` (snap to slide)

### Visibility rules (CSS-only, no JS)

- **Navigation arrows** — desktop only: wrap the auto-injected `.carousel__navigation` div with `tw-hidden md-small:tw-flex` (or set via the inline `<style>` block scoped to `#shopify-section-{{ section.id }}`).
- **Progress bar** — mobile only: wrap `.carousel-progress` with `md-small:tw-hidden`.

### Progress mechanism trade-off

carousel-swiper's `progressBarSelector` uses `activeIndex + 1 / slides.length` — **discrete per-slide steps**, NOT the continuous `scrollLeft / (scrollWidth - clientWidth)` the Figma scrollbar might imply. This is an accepted trade-off of the reuse directive. If the step-based indicator proves visually jarring in QA, fall back to a custom scroll-progress listener (still no section-JS entry needed — could be a single-purpose snippet).

### Events / API

- Emits: none
- Listens: none (swiper handles internally)
- API calls: none
- No cross-section contract

### State contract for ui-agent

- Outer section wrapper: `data-section-type="promo-test"`, `data-section-id="{{ section.id }}"` (follows project precedent)
- No custom `data-promo-test-*` selectors needed — carousel-swiper's internal classes (`.swiper`, `.swiper-slide`, `.carousel-progress__bar--{{ section.id }}`) handle all state
- No `data-state` attributes — carousel handles enabled/disabled state of nav buttons via its own `aria-disabled` updates

## 7. Copy + merchant defaults

Default values for schema settings come directly from the source-of-truth copy table in `figma-context.md` §"Source-of-truth copy table". Schema defaults reference:

- Heading default → copy table `heading` row
- Subheading desktop default → copy table `subheading_line_1` + `subheading_line_2` (desktop column, joined with newline in textarea)
- Subheading mobile default → copy table `subheading_line_1` + `subheading_line_2` (mobile column, joined with newline)
- Card 1–3 title + description defaults → copy table card rows
- `cta_label` default → `Explore`

ui-agent will paste the exact strings from the copy table when authoring the schema `default` values. Do NOT improvise or paraphrase.

## 8. Success criteria

Done when:
- Section renders visually on a `page` template and matches `qa/figma-desktop.png` + `qa/figma-mobile.png` within visual-qa pixelmatch threshold at all configured breakpoints (`small`, `md-small`, `md`, `lg`, `2xl`).
- All 10 schema fields (3 section-level + 6 block-level + 1 optional image_alt) are merchant-editable in the theme editor and produce the expected rendered output when changed.
- Each card is a keyboard-focusable single anchor linking to its configured `cta_link`. No nested interactive elements.
- Mobile progress bar visible + advances by activeIndex on slide change (carousel-swiper behavior); desktop nav arrows visible only when `section.blocks.size > 3` and correctly disable at beginning / end.
- Block range 1–6 renders without layout breakage on both breakpoints.
- Copy exactly matches the copy table in `figma-context.md` when merchant accepts all defaults.
- Basic semantic HTML: `<section>` root, `<h2>` heading, `<a>` per card, `<img>` with non-empty alt. No axe scan required (a11y mode: skip).

## 9. Constraints and assumptions

- **Template type:** `page` — section lives in `templates/page.*.json`.
- **Render context:** standalone section (not a block of another section, not a snippet).
- **Data sources:** `section.settings` + `block.settings` only. No Shopify Liquid object access (`product`, `collection`, `cart`, `customer`, metafields, etc.).
- **No reuse:** greenfield section. Architect confirms on codebase scan; if a similar promo/card section exists, architect decides whether to extract a shared snippet.
- **Font loading:** DM Sans assumed globally available via theme-wide font loader. ui-agent inherits; no section-local font injection.
- **Two-subhead assumption:** chose to expose both `subheading_desktop` and `subheading_mobile` because the Figma design explicitly authored different copy per breakpoint. If the merchant intent is actually "use one string everywhere," architect/ui-agent can collapse to a single field — flag during architect pass.
- **Scroll progress bar scope:** committed to JS-driven progress bar (not deferred). Deferring would mean shipping a visual element that doesn't function, which creates confusion. Worth the small JS cost.
