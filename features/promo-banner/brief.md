# promo-banner — brief

## Intent
Merchant-configurable promotional banner section for the home/landing page. Introduces a category or campaign with a heading + subtitle, followed by a set of visual "promo cards" (image + title + description + CTA). Used to drive traffic from the page into deeper product/collection pages. Content is fully block-driven so marketing can ship new promos without code changes.

## Template type
`page` — promo content is generic; does not depend on product or collection context.

## Accessibility
`required` — user-facing marketing surface on the landing flow. Must meet WCAG 2.1 AA. Visual-qa-agent grades violations; test-agent adds axe scans.

## Figma references
- Desktop: `5654:6240` — https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6240&m=dev
- Mobile: `5654:53324` — https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53324&m=dev

## Design source of truth
`features/promo-banner/figma-context.md` — canonical reference for typography, colors, spacing, copy strings, and Figma tokens across both breakpoints. Every downstream agent (architect, ui-agent, test-agent, visual-qa) reads that file directly. This brief does not inline pixel values or copy strings — see `figma-context.md` for all ground truth.

**Breakpoint deltas (decision-level summary only — values in figma-context.md):**
- Section bg: light grey on desktop vs white on mobile.
- Heading size drops from large to medium; color changes from deep navy to black.
- Card layout flips: desktop = absolute text overlay on image + dark gradient; mobile = image-top + text-below, no gradient.
- Desktop cards fixed 1:1 420×420; mobile cards vertical with image height fixed and text stack beneath.
- Mobile adds a scroll-progress bar beneath the card track; desktop has no equivalent (carousel nav instead when applicable).

---

## Data sources
Section settings only. No metafields, no product/collection data, no fetch calls.

Liquid objects accessed:
- `section.settings.*` — heading copy, heading/subtitle color, section bg, font pickers.
- `section.blocks` — iterated to render cards.
- `block.settings.*` — per-card image, title, description, CTA label, CTA link, optional overlay/color overrides.
- `block.shopify_attributes` — spread on each card root for editor reordering.

---

## Variants and blocks

The section schema holds global layout/appearance. Each **card** is a single block type. No branching card variants — merchants repeat the same block type to add promos.

### Section-level (macro layout + theming)
Lives in `section.settings`:
- `heading_text` — text.
- `subheading_text` — richtext (supports inline `<br>` like Figma).
- `heading_color` — color (desktop/light theme default `#0b1e3d`).
- `subheading_color` — color (default `#666`).
- `section_bg_desktop` — color (default `#f4f6f8`).
- `section_bg_mobile` — color (default `#ffffff`).
- `heading_font` — font_picker (default DM Sans Bold).
- `body_font` — font_picker (default DM Sans Medium).
- `desktop_cards_per_row` — range 2–4, default 3. Drives overflow detection.
- `enable_carousel_on_overflow` — checkbox, default true. If true + blocks exceed `desktop_cards_per_row` → carousel behavior on desktop. If false → blocks wrap to next row.
- `mobile_show_progress_bar` — checkbox, default true.

### Block — `card`
Lives in `block.settings`:
- `image` — image_picker (required for visual parity; falls back to `#a1a1a1` bg).
- `image_alt_override` — text (optional; otherwise uses `image.alt`).
- `image_aspect_ratio` — select with options `1/1` (default, matches Figma desktop 420x420), `4/5`, `3/4`, `16/9`. Passed to `shopify-responsive-image.liquid` as `image_aspect_ratio`.
- `title` — text.
- `description` — richtext (short copy, 1–2 lines desktop, ~4 lines mobile).
- `cta_label` — text (default "Shop Now").
- `cta_link` — url.
- `overlay_enabled_desktop` — checkbox, default true (renders the bottom gradient overlay on desktop).
- `overlay_opacity_desktop` — range 0–100, default 80 (max alpha of gradient, matches Figma `rgba(0,0,0,0.8)`).
- `title_color_desktop` — color (default `#f4f6f8`).
- `description_color_desktop` — color (default `#eaeaea`).
- `title_color_mobile` — color (default `#000`).
- `description_color_mobile` — color (default `#515151`).
- `button_bg` — color (default `#027db3`).
- `button_label_color` — color (default `#ffffff`).

### Presets
Ship one preset: 3 example cards (Split System / Mini-Split System / Packaged Unit) with placeholder images + heading block prefilled so merchants get a working default on install.

---

## Visual variants (rendered states)

Enumerate each state the section must handle. Each is exercised at both breakpoints unless noted.

1. **Desktop row — fits** — `blocks.size <= desktop_cards_per_row`: static flex row, no carousel nav.
2. **Desktop overflow — carousel** — `blocks.size > desktop_cards_per_row` AND `enable_carousel_on_overflow = true`: mount `<carousel-swiper>`, show nav arrows + pagination, reduced-motion respected by the custom element.
3. **Desktop overflow — wrap** — `blocks.size > desktop_cards_per_row` AND `enable_carousel_on_overflow = false`: cards wrap onto a second row with same gap, no carousel.
4. **Mobile horizontal scroll** — always at `<768px`: native horizontal scroll, ~3 cards visible partially at a time (matches Figma 820.39px inner track on 390px viewport). Scroll progress bar tracks scroll position.
5. **Mobile — 1 block** — single card, scroll disabled, no progress bar.
6. **Mobile — progress bar off** — merchant disables `mobile_show_progress_bar`: scroll still works, indicator hidden.
7. **Empty state — 0 blocks** — render heading block only, or render nothing at all. Decision below in Open Questions; default assumption: render heading block + helpful editor-only empty hint in theme editor (not storefront).
8. **Card with no image** — falls back to card fallback bg `#a1a1a1`; text stack still visible.
9. **Card with no CTA link** — button hidden (no `<a>` rendered) to avoid dead links.

State values exposed on the section root so tests can target them:
- `data-layout="row" | "carousel" | "wrap"` — desktop computed state (JS-set after detecting overflow).
- `data-empty="true"` — when `blocks.size == 0`.
- `data-scroll-progress-visible="true|false"` — mobile.

---

## Breakpoint strategy
Flip point: `md-small` (`768px`).
- `< 768px` — mobile layout: vertical-stacked cards in a horizontal scroll strip, below-scroller progress bar, section bg white.
- `>= 768px` — desktop layout: heading block above, cards in a row (or carousel/wrap per setting), section bg light grey, image-overlay card style.

No intermediate layout shift between `md-small`, `md`, `lg`, `2xl` — layout is the same, only max-width + card count fit change naturally within the `1340px` container.

---

## Responsive behavior
- `small (390px)` and below: mobile scroll strip. Card widths sized so ~3 are visible partially (matches Figma). Section padding 16px.
- `md-small (768px)` → desktop layout activates. Cards fixed at 420px max width equivalent, `desktop_cards_per_row` drives grid.
- `md (1024px)` / `lg (1280px)` / `2xl (1550px)`: container stays centered, max-width `1340px`, no per-breakpoint restyling — only available width for the card row grows until capped.
- Carousel trigger heuristic (desktop): `blocks.size > desktop_cards_per_row`. JS confirms at runtime by measuring actual overflow (belt-and-suspenders) so that narrow desktop widths still trigger carousel if needed.
- Images are responsive via `shopify-responsive-image.liquid`; card aspect ratio stays constant to prevent layout shift.

---

## Behaviour contract

### States
| State | Where set | Controlled by |
|---|---|---|
| `data-layout="row"` | section root (desktop) | JS — default, no overflow |
| `data-layout="carousel"` | section root (desktop) | JS — detected overflow + setting on |
| `data-layout="wrap"` | section root (desktop) | JS — setting off + overflow |
| `data-empty="true"` | section root | Liquid — `{% if section.blocks.size == 0 %}` |
| `data-scroll-progress-visible` | section root (mobile) | JS — based on scroll width vs container |

### JS events
Emitted:
- `promo-banner:layout-changed` — payload `{ layout: "row" | "carousel" | "wrap", blockCount }`. Fired after desktop layout decision (load + resize).
- `promo-banner:scroll-progress` — payload `{ ratio: 0..1 }`. Fired on mobile scroll (throttled via rAF).

Listened to:
- `resize` (window) — re-evaluate desktop layout.
- `scroll` (on the mobile scroll track) — update progress bar.

### API calls
None.

### JS needed: YES
Justification:
1. **Desktop overflow detection** — decide between static row and carousel at runtime. Pure CSS cannot swap between `<carousel-swiper>` behavior and a static row based on content overflow.
2. **Mobile scroll-progress indicator** — requires a scroll listener to update the indicator width proportionally to `scrollLeft / (scrollWidth - clientWidth)`.
3. **Resize handling** — re-run overflow detection when viewport changes across `md-small`.
4. **Reduced motion** — delegated to `<carousel-swiper>` (already respects `prefers-reduced-motion`); scroll-progress is purely reactive so no motion concern.

---

## Accessibility decisions
- Section root is a `<section>` element with `aria-labelledby` pointing at the heading.
- Heading level: `<h2>` (page provides `<h1>`). Subtitle is a `<p>`.
- Each card title inside a card: `<h3>` (one level below section heading).
- Cards are `<article>` elements; whole card is NOT a single big anchor — only the CTA is clickable (preserves screen-reader clarity and allows keyboard focus on a clear target).
- CTA = `<a href>` with real URL; hidden entirely when `cta_link` is blank (no empty anchors).
- CTA has a visible focus-visible ring (theme utility).
- Desktop overlay gradient must not reduce card-text contrast below WCAG AA — visual-qa-agent verifies. Text colors (`#f4f6f8` on dark gradient bottom) are already high-contrast.
- Mobile scroll region: the scrollable track has `role="region"` + `aria-label` (merchant-facing label or derived from heading) so screen-reader users know it's scrollable.
- Carousel nav buttons: `aria-label` set ("Previous promo", "Next promo"); `aria-hidden` on offscreen slides handled inside `<carousel-swiper>`.
- Scroll-progress bar: decorative (`aria-hidden="true"`) — scroll region itself is the accessible surface.
- Images: `alt` comes from `image_alt_override` block setting, falling back to `image.alt`. Decorative-only images use `alt=""` (merchant can clear the override).
- Reduced motion: carousel-swiper respects `prefers-reduced-motion`. Mobile scroll is native so inherits OS behavior.
- Keyboard: CTA + carousel nav reachable via Tab; scroll region natively scrollable with arrow keys when focused.

---

## Reuse references (informational — architect confirms)
- `<carousel-swiper>` custom element — globally registered via `js/sections/global.js`; accepts JSON config via child `<script type="application/json">`. Use for desktop overflow case.
- `snippets/shopify-responsive-image.liquid` — renders responsive `<img>` with correct `srcset` + aspect-ratio wrapper. Inputs: `image`, `image_aspect_ratio` (e.g. `1/1`), `max_width`, `max_height`, `image_class`. Use for every card image.
- Font loading pattern from `sections/hero-banner.liquid` — `font_picker` setting + `{% style %}` + `font_face` helper. Reuse the pattern for DM Sans loading here.
- Tailwind tokens — `tw-rounded-xl` for desktop card radius (12px), `tw-rounded-full` for pill button, custom color tokens for heading/buttons where they exist (fall back to arbitrary values only when no token matches).

---

## Constraints and assumptions
- Assumed DM Sans is the intended default since the whole site uses it and the hero-banner already loads it via `font_picker`; merchant can override via settings.
- Assumed mobile flip at `md-small` (768px) because Figma mobile frame is 390px and there's no tablet-specific design — `md-small` is the earliest Tailwind breakpoint where desktop row is realistic.
- Assumed `desktop_cards_per_row` default is 3 to match Figma exactly. Range 2–4 keeps layout sensible within `1340px` container.
- Assumed carousel overflow threshold = block count > per-row setting; JS also runtime-checks actual pixel overflow for safety on narrow viewports.
- Assumed CTA-less cards hide the button rather than render a non-clickable pill (avoids a11y/UX trap).
- Assumed empty-state behavior renders the heading block only and hides the card area; final decision deferred to Open Questions.
- Assumed single-card mobile state disables horizontal scroll (no scroll needed) and hides progress bar.
- Assumed the card background fallback color `#a1a1a1` is acceptable as-is; merchants who want a different fallback can upload a colored placeholder image.
- Performance: no product/collection queries; section is pure static + merchant assets → minimal server cost. Carousel JS only activates when needed.

---

## Open questions
The following need human confirmation before test-agent writes ground-truth scenarios. None are hard blockers for ui/js/architecture work — sensible defaults are in the schema above.

1. **Carousel activation threshold** — confirmed rule: `blocks.size > desktop_cards_per_row` plus JS pixel-overflow check. OK?
2. **Empty state copy** — if merchant adds the section but no blocks on storefront, do we (a) render heading block only, (b) render nothing at all, or (c) render heading block + a subtle placeholder area? Default assumption: (a).
3. **Default fonts** — confirm DM Sans is the default for both heading and body font pickers. Any brand reason to default differently?
4. **Heading/subtitle placeholder copy** — what defaults ship with the preset? Propose: heading "Shop by system", subtitle "Find the right cooling solution for your space.<br>Installation and support included." (editable per Figma).
5. **Desktop wrap vs always-carousel** — is `enable_carousel_on_overflow` actually desired, or should overflow ALWAYS trigger carousel (i.e. drop the toggle)? Default assumption: keep the toggle.
6. **Mobile card width sizing** — Figma shows ~3 cards visible at 390px viewport (inner track 820.39px ⇒ each card ~265px wide). Confirm cards should remain fixed width (~265px) regardless of viewport, so progress indication stays consistent? Default assumption: yes.
7. **Section bottom padding** — Figma desktop shows only `pb-[10px]` which is unusually tight. Intentional (section stacks directly against the next one) or typo from Figma? Default assumption: intentional, leave as `10px`.
