# Architecture — homepage-collection-tiles

Codebase archaeology for the `homepage-collection-tiles` section: horizontal scroll tile carousel with heading + "View More" link + nav arrows. Single section, block type `tile`, native-scroll mechanics + JS-driven arrow clicks and scroll-boundary state.

---

## File plan

### Create

| File | Purpose |
|---|---|
| `sections/homepage-collection-tiles.liquid` | Section shell — renders heading row + tile scroll track + nav arrows. Loops `section.blocks` of type `tile`. Contains `{% schema %}`. |
| `snippets/homepage-collection-tile.liquid` | Per-tile rendering — card (image) + label below. Called once per block via `{% render 'homepage-collection-tile', block: block %}`. Theme Block boundary — no conditional logic. |
| `js/sections/homepage-collection-tiles.js` | Webpack entry. Arrow click → scroll track by one group width. `scroll` + `resize` listener → flip `data-state` on prev/next arrows at scroll boundaries. |
| `scss/sections/homepage-collection-tiles.scss` | **TBD by ui-agent** — decide in `ui-plan.md` per escape-hatch rules. Only needed if Tailwind arbitrary brackets cannot express a style (scrollbar hiding via `::-webkit-scrollbar`, scroll-snap nuance). Note: `scss/sections/common-imports.scss` already imports `./homepage-collection-tiles.scss` — the file MUST exist even if empty, otherwise the SCSS build breaks. UI agent: create minimum empty file or populate per escape-hatch need. |

### Reuse (existing)

| Need | File | How |
|---|---|---|
| Responsive tile image rendering | `snippets/shopify-responsive-image.liquid` | `{% render 'shopify-responsive-image', image: block.settings.image, image_id: block.id, image_aspect_ratio: 1, image_class: 'tw-w-full tw-h-full tw-object-cover', wrapper_class: 'tw-w-full tw-h-full', fill: true %}` — aspect ratio 1 for 166×166 square. |
| Section tokens (colors, breakpoints, spacing) | `tailwind.config.js` → `theme.extend` | Apply utility classes directly: `tw-bg-ah-navy`, `tw-text-heading-text`, screens `small / md-small / md / lg / 2xl`. Use arbitrary brackets `tw-p-[60px]` for Figma px literals (spacing scale is sparse — 4/8/16/20/24/32/40/56/80). |
| Webpack bundling | `webpack.config.js` → `jsEntryPoints` glob of `js/sections/**/*.{js,jsx}` | Drop `js/sections/homepage-collection-tiles.js` — auto-picked up. Import shared components (if any) via `JsComponents/*` alias. |

### Rejected candidates (explicitly NOT reused)

| Candidate | Path | Why rejected |
|---|---|---|
| Swiper-based carousel wrapper | `snippets/carousel-wrapper.liquid` + `js/components/carousel-swiper.js` | Brief (resolved decision) specifies **native `overflow-x: scroll` + JS arrows + scroll listener**. Swiper adds ~50kb gzipped + its own DOM structure (`.swiper-wrapper`, `.swiper-slide`) and its own nav button injection — heavier than requirement. Keep Swiper for complex carousels that need pagination/autoplay/free-mode/uniform-height. Tile carousel is a plain horizontal overflow-scroll container. |
| `snippets/heading.liquid` | — | Variants are bold h1–h5 with Tailwind size scales; none match the Figma `DM Sans 48px / 52.8px lh / 700` requirement cleanly. Inline the heading markup in the section file with Tailwind arbitrary brackets — simpler than wedging a new variant into a shared component. |
| `snippets/button.liquid` | — | All variants are pill-shaped rounded-full CTAs (primary/secondary/tertiary) with padding, backgrounds, min-height. The Figma "View More" is a plain text link (`DM Sans 16px / 700 / #000`), no pill, no background. Inline `<a>` is correct — do not force fit the button snippet. |
| `snippets/image.liquid` | — | Wraps `shopify-responsive-image` with desktop/mobile variants and aspect triplet logic. Per brief (feedback_ui_image_fields.md — single image_picker per tile), no desktop/mobile split is needed. Render `shopify-responsive-image` directly inside the tile snippet. |
| `snippets/divider.liquid`, `snippets/body.liquid`, `snippets/caption.liquid`, `snippets/subheading.liquid` | — | Unused patterns in this feature — no divider, no body copy, no caption, no subheading per brief. |

### Shared with other sections
None. Section is self-contained. No page-mode sibling dependencies.

---

## Reuse precedence notes

1. **Image rendering MUST go through `snippets/shopify-responsive-image.liquid`** — do not emit raw `<img>` tags. The snippet handles srcset, lazysizes data attributes, aspect-ratio CSS injection. Repo standard.
2. **Single `image_picker` per tile — no desktop/mobile/aspect triplet.** Per brief + feedback_ui_image_fields.md. Aspect ratio enforcement is a ui-agent call (brief hints square 1:1 via 166×166 display), but the field is one picker, one asset.
3. **BEM class convention** — `homepage-collection-tiles__*` on section-level elements (e.g. `__track`, `__tile`, `__arrow`, `__arrow--prev`, `__arrow--next`, `__heading-row`). Used as JS hooks + a11y anchors. Styling stays on Tailwind utilities; BEM classes carry no visual rules (consistent with hero-banner pattern).
4. **Tailwind arbitrary brackets for Figma px literals** — `tw-text-[48px]`, `tw-leading-[52.8px]`, `tw-p-[60px]`, `tw-gap-[23px]`, `tw-w-[208px]`, `tw-h-[166px]`, `tw-rounded-[16px]`, `tw-rounded-[24px]`. Do NOT use scale tokens (`tw-px-20` resolves to 80px, not 20px — see memory). Preserves 1:1 Figma translation.
5. **Token source = `tailwind.config.js` only.** Do not add tokens to SCSS. Colors: `ah-navy` (#092846), `heading-text` (#092846) are close to Figma `#0b1e3d` — ui-agent decides arbitrary value `tw-text-[#0b1e3d]` vs token (values differ 1–2 rgb steps). Background `#f4f6f8` has no existing token — use arbitrary `tw-bg-[#f4f6f8]` or accept section setting color override.
6. **`data-state` attribute as arrow state API** — per brief: `data-state="prev-disabled" | "prev-enabled" | "next-disabled" | "next-enabled"`. JS reads/writes these. CSS (Tailwind or SCSS) may target them via `[data-state="prev-disabled"]:tw-opacity-40` arbitrary variant or escape-hatch SCSS.
7. **`shopify-responsive-image` param shape** — required params are `image`, `image_id`. Optional: `image_aspect_ratio` (use 1 for square tiles), `image_class`, `wrapper_class`, `fill: true` (for `object-fit: cover`), `contain: true` (for `object-fit: contain`). Pass `block.id` as `image_id` to guarantee uniqueness across tile blocks.
8. **Section tag conventions** — `"tag": "section"` in `{% schema %}`. Add `class` key for CSS hook. Set `data-section-type="homepage-collection-tiles"` on root for Shopify section runtime consistency (observed on `sections/hero-banner.liquid`).

---

## Token / pattern audit

### Usable from `tailwind.config.js`
- Breakpoints: `small` (390), `md-small` (768), `md` (1024), `lg` (1280), `2xl` (1550) — brief proposes desktop/tablet-lg/tablet/mobile — maps to `lg` / `md` / `md-small` / base.
- Colors: `ah-navy`, `heading-text` (both `#092846`) — close enough to Figma `#0b1e3d` for heading. ui-agent to decide literal vs token.
- Radius: `rounded-xl` = 12px, `rounded-full` = 9999px. Figma wants 16px card and 24px arrow — use arbitrary `tw-rounded-[16px]` / `tw-rounded-[24px]`.
- Spacing scale: 4/8/16/20/24/32/40/56/80 in px. Figma uses 18, 21, 23, 32, 40, 50, 60 — mostly arbitrary-bracket territory.

### Gaps (ui-agent DOES NOT need to add tokens)
- `#f4f6f8` (section bg + arrow bg) → use arbitrary `tw-bg-[#f4f6f8]` OR resolve via `section.settings.background_color` inline style (default already `#f4f6f8` per brief).
- `#0b1e3d` (heading color) → arbitrary `tw-text-[#0b1e3d]` OR `tw-text-heading-text` (off by ~2 rgb steps — visually indistinguishable; ui-agent decides).
- No new tokens to add. Tailwind config stays untouched.

---

## Cross-section contracts

**None.** `homepage-collection-tiles` is self-contained. No events emitted, no events listened to, no shared snippets consumed from sibling sections (feature-mode build, single section).

---

## JS architecture hint (for js-agent later, not binding on ui-agent)

- Entry file: `js/sections/homepage-collection-tiles.js`
- Custom element is **optional** — a plain class instantiated per `[data-section-type="homepage-collection-tiles"]` on `DOMContentLoaded` is sufficient for native-scroll carousel mechanics. Keep the implementation decision with js-agent.
- Responsibilities:
  - Query `__track` (scroll container), `__arrow--prev`, `__arrow--next`.
  - Click handler on arrows → `track.scrollBy({ left: ±groupWidth, behavior: 'smooth' })`. Group width = one tile column width + column gap, or `track.clientWidth` minus peek — js-agent decides.
  - `scroll` + `resize` listener on track → compute `scrollLeft === 0` (prev-disabled) and `scrollLeft + clientWidth >= scrollWidth - tolerance` (next-disabled) → write `data-state` on each arrow.
  - Initial state on mount: prev-disabled, next-enabled (per brief).
- No Swiper, no external libs, no events emitted.

---

## Open questions

None. All resolved decisions (native scroll not Swiper, responsive-image snippet, single image_picker) confirmed against codebase. Ready for ui-agent Phase 1.
