# UI Plan — promo-test

> Single source of truth for this section's UI. Two-phase document — Phase 1 = intent, Phase 2 = as-built + JS handoff.

## Intent (Phase 1)

Marketing promo-banner section with a heading/subhead intro block and a horizontally-scrollable carousel of up to 6 navigational cards. Desktop renders a `#f4f6f8` background with content-over-image cards (dark gradient, white text, absolute positioning). Mobile renders a white background with image-on-top, text-below cards. Subhead copy also differs per breakpoint. Because the layout, color scheme, text color, and copy all invert between breakpoints, the card content is built as two separate snippets (`promo-test-card-desktop`, `promo-test-card-mobile`) rendered inside each swiper slide and toggled via Tailwind visibility utilities. The carousel is delegated entirely to the existing `carousel-swiper` custom element via `carousel-wrapper.liquid`.

---

## File targets

From `architecture.md`:
- `sections/promo-test.liquid` — CREATE
- `snippets/promo-test-card-desktop.liquid` — CREATE
- `snippets/promo-test-card-mobile.liquid` — CREATE
- `templates/page.test.json` — APPEND (test-agent adds `promo-test` section entry + updates `order`; shared page-template fixture)
- `snippets/carousel-wrapper.liquid` — REUSE
- `snippets/shopify-responsive-image.liquid` — REUSE
- `scss/sections/promo-test.scss` — NO (inline `<style>` in Liquid, per project precedent)

---

## Layout strategy

**Outer `<section>`:**
- Root: `data-section-type="promo-test"`, `data-section-id="{{ section.id }}"`
- Background: `#f4f6f8` desktop / `#ffffff` mobile — cannot be expressed with a single Tailwind token; use inline `<style>` scoped to `#shopify-section-{{ section.id }}` for the breakpoint swap
- Padding: mobile `30px` top+bottom / `16px` horizontal; desktop `60px` top / `10px` bottom / `50px` horizontal — arbitrary values, use Tailwind arbitrary classes with `md-small:` override

**Intro block (heading + subhead):**
- `tw-flex tw-flex-col` stack, gap `8px` mobile / `12px` desktop
- `max-w-[599px]` desktop constraint on the intro wrapper (desktop only)
- H2: `<h2>` — breakpoint-responsive font size
- Subhead desktop and mobile copy differ — render two `<p>` elements, one with `tw-hidden md-small:tw-block`, one with `md-small:tw-hidden`
- `padding-bottom: 24px` desktop → `pb-[24px]` on the header block at `md-small:`

**Inner wrapper (desktop width constraint):**
- Desktop design specifies `1340px` inner wrapper. Apply `tw-max-w-[1340px] tw-mx-auto` on an inner `<div>` inside the section. Mobile: full width (no max-w constraint needed, section padding handles it)

**Card row / carousel:**
- `{% render 'carousel-wrapper', ... %}` wraps all card slides
- Each `slider_item` string contains both card snippets back-to-back; visibility toggled via Tailwind:
  - Desktop card snippet wrapper: `tw-hidden md-small:tw-block`
  - Mobile card snippet wrapper: `md-small:tw-hidden`
- Slide itself: `swiper-slide carousel__slide tw-h-auto` (injected by carousel-wrapper.liquid)

**Desktop card (`promo-test-card-desktop`):**
- Outer: single `<a>` — `tw-relative tw-overflow-hidden tw-rounded-xl tw-block` — card corners 12px
- Image fills 420×420 via `shopify-responsive-image` with `aspect_ratio: 1`, `crop: true`
- Gradient overlay: `tw-absolute tw-inset-0` `<div>` with inline-style or CSS custom property for the gradient (see Token map)
- Content block: `tw-absolute` positioned, `left: 45px top: 240px width: 331px` — use arbitrary values
- Inner content stack: `tw-flex tw-flex-col tw-gap-[12px] tw-items-center`

**Mobile card (`promo-test-card-mobile`):**
- Outer: single `<a>` — `tw-flex tw-flex-col tw-gap-[24px] tw-bg-white tw-block`
- Image: `shopify-responsive-image` with `aspect_ratio: 1`, `tw-rounded-[10px]` on the image/wrapper, `crop: true`
- Text block: `tw-flex tw-flex-col tw-gap-[12px] tw-items-center` below image

---

## Responsive strategy

**Base = mobile, `md-small:` (768px) = desktop.**

Visual change summary:
| Concern | Mobile (base) | Desktop (`md-small:`) |
|---|---|---|
| Section background | `#ffffff` | `#f4f6f8` |
| Section padding | `py-[30px] px-[16px]` | `pt-[60px] pb-[10px] px-[50px]` |
| H2 font size | `28px / lh 33.6` | `48px / lh 52.8` |
| H2 color | `#000000` | `#0b1e3d` |
| Intro gap | `8px` | `12px` |
| Card branch | mobile snippet visible | desktop snippet visible |
| Subhead copy | mobile `<p>` visible | desktop `<p>` visible |

**Swiper breakpoints** (configured via `carousel-wrapper.liquid` JSON config):
- Base (< 768px): `slidesPerView: 1.2`, `spaceBetween: 12`
- `768` breakpoint (= `md-small`): `slidesPerView: 2.5`, `spaceBetween: 32` (tablet intermediate)
- `1200` breakpoint (≈ `lg`): `slidesPerView: 3`, `spaceBetween: 40`

Swiper drives the card count and spacing. Tailwind drives visibility toggling of card branches and progress bar / nav arrow visibility.

**Nav arrows:** `navigation_enabled` = `section.blocks.size > 3` (Liquid boolean passed to carousel-wrapper). Arrow visibility within carousel-wrapper is Swiper-internal when `navigation: true` is in the config. No additional Tailwind toggle needed on the arrow buttons themselves — carousel-wrapper handles rendering.

**Progress bar:** passed `show_progress: true` always. carousel-wrapper renders `.carousel-progress` div. Hide on desktop via the inline `<style>` block scoped to `#shopify-section-{{ section.id }}`:
```css
@media (min-width: 768px) {
  #shopify-section-{{ section.id }} .carousel-progress { display: none; }
}
```
This avoids adding a wrapper element around the progress bar (carousel-wrapper owns that markup).

**Dual-DOM toggle classes:**
- Desktop card snippet wrapper: `tw-hidden md-small:tw-block`
- Mobile card snippet wrapper: `md-small:tw-hidden`
- Subhead desktop `<p>`: `tw-hidden md-small:tw-block`
- Subhead mobile `<p>`: `md-small:tw-hidden`

---

## Token map (Figma → Tailwind)

| Figma value | Tailwind utility | Notes |
|---|---|---|
| Section bg `#f4f6f8` (desktop) | inline `<style>` CSS var | No Tailwind token — scoped to section id |
| Section bg `#ffffff` (mobile) | `tw-bg-white` | Standard |
| Section padding mobile `30px / 16px` | `tw-py-[30px] tw-px-[16px]` | Arbitrary |
| Section padding desktop `60px top / 10px bottom / 50px h` | `md-small:tw-pt-[60px] md-small:tw-pb-[10px] md-small:tw-px-[50px]` | Arbitrary |
| Inner max-width `1340px` | `tw-max-w-[1340px]` | Arbitrary |
| Intro gap mobile `8px` | `tw-gap-[8px]` | Arbitrary |
| Intro gap desktop `12px` | `md-small:tw-gap-[12px]` | Arbitrary |
| Intro max-width `599px` (desktop) | `md-small:tw-max-w-[599px]` | Arbitrary |
| H2 mobile `28px / lh 33.6px` | `tw-text-[28px] tw-leading-[33.6px]` | Arbitrary |
| H2 desktop `48px / lh 52.8px` | `md-small:tw-text-[48px] md-small:tw-leading-[52.8px]` | Arbitrary |
| H2 weight Bold | `tw-font-bold` | Standard |
| H2 color mobile `#000000` | `tw-text-black` | Standard |
| H2 color desktop `#0b1e3d` | `md-small:tw-text-[#0b1e3d]` | Arbitrary; no token exists |
| Subhead `16px / lh 20px` | `tw-text-[16px] tw-leading-[20px]` | Arbitrary |
| Subhead weight Medium | `tw-font-medium` | Standard |
| Subhead color `#666` | `tw-text-[#666]` | Arbitrary |
| Card radius `12px` | `tw-rounded-xl` | `borderRadius.xl = 12px` in tailwind.config.js |
| Mobile image radius `10px` | `tw-rounded-[10px]` | Arbitrary |
| Card gap desktop `40px` | Swiper config `spaceBetween: 40` | Swiper-driven |
| Card gap mobile `12px` | Swiper config `spaceBetween: 12` | Swiper-driven |
| Desktop card 420×420 | `tw-aspect-square` on image wrapper | 1:1 aspect |
| Gradient overlay | inline CSS `background: linear-gradient(...)` | Complex multi-stop — see below |
| Content block position `left: 45px top: 240px w: 331px` | `tw-absolute tw-left-[45px] tw-top-[240px] tw-w-[331px]` | Arbitrary |
| Content stack gap `12px` | `tw-gap-[12px]` | Arbitrary |
| Card title desktop `24px / lh 28px` Bold `#f4f6f8` | `tw-text-[24px] tw-leading-[28px] tw-font-bold tw-text-[#f4f6f8]` | Arbitrary |
| Card title mobile `19.6px / lh 26.6px` Bold `#000` | `tw-text-[19.6px] tw-leading-[26.6px] tw-font-bold tw-text-black` | Arbitrary |
| Card desc desktop `16px / lh 20px` Medium `#eaeaea` | `tw-text-[16px] tw-leading-[20px] tw-font-medium tw-text-[#eaeaea]` | Arbitrary |
| Card desc mobile `15px / lh 24px` SemiBold `#515151` | `tw-text-[15px] tw-leading-[24px] tw-font-semibold tw-text-[#515151]` | Arbitrary |
| CTA bg `#027db3` | `tw-bg-[#027db3]` | Arbitrary; no brand-primary token |
| CTA label desktop `16px / lh 28px` Bold `#f4f6f8` | `tw-text-[16px] tw-leading-[28px] tw-font-bold tw-text-[#f4f6f8]` | Arbitrary |
| CTA label mobile `15px / lh 30px` Bold white | `tw-text-[15px] tw-leading-[30px] tw-font-bold tw-text-white` | Arbitrary |
| CTA height `48px` | `tw-h-[48px]` | Arbitrary |
| CTA padding `32px` horizontal | `tw-px-[32px]` | Arbitrary |
| CTA border-radius `100px` (pill) | `tw-rounded-full` | `borderRadius.full = 9999px` in tailwind.config.js |
| CTA max-width `280px` | `tw-max-w-[280px]` | Arbitrary |
| Progress bar height `2px` | Override via inline `<style>` on section | carousel-wrapper default is `5px` — override needed |
| Progress bar bg `rgba(0,0,0,0.1)` | Override via inline `<style>` | carousel-wrapper default is `tw-bg-slate-200` |
| Progress fill color black | `progress_color: 'tw-bg-black'` | Pass to carousel-wrapper |
| Progress bar radius `30px` | Override via inline `<style>` | carousel-wrapper default is `tw-rounded-full` (close, can accept) |

**Gradient overlay spec** (desktop card, applied via inline `style` attribute on overlay `<div>`):
`background: linear-gradient(180deg, rgba(255,255,255,0) 45.6%, rgba(8,8,8,0.4) 57.8%, rgba(0,0,0,0.8) 100%)`

**Progress bar override** — carousel-wrapper renders `.carousel-progress` with hardcoded Tailwind classes (`tw-h-[5px]`, `tw-bg-slate-200`). These cannot be overridden by passing a parameter. Override via the section's inline `<style>` block:
```css
#shopify-section-{{ section.id }} .carousel-progress {
  height: 2px;
  background: rgba(0,0,0,0.1);
}
```

---

## SCSS decision

NO. Inline `<style>` block scoped to `#shopify-section-{{ section.id }}` handles the two cases that Tailwind can't cleanly express:
1. Section background color swap between breakpoints (mobile white → desktop `#f4f6f8`)
2. Progress bar height + background override (carousel-wrapper owns `.carousel-progress` markup)
3. Progress bar hide on desktop

No keyframes, pseudo-elements, `:has()`, or complex combinators required. SCSS escape hatch does not apply.

---

## Font loading

DM Sans loaded globally (confirmed by brief and memory). No section-local font injection needed.

---

## Variant → state mapping

| Figma variant / block state | Implementation |
|---|---|
| Default (1–3 blocks) | Carousel renders, no nav arrows (`navigation_enabled: false`) |
| 4–6 blocks | `navigation_enabled: true` passed to carousel-wrapper, Swiper renders nav buttons |
| 0 blocks | Section renders heading + subhead only; `{% if section.blocks.size > 0 %}` guard wraps carousel |
| Empty image (image_picker blank) | `shopify-responsive-image` renders a placeholder `<div>` with bg-gray (snippet handles this); no special treatment in card snippet |
| No `cta_link` (blank) | Render card as `<a href="#">` — card remains navigational in DOM; see Questions |
| Mobile breakpoint | Mobile card snippet visible, desktop hidden |
| Desktop breakpoint | Desktop card snippet visible, mobile hidden |
| Progress bar | Always passed `show_progress: true`; hidden on desktop via inline `<style>` |
| Hover state | No design spec for hover — no treatment added |

---

## Reuse references followed

| Reused asset | Call signature / convention used |
|---|---|
| `snippets/carousel-wrapper.liquid` | `{% render 'carousel-wrapper', section_id: section.id, slider_items: slider_items, mobile_slides_per_view: '1.2', tablet_slides_per_view: '2.5', desktop_slides_per_view: '3', mobile_space_between: 12, tablet_space_between: 32, desktop_space_between: 40, show_progress: true, progress_color: 'tw-bg-black', navigation_enabled: navigation_enabled %}` |
| `snippets/shopify-responsive-image.liquid` | `{% render 'shopify-responsive-image', image: block.settings.image, image_id: block.id, image_aspect_ratio: 1, image_alt: alt_fallback, image_class: 'tw-w-full tw-h-full tw-object-cover', wrapper_class: 'tw-w-full tw-h-full', crop: true %}` — per architecture.md exact signature |
| `js/components/carousel-swiper.js` | Auto-registered globally — no import or script tag in section |
| `scss/components/carousel-wrapper.scss` | Global — no `@use` needed in section |
| Inline H2 + subhead typography | Direct Tailwind utility classes on `<h2>` and `<p>` — do NOT render `snippets/heading.liquid` |
| Pill CTA | `<span>` inside `<a>` — do NOT render `snippets/button.liquid` |

---

## Questions

1. **`cta_link` blank — anchor vs div.** When `block.settings.cta_link` is blank, should the card render as `<a href="#">` (always interactive) or as a non-interactive `<div>`? A `<div>` is more semantically correct but breaks the "single anchor per card" pattern. Recommendation: render `<a href="{{ block.settings.cta_link | default: '#' }}">` so the card is always an anchor — consistent DOM contract for the test-agent. Confirm or override.

2. **Progress bar height override.** `carousel-wrapper.liquid` hardcodes `.carousel-progress` as `tw-h-[5px] tw-bg-slate-200`. Figma specifies `2px` height and `rgba(0,0,0,0.1)` background. Plan is to override via inline `<style>` in the section. Confirm this approach is acceptable, or prefer modifying `carousel-wrapper.liquid` to accept these as parameters.

3. **Desktop card content block position.** Figma shows `top: 240px` for the absolute content block inside a `420×420` card. At `slidesPerView: 3` with `spaceBetween: 40` inside a `1340px` inner wrapper, each slide is approximately `420px` wide — consistent with Figma. But on screens between `768px` and `1200px`, cards are shown as `2.5` slides and each card will be narrower than `420px`. The content block at `tw-left-[45px] tw-top-[240px] tw-w-[331px]` may overflow the card at this intermediate breakpoint. Decision needed: (a) accept visual imperfection at tablet intermediate, (b) hide desktop card and show mobile card at `md-small` → switch to desktop card only at `md:` (1024px), or (c) use percentage-based positioning on the desktop card. Recommend option (b) for clean visual output — change desktop card visibility toggle to `tw-hidden md:tw-block` and mobile card to `md:tw-hidden`. Confirm.

---

## As-built DOM (Phase 2)

Annotated rendered tree — one card block, both breakpoints shown inline via visibility wrappers.

```html
<!-- Shopify wraps section in: -->
<div id="shopify-section-{id}" class="shopify-section promo-test-section">

  <style>
    /* section-scoped: bg swap, progress bar height/color/hide */
  </style>

  <section
    class="promo-test tw-bg-white tw-py-[30px] tw-px-[16px]
           md-small:tw-pt-[60px] md-small:tw-pb-[10px] md-small:tw-px-[50px]"
    data-section-type="promo-test"
    data-section-id="{id}"
  >
    <div class="promo-test__inner tw-max-w-[1340px] tw-mx-auto tw-flex tw-flex-col tw-gap-[24px]">

      <!-- Intro block -->
      <div class="promo-test__intro tw-flex tw-flex-col tw-gap-[8px]
                  md-small:tw-gap-[12px] md-small:tw-max-w-[599px] md-small:tw-pb-[24px]">
        <h2 class="promo-test__heading tw-text-[28px] tw-leading-[33.6px] tw-font-bold tw-text-black
                   md-small:tw-text-[48px] md-small:tw-leading-[52.8px] md-small:tw-text-[#0b1e3d] tw-m-0">
          Not Sure What You Need?
        </h2>

        <!-- Desktop subhead — hidden below 768px -->
        <p class="promo-test__subhead promo-test__subhead--desktop tw-hidden md-small:tw-block
                  tw-text-[16px] tw-leading-[20px] tw-font-medium tw-text-[#666] tw-m-0">
          Choose your system type...<br>Quick, simple...
        </p>

        <!-- Mobile subhead — hidden at 768px+ -->
        <p class="promo-test__subhead promo-test__subhead--mobile md-small:tw-hidden
                  tw-text-[16px] tw-leading-[20px] tw-font-medium tw-text-[#666] tw-m-0">
          Shop top HVAC systems...<br>Fresh discounts...
        </p>
      </div>

      <!-- carousel-wrapper.liquid output -->
      <carousel-swiper id="carousel-{id}" class="carousel">
        <script type="application/json">{ ...swiper config... }</script>

        <div class="swiper carousel__swiper" data-swiper-parent>
          <div class="swiper-wrapper carousel__wrapper">

            <!-- One swiper-slide per block -->
            <div class="swiper-slide carousel__slide tw-h-auto">
              <div class="promo-test__slide-inner" data-block-id="{block.id}">

                <!-- Desktop card wrapper — hidden below 1024px -->
                <div class="tw-hidden md:tw-block">
                  <!-- promo-test-card-desktop.liquid (link variant) -->
                  <a href="{cta_link}"
                     class="promo-test-card promo-test-card--desktop tw-relative tw-overflow-hidden
                            tw-rounded-xl tw-block tw-w-full tw-aspect-square tw-bg-[#a1a1a1] tw-group
                            tw-no-underline focus-visible:tw-outline focus-visible:tw-outline-2
                            focus-visible:tw-outline-offset-2 focus-visible:tw-outline-[#027db3]"
                     aria-label="{title}">

                    <!-- shopify-responsive-image output: wrapper + img -->
                    <div id="ImageWrapper-..." class="responsive-image__wrapper tw-w-full tw-h-full tw-absolute tw-inset-0">
                      <img id="Image-..." class="responsive-image__image tw-w-full tw-h-full tw-object-cover" ...>
                    </div>

                    <!-- Gradient overlay -->
                    <div class="promo-test-card__gradient tw-absolute tw-inset-0"
                         style="background: linear-gradient(...);"
                         aria-hidden="true"></div>

                    <!-- Absolute content -->
                    <div class="promo-test-card__content tw-absolute tw-left-[45px] tw-top-[240px]
                                tw-w-[331px] tw-flex tw-flex-col tw-gap-[12px] tw-items-center">
                      <h3 class="promo-test-card__title tw-text-[24px] tw-leading-[28px] tw-font-bold
                                 tw-text-[#f4f6f8] tw-text-center tw-capitalize tw-m-0">Split System</h3>
                      <p class="promo-test-card__description tw-text-[16px] tw-leading-[20px] tw-font-medium
                                tw-text-[#eaeaea] tw-text-center tw-m-0">...</p>
                      <span class="promo-test-card__cta tw-inline-flex tw-items-center tw-justify-center
                                   tw-bg-[#027db3] tw-h-[48px] tw-px-[32px] tw-rounded-full tw-text-[16px]
                                   tw-leading-[28px] tw-font-bold tw-text-[#f4f6f8] tw-capitalize
                                   tw-whitespace-nowrap tw-max-w-[280px]">Explore</span>
                    </div>
                  </a>
                </div>

                <!-- Mobile card wrapper — hidden at 1024px+ -->
                <div class="md:tw-hidden">
                  <!-- promo-test-card-mobile.liquid (link variant) -->
                  <a href="{cta_link}"
                     class="promo-test-card promo-test-card--mobile tw-flex tw-flex-col tw-gap-[24px]
                            tw-bg-white tw-w-full tw-no-underline focus-visible:tw-outline
                            focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2
                            focus-visible:tw-outline-[#027db3]"
                     aria-label="{title}">

                    <div class="promo-test-card__image-wrapper tw-w-full tw-aspect-square
                                tw-rounded-[10px] tw-overflow-hidden">
                      <!-- shopify-responsive-image -->
                    </div>

                    <div class="promo-test-card__text tw-flex tw-flex-col tw-gap-[12px]
                                tw-items-center tw-w-full">
                      <h3 class="promo-test-card__title tw-text-[19.6px] tw-leading-[26.6px] tw-font-bold
                                 tw-text-black tw-text-center tw-capitalize tw-w-full tw-m-0">Split System</h3>
                      <p class="promo-test-card__description tw-text-[15px] tw-leading-[24px] tw-font-semibold
                                tw-text-[#515151] tw-text-center tw-w-full tw-m-0">...</p>
                      <span class="promo-test-card__cta tw-inline-flex tw-items-center tw-justify-center
                                   tw-bg-[#027db3] tw-h-[48px] tw-px-[31.8px] tw-rounded-full tw-text-[15px]
                                   tw-leading-[30px] tw-font-bold tw-text-white tw-capitalize
                                   tw-whitespace-nowrap">Explore</span>
                    </div>
                  </a>
                </div>

              </div>
            </div>
            <!-- /swiper-slide -->

          </div>
        </div>

        <!-- Progress bar (carousel-wrapper renders this when show_progress=true) -->
        <div class="carousel-progress tw-mt-8 tw-w-full tw-h-[5px] tw-bg-slate-200 tw-rounded-full tw-overflow-hidden">
          <div class="carousel-progress__bar carousel-progress__bar--{id} tw-bg-black tw-h-full tw-rounded-full tw-transition-all tw-duration-300" style="width: 25%;"></div>
        </div>

      </carousel-swiper>

    </div>
  </section>
</div>
```

---

## BEM / selector catalogue

| Selector | Element | Purpose |
|---|---|---|
| `[data-section-type="promo-test"]` | `<section>` | Section root / JS mount |
| `#shopify-section-{id}` | Shopify wrapper `<div>` | Inline `<style>` scoping |
| `.promo-test` | `<section>` | Section root BEM block |
| `.promo-test__inner` | `<div>` | Max-width constraint wrapper (1340px) |
| `.promo-test__intro` | `<div>` | Heading + subhead flex stack |
| `.promo-test__heading` | `<h2>` | Section heading |
| `.promo-test__subhead` | `<p>` | Subhead — both variants share class |
| `.promo-test__subhead--desktop` | `<p>` | Desktop copy (tw-hidden md-small:tw-block) |
| `.promo-test__subhead--mobile` | `<p>` | Mobile copy (md-small:tw-hidden) |
| `.promo-test__slide-inner` | `<div>` | Slide content wrapper inside swiper-slide |
| `.promo-test-card` | `<a>` or `<div>` | Card root (both variants share) |
| `.promo-test-card--desktop` | `<a>` or `<div>` | Desktop card variant |
| `.promo-test-card--mobile` | `<a>` or `<div>` | Mobile card variant |
| `.promo-test-card__gradient` | `<div>` | Gradient overlay (desktop card) |
| `.promo-test-card__content` | `<div>` | Absolute content block (desktop card) |
| `.promo-test-card__image-wrapper` | `<div>` | Image container with rounded corners (mobile card) |
| `.promo-test-card__text` | `<div>` | Text block below image (mobile card) |
| `.promo-test-card__title` | `<h3>` | Card heading (both variants) |
| `.promo-test-card__description` | `<p>` | Card body copy (both variants) |
| `.promo-test-card__cta` | `<span>` | Pill CTA label (both variants) |
| `.carousel` | `<carousel-swiper>` | Carousel custom element root (carousel-wrapper.liquid) |
| `.swiper` | `<div>` | Swiper container (carousel-wrapper.liquid) |
| `.swiper-slide` | `<div>` | Swiper slide (carousel-wrapper.liquid) |
| `.carousel-progress` | `<div>` | Progress bar container (carousel-wrapper.liquid) |
| `.carousel-progress__bar--{section.id}` | `<div>` | Progress bar fill — carousel-swiper targets this |

---

## Data attributes

| Attribute | Element | Values | Meaning | Set by |
|---|---|---|---|---|
| `data-section-type` | `<section>` | `"promo-test"` | JS mount selector | Liquid (static) |
| `data-section-id` | `<section>` | `"{section.id}"` | Unique section identifier | Liquid (static) |
| `data-block-id` | `.promo-test__slide-inner` | `"{block.id}"` | Block identity per slide | Liquid (static) |
| `data-swiper-parent` | `.swiper` | (presence) | carousel-swiper custom element mount | carousel-wrapper.liquid (static) |
| `aria-label` | `.promo-test-card` (`<a>`) | card title string | Accessible link label | Liquid (static) |
| `aria-hidden` | `.promo-test-card__gradient` | `"true"` | Hides decorative gradient from AT | Liquid (static) |
| `role` | `.promo-test-card` (`<div>`) | `"presentation"` | Marks non-link card as decorative | Liquid (static, blank-link path) |

---

## Schema settings & block fields

### Section settings

| ID | Type | Default | Purpose |
|---|---|---|---|
| `heading` | `text` | `Not Sure What You Need?` | H2 section heading, both breakpoints |
| `subheading_desktop` | `textarea` | `Choose your system type and we'll guide you to the best options.\nQuick, simple, and tailored to your space.` | Shown at md-small (768px) and above |
| `subheading_mobile` | `textarea` | `Shop top HVAC systems with limited-time pricing applied at checkout.\nFresh discounts, seasonal savings, and our best offers of the year.` | Shown below md-small (768px) |

### Block type `card` settings

| ID | Type | Default | Purpose |
|---|---|---|---|
| `desktop_image` | `image_picker` | — | Image used by `promo-test-card-desktop` snippet |
| `desktop_aspect_ratio` | `range` 0.5–2.5 step 0.1 | `1` | Aspect passed to `shopify-responsive-image` for desktop |
| `mobile_image` | `image_picker` | — | Image used by `promo-test-card-mobile` snippet; falls back to `desktop_image` if blank |
| `mobile_aspect_ratio` | `range` 0.5–2.5 step 0.1 | `1` | Aspect passed to `shopify-responsive-image` for mobile |
| `image_alt` | `text` | — | Shared alt override; fallback chain: `image_alt` → `image.alt` → `title` |
| `title` | `text` | `Split System` (preset block 1) | Card heading |
| `description` | `textarea` | Per copy table | Card body copy |
| `cta_label` | `text` | `Explore` | Pill button label |
| `cta_link` | `url` | `/collections/all` | Destination URL; blank → non-interactive `<div>` |

Min blocks: not schema-enforced. Max blocks: `6`.

### Schema settings the test template must populate

| Setting ID | Type | Recommended test value |
|---|---|---|
| `heading` | text | `Not Sure What You Need?` |
| `subheading_desktop` | textarea | `Choose your system type and we'll guide you to the best options.\nQuick, simple, and tailored to your space.` |
| `subheading_mobile` | textarea | `Shop top HVAC systems with limited-time pricing applied at checkout.\nFresh discounts, seasonal savings, and our best offers of the year.` |
| block `title` (card 1) | text | `Split System` |
| block `description` (card 1) | textarea | `A traditional central air system with indoor and outdoor units. Ideal for whole-home or multi-room cooling using ductwork.` |
| block `title` (card 2) | text | `Mini-Split System` |
| block `description` (card 2) | textarea | `Flexible, energy-efficient cooling with wall-mounted indoor units. Perfect for single rooms, additions, or homes without ducts.` |
| block `title` (card 3) | text | `Packaged Unit` |
| block `description` (card 3) | textarea | `All-in-one heating and cooling system installed outside the home. Perfect for homes with limited indoor space.` |
| block `cta_label` (all) | text | `Explore` |
| block `cta_link` (all) | url | `/collections/all` |

---

## CSS custom properties

None. All values expressed as Tailwind arbitrary utilities or raw inline styles. The inline `<style>` block in the section emits scoped CSS rules but no custom properties (`--var` declarations).

---

## Figma variants implemented

| Variant | Implementation |
|---|---|
| Desktop — content-over-image, white text, gray bg | Desktop card snippet + section bg via inline `<style>` at `md-small:` |
| Mobile — image-on-top, black text, white bg, progress bar | Mobile card snippet as base + progress bar via carousel-wrapper |
| 1–3 blocks (no nav arrows) | `navigation_enabled: false` (Liquid computed) |
| 4–6 blocks (nav arrows) | `navigation_enabled: true` (Liquid computed) |
| 0 blocks (cards absent) | `{% if section.blocks.size > 0 %}` guard — section renders intro only |
| No `cta_link` (blank) | Card renders as `<div role="presentation">` instead of `<a>` |
| Empty image slot | `shopify-responsive-image` renders gray fallback div (mobile); desktop shows `#a1a1a1` section bg |
| Dual-copy subhead | Two `<p>` elements toggled via `tw-hidden md-small:tw-block` / `md-small:tw-hidden` |

---

## Figma variants NOT implemented

| Variant | Reason |
|---|---|
| Hover state on desktop card | No spec in Figma. Brief says "may add subtle hover but keep conservative." Not added — visual-qa comparison would flag any addition as diff. Deferred to post-QA. |
| Continuous scroll-progress bar | Figma implies continuous `scrollLeft`-based progress. carousel-swiper provides discrete `activeIndex`-based progress — accepted trade-off of reusing shared component (documented in brief §6). |

---

## DEVIATIONS

1. **Dual-DOM card toggle breakpoint: `md:` (1024px), NOT `md-small:` (768px).** Card snippet wrapper classes: `tw-hidden md:tw-block` (desktop) and `md:tw-hidden` (mobile). Rationale: at 768–1024px, the `2.5` Swiper slidesPerView would show mobile-card-width cards as desktop cards, causing `left: 45px; top: 240px; width: 331px` absolute content to overflow. Switching at 1024px ensures desktop card only renders when the card is wide enough to support absolute positioning.

2. **Accepted mixed-breakpoint state at tablet (768–1024px).** Section background becomes `#f4f6f8`, heading becomes desktop typography, subhead switches to desktop copy — all at `md-small:` (768px). But card template remains mobile layout until `md:` (1024px). This means tablets 768–1024px get desktop intro + mobile cards. Accepted per Q3 resolution.

3. **Swiper desktop breakpoint at 1200px (carousel-wrapper hardcoded), not 1024px.** `carousel-wrapper.liquid` has `"1200"` hardcoded as the desktop breakpoint key — it cannot be overridden by passing a parameter. `desktop_slides_per_view: '3'` and `desktop_space_between: 40` therefore activate at 1200px, not 1024px. Between 1024px and 1199px, the `2.5` tablet config is still active, but the desktop card DOM is now visible. Visual impact: cards at 1024–1199px render as desktop card snippets inside 2.5-up swiper slots (slightly narrower than 420px design). Decision: accept the limitation rather than modifying `carousel-wrapper.liquid`. Document for visual-qa.

4. **Progress bar override via inline `<style>`, not carousel-wrapper params.** carousel-wrapper hardcodes `tw-h-[5px]` and `tw-bg-slate-200` on `.carousel-progress`. These cannot be passed as parameters. Overridden with `height: 2px; background: rgba(0,0,0,0.1); border-radius: 30px` in the section's scoped inline `<style>` block.

5. **`cta_link` blank → `<div role="presentation">` (not `<a href="#">`).** Phase 1 plan listed `<a href="#">` as fallback. Q1 resolution changed this to a semantic `<div>` to prevent broken navigation. Updated implementation uses `<div role="presentation">`.

6. **shopify-responsive-image wrapper_class on desktop card uses `tw-absolute tw-inset-0`.** The snippet renders a `<div id="ImageWrapper-...">` at `position: relative` by default (via its own `<style>` tag). For the desktop card where the image must fill the full card as a background, `wrapper_class: 'tw-w-full tw-h-full tw-absolute tw-inset-0'` is passed to place the image wrapper as an absolute-fill layer behind the gradient overlay. This deviates from the architecture.md exact signature (which listed `wrapper_class: 'tw-w-full tw-h-full'`) — the `tw-absolute tw-inset-0` addition is required by the overlay layout.

---

## JS handoff

**Section JS: NONE.** All carousel behavior delegated to `<carousel-swiper>` custom element (`js/components/carousel-swiper.js`, auto-registered globally via `js/components/ui-components.js`). Config passed via child `<script type="application/json">` inside `carousel-wrapper.liquid`. No section-specific event contract.

| Behavior | Owner |
|---|---|
| Slide transition + snap | `<carousel-swiper>` / Swiper.js |
| Progress bar width update (activeIndex-based) | `<carousel-swiper>` via `progressBarSelector` |
| Navigation arrow inject + prev/next disable state | `<carousel-swiper>` when `navigation: true` in config |
| Keyboard navigation within carousel | Swiper.js built-in |
| Touch/drag scroll | Swiper.js built-in |

js-agent: this section is complete — no further JS work needed.
