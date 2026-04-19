# UI Plan — collection-grid

## File targets
(from architecture.md — create list)

- `sections/collection-grid.liquid` — new section file
- `js/sections/collection-grid.js` — js-agent owns; ui-agent produces data-attrs only
- `scss/sections/collection-grid.scss` — YES (see SCSS Decision below)

Reuse (verbatim — do NOT recreate):
- `snippets/homepage-collection-tile.liquid`
- `snippets/shopify-responsive-image.liquid`

---

## Reuse references followed

The `homepage-collection-tiles` section (`sections/homepage-collection-tiles.liquid`) is functionally identical to `collection-grid`. The new section mirrors it literally across every dimension:

- Section root classes: `tw-w-full tw-px-[…] tw-pt-[…] tw-pb-[…]` responsive pattern
- Inner wrapper: `tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto tw-w-full`
- Header row: `tw-flex tw-items-center tw-justify-between tw-w-full` — heading flex-1 + CTA right
- Carousel wrapper: `tw-relative` containing track + abs-positioned arrow buttons
- Track: `tw-flex tw-overflow-x-auto tw-gap-[…] tw-scroll-smooth` + scrollbar-hide SCSS
- Arrow buttons: abs positioned ±24px, 48px circle, `data-arrow="prev|next"`, `data-state` pattern, `aria-disabled`
- Tile render: `{% render 'homepage-collection-tile', block: block %}`
- Font: `font_picker` setting with `section_font | font_face` style tag + CSS custom property — same pattern as existing section (default `dm_sans_n7`)
- Schema shape: heading_text / view_more_label / view_more_link / background_color / section_font / blocks[tile]

Delta additions (new to collection-grid vs the existing section):
- `show_cta` checkbox (default true) — guards CTA anchor via `{% if %}`
- `show_arrows` checkbox (default true) — guards both arrow buttons via `{% if %}`
- Empty-state guard: `{% if section.blocks.size == 0 %}` — renders header only, hides carousel wrapper

---

## DOM outline (intent only)

```
sections/collection-grid.liquid
  <style>   — font_face + CSS custom property --cg-font
  <section .collection-grid data-section-type="collection-grid" data-section-id>
    <div .collection-grid__inner>               max-w-[1338px], flex-col, gap-8
      <div .collection-grid__header>            flex items-center justify-between
        <h2 .collection-grid__heading>          flex-1, heading text
        <a .collection-grid__cta>               {% if show_cta %} — CTA link
      {% if section.blocks.size > 0 %}
      <div .collection-grid__carousel>          tw-relative
        <div .collection-grid__track>           flex overflow-x-auto scroll-smooth [data-track]
          {% for block in section.blocks %}
            {% render 'homepage-collection-tile', block: block %}
          {% endfor %}
        {% if show_arrows %}
        <button .collection-grid__arrow--prev>  abs left-[-24px] [data-arrow="prev"]
        <button .collection-grid__arrow--next>  abs right-[-24px] [data-arrow="next"]
        {% endif %}
      {% endif %}
```

The authoritative DOM tree + full BEM + data-attrs live in `component-structure.md` (Phase 2 output).

---

## Layout strategy

- Section root: `tw-w-full` + responsive padding (px/pt/pb) — background via inline style from color setting
- Inner: `tw-flex tw-flex-col tw-gap-8 tw-max-w-full lg:tw-max-w-[1338px] tw-mx-auto tw-w-full`
- Header row: `tw-flex tw-items-center tw-justify-between tw-w-full` — heading takes `tw-flex-1`, CTA is `tw-flex-shrink-0 tw-ml-[16px]`
- CTA underline: `tw-border-b tw-border-b-black` (1px bottom border per Figma — not `text-decoration: underline`)
- Carousel: `tw-relative` wrapper; track is `tw-flex tw-overflow-x-auto`; arrows are `tw-absolute tw-top-1/2 tw--translate-y-1/2`
- Track gap: `tw-gap-[16px] md-small:tw-gap-[20px] lg:tw-gap-[18px]` — mirrors existing section
- Image sizing inside tile: handled by `homepage-collection-tile` snippet (fixed w/h per breakpoint with tw-w-[…] tw-h-[…] classes)
- Empty state: when `section.blocks.size == 0`, carousel div is suppressed; heading still renders

---

## Responsive strategy

Mirror the existing `homepage-collection-tiles` section exactly:

| Property | Mobile (base) | md-small (768px) | md (1024px) | lg (1280px) |
|---|---|---|---|---|
| Section px | `tw-px-[20px]` | `md-small:tw-px-[30px]` | `md:tw-px-[50px]` | — |
| Section pt | `tw-pt-[40px]` | — | `md:tw-pt-[60px]` | — |
| Section pb | `tw-pb-[30px]` | — | `md:tw-pb-[40px]` | — |
| Heading size | `tw-text-[32px] tw-leading-[36px]` | `md-small:tw-text-[40px] md-small:tw-leading-[44px]` | `md:tw-text-[48px] md:tw-leading-[52.8px]` | — |
| Inner max-w | `tw-max-w-full` | — | — | `lg:tw-max-w-[1338px]` |
| Arrows visible | `tw-hidden` | `md-small:tw-flex` | — | — |
| Track gap | `tw-gap-[16px]` | `md-small:tw-gap-[20px]` | — | `lg:tw-gap-[18px]` |
| Tile width | handled inside snippet (120/140/166px at base/md-small/md) | | | |

Strategy: CSS-only, same DOM at all breakpoints. Arrow buttons hidden on mobile via `tw-hidden md-small:tw-flex`. No DOM duplication needed.

---

## Token map (Figma → Tailwind)

| Figma value | Tailwind utility | Notes |
|---|---|---|
| `#f4f6f8` bg | `tw-bg-[#f4f6f8]` (inline style via schema color setting) | No token in tailwind.config.js; background_color schema setting with default |
| `#0b1e3d` heading | `tw-text-[#0b1e3d]` | Intentionally NOT `ah-navy` (#092846 ≠ #0b1e3d) — bracket literal per architecture.md rule 8 |
| `#000` CTA/label | `tw-text-black` | maps to Tailwind black |
| `48px / 52.8px` heading | `tw-text-[48px] tw-leading-[52.8px]` (at md+) | Arbitrary — not in token scale |
| `16px / 20px` CTA | `tw-text-[16px] tw-leading-[20px]` | Matches existing section verbatim |
| `15px / 24px` label | handled inside tile snippet | Already correct in snippet |
| `gap-[32px]` header→tiles | `tw-gap-8` (= 32px in 4px scale) | `8` token in tailwind.config.js = 32px — exact match |
| `gap-[18px]` tile gap (desktop) | `lg:tw-gap-[18px]` | Arbitrary bracket |
| `max-w-[1338px]` inner | `lg:tw-max-w-[1338px]` | Arbitrary bracket |
| `px-[50px] pt-[60px] pb-[40px]` section | `md:tw-px-[50px] md:tw-pt-[60px] md:tw-pb-[40px]` | Arbitrary brackets matching Figma |
| Arrow: `rgba(0,0,0,0.2)` border | `tw-border-[rgba(0,0,0,0.2)]` | Arbitrary bracket |
| Arrow: `48px` size, `24px` radius | `tw-w-[48px] tw-h-[48px] tw-rounded-[24px]` | Not in token scale |
| Arrow disabled: `opacity 40%` | `data-[state=prev-disabled]:tw-opacity-40` | data-attr variant per architecture.md rule 4 |
| Arrow hover bg | `hover:tw-bg-[#e8eaed]` | Mirrors existing section |
| `capitalize` CTA | `tw-capitalize` | Standard utility |

No new tokens need to be added to `tailwind.config.js`.

---

## SCSS decision

YES — `scss/sections/collection-grid.scss` required.

Escape-hatch rule: pseudo-element selector `::-webkit-scrollbar { display: none }` + `scrollbar-width: none` on the track element. These cannot be expressed in Tailwind utility classes.

File contents (mirrors `scss/sections/homepage-collection-tiles.scss` exactly, new BEM class):

```scss
.collection-grid__track {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
```

No other SCSS rules. All other styling is Tailwind utilities.

---

## Font loading

Strategy: `font_picker` setting (id `section_font`, default `dm_sans_n7`) + inline `<style>` tag with `{{ section_font | font_face: font_display: 'swap' }}` + CSS custom property `--cg-font` scoped to `#shopify-section-{{ section.id }}`.

Rationale: existing `homepage-collection-tiles` section uses this exact pattern. Mirrors it verbatim for consistency. DM Sans is not globally loaded in `layout/theme.liquid` for this project (based on existing section using font_picker for it).

Applied to: `.collection-grid__heading`, `.collection-grid__cta`, `.collection-grid__label` (via `font-family: var(--cg-font)` inline style on those elements, same as existing).

---

## Variant → state mapping

| Figma variant | Implementation |
|---|---|
| scrolled-start (prev disabled) | `data-state="prev-disabled"` on prev button; JS sets on mount + scroll. Initial render = `data-state="prev-disabled"` in Liquid (static). |
| scrolled-middle (both active) | JS removes disabled state from both arrows |
| scrolled-end (next disabled) | `data-state="next-disabled"` on next button; JS sets |
| Arrows hidden (show_arrows=false) | `{% if section.settings.show_arrows %}` guard — both buttons absent from DOM |
| CTA hidden (show_cta=false) | `{% if section.settings.show_cta %}` guard — CTA anchor absent from DOM |
| Empty (0 blocks) | Carousel wrapper absent from DOM; header row renders normally |
| Arrow hover | `hover:tw-bg-[#e8eaed]` — CSS only |
| Arrow disabled visual (40% opacity) | `data-[state=prev-disabled]:tw-opacity-40 data-[state=prev-disabled]:tw-pointer-events-none` |

---

## Questions

None blocking. Phase 2 can proceed.

Note for Phase 2 reference: mobile Figma node was not provided. Mobile responsive strategy is derived from the existing `homepage-collection-tiles` section pattern (the authoritative reuse precedent), not from a separate mobile Figma frame. This is acceptable — no question needed.
