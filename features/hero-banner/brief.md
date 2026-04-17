# Hero Banner — Brief

## What & why

**Feature name:** `hero-banner`

**Purpose:** Cosmetic marketing banner placed as the hero-of-page on general Shopify pages (e.g. landing, contact, promo). Merchant-configurable via section settings. Displays an eyebrow, headline, subhead, CTA button, background lifestyle image, optional foreground product/lifestyle image, optional brand logo, and a left-to-right gradient overlay.

**Figma references**
- File: `g3gxO3mhrniJOYTHNmotAu`
- Desktop node: `5654:4196`
- URL: https://www.figma.com/design/g3gxO3mhrniJOYTHNmotAu/The-AC-Outlet?node-id=5654-4196&m=dev
- Reference PNG on disk: `features/hero-banner/qa/figma-desktop.png` (1340×480 @ 2x)
- Mobile node: **NOT PROVIDED** — responsive behavior is an assumption (see Constraints).

**Template type:** `page`

**Accessibility:** `skip`

**JavaScript:** No JavaScript needed.

**SCSS:** No SCSS — styling fully expressed in Tailwind utilities.

---

## Architecture decisions

**Liquid type:** Single section (`sections/hero-banner.liquid`).
- Rationale: merchant places via theme editor; has schema; no repeatable inner blocks; no reuse across multiple templates as a snippet.
- Alternative considered: section-with-blocks. Rejected — design is a single atomic composition (one eyebrow, one heading, one subhead, one CTA). Blocks add complexity without enabling any merchant variation the design demands.

**Component boundaries:** Single file. No snippet extraction.
- The background stack (solid fallback + bg image + foreground couch image + decorative vector + gradient overlay) is conceptually one decorative layer, but splitting into a snippet buys nothing — it's not reused.
- The CTA button does **not** reuse `snippets/button.liquid` because the design color `#027db3` diverges from the primary button's `ah-navy`. Adding a new variant to `button.liquid` for one section would over-generalize; inline the CTA markup instead and keep `button.liquid` stable.
- The bg/foreground images do not reuse `snippets/shopify-responsive-image.liquid` — that snippet is optimized for lazysizes + adaptive height with its own wrapper ID scheme. Hero needs simpler `picture` + `image_url` responsive variants (eager-loaded, fetchpriority high). Inline is clearer.

**Shared components/snippets:** None reused (by design, per reuse decision above).

---

## Data

**Data sources:** `section.settings` only. No product, collection, metafields, or fetches.

**Schema (merchant-configurable settings):**

| id | type | default | purpose |
|---|---|---|---|
| `background_image` | `image_picker` | — | Lifestyle background image (e.g. living-room scene) |
| `foreground_image` | `image_picker` | — | Right-side decorative image (e.g. couple on couch). Desktop-only. |
| `logo_image` | `image_picker` | — | Brand logo, top-right. Decorative. |
| `eyebrow_text` | `text` | `NEW ARRIVALS` | Uppercase label above heading |
| `heading_text` | `text` | `Unlock Exclusive Savings` | Main headline |
| `subheading_text` | `richtext` | `<p>Get contractor pricing on top-rated systems. Add to cart to see your price.</p>` | Supporting copy |
| `cta_label` | `text` | `Shop Now` | Button label |
| `cta_link` | `url` | — | Button destination |
| `text_color` | `color` | `#ffffff` | Eyebrow / heading / subhead color |
| `cta_bg_color` | `color` | `#027db3` | CTA button background |
| `cta_text_color` | `color` | `#ffffff` | CTA button label color |
| `overlay_opacity` | `range` 0–100 step 5 | `50` | Gradient overlay opacity |
| `heading_font` | `font_picker` | `dm_sans_n7` | Heading font (Bold weight) |
| `body_font` | `font_picker` | `dm_sans_n5` | Eyebrow / subhead / CTA font (Medium/Bold weights) |

Preset: `{ "name": "Hero Banner" }` so merchants can add from theme editor.

---

## Behaviour

**Variants/states:** One state only — `data-state="default"`. No hover variants on the section (CTA button has a subtle hover — opacity / darken — via Tailwind `hover:` utility).

**JS-controlled vs Liquid conditionals:** All conditionals are Liquid.
- If `background_image == blank` → render solid `#f0efeb` fallback div
- If `foreground_image == blank` → omit right-side couch `<img>` entirely
- If `logo_image == blank` → omit logo `<img>`
- If `eyebrow_text == blank` → omit eyebrow `<p>`
- If `subheading_text == blank` → omit subhead container
- If `cta_label == blank` or `cta_link == blank` → omit CTA anchor
- If `overlay_opacity == 0` → omit gradient overlay

**JS events emitted:** None.
**JS events listened to:** None.
**API calls:** None.

**Responsive strategy:** CSS-only, single DOM tree. No duplication.
- Mobile (`<768`): foreground couch image hidden (`md-small:tw-block tw-hidden`), logo hidden (`md-small:tw-block tw-hidden`), heading scales down (`tw-text-[32px] md-small:tw-text-[44px] md:tw-text-[60px]`), content container shrinks padding (`tw-px-5 md-small:tw-px-10 md:tw-px-20`), gradient overlay remains (ensures text contrast on bg image).
- Tablet (`md-small`/`md`): foreground image reappears but may be clipped; logo reappears.
- Desktop (`lg`/`2xl`): full composition per Figma.

**Rationale for CSS-only:** Design frames share the same semantic content — no element genuinely disappears, just hides decoratively. DOM duplication would add markup weight for zero merchant benefit and complicate a11y tree.

---

## Implementation detail

### `sections/hero-banner.liquid`

**Liquid objects/properties accessed:**
- `section.settings.background_image` → `.alt`, `.width`, `.height`, piped through `image_url: width: N` at 600/900/1340/1920 widths
- `section.settings.foreground_image` → same as above, widths 600/900/1200
- `section.settings.logo_image` → widths 271/542 (retina)
- `section.settings.eyebrow_text`, `heading_text`, `cta_label`, `cta_link` → `escape` filter for text attrs
- `section.settings.subheading_text` → raw richtext output (Shopify sanitizes)
- `section.settings.text_color`, `cta_bg_color`, `cta_text_color`, `overlay_opacity` → injected into scoped `<style>` block
- `section.settings.heading_font` → `font_face: font_display: 'swap'` + `.family` + `.fallback_families`
- `section.settings.body_font` → same as above
- `section.id` → scoping CSS overrides to `#shopify-section-{{ section.id }}`

**Scoped `<style>` block (per-instance):** Emits `@font-face` declarations via `font_face` filter, CSS custom properties for heading-font, body-font, text-color, CTA colors. Only dynamic values that can't be expressed as Tailwind arbitrary values with runtime interpolation.

**Markup tree (flat, no snippets):**
```
<section.hero-banner>
  <div.hero-banner__bg>          — absolute inset-0, contains background image or #f0efeb fallback
  <img.hero-banner__foreground>  — absolute right-0, desktop-only (tw-hidden md:tw-block)
  <div.hero-banner__overlay>     — absolute inset-0, bg-gradient-to-r, opacity from setting
  <img.hero-banner__logo>        — absolute top-10 right-10, desktop-only
  <div.hero-banner__content>     — relative z-10, flex-col, px-5/px-10/px-20, py-10/py-20
    <p.hero-banner__eyebrow>
    <h1.hero-banner__heading>    — h1 if likely above-the-fold hero; h2 if stacked below another hero-level heading (default h1)
    <div.hero-banner__subhead>
    <a.hero-banner__cta>         — inline CTA with Tailwind hover, focus-visible states
</section>
```

**Tailwind classes (key ones):**
- Section root: `tw-relative tw-overflow-hidden tw-rounded-[10px] tw-w-full tw-min-h-[320px] md-small:tw-min-h-[400px] md:tw-min-h-[480px]`
- Foreground image: `tw-hidden md:tw-block tw-absolute tw-right-0 tw-top-[-74px] tw-w-[1088px] tw-h-[629px] tw-object-cover tw-pointer-events-none`
- Overlay: `tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-black tw-to-transparent tw-pointer-events-none` with `style="opacity: {{ overlay_opacity | divided_by: 100.0 }}"`
- Content: `tw-relative tw-z-10 tw-flex tw-flex-col tw-gap-4 md:tw-gap-6 tw-px-5 md-small:tw-px-10 md:tw-px-20 tw-py-10 md:tw-py-20 tw-max-w-[938px]`
- Heading: `tw-text-[32px] md-small:tw-text-[44px] md:tw-text-[60px] tw-font-bold tw-leading-[1.1] md:tw-leading-[66px]`
- CTA: `tw-inline-flex tw-items-center tw-justify-center tw-rounded-full tw-px-8 tw-py-[10px] tw-font-bold tw-text-[16px] tw-leading-[28px] tw-capitalize tw-no-underline tw-transition-opacity hover:tw-opacity-90 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-white/70 focus-visible:tw-ring-offset-2`

**Output file targets:**
- `sections/hero-banner.liquid` (overwrite legacy file entirely)
- No `js/sections/hero-banner.js` (no JS needed)
- No `scss/sections/hero-banner.scss` (no SCSS needed)
- No entry added to `webpack.config.js` (no TS/SCSS entry)

### Validation gates
- **Shopify Liquid validation (main's job):** `shopify-dev-mcp.validate_theme` on the updated `sections/hero-banner.liquid` after UI agent writes it. Loop up to 3× on errors.
- **Playwright UI spec (test-agent):** breakpoints 375/768/1280/1440; element presence, computed style parity (heading font-size / font-weight / color, eyebrow font-size / color, subhead color+opacity, CTA bg/text color), no horizontal overflow, no overlap at intermediate breakpoints.
- **Visual QA (visual-qa-agent):** pixelmatch `qa/figma-desktop.png` vs `qa/live-desktop.png` (1440) and `qa/live-mobile.png` (375). No Figma mobile — mobile pixelmatch is informational only until a mobile Figma node is provided.
- **Build:** `yarn start` (webpack watch) — must emit no errors. Section is `.liquid`-only, no webpack entry needed.

---

## Technical tradeoffs

| Decision | Alternative | Why chosen | Downside |
|---|---|---|---|
| Single section file (no snippet extraction) | Extract bg-stack / cta / content into snippets | One-off composition, no reuse; splitting adds indirection without value | If a second hero variant is needed later, refactor cost |
| Inline CTA markup (not `snippets/button.liquid`) | Extend `button.liquid` with a fourth variant `hero-cta` | Color `#027db3` is one-off to this section; polluting the shared component with section-specific variants bloats it | If multiple sections later adopt the same blue CTA, consolidate then |
| All conditionals in Liquid | JS state machine | Zero interactivity — every "state" is merchant-settings-driven at render time | None — pure Liquid is simpler here |
| CSS-only responsive (hide foreground image at mobile) | DOM-duplicated mobile variant | Design intent is same content; decorative image is genuinely optional | Hidden `<img>` still downloaded by browser — use `loading="lazy"` + `media` attribute in `<picture><source>` to skip mobile fetch |
| Scoped `<style>` block for dynamic colors/fonts | All inline `style="..."` attributes | `font_face` filter must go in `<style>`; CSS vars cleaner for multi-element color consumption | Per-instance `<style>` adds ~0.3kb per render |
| Arbitrary Tailwind values (`tw-bg-[#027db3]`, `tw-rounded-[10px]`) | Extend `tailwind.config.js` with `hero-blue` token | Single-use colors don't warrant token-system pollution | If brand adopts `#027db3` elsewhere, promote to token |
| No JS, no webpack entry | Register empty JS entry for consistency | Empty entries bloat `assets/` and confuse webpack `sideEffects` graph | None |
| `overlay_opacity` as range 0–100 | Boolean on/off + fixed 50% | Design-agnostic — merchants may want stronger/weaker contrast per image | Ranges require slider, marginal schema bloat |

---

## Constraints and assumptions

**Constraints:**
- Section settings only (no product/collection/metafield access).
- Must be placeable via theme editor on `page` template type.
- Tailwind prefix `tw-` on every utility.
- Project breakpoints only: `small` 390 / `md-small` 768 / `md` 1024 / `lg` 1280 / `2xl` 1550.
- No raw hex in Tailwind config tokens — use arbitrary values `tw-bg-[#...]` OR tokenize (we chose arbitrary — see Tradeoffs).
- Figma asset URLs embedded in design context are 7-day-ephemeral; schema never hardcodes them — merchant uploads via `image_picker`, placeholder surface shown until set.
- `Accessibility: skip` per current global default (opt-in if user later flags this banner as user-facing-critical).

**Assumptions:**
1. **No mobile Figma node was provided.** Mobile reflow (hide foreground image + logo, reduce heading to 32px, reduce padding) is planner's inference from the desktop frame. **Flag for human review after UI lands** — may need adjustment once mobile design exists.
2. **Heading semantic level (`<h1>` vs `<h2>`).** Assuming `<h1>` since this is the hero-of-page. If the page already has a higher `<h1>` (e.g. layout-level page title), drop to `<h2>`. UI agent should verify with main; default is `<h1>`.
3. **CTA hover state** not specified in Figma — using `hover:tw-opacity-90` as a safe conventional feedback. If design team supplies a specific hover color later, update.
4. **Foreground image positioning** at desktop uses the absolute coordinates from Figma (right-aligned, overflow top). At intermediate breakpoints (`md-small`, `md`), it may clip partially — tests assert no horizontal scroll, not exact positioning.
5. **Logo image dimensions** (271×64) assumed fixed; scaled down proportionally if smaller than container on narrow desktops via `tw-max-w-[271px]`.
6. **Gradient overlay** uses `tw-from-black tw-to-transparent` — Figma spec is `rgba(102,102,102,0)` at the right edge, which visually equals transparent-ish gray; `to-transparent` is visually indistinguishable and avoids the need for an arbitrary stop color.
7. **Default overlay opacity 50%** matches Figma spec; merchant can override via range slider.
