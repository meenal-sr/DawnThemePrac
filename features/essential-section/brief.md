# brief.md — essential-section

## Intent
Merchant-editable "HVAC Essentials" marketing block pairing a left-column CTA (heading + description + primary button) with a row of 3 informational feature cards (icon + title + body + "Learn More" link). Intended for above-the-fold placement on page templates (e.g. a learn/education page). Helps shoppers understand efficiency standards, incentives, and refrigerant changes before committing to a purchase. Desktop renders as a 2-column row; mobile stacks header block above a horizontally-scrolling slider of cards. All content editable via section settings + card blocks; no hardcoded copy or imagery.

## Design reference
- **Canonical values:** `features/essential-section/figma-context.md` — typography, colors, spacing, copy, cross-breakpoint deltas. ui-agent reads verbatim; do NOT re-inline.
- **PNG references:** `features/essential-section/qa/figma-desktop.png` (1440w) + `features/essential-section/qa/figma-mobile.png` (390w).
- **Figma URLs / nodes:**
  - Desktop 1440w — https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-6459 (node `5654:6459`)
  - Mobile 390w — https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-53606 (node `5654:53606`)
- **Divergence:** MEDIUM — layout axis flips (row→stack), heading sizes swap palette (#0b1e3d → #000), description weight changes (medium 500 → regular 400), card radius + widths + paddings differ, section bg transparent on mobile.
- **Dual-DOM directive:** NO — single DOM suffices. Layout pivot handled via Tailwind responsive utilities (`flex-col` base → `md:flex-row`, card widths via scoped `<style>` on the swiper slides à la `promo-collection.liquid`). `<carousel-swiper>` drives both breakpoints with `slidesPerView: 'auto'`.

## Schema plan
- **Template type:** `page` (enabled_on: `["page", "index"]` to match `promo-collection` precedent).
- **Render context:** standalone section.
- **Data sources:** `section.settings` + `section.blocks` only. No product/collection/metafield dependencies.
- **Section settings:**
  | id | type | default | purpose |
  |---|---|---|---|
  | `heading_text` | text | `HVAC Essentials` | h2 heading |
  | `description_text` | textarea | copy from figma-context §Copy | paragraph under heading |
  | `button_label` | text | `Learn More` | primary CTA pill label |
  | `button_link` | url | blank | primary CTA target |
  | `background_color` | color | `#f4f6f8` | desktop section wrapper bg (mobile applies conditionally — see DEVIATIONS) |
  | `section_font` | font_picker | `dm_sans_n7` | DM Sans variable-font family |
- **Block type:** `card` — `max_blocks: 6` (Figma shows 3, allow merchant growth).
  | id | type | default | purpose |
  |---|---|---|---|
  | `icon` | image_picker | — | 50×50 icon (merchant uploads) |
  | `title` | text | — | card headline |
  | `body` | textarea | — | card description |
  | `link_label` | text | `Learn More` | card link anchor text |
  | `link_url` | url | blank | card link target |
- **Preset:** one preset `HVAC Essentials` with 3 default blocks (SEER2 / HVAC Rebates / New Refrigerant Updates — exact copy from figma-context §Copy).

## File plan (Create + Reuse + APPEND)

| Action | Path | Purpose |
|---|---|---|
| CREATE | `sections/essential-section.liquid` | Section wrapper — header (heading + description + button) + `<carousel-swiper>` with card blocks. Inline JSON config for swiper. Scoped `<style>` for slide widths per breakpoint. Follows `sections/promo-collection.liquid` precedent. |
| CREATE | `snippets/essential-section-card.liquid` | Single card markup — icon + title + body + link. BEM class `essential-section__card`. Accepts `block` param. |
| REUSE | `snippets/shopify-responsive-image.liquid` | Render 50×50 card icon. Called directly from card snippet (fixed-dimension icon; skip `snippets/image.liquid` layout=icon wrapper because the card's icon has no rounded corner requirement and we want tighter size control — see `snippets/homepage-collection-tile.liquid` precedent for direct-call pattern). |
| REUSE | `<carousel-swiper>` custom element (inline invocation) | Mobile slider + optional desktop slider. NO snippet wrapper — `carousel-wrapper.liquid` doesn't fit the CTA-block + cards layout cleanly (wrapper assumes carousel is the only content). Inline `<carousel-swiper>` per `sections/promo-collection.liquid` precedent. |
| SKIP | `snippets/button.liquid` | Does NOT fit. `button.liquid` variant 'primary' hardcodes `tw-bg-ah-navy` — can't override to `#027db3`. ui-agent writes inline `<a>` pill styled with arbitrary Tailwind values per figma-context. |
| SKIP | `snippets/image.liquid` (layout=icon wrapper) | Adds icon-wrapper div + rounded-xl default + block.id style tag — overkill for a 50×50 icon with no rounded corners and no layout dependency. Call `shopify-responsive-image` directly. |
| APPEND | `templates/page.test.json` | Add `essential-section-test` section entry; update `order` array. test-agent appends. |
| SKIP | `js/sections/essential-section.js` | JavaScript decision = NO. `<carousel-swiper>` globally registered via `js/sections/global.js`. No per-section JS entry. |
| SKIP | `scss/sections/essential-section.scss` | Scoped inline `<style>` precedent (see `promo-collection.liquid`). Escalate only if ui-agent hits a case Tailwind + scoped style can't cover. |

## Reuse scan

| Need | File | Fitness | Recommendation |
|---|---|---|---|
| Section outer layout + swiper pattern | `sections/promo-collection.liquid` | STRONG | Mirror structure — `{%- capture slider_items -%}` + `split: '::slider-limiter'` + inline `<carousel-swiper>` + scoped `<style>` for slide widths + custom nav-button SVG markup. Copy the schema skeleton (heading_text/background_color/section_font/block preset pattern). |
| Carousel wrapper | `snippets/carousel-wrapper.liquid` | PARTIAL | Does not fit — wrapper assumes carousel is the whole content. Essential-section has a CTA-block BEFORE the cards. Use inline `<carousel-swiper>` (promo-collection pattern) instead. |
| Card icon 50×50 rendering | `snippets/shopify-responsive-image.liquid` (direct call) | STRONG | Call signature (verified from `snippets/image.liquid` internal use): `{%- render 'shopify-responsive-image', image: block.settings.icon, image_id: block.id, image_aspect_ratio: 1, wrapper_class: 'tw-w-[50px] tw-h-[50px]', image_class: 'tw-w-full tw-h-full tw-object-contain', cover: false -%}`. Alt text fallback chain: `block.settings.icon.alt` → `block.settings.title` → empty (aria-hidden). |
| Card icon via `snippets/image.liquid` layout=icon | `snippets/image.liquid` | PARTIAL | Adds icon-wrapper + default `tw-rounded-xl` + block.id-scoped `border-radius: 12px` @media ≥768. Figma icons have NO rounded corners. Would need `icon_rounded: false` override. Direct `shopify-responsive-image` call is cleaner. |
| Primary CTA button | `snippets/button.liquid` | NONE | Variant 'primary' hardcoded to `tw-bg-ah-navy` with teal hover overlay. Figma button is `#027db3` (not tokenized) with no hover animation spec. Writing inline `<a>` is simpler than introducing a button variant for one color. |
| Carousel behavior | `js/components/carousel-swiper.js` (global custom element) | STRONG | Globally registered. No section JS needed. Inline JSON config per promo-collection precedent: `slidesPerView: "auto"`, `spaceBetween: 12` (mobile gap per figma-context), breakpoint 1024 override to `spaceBetween: 16`. |
| Tailwind tokens | `tailwind.config.js` | PARTIAL | `tw-` prefix mandatory. `ah-navy` (#092846) defined but doesn't match Figma heading (#0b1e3d) — use arbitrary `tw-text-[#0b1e3d]`. Button `#027db3` not tokenized — arbitrary `tw-bg-[#027db3]` OK (consistent with promo-collection using `tw-bg-[#f4f6f8]`). Breakpoints `md-small=768`, `md=1024`, `lg=1280`. |
| Shared test template | `templates/page.test.json` | STRONG | APPEND-only. test-agent adds entry + updates `order`. |

## Variants

| Variant | Trigger | Behavior |
|---|---|---|
| 3-card default | Preset applied | Row of 3 cards desktop (justify-between in 1340px frame); mobile 2.x visible in swiper |
| <3 cards | Merchant deletes blocks | Cards still rendered via carousel; desktop gap-16 between available cards; left-aligned (flex items-center justify-start instead of justify-between fallback handled by swiper `slidesPerView: "auto"`) |
| >3 cards (up to 6) | Merchant adds blocks | Swiper activates on desktop too — nav arrows appear (md-small:+ per promo-collection pattern); mobile unchanged |
| Blank section heading | `heading_text == blank` | Suppress entire `<h2>` (no empty tag) |
| Blank description | `description_text == blank` | Suppress entire `<p>` |
| Blank button_label | Merchant clears label | Suppress CTA anchor entirely (do NOT render empty `<a>`) |
| Blank button_link but label present | Link field empty | Render button as non-clickable `<div role="presentation">` with identical visual styling (per a11y convention) |
| Blank card icon | `block.settings.icon == blank` | Omit icon container entirely (do NOT render broken image placeholder) |
| Blank card title | `block.settings.title == blank` | Suppress `<h3>` |
| Blank card body | `block.settings.body == blank` | Suppress body `<p>` |
| Blank card link_url | `link_url == blank` | Suppress "Learn More" anchor (card becomes purely informational; no dead link) |
| Zero blocks | Merchant deletes all blocks | Right column empty — section still renders header/button for schema editability; no broken swiper markup (guard with `{% if section.blocks.size > 0 %}`) |
| Font fallback | `section_font` unset | Liquid `font_face` filter emits nothing → browser falls back to sans-serif; DM Sans assumed globally loaded via theme layout |

## A11y
- **Mode:** `required` — user-facing marketing content with links and CTA; WCAG 2.1 AA applies.
- **Heading hierarchy:** `<h2>` for section heading (`HVAC Essentials`); `<h3>` per card title. Section is expected to appear inside a page that owns `<h1>`.
- **Primary CTA:** single `<a href>` element, not `<button>` (semantic link, not form/action button). Blank `button_link` → `<div role="presentation">` wrapper to retain visual parity without exposing a dead link.
- **Card link:** entire "Learn More" anchor wraps the label text only; NOT the whole card (avoids nested-interactive antipattern + keeps card copy selectable).
- **Icon images:** Figma icons are decorative glyphs. If `block.settings.icon.alt` empty → render `alt=""` + `aria-hidden="true"` on wrapper. If merchant supplies alt text → use it verbatim (ui-agent reads `shopify-responsive-image`'s alt handling).
- **Focus-visible rings:** black 2px outline + 2px offset on all anchors (match `promo-collection` precedent: `focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-black`).
- **Carousel arrows (if rendered desktop):** `aria-label="Previous essentials"` / `"Next essentials"` — same pattern as promo-collection.
- **Swiper on mobile:** swipable touch target; arrows hidden mobile (`tw-hidden md-small:tw-flex`).
- **Color contrast:** verify description `#666` on `#f4f6f8` (desktop) passes 4.5:1 for 16px regular — contrast ratio ~5.3:1 PASS. Mobile description `#000` on white — passes trivially.

## JavaScript decision
**NO.** `<carousel-swiper>` is a globally-registered custom element (registered in `js/sections/global.js`, per `reference_new_theme.md`). All slider, navigation, responsive-breakpoint, and touch-swipe behavior flows through the custom element's inline JSON config. No per-section JS entry file required. ui-agent writes `## JS handoff — N/A (global custom element handles all behavior)` in the final section of brief.md.

## Copy
Defaults come from `features/essential-section/figma-context.md` § "Copy (ground truth)". ui-agent pastes exact strings into schema defaults + preset blocks; do NOT duplicate here. All card copy (SEER2 / HVAC Rebates / New Refrigerant Updates) lives in figma-context. Mobile Figma frame shows card 3 duplicated as "HVAC Rebates" — that is a prototype glitch per figma-context; use the 3 card copy from the canonical table.

## Success criteria
- Visual match at 390 / 768 / 1024 / 1440 breakpoints (pixelmatch ≤ threshold — visual-qa decides).
- Typography within ±1px per breakpoint (sizes + line-heights match figma-context §Typography exactly).
- Colors exact hex (no approximations — use figma-context §Colors verbatim).
- Layout correctness:
  - Desktop (≥1024): 2-column row, left ~305px column with CTA block, right flex row of 3 cards (306px each, gap 16) inside 1340px max-width frame centered horizontally.
  - Mobile (<768): header stacked (heading → description → button full-ish width), cards horizontal scroll below with 2.x cards visible at a time.
- Schema fully editable in Shopify theme editor; preset loads 3 default cards + CTA copy.
- Blank-field variants degrade gracefully per §Variants table (no dead links, no broken image icons, no empty pills, no empty headings).
- Copy exact match to figma-context (verified by test-agent DOM assertions).
- Semantic HTML — `<section>` wrapper, `<h2>`, `<h3>`, `<a href>`, `<p>`.
- No bundled `/assets/` imagery (all icons via image_picker per user memory binding).
- `<carousel-swiper>` custom element used (not `overflow-x-auto` with snap-scroll).

## Constraints
- **Template type:** page (+ index).
- **Data scope:** section.settings + block.settings only. No product/collection/metafield access.
- **Tailwind:** mobile-first. Base utilities = mobile. `md-small:` (768+), `md:` (1024+), `lg:` (1280+), `2xl:` (1550+) for progressive enhancement. All classes `tw-` prefixed.
- **Font:** DM Sans assumed globally loaded via theme layout (`section_font.family` applied via scoped `<style>` CSS custom property per promo-collection pattern — `--essential-font`). `font-variation-settings: 'opsz' 14` applied on text elements.
- **Carousel:** `<carousel-swiper>` required (user directive). NO `overflow-x-auto` fallback.
- **Test fixture:** shared `templates/page.test.json` — APPEND, never CREATE per-feature template file.
- **No per-section JS:** rely on global custom element registration.
- **Cross-section contracts:** none. No events emitted or consumed.
- **Merchant editability:** every text string, color, link, icon must be settable without code change. `max_blocks: 6` to allow growth beyond Figma's 3.

## DEVIATIONS (planner-documented; ui-agent to confirm or extend)

1. **Mobile card body color inconsistency in Figma.** Card 1 mobile uses `#515151`, cards 2/3 use `#666666`. figma-context §Cross-breakpoint deltas instructs: use `#666666` uniformly. Applied here. No per-card override in ui-agent output.
2. **Mobile section background color.** Figma mobile frame renders on transparent/white (inherits page bg). Desktop renders on `#f4f6f8`. ui-agent MUST apply `background_color` setting conditionally — mobile no bg style (inherits page), desktop applies `style="background-color: {{ background_color }};"` via responsive approach. Options: (a) apply bg inline + rely on figma matching merchant's page bg, OR (b) apply bg only at `md-small:+` via scoped style rule. Recommend (b) for exact Figma parity; ui-agent confirms.
3. **Heading color swap per breakpoint.** Desktop `#0b1e3d` (near-navy); mobile `#000`. Use responsive utility `tw-text-black md:tw-text-[#0b1e3d]` (mobile-first).
4. **Description weight swap.** Desktop medium (500) `#666`; mobile regular (400) `#000`. Use `tw-font-normal tw-text-black md:tw-font-medium md:tw-text-[#666]`.
5. **Card radius differs per breakpoint.** 8px mobile / 12px desktop. Use `tw-rounded-lg md:tw-rounded-xl` OR arbitrary `tw-rounded-[8px] md:tw-rounded-[12px]`. ui-agent picks.
6. **Button non-tokenized color.** `#027db3` is not in `tailwind.config.js`. Use arbitrary `tw-bg-[#027db3]` — consistent with promo-collection precedent (`tw-bg-[#f4f6f8]`).
7. **Carousel on desktop for ≤3 cards.** Figma desktop shows static 3-card row (no arrows/swipe). If merchant stays at 3, swiper still works but arrows are unnecessary. Pattern: leave swiper active; arrows only render when slides overflow container. `<carousel-swiper>` auto-hides disabled arrows via `disabled:tw-opacity-40 disabled:tw-pointer-events-none` (see promo-collection SVG arrow markup). Acceptable — visual parity at 3 cards (no arrows visible because both ends are at boundary → both buttons disabled → invisible via CSS).

ui-agent MUST append any additional real-world deviations below this block (e.g. if Tailwind can't exactly reproduce a Figma value).

## As-built DOM

### Section root (`sections/essential-section.liquid`)

```html
<section
  class="essential-section tw-w-full tw-pt-[30px] tw-pb-[30px] md:tw-pt-[60px] md:tw-pb-[40px] md:tw-px-[50px]"
  data-section-type="essential-section"
  data-section-id="{{ section.id }}"
>
  <!-- Background applied via scoped @media (min-width: 768px) style rule, not inline style -->

  <div class="essential-section__inner tw-flex tw-flex-col md:tw-flex-row md:tw-items-center md:tw-justify-between md:tw-max-w-[1340px] md:tw-mx-auto md:tw-gap-[32px] tw-w-full">

    <!-- Left column -->
    <div class="essential-section__header tw-px-[16px] md:tw-px-0 tw-flex tw-flex-col tw-gap-[12px] md:tw-gap-[32px] tw-items-start tw-w-full md:tw-w-[305px] md:tw-shrink-0 tw-pb-[24px] md:tw-pb-0">

      <div class="tw-flex tw-flex-col tw-gap-[12px] md:tw-gap-[16px] tw-w-full">
        <!-- if heading_text != blank -->
        <h2 class="essential-section__heading tw-m-0 tw-font-bold tw-text-[28px] tw-leading-[33.6px] tw-text-black md:tw-text-[48px] md:tw-leading-[52.8px] md:tw-text-[#0b1e3d]"
            style="font-family: var(--es-font);">...</h2>
        <!-- if description_text != blank -->
        <p class="essential-section__description tw-m-0 tw-text-[15px] tw-leading-[24px] tw-font-normal tw-text-black md:tw-text-[16px] md:tw-leading-[20px] md:tw-font-medium md:tw-text-[#666]"
           style="font-family: var(--es-font);">...</p>
      </div>

      <!-- if button_label != blank AND button_link != blank -->
      <a class="essential-section__button tw-inline-flex tw-items-center tw-justify-center tw-bg-[#027db3] ... tw-rounded-[100px] tw-px-[32px] tw-py-[8px] md:tw-h-[48px] tw-max-w-[358px] md:tw-max-w-[280px] tw-w-full"
         href="{{ button_link | escape }}">...</a>
      <!-- if button_label != blank AND button_link == blank -->
      <div class="essential-section__button ..." role="presentation">...</div>
    </div>

    <!-- Right column — only rendered if section.blocks.size > 0 -->
    <carousel-swiper id="carousel-essential-{{ section.id }}"
      class="essential-section__carousel carousel tw-block tw-relative tw-w-full md:tw-flex-1 tw-px-[16px] md:tw-px-0">
      <script type="application/json">{ "slidesPerView": "auto", "spaceBetween": 12, ... }</script>

      <div class="swiper carousel__swiper" data-swiper-parent>
        <div class="swiper-wrapper carousel__wrapper">
          <div class="swiper-slide carousel__slide tw-h-auto tw-w-auto">
            <!-- essential-section-card rendered here per block -->
          </div>
        </div>
      </div>

      <button class="carousel__nav-button carousel__nav-button--prev ... tw-hidden md-small:tw-flex ..."
              aria-label="Previous essentials" data-arrow="prev">...</button>
      <button class="carousel__nav-button carousel__nav-button--next ... tw-hidden md-small:tw-flex ..."
              aria-label="Next essentials" data-arrow="next">...</button>
    </carousel-swiper>

  </div>
</section>
```

### Card snippet (`snippets/essential-section-card.liquid`)

```html
<article class="essential-section__card tw-flex-none tw-bg-white tw-rounded-[8px] md:tw-rounded-[12px] tw-px-[16px] tw-py-[24px] md:tw-p-[20px] tw-flex tw-flex-col tw-w-full tw-h-full"
         {{ block.shopify_attributes }}>

  <div class="essential-section__card-top tw-flex tw-flex-col tw-gap-[8px] md:tw-gap-[12px] tw-w-full tw-flex-1">
    <!-- if icon_image != blank -->
    <div class="essential-section__card-icon tw-w-[50px] tw-h-[50px] tw-mb-[16px] md:tw-mb-0 tw-shrink-0"
         aria-hidden="true" (if icon has no alt)>
      <!-- shopify-responsive-image snippet -->
    </div>

    <!-- if card_title != blank -->
    <h3 class="essential-section__card-title tw-m-0 tw-text-[16px] tw-leading-[26px] md:tw-text-[20px] md:tw-leading-[28px] tw-font-bold tw-text-black tw-capitalize"
        style="font-family: var(--es-font);">...</h3>

    <!-- if card_body != blank -->
    <p class="essential-section__card-body tw-m-0 tw-text-[15px] tw-leading-[24px] tw-font-normal md:tw-text-[16px] md:tw-leading-[20px] md:tw-font-medium tw-text-[#666]"
       style="font-family: var(--es-font);">...</p>
  </div>

  <!-- if link_label != blank and link_url != blank -->
  <a class="essential-section__card-link tw-mt-[8px] md:tw-mt-auto tw-text-[15px] tw-leading-[20px] md:tw-text-[16px] md:tw-leading-[20px] tw-font-medium tw-text-black tw-underline tw-self-start focus-visible:tw-outline ..."
     href="{{ link_url | escape }}"
     style="font-family: var(--es-font);">...</a>
</article>
```

## Selector catalogue

| Selector | Element | Purpose |
|---|---|---|
| `[data-section-type="essential-section"]` | `<section>` | Section root / JS mount |
| `[data-section-id]` | `<section>` | Section instance ID |
| `.essential-section__inner` | `<div>` | 2-column flex row (desktop) / stacked (mobile) |
| `.essential-section__header` | `<div>` | Left CTA column |
| `.essential-section__heading` | `<h2>` | Section heading |
| `.essential-section__description` | `<p>` | Section description paragraph |
| `.essential-section__button` | `<a>` or `<div>` | Primary CTA pill (link or presentation div) |
| `.essential-section__carousel` | `<carousel-swiper>` | Swiper custom element wrapper |
| `.essential-section__arrow--prev` | `<button>` | Previous slide arrow (desktop only) |
| `.essential-section__arrow--next` | `<button>` | Next slide arrow (desktop only) |
| `.carousel__nav-button--prev` | `<button>` | Swiper-bound prev selector |
| `.carousel__nav-button--next` | `<button>` | Swiper-bound next selector |
| `.essential-section__card` | `<article>` | Individual feature card root |
| `.essential-section__card-top` | `<div>` | Icon + title + body group |
| `.essential-section__card-icon` | `<div>` | 50×50 icon wrapper |
| `.essential-section__card-title` | `<h3>` | Card headline |
| `.essential-section__card-body` | `<p>` | Card description |
| `.essential-section__card-link` | `<a>` | Card "Learn More" anchor |

## Data attributes

| Attribute | Element | Values | Meaning | Set by |
|---|---|---|---|---|
| `data-section-type` | `<section>` | `"essential-section"` | JS mount selector | Liquid (static) |
| `data-section-id` | `<section>` | `{{ section.id }}` | Unique section instance | Liquid (static) |
| `data-swiper-parent` | `<div.swiper>` | present | Swiper init target | Liquid (static) |
| `data-arrow` | `<button>` | `"prev"` / `"next"` | Swiper nav binding | Liquid (static) |
| `aria-label` | `<button>` | `"Previous essentials"` / `"Next essentials"` | Screen reader label | Liquid (static) |
| `aria-hidden` | icon wrapper `<div>` | `"true"` | Hides decorative icon from AT (when no alt text) | Liquid (static) |

## Schema settings (final)

Section settings:
```json
[
  { "type": "text",        "id": "heading_text",     "label": "Heading",          "default": "HVAC Essentials" },
  { "type": "textarea",   "id": "description_text",  "label": "Description",      "default": "Understand efficiency standards, incentives, and new refrigerant changes so you can make a confident, informed HVAC purchase." },
  { "type": "text",        "id": "button_label",      "label": "Button label",     "default": "Learn More" },
  { "type": "url",         "id": "button_link",       "label": "Button link",      "default": "/collections/all" },
  { "type": "color",       "id": "background_color",  "label": "Background colour","default": "#f4f6f8" },
  { "type": "font_picker", "id": "section_font",      "label": "Section font",     "default": "dm_sans_n7" }
]
```

Block type `card` settings:
```json
[
  { "type": "image_picker", "id": "icon",       "label": "Icon (50×50)" },
  { "type": "text",         "id": "title",      "label": "Card title" },
  { "type": "textarea",     "id": "body",       "label": "Card description" },
  { "type": "text",         "id": "link_label", "label": "Link label", "default": "Learn More" },
  { "type": "url",          "id": "link_url",   "label": "Link URL",   "default": "/collections/all" }
]
```

`max_blocks: 6`. Preset "HVAC Essentials" with 3 blocks (SEER2 / HVAC Rebates / New Refrigerant Updates).

Test-fixture note: Main populates via `templates/page.test.json` APPEND per test-fixture rule.

## CSS custom properties

| Property | Value | Scope | Purpose |
|---|---|---|---|
| `--es-font` | `{{ section_font.family }}, {{ section_font.fallback_families }}, sans-serif` | `#shopify-section-{{ section.id }}` | DM Sans variable-font family cascade |

Background color applied via scoped `@media (min-width: 768px)` rule on `.essential-section` — not as a CSS custom property. No `--es-bg` variable.

## Figma variants implemented

- **Single DOM, both breakpoints** — mobile-first Tailwind utilities + `md:` overrides handle all layout/typography/color/spacing transitions. No dual-DOM.
- **Mobile (390w):** flex-col layout, heading 28/33.6 black, description 15/24 regular black, button full-ish width (max-w-358px), cards horizontally scrollable at 265px width, no section bg.
- **Desktop (≥1024w):** 2-column flex-row, heading 48/52.8 #0b1e3d, description 16/20 medium #666, button 48px height max-w-280px #f4f6f8 text, cards at 306px width with 16px gap, section bg #f4f6f8.
- **Blank-field guards:** heading, description, button, card title, card body, card link — all suppressed cleanly when blank. Button link blank → `<div role="presentation">`. Card icon blank → icon div omitted. Zero blocks → carousel not rendered.
- **>3 cards:** Swiper activates overflow scrolling with arrows on desktop.
- **<3 cards:** Swiper still renders; disabled arrows invisible via `disabled:tw-opacity-40 disabled:tw-pointer-events-none`.

## Figma variants NOT implemented

None. All §Variants table entries implemented.

## DEVIATIONS

1. **Mobile card body color inconsistency in Figma.** Card 1 mobile uses `#515151`, cards 2/3 use `#666666`. Applied `#666666` uniformly per brief §DEVIATIONS #1. No per-card override.
2. **Mobile section background.** Applied background-color via scoped `@media (min-width: 768px)` rule (option b from brief §DEVIATIONS #2) — mobile inherits page bg, desktop/tablet apply #f4f6f8. No inline `style` attribute on `<section>` (overrides scoped rule by specificity at all breakpoints).
3. **Heading color swap per breakpoint.** `tw-text-black md:tw-text-[#0b1e3d]` — per brief §DEVIATIONS #3.
4. **Description weight/color swap per breakpoint.** `tw-font-normal tw-text-black md:tw-font-medium md:tw-text-[#666]` — per brief §DEVIATIONS #4.
5. **Card radius.** `tw-rounded-[8px] md:tw-rounded-[12px]` — arbitrary values used for precision — per brief §DEVIATIONS #5.
6. **Button non-tokenized color.** `tw-bg-[#027db3]` arbitrary value — per brief §DEVIATIONS #6.
7. **Desktop carousel for ≤3 cards.** Swiper active at all block counts; arrows auto-disable at boundaries → invisible. Visual parity at 3 cards — per brief §DEVIATIONS #7.
8. **`section_font` passed as param to card snippet.** Card snippet receives `section_font` param from parent's `{%- capture slider_items -%}` render call. This is required because captured renders don't inherit section context — the CSS custom property `--es-font` is defined on the section wrapper in the `<style>` block, so cards reference `var(--es-font)` without needing the font object directly. However, passing it ensures no breakage if card snippet is reused standalone in future.
9. **Desktop card inner gap.** Figma specifies `gap-38` between top-block (icon+title+body) and Learn More link. Implemented via `tw-flex-1` on `.essential-section__card-top` + `tw-mt-auto` on the link anchor — flex-col growth naturally spaces the link to the card bottom. On mobile: `tw-mt-[8px]` replaces `mt-auto` since mobile cards don't have fixed height (swiper slide `height: auto`).
10. **`md-small:` (768px) used for bg breakpoint.** Background media query uses `min-width: 768px` aligning with `md-small` token — matches the Figma "desktop background appears from tablet up" intent. Arrow buttons also appear from `md-small:` per promo-collection precedent.

## JS handoff

**Section JS: N/A.** Uses global `<carousel-swiper>` custom element (registered in `js/sections/global.js`). No per-section JS entry file. Swiper handles navigation, disabled states, keyboard a11y, touch swipe, and reduced-motion. Browser-native `disabled` attribute on `.carousel__nav-button--prev` / `.carousel__nav-button--next` drives `disabled:tw-opacity-40 disabled:tw-pointer-events-none` Tailwind variants. No `js/sections/essential-section.js` created or needed.

## Success criteria for downstream agents
- **ui-agent:** Write `sections/essential-section.liquid` + `snippets/essential-section-card.liquid`. Append `## As-built DOM`, `## Selector catalogue`, `## Data attributes`, `## Schema settings (final)`, `## CSS custom properties`, `## Figma variants implemented/not`, `## DEVIATIONS` (add to existing block), `## JS handoff` (state N/A — global custom element) to this brief. Use scoped `<style>` for slide widths per promo-collection precedent. No `/assets/` imagery.
- **test-agent (ui-only mode):** Write `features/essential-section/test-scenarios.md` + `features/essential-section/essential-section.spec.js`. APPEND `essential-section-test` entry to `templates/page.test.json` with 3 blocks matching preset. Capture `qa/live-desktop.png` (1440w) + `qa/live-mobile.png` (390w) + optional 768w + 1024w. DOM assertions: heading text, description text, button label + href presence, card count = 3, each card title + body + link text. Blank-field guards per §Variants (render empty blocks, assert nothing breaks).
- **visual-qa-agent:** Compare `qa/figma-desktop.png` ↔ `qa/live-desktop.png` and `qa/figma-mobile.png` ↔ `qa/live-mobile.png` via pixelmatch. Write `qa/visual-qa-report.md`. Call out DEVIATIONS §1–7 as ACCEPTED (documented here). Any layout/color/typography mismatch NOT in DEVIATIONS = DEFECT per user memory binding `feedback_visual_qa_no_pre_approve`.
- **js-agent:** N/A — not spawned. JS decision = NO.
