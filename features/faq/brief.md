# brief.md — faq

## Intent

Merchandising trust / SEO section titled "The AC Outlet Advantage" for the `/pages/advantage` (or similar) page. Teaches shoppers the brand's value props (wholesale pricing, manufacturer warranties, breadth of catalog, nationwide distribution) through a disclosure-style FAQ list of 4 question/answer rows. Audience: residential shoppers + HVAC contractors landing on the advantage / FAQ page. Renders as a merchant-editable `sections/faq.liquid` section dropped into the page template via `templates/page.test.json`. Desktop shows row 1 expanded with a rich answer containing 3 inline outbound links; mobile renders all rows collapsed.

## Design reference

- Canonical design values: `features/faq/figma-context.md` (typography, colors, spacing, copy, cross-breakpoint deltas, token mapping, a11y notes — DO NOT duplicate here).
- Reference screenshots: `features/faq/qa/figma-desktop.png` (1440), `features/faq/qa/figma-mobile.png` (390).
- Breakpoints implemented: mobile-first base (390) → `md:` override at 1024 for desktop layout. `md-small:` / `lg:` / `2xl:` not required by design (no intermediate delta).
- Divergence: MEDIUM. Heading size + color, question font-size + line-height, border width, icon size, section padding all shift desktop vs. mobile. Default-open state differs (row 1 open desktop / all closed mobile) — handled by per-row `default_open` schema toggle, not CSS.
- Dual-DOM directive: NO. Single DOM sufficient — all deltas are utility-token swaps under `md:` prefix. Default-open diff is data-driven, not structural.

## Schema plan

- Template type: `page`
- Render context: section in editor (`sections/faq.liquid`)
- Data sources: `section.settings` + `blocks` (see trade-off below)

### Trade-off on "section-settings-only"

Merchant answered "section settings only" but FAQ is inherently variable-count. Honoring that literally would force either (a) N fixed Q/A slot settings (clunky, caps content) or (b) one giant richtext that loses per-row disclosure affordance. RECOMMENDATION (override merchant answer with explicit call-out): use Shopify `blocks` with one block type `faq_item`. Rationale: preset supplies the 4 Figma items so merchant edit-experience matches intent; merchant gains add / reorder / remove rows without code change; no fixed slot cap; aligns with `reference_new_theme.md` "block-level variants" and Shopify idiomatic patterns for repeating content.

Fallback if merchant insists on settings-only: ten fixed slots `faq_1_question` / `faq_1_answer` / `faq_1_default_open` through `faq_10_*` gated by `visible_if`. Inferior — document but do not implement unless merchant re-asserts.

### Section settings

| id | type | default | label / purpose |
|---|---|---|---|
| `heading` | `text` | `"The AC Outlet Advantage"` | Section heading shown above list |
| `heading_color` | `color` | `#0b1e3d` | Resolves Figma heading-color inconsistency (desktop `#0b1e3d` / mobile `#000`). Merchant picks one value applied at both breakpoints. |
| `heading_font_picker` | `font_picker` | `dm_sans_n7` | Lets merchant honor DM Sans Bold 48px heading without theme-level font swap. See §Constraints for DM Sans rationale. |
| `body_font_picker` | `font_picker` | `dm_sans_n4` | Drives question (Medium 500) + answer (Regular 400) family. Weights selected via Liquid `font_modify` filter in ui-agent. |
| `padding_top_desktop` | `range` min 0 max 120 step 4 default 60 | 60 | px |
| `padding_bottom_desktop` | `range` min 0 max 120 step 4 default 60 | 60 | px |
| `padding_top_mobile` | `range` min 0 max 80 step 2 default 30 | 30 | px |
| `padding_bottom_mobile` | `range` min 0 max 80 step 2 default 30 | 30 | px |

### Block: `faq_item`

| id | type | default | label / purpose |
|---|---|---|---|
| `question` | `text` | — | Short question/summary shown on the row header |
| `answer` | `richtext` | — | Long-form answer with inline links. `richtext` supports `<a>` with rel/target — inline outbound links rendered by merchant via editor toolbar. |
| `default_open` | `checkbox` | `false` | Whether this row renders with `aria-expanded="true"` + panel visible on first paint. |

Block `max`: `10`. `min`: `1`. Preset seeds 4 `faq_item` blocks with the Figma copy (see §Copy). Only the first preset block has `default_open: true` and includes the rich answer with 3 inline links; remaining three blocks seed answer placeholder copy for merchant to fill.

### Preset

One preset `FAQ`, `enabled_on: { templates: ["page"] }`, presets `heading` + font pickers + all 4 Figma blocks (see §Copy for verbatim strings + link hrefs).

## File plan (Create + Reuse + APPEND)

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/faq.liquid` | Section shell, schema, Liquid rendering. Contains inline SVG for plus/minus icons scoped to `[data-accordion-target]` state. |
| APPEND | `templates/page.test.json` | test-agent appends `"faq": { "type": "faq", "blocks": { ... 4 preset items ... }, "block_order": [...] }` and adds `"faq"` to `order` array. |
| REUSE | `js/components/ui-components.js` (`attachUIEvents` → `[data-accordion]` / `[data-accordion-target]` handler, lines 221–248) | Accordion click toggle + `aria-expanded` + `panel.hidden` + `is-active` class. Verbatim — no wrapper, no JS entry needed. Already globally initialized by `js/sections/global.js` on `DOMContentLoaded`. |
| REUSE (unused) | `snippets/image.liquid` | Available per `reference_image_stack.md` but FAQ design has NO imagery. Documented here for traceability. |
| SKIP | `js/sections/faq.js` | JS decision = NO. Global init wires accordion automatically. |
| SKIP | `scss/sections/faq.scss` | No animations / no complex selectors beyond Tailwind utilities. Inline `<style>` scoped to `[data-accordion]` only if icon rotation requires `.is-active &` escape (ui-agent judges). |
| SKIP | `assets/faq-*.{png,svg}` | No imagery. Plus/minus icons via inline SVG in Liquid. Per `reference_new_theme.md` SVG rule: stored in `assets/` as standalone SVG + rendered via `{{ 'icon-plus.svg' | asset_url }}` OR inline. ui-agent's choice. |

Never emit `CREATE assets/faq-*.png` rows — no image_picker needed, no bundled imagery.

## Reuse scan

Grep / glob commands run:

```
grep -rn "initUIComponents|attachUIEvents" js/ assets/
glob sections/faq*.liquid
glob snippets/*faq*
glob templates/page.test.json
```

Results:

| Need | File | Fitness | Recommendation |
|---|---|---|---|
| Accordion click + aria toggle | `js/components/ui-components.js` L224–248 | STRONG — exact DOM contract (`[data-accordion]` wraps list; `[data-accordion-target]` on button; panel id in `data-accordion-target` attr; toggles `panel.hidden` + `aria-expanded` + `.is-active`) | REUSE verbatim. ui-agent emits matching selectors. |
| Global accordion init | `js/sections/global.js` L11 (`initUIComponents()` on DOMContentLoaded) | STRONG — fires on initial page load; covers any section on any template. | REUSE — no per-section JS entry. Brief §JS = NO. |
| Responsive image rendering | `snippets/image.liquid` | N/A — no imagery in Figma | SKIP. Documented as AVAILABLE BUT UNUSED per `reference_image_stack.md`. |
| Existing FAQ section / snippet | `sections/faq*.liquid`, `snippets/*faq*` | NONE — no prior file | CREATE new. No collision. |
| Test fixture target | `templates/page.test.json` | STRONG — exists, already hosts 4 sections (`collection-grid-test`, `payment-banner`, `promo-test`, `promo-collection-test`). | APPEND per `feedback_test_template_naming.md` rule. |
| DM Sans font stack | `tailwind.config.js` `fontFamily.sans` | NONE — theme loads Helvetica Neue. Figma uses DM Sans. | Resolve via `settings_schema.json` / section `font_picker` setting `dm_sans_n7` + `dm_sans_n4`. Shopify's font library includes DM Sans — no CDN or local font file needed. ui-agent binds family via `{{ settings.heading_font_picker | font_face }}` in section `<style>` tag. |
| Heading-color inconsistency `#0b1e3d` vs `#000` | — | N/A | Resolve via schema `color` setting `heading_color`. Merchant picks one value used at both breakpoints. Default `#0b1e3d`. |

## Variants

| Variant | Trigger | Visual behavior |
|---|---|---|
| Row closed | `block.settings.default_open == false` AND merchant has not clicked | Plus icon, `rgba(0,0,0,0.2)` bottom border (0.8px mobile / 1px desktop), summary-only row, `<panel hidden>` |
| Row open | `block.settings.default_open == true` on render OR user click sets `aria-expanded="true"` | Minus icon (desktop only visually per Figma — mobile shows plus even when open; ui-agent can keep minus for consistency + document in DEVIATIONS), solid black 1px bottom border, deeper `padding-top` (16px vs 12px), answer panel revealed |
| Row open with rich answer (first preset row) | `default_open: true` + `answer` richtext contains `<a>` elements | Answer paragraph `#666` text; inline `<a>` underlined, `target="_blank"`, inherits `#666` color |
| Empty answer | Merchant authors `question` but leaves `answer` blank | Row still renders + toggles but panel empty. ui-agent must suppress `<div hidden id="panel-N">` when `answer` is blank OR still emit empty panel (trivial visual; recommend emit empty to keep DOM shape stable). Decision: ui-agent's call — flag in DEVIATIONS. |
| Blank `question` | Merchant leaves `question` blank | Skip the block entirely (`{% if block.settings.question != blank %}`). No empty row. |
| Heading blank | `section.settings.heading == blank` | Suppress `<h2>`. Section still renders list below. |
| Cross-breakpoint (mobile) | `width < 1024` | Smaller heading (28px), smaller question (16px/26lh), tighter padding, 0.8px borders, 16px icon. Answer body copy uses same markup but natural wrap. Default-open rows stay open on mobile (data-driven, not viewport). |

## A11y

Mode: **required** (user-facing marketing content; disclosure pattern needs semantic correctness for WCAG 2.1 AA).

- Section root: `<section aria-labelledby="faq-heading-{{ section.id }}">`
- Heading: `<h2 id="faq-heading-{{ section.id }}">` — single `<h2>` per section. No per-row `<h3>` needed (row header is a `<button>`, not a heading); if ui-agent wants row `<h3>`, wrap the button: `<h3><button aria-expanded ...>…</button></h3>` — both patterns valid; ui-agent's call.
- Row button: `<button type="button" data-accordion-target="faq-panel-{{ block.id }}" aria-expanded="{{ block.settings.default_open | default: false }}" aria-controls="faq-panel-{{ block.id }}">`
- Answer panel: `<div id="faq-panel-{{ block.id }}" {% unless block.settings.default_open %}hidden{% endunless %}>`
- Icon: inline SVG with `aria-hidden="true"` + `focusable="false"`. Plus/minus swap driven by `[aria-expanded]` attribute selector (CSS) — visual state is redundant with `aria-expanded` per `figma-context.md` a11y note.
- Keyboard: browser default on `<button>` handles Space + Enter (confirmed by `js/components/ui-components.js` L241 — click-only handler, relies on browser default). No custom key handler needed. No arrow-key navigation required (each row is an independent disclosure, not a tablist).
- Focus ring: ui-agent applies `focus-visible:tw-outline-black` or theme-standard focus style. Never `outline: none` without replacement.
- Inline links in rich answer: `target="_blank"` + `rel="noopener noreferrer"` (merchant authors target via richtext toolbar; ui-agent does NOT need to enforce — Shopify richtext output already sanitizes).
- Disabled / loading / empty states: N/A for FAQ.

## JavaScript decision

**NO.**

Rationale: `js/sections/global.js` L11 globally calls `initUIComponents()` on `DOMContentLoaded`, which invokes `attachUIEvents(document)` → binds every `[data-accordion]` / `[data-accordion-target]` pair page-wide. FAQ section only needs to emit the matching DOM selectors — no per-section JS entry, no webpack entry, no `JsComponents/ui-components` import. No `js/sections/faq.js` file created.

Section is **pure Liquid + Tailwind** (with inline `<style>` for `font_face` output + optional scoped icon rotation).

## Copy

All verbatim from `figma-context.md`. ui-agent pastes exact strings into preset defaults — do NOT re-author.

### Heading

- `"The AC Outlet Advantage"` (canonical; ignore the Figma desktop casing typo "The Ac Outlet Advantage" — mobile rendering is authoritative).

### Block presets (preset `FAQ`)

| # | `question` | `answer` (richtext) | `default_open` |
|---|---|---|---|
| 1 | `Wholesale HVAC Equipment for All of Your Cooling & Heating Needs` | (see full paragraph below with 3 inline links) | `true` |
| 2 | `Find What You Need at Our Online AC Supply Store` | (merchant fills — preset seeds with placeholder or empty; defer copy to merchant) | `false` |
| 3 | `We Offer a Wide Variety of HVAC Products` | (merchant fills) | `false` |
| 4 | `A Combination of Convenience & Customer Support at Wholesale Prices` | (merchant fills) | `false` |

### Block 1 answer (verbatim, with inline `<a>`)

```
Looking for reliable AC equipment at great prices? At The AC Outlet, we've got you covered! Whether you're a homeowner, business owner, real estate investor, property manager, or HVAC contractor, we make it easy to find the right <a href="https://www.theacoutlet.com/individual-ac-components.html" target="_blank" rel="noopener noreferrer">cooling and heating units</a> and pre-matched, <a href="https://www.theacoutlet.com/complete-ac-systems.html" target="_blank" rel="noopener noreferrer">AHRI-rated systems</a> at affordable prices. We make sure your order gets to you fast, with distribution centers nationwide ready to deliver in as little as 2-5 business days for in-stock items. Plus, everything we sell is backed by manufacturer warranties, some lasting up to a lifetime. We even offer <a href="https://www.theacoutlet.com/extended-labor-warranty-plans.html" target="_blank" rel="noopener noreferrer">extended labor warranty plans</a> to even further protect your purchase!
```

## Success criteria

- Visual parity at mobile (390) + desktop (1440) per pixelmatch against `qa/figma-desktop.png` + `qa/figma-mobile.png` — mismatch % under project threshold.
- All 4 preset rows render with correct question copy; row 1 answer renders with 3 inline underlined links, each `target="_blank"`.
- Clicking any row button toggles `aria-expanded`, shows/hides its panel, swaps plus ↔ minus icon, swaps border color (`rgba(0,0,0,0.2)` ↔ `#000`) without JS written in this feature — purely from existing `attachUIEvents` handler + CSS `[aria-expanded="true"]` selectors.
- Keyboard: Tab reaches row buttons; Space + Enter toggle the panel (browser default).
- Schema editable in theme editor: merchant can add / reorder / remove `faq_item` blocks; edit heading + font + padding + per-row copy + per-row default-open toggle; preview updates.
- No Liquid validation errors from `shopify-dev-mcp.validate_theme`.
- No ESLint errors (no new JS written, but `yarn lint` still runs clean).
- `templates/page.test.json` appended cleanly: new `faq` section entry + `order` array contains `"faq"`; existing 4 sections untouched.
- a11y: `aria-labelledby` resolves; each row `aria-controls` points to a real panel id; `hidden` attribute toggles in sync with `aria-expanded`.

## Constraints

- **DM Sans availability.** Theme's `tailwind.config.js` `fontFamily.sans` is Helvetica-Neue stack. Figma design is DM Sans. RESOLUTION: expose `heading_font_picker` + `body_font_picker` section settings (defaults `dm_sans_n7` / `dm_sans_n4`). Shopify's font library includes DM Sans — no local font file required; rendered via `font_face` Liquid filter in an inline `<style>` block inside `sections/faq.liquid`. Trade-off accepted: adds one inline `<style>` per section instance. Alternative (add DM Sans to theme-wide `settings_schema.json` font picker) is out of scope for this feature.
- **Heading-color inconsistency.** Figma shows `#0b1e3d` desktop vs `#000` mobile. Single merchant-chosen color applied at both breakpoints via `heading_color` section setting. Default: `#0b1e3d` (desktop value). Document the mobile-deviation in ui-agent's DEVIATIONS section of brief.md.
- **Section-settings-only override.** Merchant answered "section settings only" but spec uses `blocks` for FAQ items (rationale in §Schema plan). Flag to merchant at review; revert to 10-slot fallback only if merchant re-asserts.
- **Data scope.** `section.settings` + `block.settings` only. No `product`, `collection`, `metafields`, or `fetch`. Section is pure content.
- **No Figma imagery.** No `image_picker` settings. Plus/minus icons rendered as inline SVG in Liquid. No bundled `/assets/faq-*.{png,svg}`.
- **Cross-section contracts.** None. FAQ section emits no events, consumes no events, no inter-section state. Self-contained.
- **Performance.** Zero new JS bundle weight. Accordion behavior reuses already-loaded `js/components/ui-components.js` (part of `js/sections/global.js` entry → `assets/global.js` bundle). SVG icons inline = no extra HTTP request.
- **Merchant editability.** All copy, colors, padding, fonts, block count, default-open state exposed as schema. No hardcoded strings in Liquid beyond structural `aria-*` attributes.
- **Template-push.** Developer must NOT run `yarn deploy` / `shopify theme push`. `yarn start` watcher handles sync per `.claude/rules/theme-push.md`.

---

Brief complete. Ready for `/build-ui faq`.

---

## As-built DOM

```
<section.faq-section[data-section-type="faq"][data-section-id][aria-labelledby="faq-heading-{id}"]>
  <div.tw-w-full.tw-flex.tw-flex-col.tw-mx-auto.tw-max-w-[1340px]>

    <!-- conditional: heading != blank -->
    <div.tw-pb-[24px].md:tw-pb-[32px]>
      <h2#faq-heading-{id}.faq-heading[style="color:{heading_color}"]>
        {{ heading | escape }}
      </h2>
    </div>

    <div[data-accordion].tw-w-full.tw-flex.tw-flex-col.md:tw-gap-[12px]>

      <!-- for each block where question != blank -->
      <div.tw-w-full[{{ block.shopify_attributes }}]>

        <h3.tw-m-0>
          <button[type="button"][data-accordion-target="faq-panel-{block.id}"]
                 [aria-expanded="{is_open}"][aria-controls="faq-panel-{block.id}"]
                 class="tw-flex tw-items-center tw-justify-between tw-w-full tw-text-left
                        tw-border-b-[0.8px] tw-border-black/20 tw-pt-[12px] tw-pb-[12.8px]
                        tw-min-h-[50px] md:tw-border-b md:tw-border-black/20 md:tw-pb-[17px]
                        tw-bg-transparent tw-cursor-pointer
                        focus-visible:tw-outline focus-visible:tw-outline-2
                        focus-visible:tw-outline-offset-2 focus-visible:tw-outline-black">
            <span.faq-question-text.tw-text-[16px].tw-leading-[26px].md:tw-text-[18px]
                  .md:tw-leading-[20px].md:tw-tracking-[-0.72px].tw-text-black
                  .tw-pr-[16px].tw-min-w-0.tw-break-words>
              {{ block.settings.question | escape }}
            </span>
            <svg.faq-icon-plus[aria-hidden="true"][focusable="false"]
                 class="tw-flex-shrink-0 tw-h-[16px] tw-w-[16px] md:tw-h-[20px] md:tw-w-[20px]">
              <!-- plus path -->
            </svg>
            <svg.faq-icon-minus[aria-hidden="true"][focusable="false"]
                 class="tw-flex-shrink-0 tw-h-[16px] tw-w-[16px] md:tw-h-[20px] md:tw-w-[20px]">
              <!-- minus path -->
            </svg>
          </button>
        </h3>

        <div#faq-panel-{block.id}[hidden?]
             class="faq-answer tw-pt-[16px] tw-pb-[16px] md:tw-max-w-[640px]
                    tw-text-[16px] tw-leading-[20px] md:tw-tracking-[-0.16px]
                    tw-text-[#666] [&_a]:tw-underline [&_a]:tw-decoration-solid">
          {{ block.settings.answer }}
        </div>

      </div>
      <!-- end for -->

    </div>
  </div>
</section>
```

---

## Selector catalogue

| Selector | Element | Purpose |
|---|---|---|
| `[data-section-type="faq"]` | `<section>` | Section root — JS mount selector |
| `[data-section-id]` | `<section>` | Section instance ID |
| `#faq-heading-{section.id}` | `<h2>` | `aria-labelledby` target; test-agent asserts heading text |
| `[data-accordion]` | `<div>` | Accordion group root — `attachUIEvents` binds here |
| `[data-accordion-target]` | `<button>` | Toggle button; value = matching panel id |
| `[aria-expanded="false"]` | `<button>` | Closed state |
| `[aria-expanded="true"]` | `<button>` | Open state |
| `[aria-controls="faq-panel-{block.id}"]` | `<button>` | Points to answer panel |
| `#faq-panel-{block.id}` | `<div>` | Answer panel |
| `[hidden]` | `<div#faq-panel-*>` | Panel closed (hidden attribute) |
| `.faq-heading` | `<h2>` | Heading typography class |
| `.faq-question-text` | `<span>` | Question text font class |
| `.faq-answer` | `<div>` | Answer panel typography class |
| `.faq-icon-plus` | `<svg>` | Plus icon (shown when closed) |
| `.faq-icon-minus` | `<svg>` | Minus icon (shown when open) |
| `.is-active` | block `<div>` | Added by JS when row is open |

---

## Data attributes

| Attribute | Element | Values | Meaning | Set by |
|---|---|---|---|---|
| `data-section-type` | `<section>` | `"faq"` | JS/CSS mount selector | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Instance identifier | Liquid (static) |
| `data-accordion` | `<div>` (list wrapper) | present | `attachUIEvents` binding root | Liquid (static) |
| `data-accordion-target` | `<button>` | `"faq-panel-{block.id}"` | Points to matching panel id | Liquid (static) |
| `aria-expanded` | `<button>` | `"true"` / `"false"` | Disclosure state | Liquid initial; JS toggles |
| `aria-controls` | `<button>` | `"faq-panel-{block.id}"` | Associates button → panel | Liquid (static) |
| `aria-labelledby` | `<section>` | `"faq-heading-{section.id}"` | Section landmark label | Liquid (static) |
| `aria-hidden` | `<svg>` | `"true"` | Decorative icon hidden from AT | Liquid (static) |
| `focusable` | `<svg>` | `"false"` | IE/Edge SVG focus fix | Liquid (static) |
| `hidden` | `<div#faq-panel-*>` | boolean | Panel closed on initial render | Liquid (via `unless default_open`) |

---

## Schema settings (final)

```json
{
  "name": "FAQ",
  "tag": "section",
  "settings": [
    { "type": "text",       "id": "heading",               "label": "Heading",                "default": "The AC Outlet Advantage" },
    { "type": "color",      "id": "heading_color",         "label": "Heading color",          "default": "#0b1e3d" },
    { "type": "font_picker","id": "heading_font_picker",   "label": "Heading font",           "default": "dm_sans_n7" },
    { "type": "font_picker","id": "body_font_picker",      "label": "Body font",              "default": "dm_sans_n4" },
    { "type": "range",      "id": "padding_top_desktop",   "label": "Padding top (desktop)",  "min": 0, "max": 120, "step": 4,  "default": 60, "unit": "px" },
    { "type": "range",      "id": "padding_bottom_desktop","label": "Padding bottom (desktop)","min": 0, "max": 120, "step": 4, "default": 60, "unit": "px" },
    { "type": "range",      "id": "padding_top_mobile",    "label": "Padding top (mobile)",   "min": 0, "max": 80,  "step": 2,  "default": 30, "unit": "px" },
    { "type": "range",      "id": "padding_bottom_mobile", "label": "Padding bottom (mobile)","min": 0, "max": 80,  "step": 2,  "default": 30, "unit": "px" }
  ],
  "blocks": [
    {
      "type": "faq_item",
      "name": "FAQ item",
      "settings": [
        { "type": "text",     "id": "question",     "label": "Question" },
        { "type": "richtext", "id": "answer",       "label": "Answer" },
        { "type": "checkbox", "id": "default_open", "label": "Open by default", "default": false }
      ]
    }
  ],
  "max_blocks": 10,
  "presets": [
    {
      "name": "FAQ",
      "settings": { "heading": "The AC Outlet Advantage", "heading_color": "#0b1e3d" },
      "blocks": [
        {
          "type": "faq_item",
          "settings": {
            "question": "Wholesale HVAC Equipment for All of Your Cooling & Heating Needs",
            "answer": "<p>Looking for reliable AC equipment at great prices? ... [3 inline links] ...</p>",
            "default_open": true
          }
        },
        { "type": "faq_item", "settings": { "question": "Find What You Need at Our Online AC Supply Store", "answer": "", "default_open": false } },
        { "type": "faq_item", "settings": { "question": "We Offer a Wide Variety of HVAC Products", "answer": "", "default_open": false } },
        { "type": "faq_item", "settings": { "question": "A Combination of Convenience & Customer Support at Wholesale Prices", "answer": "", "default_open": false } }
      ]
    }
  ],
  "enabled_on": { "templates": ["page"] }
}
```

Note: test-agent populates live block data via `templates/page.test.json` APPEND per test-fixture rule.

---

## CSS custom properties

| Property | Defined on | Value source | Purpose |
|---|---|---|---|
| `--faq-pt-mobile` | `#shopify-section-{id}` | `{{ section.settings.padding_top_mobile }}px` | Mobile top padding driven by schema range |
| `--faq-pb-mobile` | `#shopify-section-{id}` | `{{ section.settings.padding_bottom_mobile }}px` | Mobile bottom padding |
| `--faq-pt-desktop` | `#shopify-section-{id}` | `{{ section.settings.padding_top_desktop }}px` | Desktop top padding |
| `--faq-pb-desktop` | `#shopify-section-{id}` | `{{ section.settings.padding_bottom_desktop }}px` | Desktop bottom padding |

Font-face CSS emitted via `{{ heading_bold | font_face }}`, `{{ body_medium | font_face }}`, `{{ body_regular | font_face }}` — not custom properties, but scoped to the section `<style>` block.

---

## Figma variants implemented

| Variant | Implemented |
|---|---|
| Row closed (plus icon, rgba border) | YES — default state |
| Row open (minus icon, solid black border, deeper pt, answer revealed) | YES — driven by `aria-expanded="true"` CSS selectors + JS toggle |
| Row open with rich answer + 3 inline links | YES — preset block 1 |
| Empty answer (question set, answer blank) | YES — panel emitted with empty body; DOM shape stable |
| Blank question → skip block | YES — `{% if block.settings.question != blank %}` gate |
| Heading blank → suppress h2 | YES — `{% if heading != blank %}` gate |
| Mobile layout (28px heading, 16px question, tighter padding, 0.8px border) | YES — base (mobile-first) Tailwind classes |
| Desktop layout (48px heading, 18px question, 50px/60px padding, 1px border) | YES — `md:` overrides |

---

## Figma variants NOT implemented

None — all Figma variants accounted for above.

---

## DEVIATIONS

- **Heading color unified.** Figma shows `#0b1e3d` desktop / `#000` mobile. Single `heading_color` schema setting (default `#0b1e3d`) applied at both breakpoints per brief §Constraints. Mobile heading color deviation documented here.
- **`pr-[700px]` answer constraint → `md:tw-max-w-[640px]`.** Figma specifies `padding-right: 700px` on the desktop answer slot to constrain line-length. Translated to `md:tw-max-w-[640px]` on the answer `<div>`. Produces equivalent measure constraint without breaking natural flow at narrower containers.
- **`<h3>` wrap on each row button.** Brief marked ui-agent's call. Chose `<h3><button>…</button></h3>` for screen-reader heading jump-list navigation. Heading rank: `<h2>` section, `<h3>` row — correct hierarchy.
- **`is_open` Liquid variable as `{{ block.settings.default_open }}`.** `aria-expanded` outputs the literal boolean. Shopify renders Liquid booleans as `"true"` / `"false"` strings — matches JS contract `btn.getAttribute('aria-expanded') === 'true'`.
- **Heading container uses `md:tw-items-center` omitted.** Figma desktop shows centered alignment of the heading, but the heading sits in a left-aligned max-width container. Left-aligned is cleaner for prose; no explicit `items-center` on the outer container to avoid centering the full accordion list.
- **Empty answer panel always emitted.** When `answer` is blank the `<div hidden>` still renders, keeping DOM shape stable for the accordion JS contract. Visual impact: none (hidden). Brief stated ui-agent's call — emitting empty panel chosen.
- **DM Sans via `font_picker` schema.** Theme-level `tailwind.config.js` is Helvetica Neue. DM Sans loaded per-section via `font_face` Liquid filter from section `font_picker` settings per brief §Constraints.
- **`items-gap: 12px` on desktop only.** Figma specifies `gap: 12px` between rows only on desktop (first-open variant). Implemented as `md:tw-gap-[12px]` on `[data-accordion]` wrapper; mobile uses tight stack (no gap).

---

## JS handoff

**Section JS: NONE.** Static disclosure pattern. No `js/sections/faq.js` file written.

Behavior wired globally:
- `js/sections/global.js` calls `initUIComponents(document)` on `DOMContentLoaded`.
- `initUIComponents` calls `attachUIEvents(root)` in `js/components/ui-components.js`.
- `attachUIEvents` at L224 binds every `[data-accordion]` wrapper; at L228 binds every `[data-accordion-target]` button within it.
- On button click (L241): toggles `aria-expanded` string, sets `panel.hidden`, toggles `.is-active` on the closest ancestor that contains the panel.

Selectors test-agent should assert:
- `[data-section-type="faq"]` — section mount present in DOM
- `[data-accordion]` — accordion wrapper present
- `[data-accordion-target]` buttons — count equals block count (4 in preset)
- `[aria-expanded="true"]` — block 1 expanded on initial render (desktop preset)
- `#faq-panel-{block.id}` — panel ids exist and match `aria-controls` values
- `.faq-heading` — heading text = "The AC Outlet Advantage"
- `.faq-question-text` — 4 question strings rendered verbatim
- `.faq-icon-plus` / `.faq-icon-minus` — both SVGs present per row; CSS drives visibility
- After simulated click: `aria-expanded` flips, `panel.hidden` toggles, `.is-active` appears on row wrapper
