# brief.md — faq

## Intent
Merchandising trust/SEO section titled "The AC Outlet Advantage" that renders a heading plus a variable-length list of expandable Q&A rows. Surfaces value props, warranty claims, and cross-links to key collection / policy pages on the `/pages/advantage` (or similar) page template. Merchants control every question + answer, order, and which row starts open. No per-section JS — globally-wired `[data-accordion]` handles the disclosure toggle.

## Design reference
- Desktop: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6499 (node `5654:6499`)
- Mobile: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53659 (node `5654:53659`)
- Reference PNGs: `features/faq/qa/figma-desktop.png`, `features/faq/qa/figma-mobile.png`
- Divergence: **MEDIUM** — heading size, heading color, padding, icon size, border weight all shift. Structure identical (heading + stacked rows). Row-1 default-open state on desktop only.
- Dual-DOM directive: **NO** — single DOM with mobile-first Tailwind utilities + `md-small:` / `md:` overrides suffices. Rows wrap/fit naturally at every breakpoint.

## Design tokens

### Typography
| Element | Mobile (base) | Desktop (md-small+) | Notes |
|---|---|---|---|
| Heading | DM Sans Bold, 28/33.6, `#000` | DM Sans Bold, 48/52.8, `#0b1e3d` | Design inconsistency flagged — unified via schema setting `heading_color` default `#0b1e3d`. See DEVIATIONS in test-scenarios. |
| Question (summary) | DM Sans Medium, 16/26, `#000` | DM Sans Medium, 18/20, `#000`, tracking `-0.72px` | |
| Answer body | — (not visible on mobile design) | DM Sans Regular, 16/20, `#666`, tracking `-0.16px` | |
| Inline links | inherit body + `underline decoration-solid`, `target="_blank"`, tracking `-0.16px` | same | Three links in row-1 answer. |

### Color
| Raw | Usage | Tailwind mapping |
|---|---|---|
| `#ffffff` | section bg | `tw-bg-white` |
| `#0b1e3d` | heading (desktop) | arbitrary `tw-text-[#0b1e3d]` or schema-driven `style` attr |
| `#000000` | question + heading (mobile) | `tw-text-black` |
| `#666666` | answer body | arbitrary `tw-text-[#666]` |
| `#000000` (solid) | open-row bottom border | `tw-border-black` |
| `rgba(0,0,0,0.2)` | closed-row bottom border | `tw-border-black/20` |

### Spacing
| Element | Mobile | Desktop |
|---|---|---|
| Section padding X / Y | `16 / 30` | `50 / 60` |
| Header→list gap (`pb`) | 24 | 32 |
| Inter-row gap | 0 (tight stack) | 12 |
| Row `pt` / `pb` (closed) | 12 / 12.8 | 12 / 17 |
| Row `pt` / `pb` (open) | n/a on mobile | 16 / 17 |
| Answer `pr` | n/a | 700 (right-inset for readable measure) |
| Answer `pt` | n/a | 16 |
| Icon size | 16 | 20 |
| Border width | 0.8px | 1px |

### Token mapping decisions
- **DM Sans** not in `tailwind.config.js` `fontFamily`. Use Shopify `font_picker` schema settings (`heading_font` default `dm_sans_n7`, `body_font` default `dm_sans_n4`) inlined via `style="font-family: {{ settings.value.family }}, {{ settings.value.fallback_families }}; font-weight: {{ settings.value.weight }};"` — follows `sections/hero-banner.liquid`, `promo-collection.liquid` precedent.
- **Heading color** unified via schema `color` setting (default `#0b1e3d`) applied at both breakpoints — removes mobile/desktop inconsistency. See DEVIATIONS in test-scenarios.
- `#666` and `#0b1e3d` are one-off hexes not in tailwind config — use arbitrary values.

## Copy

| Slot | Verbatim string |
|---|---|
| Section heading | `The AC Outlet Advantage` (mobile spelling authoritative; desktop Figma "Ac" is a typo) |
| Q1 | `Wholesale HVAC Equipment for All of Your Cooling & Heating Needs` |
| Q2 | `Wholesale HVAC Equipment for All of Your Cooling & Heating Needs` *(placeholder — rows 2–4 in Figma reuse row-1 question; merchant replaces via theme editor; preset seeds unique placeholder copy below)* |
| Q3 | same placeholder |
| Q4 | same placeholder |

### Row-1 answer (richtext, verbatim with inline anchors)
```html
Looking for reliable AC equipment at great prices? At The AC Outlet, we've got you covered! Whether you're a homeowner, business owner, real estate investor, property manager, or HVAC contractor, we make it easy to find the right <a href="https://www.theacoutlet.com/individual-ac-components.html" target="_blank" rel="noopener noreferrer">cooling and heating units</a> and pre-matched, <a href="https://www.theacoutlet.com/complete-ac-systems.html" target="_blank" rel="noopener noreferrer">AHRI-rated systems</a> at affordable prices. We make sure your order gets to you fast, with distribution centers nationwide ready to deliver in as little as 2-5 business days for in-stock items. Plus, everything we sell is backed by manufacturer warranties, some lasting up to a lifetime. We even offer <a href="https://www.theacoutlet.com/extended-labor-warranty-plans.html" target="_blank" rel="noopener noreferrer">extended labor warranty plans</a> to even further protect your purchase!
```

### Preset question placeholders (seed rows 2–4)
- Q2: `Fast, Nationwide Delivery in 2–5 Business Days`
- Q3: `Manufacturer Warranties Up To A Lifetime`
- Q4: `Optional Extended Labor Warranty Plans`
(Merchant can replace; answers blank in preset except row 1.)

## Schema plan

### Trade-off callout — blocks override
Intake answer said "section settings only". Overriding to **blocks** because FAQ count is inherently variable per page/merchant and fixed-slot section settings force 4-slot limit + duplicated setting groups. Blocks also align with `promo-test` precedent for repeatable content.

### Section settings
- `heading` (text, default `The AC Outlet Advantage`)
- `heading_color` (color, default `#0b1e3d`) — applied at both breakpoints; resolves Figma mobile/desktop inconsistency
- `heading_font` (font_picker, default `dm_sans_n7`)
- `body_font` (font_picker, default `dm_sans_n4`)
- `padding_top_mobile` (range, 0–80, step 2, default 30)
- `padding_bottom_mobile` (range, 0–80, step 2, default 30)
- `padding_top_desktop` (range, 0–120, step 4, default 60)
- `padding_bottom_desktop` (range, 0–120, step 4, default 60)

### Block type `faq_item` (max_blocks: 10)
- `question` (text, required)
- `answer` (richtext) — inline `<a>`, `<strong>`, `<em>` supported natively by Shopify richtext
- `default_open` (checkbox, default false) — only desktop row 1 seeded true in preset

### Preset
One preset `FAQ` with `enabled_on: templates: ["page"]`, seeded with 4 blocks. Block 1: Q1 + full rich answer + `default_open: true`. Blocks 2–4: placeholder questions, blank answers, `default_open: false`.

## File plan

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/faq.liquid` | Full section — heading + `[data-accordion]` container + per-block `<button data-accordion-target>` + `<div id hidden>` panel + schema |
| APPEND | `templates/page.test.json` | test-agent appends `faq` as fifth section + updates `order` array |
| REUSE | `js/components/ui-components.js` (`attachUIEvents` accordion block, L221-248) | Already wires `[data-accordion]` + `[data-accordion-target]` globally via `js/sections/global.js` DOMContentLoaded |
| REUSE | `snippets/image.liquid` | AVAILABLE but UNUSED — no imagery in FAQ design |
| SKIP | `js/sections/faq.js` | JS=NO — global accordion handler covers it |
| SKIP | `scss/sections/faq.scss` | All styling via Tailwind utilities; no section-scoped overrides needed |
| SKIP | `assets/faq-*.png` | No imagery |

## Reuse scan

| Need | File | Fitness | Recommendation |
|---|---|---|---|
| Accordion toggle behavior | `js/components/ui-components.js` L221-248 | **strong** — exact `[data-accordion]` / `[data-accordion-target]` / `hidden` / `aria-expanded` / `is-active` pattern | **reuse** — no new JS. Attach `data-accordion` to list `<ul>`, `data-accordion-target="{panelId}"` to `<button>`, panel `<div id="{panelId}" hidden>`. Liquid seeds `aria-expanded="true"` + removes `hidden` when `block.settings.default_open` is true. |
| Global JS init | `js/sections/global.js` L11 | **strong** — `initUIComponents()` runs on DOMContentLoaded | **reuse** — no wiring needed |
| DM Sans font loading | `sections/hero-banner.liquid` L259-268, `promo-collection.liquid` L178-181 | **strong** — font_picker setting + inline `style="font-family:..."` | **reuse pattern** |
| Heading color/size desktop-mobile split | `sections/promo-test.liquid` L56 | **strong** — `tw-text-black md-small:tw-text-[#0b1e3d]` precedent already exists; FAQ unifies via schema instead for merchant control | **adapt** — schema-driven heading color |
| Image rendering | `snippets/image.liquid` | n/a (no imagery) | **skip** — document AVAILABLE-but-UNUSED |
| Max-width container | Section uses full-width container (Figma shows `px-50 py-60` at section level, no inner max-width shown). Mirror `promo-test` `max-w-[1340px] mx-auto` inside section body | **partial** | **adapt** — `max-w-[1340px]` inner wrapper on desktop for readable measure |

## Variants & states

| Variant | Trigger | Visual behavior |
|---|---|---|
| Closed row | default | Question + plus icon. Bottom border `rgba(0,0,0,0.2)` 0.8px mobile / 1px desktop. Row `pt/pb` 12/12.8 mobile, 12/17 desktop. |
| Open row | `default_open: true` OR user click | `aria-expanded="true"`, panel shown (no `hidden`). Desktop: icon flips to minus, bottom border becomes solid black 1px, row `pt` bumps to 16, answer panel `pr-[700px] pt-[16px]` with body copy. Mobile: design shows no open state — still expands on tap for accessibility, using same desktop panel styles scaled to mobile measure (full width, no `pr-[700px]`). |
| Open row with rich answer + inline links | richtext has `<a>` | Links render with `target="_blank" rel="noopener noreferrer"` + `underline decoration-solid`, inherit body color/size |
| Empty answer | block.answer blank | Panel renders empty `<div>` but still toggles — or row degrades to non-interactive div (prefer: render empty panel for a11y consistency — decide in ui-agent; acceptable either way). |
| Blank question | block.question blank | Skip rendering the entire block (guard `{% if block.settings.question != blank %}`) |
| Blank heading | section.settings.heading blank | Suppress entire header container (no empty `<h2>`, list still renders) |
| Mobile layout | `<768px` | Base utilities apply: 16px x-padding, 30px y-padding, 16px heading, 0.8px borders. All rows closed in Figma; JS toggle still operative. |

## A11y

Mode: **required** — user-facing content under WCAG 2.1 AA.

- `<section aria-labelledby="faq-heading-{{ section.id }}">` wrapping; `<h2 id="faq-heading-{{ section.id }}">` for heading.
- Disclosure pattern per block:
  - `<button type="button" aria-expanded="{true|false}" aria-controls="faq-panel-{{ section.id }}-{{ block.id }}" data-accordion-target="faq-panel-{{ section.id }}-{{ block.id }}">` for the question row.
  - `<div id="faq-panel-{{ section.id }}-{{ block.id }}" {% unless default_open %}hidden{% endunless %}>` for the answer panel.
- `[data-accordion]` on the enclosing `<ul>`/`<div>` so `attachUIEvents` finds and wires it.
- Icon SVG marked `aria-hidden="true"` + `focusable="false"`.
- Inline answer links: `rel="noopener noreferrer"` (since `target="_blank"`), descriptive anchor text (already satisfied — "cooling and heating units", etc.).
- Focus-visible ring on button: `focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#0b1e3d]` (or `ah-teal` — ui-agent picks).
- Keyboard: native `<button>` handles Enter/Space out of the box; `attachUIEvents` click handler triggers on both.
- Heading hierarchy: page-level `<h1>` elsewhere; this section uses `<h2>`. Question rows are `<button>` inside `<li>`, not headings — standard FAQ disclosure pattern (we deliberately don't use `<h3>` wrappers to avoid heading-spam).

## JavaScript decision

**NO.**

Rationale: `initUIComponents()` in `js/components/ui-components.js` (L221-248) already wires every `[data-accordion]` container + `[data-accordion-target]` button globally on DOMContentLoaded (called from `js/sections/global.js` L11). The handler toggles `aria-expanded`, panel `hidden`, and `.is-active` on the item — exactly what this section needs. No per-section JS file, no entry point, no webpack bundle required.

Guidance for `test-scenarios.md` (ui-agent will author):
- **JS handoff section content: "Section JS: NONE — relies on global `attachUIEvents` accordion handler. See `js/components/ui-components.js` L221-248."**
- Test-agent selectors to assert (functional spec): `[data-section-type="faq"] [data-accordion]`, `[data-accordion-target]` buttons with `aria-expanded` + `aria-controls`, panels `[id^="faq-panel-"][hidden]` (closed) vs no `hidden` (open), click flips `aria-expanded` true↔false and adds/removes `hidden` on panel.

## Success criteria
- Visual match vs `qa/figma-desktop.png` + `qa/figma-mobile.png` at `390`, `768`, `1024`, `1280`, `1550` via pixelmatch.
- Heading + all 4 preset blocks editable in theme editor; `default_open` checkbox on block 1 renders expanded on first paint.
- Row-1 rich answer renders three inline links with correct hrefs + `target="_blank"` + `rel="noopener noreferrer"`.
- Blank question blocks are skipped; blank heading suppresses the header.
- Copy matches verbatim strings in `## Copy` table.
- Semantic: one `<section aria-labelledby>`, one `<h2>`, one `<button aria-expanded aria-controls>` per row, one `<div id hidden>` per panel.
- Click / Enter / Space on any row button toggles disclosure via global accordion handler — no new JS file shipped.
- `yarn lint` clean. `shopify-dev-mcp.validate_theme` clean.
- `templates/page.test.json` reachable at `?view=test` and renders `faq` as fifth section.

## Constraints
- Template type: `page` only. Preset `enabled_on: templates: ["page"]`.
- Data scope: section.settings + block.settings only. No product/collection/metafield access.
- Fonts: DM Sans via `font_picker` schema (`dm_sans_n7` heading / `dm_sans_n4` body). Not in `tailwind.config.js` — inline `style="font-family: ...; font-weight: ...;"` per existing precedent.
- Heading color unified via schema `heading_color` (default `#0b1e3d`) — applied at both breakpoints; resolves Figma mobile/desktop inconsistency.
- Blocks override of "section settings only" intake answer — trade-off documented in Schema plan.
- No imagery (`snippets/image.liquid` AVAILABLE but UNUSED).
- No new JS file; no new SCSS file; no bundled assets.
- Test fixture path: APPEND to shared `templates/page.test.json`; test-agent reaches the rendered page via `?view=test` query on `GLOBAL_PAGE_PATH`.
- Mobile-first Tailwind: base utilities = 390px, overrides at `md-small:` (768), `md:` (1024), `lg:` (1280), `2xl:` (1550). All classes prefixed `tw-`.
